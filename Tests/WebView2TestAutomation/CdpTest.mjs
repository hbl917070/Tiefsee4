import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const activePortPath = resolve(
  repoRoot,
  "Tiefsee",
  "bin",
  "Debug",
  "WebView2TestProfile",
  "EBWebView",
  "DevToolsActivePort",
);
const cdpConnections = new Map();
let keepCdpConnections = false;

async function getPageTargets() {
  const deadline = Date.now() + 15000;
  let lastError = "DevToolsActivePort has not been created.";
  let activePort = "unknown";

  // The port file can be left behind after Tiefsee exits. Poll the actual
  // endpoint until WebView2 has started and is listening on the current port.
  while (Date.now() < deadline) {
    try {
      activePort = (await readFile(activePortPath, "utf8")).split(/\r?\n/, 1)[0];
      if (!/^\d+$/.test(activePort)) {
        throw new Error(`Invalid DevTools port: ${activePort}`);
      }

      const baseUrl = `http://127.0.0.1:${activePort}`;
      const versionResponse = await fetch(`${baseUrl}/json/version`, {
        signal: AbortSignal.timeout(1000),
      });
      if (!versionResponse.ok) {
        throw new Error(`CDP version check failed: HTTP ${versionResponse.status}`);
      }
      const version = await versionResponse.json();
      if (typeof version.Browser !== "string" || !version.Browser.startsWith("Edg/")) {
        throw new Error(`CDP endpoint is not Edge WebView2: ${version.Browser ?? "unknown browser"}`);
      }

      const response = await fetch(`${baseUrl}/json/list`, {
        signal: AbortSignal.timeout(1000),
      });
      if (!response.ok) {
        throw new Error(`CDP target listing failed: HTTP ${response.status}`);
      }

      const targets = (await response.json()).filter(target =>
        target.type === "page" && target.webSocketDebuggerUrl,
      );
      if (!targets.some(target => target.url?.includes("/assets/www/MainWindow.html"))) {
        throw new Error("CDP endpoint does not contain a Tiefsee MainWindow page.");
      }
      return targets;
    } catch (error) {
      lastError = error.message;
      await new Promise(resolve => setTimeout(resolve, 250));
    }
  }

  throw new Error(
    `CDP did not become ready within 15 seconds (port ${activePort}; ${lastError}). `
      + "Confirm the Debug test process is still running and TIEFSEE_ENABLE_TEST_CDP=1 was set.",
  );
}

async function connect(target) {
  const socketUrl = new URL(target.webSocketDebuggerUrl);
  if (socketUrl.protocol !== "ws:" || !["127.0.0.1", "localhost"].includes(socketUrl.hostname)) {
    throw new Error("Refusing a non-local CDP WebSocket URL.");
  }

  const connectionKey = socketUrl.href;
  const existing = cdpConnections.get(connectionKey);
  if (existing?.isOpen()) return existing;

  const socket = new WebSocket(socketUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  let nextId = 0;
  const pending = new Map();
  const eventListeners = new Map();
  socket.addEventListener("message", event => {
    const message = JSON.parse(event.data);
    if (typeof message.method === "string") {
      for (const listener of eventListeners.get(message.method) ?? []) listener(message.params ?? {});
      return;
    }
    const waiter = pending.get(message.id);
    if (!waiter) return;
    pending.delete(message.id);
    clearTimeout(waiter.timeout);
    if (message.error) {
      waiter.reject(new Error(message.error.message));
    } else {
      waiter.resolve(message.result);
    }
  });
  socket.addEventListener("close", () => {
    for (const waiter of pending.values()) {
      clearTimeout(waiter.timeout);
      waiter.reject(new Error("CDP WebSocket closed."));
    }
    pending.clear();
  });

  const connection = {
    isOpen: () => socket.readyState === WebSocket.OPEN,
    call(method, params = {}) {
      const id = ++nextId;
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          pending.delete(id);
          reject(new Error(`CDP ${method} timed out.`));
        }, 5000);
        pending.set(id, { resolve, reject, timeout });
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
    on(method, listener) {
      const listeners = eventListeners.get(method) ?? new Set();
      listeners.add(listener);
      eventListeners.set(method, listeners);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) eventListeners.delete(method);
      };
    },
    close(force = false) {
      if (force || !keepCdpConnections) socket.close();
    },
  };
  cdpConnections.set(connectionKey, connection);
  socket.addEventListener("close", () => {
    if (cdpConnections.get(connectionKey) === connection) cdpConnections.delete(connectionKey);
  });
  return connection;
}

function closeCdpConnections() {
  for (const connection of cdpConnections.values()) {
    if (connection.isOpen()) connection.close(true);
  }
  cdpConnections.clear();
}

async function readState(target, existingConnection = null) {
  const cdp = existingConnection ?? await connect(target);
  try {
    const result = await cdp.call("Runtime.evaluate", {
      expression: `({
        windowId: window.baseWindow?.appInfo?.windowId ?? null,
        args: window.baseWindow?.appInfo?.args ?? null,
        title: document.title,
        url: location.href,
        ready: document.readyState,
        bodyText: document.body?.innerText?.slice(0, 500) ?? ""
      })`,
      returnByValue: true,
      awaitPromise: true,
    });
    return result.result?.value ?? null;
  } finally {
    if (!existingConnection) cdp.close();
  }
}

async function listWindows() {
  const targets = await getPageTargets();
  return await Promise.all(targets.map(async target => {
    try {
      return { targetId: target.id, ...(await readState(target)) };
    } catch (error) {
      return { targetId: target.id, error: error.message };
    }
  }));
}

async function findWindowTarget(windowId) {
  const targets = await getPageTargets();
  const inspected = await Promise.all(targets.map(async target => {
    try {
      const cdp = await connect(target);
      const state = await readState(target, cdp);
      return { target, cdp, state };
    } catch (error) {
      return { target, error };
    }
  }));
  const matches = inspected.filter(item => item.state?.windowId === windowId);
  if (matches.length !== 1) {
    throw new Error(`Expected one page for windowId ${windowId}, found ${matches.length}. Refresh the page list and retry.`);
  }
  return matches[0];
}

const modifiers = {
  ctrl: { key: "Control", code: "ControlLeft", vk: 17, mask: 2 },
  control: { key: "Control", code: "ControlLeft", vk: 17, mask: 2 },
  shift: { key: "Shift", code: "ShiftLeft", vk: 16, mask: 8 },
  alt: { key: "Alt", code: "AltLeft", vk: 18, mask: 1 },
  meta: { key: "Meta", code: "MetaLeft", vk: 91, mask: 4 },
};

const namedKeys = {
  enter: ["Enter", "Enter", 13],
  escape: ["Escape", "Escape", 27],
  tab: ["Tab", "Tab", 9],
  space: [" ", "Space", 32],
  backspace: ["Backspace", "Backspace", 8],
  delete: ["Delete", "Delete", 46],
  arrowup: ["ArrowUp", "ArrowUp", 38],
  arrowdown: ["ArrowDown", "ArrowDown", 40],
  arrowleft: ["ArrowLeft", "ArrowLeft", 37],
  arrowright: ["ArrowRight", "ArrowRight", 39],
  home: ["Home", "Home", 36],
  end: ["End", "End", 35],
  pageup: ["PageUp", "PageUp", 33],
  pagedown: ["PageDown", "PageDown", 34],
};

function parseShortcut(value) {
  const parts = value.split("+").map(part => part.trim()).filter(Boolean);
  if (parts.length === 0) throw new Error("A key combination is required.");

  const heldModifiers = [];
  while (parts.length > 1) {
    const modifier = modifiers[parts[0].toLowerCase()];
    if (!modifier) throw new Error(`Unsupported modifier: ${parts[0]}`);
    heldModifiers.push(modifier);
    parts.shift();
  }

  const rawKey = parts[0];
  const lowered = rawKey.toLowerCase();
  let keyInfo = namedKeys[lowered];
  if (!keyInfo && /^[a-z]$/i.test(rawKey)) {
    keyInfo = [rawKey.toLowerCase(), `Key${rawKey.toUpperCase()}`, rawKey.toUpperCase().charCodeAt(0)];
  }
  if (!keyInfo && /^\d$/.test(rawKey)) {
    keyInfo = [rawKey, `Digit${rawKey}`, rawKey.charCodeAt(0)];
  }
  if (!keyInfo && /^f(?:[1-9]|1[0-2])$/i.test(rawKey)) {
    const number = Number(rawKey.slice(1));
    keyInfo = [`F${number}`, `F${number}`, 111 + number];
  }
  if (!keyInfo) throw new Error(`Unsupported key: ${rawKey}`);

  return { heldModifiers, key: keyInfo[0], code: keyInfo[1], vk: keyInfo[2] };
}

async function pressForWindow(windowId, shortcutText, waitMs) {
  const { target, cdp } = await findWindowTarget(windowId);
  try {
    const before = await readState(target, cdp);
    if (before?.windowId !== windowId) {
      throw new Error(`Target identity changed before input; expected ${windowId}, found ${before?.windowId ?? "none"}.`);
    }

    const shortcut = parseShortcut(shortcutText);
    let modifierMask = 0;
    for (const modifier of shortcut.heldModifiers) {
      modifierMask |= modifier.mask;
      await cdp.call("Input.dispatchKeyEvent", {
        type: "keyDown", key: modifier.key, code: modifier.code,
        windowsVirtualKeyCode: modifier.vk, nativeVirtualKeyCode: modifier.vk,
        modifiers: modifierMask,
      });
    }

    await cdp.call("Input.dispatchKeyEvent", {
      type: "keyDown", key: shortcut.key, code: shortcut.code,
      windowsVirtualKeyCode: shortcut.vk, nativeVirtualKeyCode: shortcut.vk,
      modifiers: modifierMask,
    });
    await cdp.call("Input.dispatchKeyEvent", {
      type: "keyUp", key: shortcut.key, code: shortcut.code,
      windowsVirtualKeyCode: shortcut.vk, nativeVirtualKeyCode: shortcut.vk,
      modifiers: modifierMask,
    });

    for (const modifier of [...shortcut.heldModifiers].reverse()) {
      modifierMask &= ~modifier.mask;
      await cdp.call("Input.dispatchKeyEvent", {
        type: "keyUp", key: modifier.key, code: modifier.code,
        windowsVirtualKeyCode: modifier.vk, nativeVirtualKeyCode: modifier.vk,
        modifiers: modifierMask,
      });
    }

    let after;
    let changed = false;
    const isPaste = shortcut.heldModifiers.some(modifier => modifier.mask === 2)
      && shortcut.key.toLowerCase() === "v";
    const settleMs = waitMs ?? (isPaste ? 8000 : 1500);
    if (isPaste) {
      const deadline = Date.now() + settleMs;
      do {
        await new Promise(resolve => setTimeout(resolve, 200));
        after = await readState(target, cdp);
        changed = after?.bodyText !== before?.bodyText;
      } while (!changed && Date.now() < deadline);
    } else {
      await new Promise(resolve => setTimeout(resolve, settleMs));
      after = await readState(target, cdp);
      changed = after?.bodyText !== before?.bodyText;
    }

    if (after?.windowId !== windowId) {
      throw new Error(`Target identity changed after input; expected ${windowId}, found ${after?.windowId ?? "none"}.`);
    }
    return { windowId, targetId: target.id, shortcut: shortcutText, pageChanged: changed, state: after };
  } finally {
    cdp.close();
  }
}

async function clickForWindow(windowId, selector, button = "left", includeSnapshot = false, clickCount = 1) {
  const buttonMask = { left: 1, right: 2, middle: 4 }[button];
  if (!buttonMask) throw new Error("button must be left, right or middle.");
  if (![1, 2].includes(clickCount)) throw new Error("clickCount must be 1 or 2.");
  const { target, cdp } = await findWindowTarget(windowId);
  try {
    const result = await cdp.call("Runtime.evaluate", {
      expression: `(() => {
        const selector = ${JSON.stringify(selector)};
        const elements = [...document.querySelectorAll(selector)];
        const visible = elements.map(element => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return { element, rect, visible: rect.width > 0 && rect.height > 0
            && style.display !== "none" && style.visibility !== "hidden"
            && style.pointerEvents !== "none" };
        }).filter(item => item.visible);
        if (visible.length !== 1) {
          return { error: \`selector matched \${elements.length} element(s), \${visible.length} visible\` };
        }
        // Inline elements can wrap across multiple lines. Their bounding
        // rectangle includes the empty space between fragments, so its center
        // may not hit the element. Use the largest rendered fragment instead.
        const rects = [...visible[0].element.getClientRects()]
          .filter(rect => {
            const x = rect.x + rect.width / 2, y = rect.y + rect.height / 2;
            return rect.width > 0 && rect.height > 0
              && x >= 0 && y >= 0 && x < innerWidth && y < innerHeight;
          })
          .sort((a, b) => (b.width * b.height) - (a.width * a.height));
        if (rects.length === 0) {
          return { error: "target is outside the visible viewport; scroll it into view before clicking" };
        }
        const rect = rects[0];
        return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
      })()`,
      returnByValue: true,
    });
    const point = result.result?.value;
    if (!point || point.error) throw new Error(point?.error ?? "Could not locate the click target.");

    const state = await readState(target, cdp);
    if (state?.windowId !== windowId) {
      throw new Error(`Target identity changed before input; expected ${windowId}, found ${state?.windowId ?? "none"}.`);
    }
    await cdp.call("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y, button });
    for (let count = 1; count <= clickCount; count++) {
      await cdp.call("Input.dispatchMouseEvent", {
        type: "mousePressed", x: point.x, y: point.y, button,
        buttons: buttonMask, clickCount: count,
      });
      await cdp.call("Input.dispatchMouseEvent", {
        type: "mouseReleased", x: point.x, y: point.y, button,
        buttons: 0, clickCount: count,
      });
    }
    return { windowId, targetId: target.id, selector, button, clickCount, x: point.x, y: point.y,
      ...(includeSnapshot ? { snapshot: (await snapshotForWindow(windowId)).snapshot } : {}) };
  } finally {
    cdp.close();
  }
}

async function clickAtForWindow(windowId, x, y, button = "left") {
  const buttonMask = { left: 1, right: 2, middle: 4 }[button];
  if (!buttonMask) throw new Error("button must be left, right or middle.");
  if (![x, y].every(Number.isFinite)) throw new Error("x and y must be finite numbers.");
  const { target, cdp } = await findWindowTarget(windowId);
  try {
    const state = await readState(target, cdp);
    if (state?.windowId !== windowId) {
      throw new Error(`Target identity changed before input; expected ${windowId}, found ${state?.windowId ?? "none"}.`);
    }
    const viewport = await cdp.call("Runtime.evaluate", {
      expression: "({width: innerWidth, height: innerHeight})",
      returnByValue: true,
    });
    const { width, height } = viewport.result?.value ?? {};
    if (!Number.isFinite(width) || !Number.isFinite(height) || x < 0 || y < 0 || x >= width || y >= height) {
      throw new Error(`Coordinates (${x}, ${y}) are outside the ${width}x${height} viewport.`);
    }
    for (const type of ["mouseMoved", "mousePressed", "mouseReleased"]) {
      await cdp.call("Input.dispatchMouseEvent", {
        type, x, y, button,
        buttons: type === "mousePressed" ? buttonMask : 0,
        clickCount: 1,
      });
    }
    return { windowId, targetId: target.id, x, y, button, viewport: { width, height } };
  } finally {
    cdp.close();
  }
}

async function clickTextForWindow(windowId, text, includeSnapshot = false) {
  if (typeof text !== "string" || !text.trim() || text.length > 500) {
    throw new Error("text must contain 1–500 characters.");
  }
  const { target, cdp } = await findWindowTarget(windowId);
  try {
    const result = await cdp.call("Runtime.evaluate", {
      expression: `(() => {
        const text = ${JSON.stringify(text.trim())};
        const candidates = [...document.querySelectorAll('button,a,[role],[tabindex],[onclick],[title],[aria-label],[class*="js-"],[class*="menu-item"],[class*="menu-hor-item"]')]
          .filter(element => {
            const rect = element.getBoundingClientRect(), style = getComputedStyle(element);
            return rect.width > 0 && rect.height > 0 && style.display !== "none"
              && style.visibility !== "hidden" && style.pointerEvents !== "none"
              && (element.innerText || element.getAttribute("aria-label") || element.title || "").trim() === text;
          });
        if (candidates.length !== 1) {
          return { error: "exact text matched " + candidates.length + " visible interactive element(s)" };
        }
        const element = candidates[0];
        // Use a real rendered fragment for wrapped inline text rather than
        // the union rectangle, whose center can fall between text lines.
        const rects = [...element.getClientRects()]
          .filter(rect => {
            const x = rect.x + rect.width / 2, y = rect.y + rect.height / 2;
            return rect.width > 0 && rect.height > 0
              && x >= 0 && y >= 0 && x < innerWidth && y < innerHeight;
          })
          .sort((a, b) => (b.width * b.height) - (a.width * a.height));
        if (rects.length === 0) {
          return { error: "target is outside the visible viewport; scroll it into view before clicking" };
        }
        const rect = rects[0];
        return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2,
          tag: element.tagName.toLowerCase(), className: String(element.className) };
      })()` ,
      returnByValue: true,
    });
    const point = result.result?.value;
    if (!point || point.error) throw new Error(point?.error ?? "Could not locate the text target.");
    const state = await readState(target, cdp);
    if (state?.windowId !== windowId) {
      throw new Error(`Target identity changed before input; expected ${windowId}, found ${state?.windowId ?? "none"}.`);
    }
    for (const type of ["mouseMoved", "mousePressed", "mouseReleased"]) {
      await cdp.call("Input.dispatchMouseEvent", {
        type, x: point.x, y: point.y, button: "left",
        buttons: type === "mousePressed" ? 1 : 0, clickCount: 1,
      });
    }
    return { windowId, targetId: target.id, text: text.trim(), ...point,
      ...(includeSnapshot ? { snapshot: (await snapshotForWindow(windowId)).snapshot } : {}) };
  } finally {
    cdp.close();
  }
}

async function inspectForWindow(windowId, selector = "button,[title],[aria-label],[role=button]") {
  const { target, cdp } = await findWindowTarget(windowId);
  try {
    const result = await cdp.call("Runtime.evaluate", {
      expression: `(() => [...document.querySelectorAll(${JSON.stringify(selector)})].map(element => {
        const roleFor = element => {
          const explicitRole = element.getAttribute("role");
          if (explicitRole) return explicitRole;
          const tag = element.tagName.toLowerCase();
          if (tag === "button" || tag === "summary") return "button";
          if ((tag === "a" || tag === "area") && element.hasAttribute("href")) return "link";
          if (tag === "select") return element.multiple || element.size > 1 ? "listbox" : "combobox";
          if (tag === "textarea") return "textbox";
          if (tag === "input") {
            const type = (element.getAttribute("type") || "text").toLowerCase();
            if (type === "checkbox" || type === "radio" || type === "range" || type === "number") {
              return { checkbox: "checkbox", radio: "radio", range: "slider", number: "spinbutton" }[type];
            }
            if (type === "search") return "searchbox";
            if (["button", "submit", "reset", "image"].includes(type)) return "button";
            if (type !== "hidden") return "textbox";
          }
          if (tag === "progress") return "progressbar";
          if (tag === "meter") return "meter";
          return null;
        };
        const label = element.labels?.[0] || null;
        const ownRect = element.getBoundingClientRect();
        const labelRect = label?.getBoundingClientRect();
        const rect = ownRect.width > 0 && ownRect.height > 0 ? ownRect : labelRect || ownRect;
        const style = getComputedStyle(element);
        const labels = element.labels ? [...element.labels].map(label => label.innerText || label.textContent || "").join(" ").trim() : "";
        const labelledBy = (element.getAttribute("aria-labelledby") || "").split(/\\s+/)
          .map(id => document.getElementById(id)?.innerText || document.getElementById(id)?.textContent || "").join(" ").trim();
        const nearbyLabel = element.closest(".text-content")?.previousElementSibling;
        const nearbyName = nearbyLabel?.classList.contains("text-title") ? (nearbyLabel.innerText || nearbyLabel.textContent || "").trim() : "";
        const labelSelector = label ? label.id ? "#" + CSS.escape(label.id)
          : element.id ? "label:has(#" + CSS.escape(element.id) + ")" : null : null;
        return { tag: element.tagName, role: roleFor(element),
          text: (element.innerText || "").trim().slice(0, 80),
          name: (element.getAttribute("aria-label") || labelledBy || labels || nearbyName || element.innerText || element.title || element.value || "").trim().slice(0, 100),
          labelSelector,
          ariaChecked: element.getAttribute("aria-checked"),
          ariaDisabled: element.getAttribute("aria-disabled"),
          ariaLabelledBy: element.getAttribute("aria-labelledby"),
          ariaSelected: element.getAttribute("aria-selected"),
          ariaExpanded: element.getAttribute("aria-expanded"),
          ariaControls: element.getAttribute("aria-controls"),
          title: element.title, ariaLabel: element.getAttribute("aria-label"), className: String(element.className),
          value: "value" in element ? element.value : undefined,
          selectionStart: element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement ? element.selectionStart : undefined,
          selectionEnd: element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement ? element.selectionEnd : undefined,
          selectedText: element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement
            ? element.value.slice(element.selectionStart ?? 0, element.selectionEnd ?? 0) : undefined,
          pageSelection: window.getSelection()?.toString() || "",
          checked: element instanceof HTMLInputElement && ["checkbox", "radio"].includes(element.type) ? element.checked : undefined,
          focused: element === document.activeElement,
          visible: (ownRect.width > 0 && ownRect.height > 0 && style.display !== "none" && style.visibility !== "hidden")
            || Boolean(label && labelRect.width > 0 && labelRect.height > 0 && getComputedStyle(label).display !== "none" && getComputedStyle(label).visibility !== "hidden"),
          rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height } };
      }))()`,
      returnByValue: true,
    });
    return result.result?.value ?? [];
  } finally {
    cdp.close();
  }
}

async function moveForWindow(windowId, x, y) {
  const { target, cdp } = await findWindowTarget(windowId);
  try {
    const state = await readState(target, cdp);
    if (state?.windowId !== windowId) {
      throw new Error(`Target identity changed before input; expected ${windowId}, found ${state?.windowId ?? "none"}.`);
    }
    await cdp.call("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
    return { windowId, targetId: target.id, x, y };
  } finally {
    cdp.close();
  }
}

async function wheelForWindow(windowId, x, y, deltaY, deltaX = 0, captureScreenshot = false, captureScreenshotDelayMs = 0) {
  if (![x, y, deltaX, deltaY].every(Number.isFinite) || deltaX === 0 && deltaY === 0) {
    throw new Error("x, y, deltaX and deltaY must be finite numbers, with a non-zero delta.");
  }
  if (!Number.isFinite(captureScreenshotDelayMs) || captureScreenshotDelayMs < 0 || captureScreenshotDelayMs > 250) {
    throw new Error("captureScreenshotDelayMs must be between 0 and 250.");
  }

  const { target, cdp } = await findWindowTarget(windowId);
  try {
    const before = await readState(target, cdp);
    if (before?.windowId !== windowId) {
      throw new Error(`Target identity changed before input; expected ${windowId}, found ${before?.windowId ?? "none"}.`);
    }
    await cdp.call("Input.dispatchMouseEvent", {
      type: "mouseWheel", x, y, deltaX, deltaY,
    });
    // 需要捕捉短暫視覺狀態時，先截圖再讀取頁面狀態，減少輸入後的延遲。
    if (captureScreenshot && captureScreenshotDelayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, captureScreenshotDelayMs));
    }
    const image = captureScreenshot
      ? (await cdp.call("Page.captureScreenshot", { format: "png", fromSurface: true })).data
      : undefined;
    const after = await readState(target, cdp);
    if (after?.windowId !== windowId) {
      throw new Error(`Target identity changed after input; expected ${windowId}, found ${after?.windowId ?? "none"}.`);
    }
    return { windowId, targetId: target.id, x, y, deltaX, deltaY, state: after, ...(image ? { image } : {}) };
  } finally {
    cdp.close();
  }
}

async function resizeWindowForWindow(windowId, width, height) {
  if (!Number.isInteger(width) || width < 400 || width > 3840 ||
      !Number.isInteger(height) || height < 300 || height > 2160) {
    throw new Error("width must be 400-3840 and height must be 300-2160.");
  }
  const { target, cdp } = await findWindowTarget(windowId);
  try {
    const state = await readState(target, cdp);
    if (state?.windowId !== windowId) {
      throw new Error(`Target identity changed before resize; expected ${windowId}, found ${state?.windowId ?? "none"}.`);
    }
    const result = await cdp.call("Browser.getWindowForTarget", { targetId: target.id });
    await cdp.call("Browser.setWindowBounds", {
      windowId: result.windowId,
      bounds: { width, height, windowState: "normal" },
    });
    return { windowId, targetId: target.id, width, height };
  } finally {
    cdp.close();
  }
}

async function touchGestureForWindow(windowId, kind, x, y, radius, value, steps = 12, durationMs = 300) {
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(radius) || radius < 20 || radius > 300
    || !Number.isFinite(value) || !Number.isInteger(steps) || steps < 2 || steps > 60
    || !Number.isFinite(durationMs) || durationMs < 0 || durationMs > 5000) {
    throw new Error("Touch gesture requires finite coordinates, radius 20–300, 2–60 steps, and durationMs 0–5000.");
  }
  if (kind !== "pinch" && kind !== "rotate") throw new Error("Touch gesture kind must be pinch or rotate.");
  if (kind === "pinch" && (value < 0.5 || value > 2)) throw new Error("Pinch scale must be 0.5–2.");
  if (kind === "rotate" && (Math.abs(value) < 5 || Math.abs(value) > 180)) throw new Error("Rotation angle must be 5–180 degrees in either direction.");

  const { target, cdp } = await findWindowTarget(windowId);
  try {
    const before = await readState(target, cdp);
    if (before?.windowId !== windowId) {
      throw new Error(`Target identity changed before input; expected ${windowId}, found ${before?.windowId ?? "none"}.`);
    }

    const pointFor = (angle, distance, id) => ({
      x: x + Math.cos(angle) * distance,
      y: y + Math.sin(angle) * distance,
      id,
      radiusX: 1,
      radiusY: 1,
      force: 1,
    });
    const startAngle = kind === "pinch" ? 0 : -Math.PI / 2;
    const touchPoints = (progress) => {
      const angle = startAngle + (kind === "rotate" ? value * Math.PI / 180 * progress : 0);
      const distance = radius * (kind === "pinch" ? 1 + (value - 1) * progress : 1);
      return [pointFor(angle, distance, 1), pointFor(angle + Math.PI, distance, 2)];
    };

    await cdp.call("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 2 });
    let touchEnded = false;
    try {
      await cdp.call("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: touchPoints(0) });
      for (let i = 1; i <= steps; i++) {
        if (durationMs > 0) await new Promise(resolve => setTimeout(resolve, durationMs / steps));
        await cdp.call("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: touchPoints(i / steps) });
      }
      await cdp.call("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      touchEnded = true;
    } finally {
      if (!touchEnded) {
        await cdp.call("Input.dispatchTouchEvent", { type: "touchCancel", touchPoints: [] }).catch(() => {});
      }
      await cdp.call("Emulation.setTouchEmulationEnabled", { enabled: false });
    }

    const after = await readState(target, cdp);
    if (after?.windowId !== windowId) {
      throw new Error(`Target identity changed after input; expected ${windowId}, found ${after?.windowId ?? "none"}.`);
    }
    return { windowId, targetId: target.id, kind, x, y, radius, value, steps, durationMs, state: after };
  } finally {
    cdp.close();
  }
}

async function dragForWindow(windowId, x1, y1, x2, y2, steps = 1, durationMs = 0, captureConsoleMs = 0, captureTrace = false) {
  if (![x1, y1, x2, y2].every(Number.isFinite)) {
    throw new Error("Drag coordinates must be finite numbers.");
  }
  if (!Number.isInteger(steps) || steps < 1 || steps > 60 || !Number.isFinite(durationMs) || durationMs < 0 || durationMs > 5000) {
    throw new Error("Drag steps must be 1–60 and durationMs must be 0–5000.");
  }
  if (!Number.isInteger(captureConsoleMs) || captureConsoleMs < 0 || captureConsoleMs > 5000) {
    throw new Error("captureConsoleMs must be an integer from 0 to 5000.");
  }
  if (typeof captureTrace !== "boolean") throw new Error("captureTrace must be a boolean.");

  const { target, cdp } = await findWindowTarget(windowId);
  const consoleMessages = [];
  const traceEvents = [];
  let removeConsoleListener = null;
  let removeTraceDataListener = null;
  let removeTraceCompleteListener = null;
  let resolveTraceComplete = null;
  let traceCompletePromise = null;
  let tracingStarted = false;
  let mousePressed = false;
  const captureStartedAt = Date.now();
  try {
    if (captureConsoleMs > 0) {
      removeConsoleListener = cdp.on("Runtime.consoleAPICalled", message => {
        const text = (message.args ?? []).map(argument => argument.value ?? argument.description ?? "").join(" ");
        const eventTimeMs = message.timestamp > 1e12 ? message.timestamp : message.timestamp * 1000;
        if (eventTimeMs >= captureStartedAt && text.includes("[Tiefsee render performance] pan")) {
          consoleMessages.push({ type: message.type, args: message.args ?? [], timestamp: message.timestamp });
        }
      });
      await cdp.call("Runtime.enable");
    }
    const before = await readState(target, cdp);
    if (before?.windowId !== windowId) {
      throw new Error(`Target identity changed before input; expected ${windowId}, found ${before?.windowId ?? "none"}.`);
    }
    if (captureTrace) {
      traceCompletePromise = new Promise(resolve => { resolveTraceComplete = resolve; });
      removeTraceDataListener = cdp.on("Tracing.dataCollected", message => traceEvents.push(...(message.value ?? [])));
      removeTraceCompleteListener = cdp.on("Tracing.tracingComplete", message => resolveTraceComplete?.(message));
      await cdp.call("Tracing.start", {
        transferMode: "ReportEvents",
        traceConfig: {
          recordMode: "recordUntilFull",
          includedCategories: [
            "devtools.timeline",
            "disabled-by-default-devtools.timeline",
            "cc",
            "gpu",
            "viz",
          ],
        },
      });
      tracingStarted = true;
    }
    await cdp.call("Input.dispatchMouseEvent", { type: "mouseMoved", x: x1, y: y1 });
    await cdp.call("Input.dispatchMouseEvent", { type: "mousePressed", x: x1, y: y1, button: "left", buttons: 1, clickCount: 1 });
    mousePressed = true;
    for (let i = 1; i <= steps; i++) {
      const progress = i / steps;
      await cdp.call("Input.dispatchMouseEvent", {
        type: "mouseMoved",
        x: x1 + (x2 - x1) * progress,
        y: y1 + (y2 - y1) * progress,
        button: "left",
        buttons: 1,
      });
      if (durationMs > 0) await new Promise(resolve => setTimeout(resolve, durationMs / steps));
    }
    await cdp.call("Input.dispatchMouseEvent", { type: "mouseReleased", x: x2, y: y2, button: "left", buttons: 0, clickCount: 1 });
    mousePressed = false;
    if (captureTrace) {
      // Stop recording at the end of input so compositor idle frames do not pollute the pan sample.
      await cdp.call("Tracing.end");
      tracingStarted = false;
    }
    const after = await readState(target, cdp);
    if (after?.windowId !== windowId) {
      throw new Error(`Target identity changed after input; expected ${windowId}, found ${after?.windowId ?? "none"}.`);
    }
    const readRemoteValue = async (remoteObject, depth = 0) => {
      if (remoteObject?.value !== undefined) return remoteObject.value;
      if (!remoteObject?.objectId) return remoteObject?.description ?? null;
      if (depth >= 2) {
        await cdp.call("Runtime.releaseObject", { objectId: remoteObject.objectId }).catch(() => { });
        return remoteObject.description ?? null;
      }
      try {
        const properties = await cdp.call("Runtime.getProperties", {
          objectId: remoteObject.objectId,
          ownProperties: true,
        });
        return Object.fromEntries(await Promise.all((properties.result ?? [])
          .filter(property => property.value !== undefined)
          .map(async property => [property.name, await readRemoteValue(property.value, depth + 1)])));
      } finally {
        await cdp.call("Runtime.releaseObject", { objectId: remoteObject.objectId }).catch(() => { });
      }
    };
    let performanceTrace;
    if (captureTrace) {
      let traceTimeout;
      try {
        await Promise.race([
          traceCompletePromise,
          new Promise((_, reject) => {
            traceTimeout = setTimeout(() => reject(new Error("Timed out waiting for the WebView2 performance trace.")), 5000);
          }),
        ]);
      } finally {
        clearTimeout(traceTimeout);
      }
      const selectedEvents = traceEvents.filter(event =>
        typeof event.name === "string" && /BeginFrame|DrawFrame|SubmitCompositorFrame|FramePresented|SwapBuffers|Raster|Paint|Composite|FrameDropped|FrameSkipped/i.test(event.name),
      );
      const eventCounts = Object.create(null);
      const eventDurations = new Map();
      for (const event of selectedEvents) {
        eventCounts[event.name] = (eventCounts[event.name] ?? 0) + 1;
        if (Number.isFinite(event.dur) && event.dur >= 0) {
          const durations = eventDurations.get(event.name) ?? [];
          durations.push(event.dur / 1000);
          eventDurations.set(event.name, durations);
        }
      }
      const durationSummaries = Object.fromEntries([...eventDurations.entries()].map(([name, durations]) => {
        durations.sort((a, b) => a - b);
        return [name, {
          p50Ms: Number(durations[Math.floor((durations.length - 1) * 0.5)].toFixed(3)),
          p95Ms: Number(durations[Math.ceil(durations.length * 0.95) - 1].toFixed(3)),
          maxMs: Number(durations[durations.length - 1].toFixed(3)),
        }];
      }));
      const compositorThreads = Object.create(null);
      const compositorEventNames = /BeginFrame|DrawFrame|SubmitCompositorFrame|FramePresented|SwapBuffers|FrameDropped|FrameSkipped/i;
      for (const event of traceEvents) {
        if (!compositorEventNames.test(event.name ?? "")) continue;
        const key = `${event.pid ?? "?"}:${event.tid ?? "?"}`;
        const summary = compositorThreads[key] ??= { events: 0, names: Object.create(null) };
        summary.events++;
        summary.names[event.name] = (summary.names[event.name] ?? 0) + 1;
      }
      const eventSamples = Object.create(null);
      for (const event of traceEvents) {
        if (!/DirectRenderer::DrawFrame|SubmitCompositorFrameToPresentationCompositorFrame|SwapBuffers|FramePresented/i.test(event.name ?? "")) continue;
        const samples = eventSamples[event.name] ??= [];
        if (samples.length < 3) {
          samples.push({ pid: event.pid, tid: event.tid, ts: event.ts, dur: event.dur, args: event.args });
        }
      }
      performanceTrace = {
        eventCount: traceEvents.length,
        selectedEventCounts: eventCounts,
        selectedEventDurationsMs: durationSummaries,
        compositorThreads,
        eventSamples,
      };
    }
    if (captureConsoleMs > 0) await new Promise(resolve => setTimeout(resolve, captureConsoleMs));
    const renderPerformance = await Promise.all(consoleMessages.map(async message => ({
      timestamp: message.timestamp,
      type: message.type,
      summary: await readRemoteValue(message.args.find(argument => argument.objectId)),
    })));
    return {
      windowId, targetId: target.id, x1, y1, x2, y2, state: after,
      ...(captureConsoleMs > 0 ? { renderPerformance } : {}),
      ...(captureTrace ? { performanceTrace } : {}),
    };
  } finally {
    if (mousePressed) {
      try {
        await cdp.call("Input.dispatchMouseEvent", {
          type: "mouseReleased", x: x2, y: y2, button: "left", buttons: 0, clickCount: 1,
        });
      } catch { /* The target may have closed; preserve the original drag error. */ }
    }
    if (tracingStarted) {
      try { await cdp.call("Tracing.end"); } catch { /* Preserve the original drag or trace error. */ }
    }
    removeConsoleListener?.();
    removeTraceDataListener?.();
    removeTraceCompleteListener?.();
    cdp.close();
  }
}

async function typeForWindow(windowId, text) {
  if (typeof text !== "string" || text.length > 10000) {
    throw new Error("Text must be a string no longer than 10000 characters.");
  }
  const { target, cdp } = await findWindowTarget(windowId);
  try {
    const before = await readState(target, cdp);
    if (before?.windowId !== windowId) {
      throw new Error(`Target identity changed before input; expected ${windowId}, found ${before?.windowId ?? "none"}.`);
    }
    await cdp.call("Input.insertText", { text });
    const after = await readState(target, cdp);
    if (after?.windowId !== windowId) {
      throw new Error(`Target identity changed after input; expected ${windowId}, found ${after?.windowId ?? "none"}.`);
    }
    return { windowId, targetId: target.id, state: after };
  } finally {
    cdp.close();
  }
}

async function snapshotForWindow(windowId) {
  const { target, cdp } = await findWindowTarget(windowId);
  try {
    const state = await readState(target, cdp);
    if (state?.windowId !== windowId) {
      throw new Error(`Target identity changed before reading; expected ${windowId}, found ${state?.windowId ?? "none"}.`);
    }
    const result = await cdp.call("Runtime.evaluate", {
      expression: `(() => {
        const ownVisible = element => {
          const rect = element.getBoundingClientRect();
          for (let current = element; current; current = current.parentElement) {
            const style = getComputedStyle(current);
            if (style.display === "none" || style.visibility === "hidden" || style.pointerEvents === "none") return false;
            if (current !== element && style.maxHeight === "0px" && style.overflowY === "hidden") return false;
          }
          return rect.width > 0 && rect.height > 0;
        };
        const associatedLabel = element => element.labels?.[0] || null;
        const visible = element => ownVisible(element) || Boolean(associatedLabel(element) && ownVisible(associatedLabel(element)));
        const rectFor = element => {
          const ownRect = element.getBoundingClientRect();
          return ownRect.width > 0 && ownRect.height > 0 ? ownRect : associatedLabel(element)?.getBoundingClientRect() || ownRect;
        };
        const labelSelectorFor = element => {
          const label = associatedLabel(element);
          return label ? label.id ? "#" + CSS.escape(label.id)
            : element.id ? "label:has(#" + CSS.escape(element.id) + ")" : null : null;
        };
        const selectorFor = element => {
          if (element.id) return "#" + CSS.escape(element.id);
          for (const name of ["data-testid", "aria-label", "title"]) {
            const value = element.getAttribute(name);
            if (value) return element.tagName.toLowerCase() + "[" + name + '=\"' + CSS.escape(value) + '\"]';
          }
          return null;
        };
        const roleFor = element => {
          const explicitRole = element.getAttribute("role");
          if (explicitRole) return explicitRole;
          const tag = element.tagName.toLowerCase();
          if (tag === "button" || tag === "summary") return "button";
          if ((tag === "a" || tag === "area") && element.hasAttribute("href")) return "link";
          if (tag === "select") return element.multiple || element.size > 1 ? "listbox" : "combobox";
          if (tag === "textarea") return "textbox";
          if (tag === "input") {
            const type = (element.getAttribute("type") || "text").toLowerCase();
            if (type === "checkbox" || type === "radio" || type === "range" || type === "number") {
              return { checkbox: "checkbox", radio: "radio", range: "slider", number: "spinbutton" }[type];
            }
            if (type === "search") return "searchbox";
            if (["button", "submit", "reset", "image"].includes(type)) return "button";
            if (type !== "hidden") return "textbox";
          }
          if (tag === "progress") return "progressbar";
          if (tag === "meter") return "meter";
          return null;
        };
        const nameFor = element => {
          const ariaLabel = element.getAttribute("aria-label");
          if (ariaLabel) return ariaLabel;
          const labelledBy = (element.getAttribute("aria-labelledby") || "").split(/\\s+/)
            .map(id => document.getElementById(id)?.innerText || document.getElementById(id)?.textContent || "").join(" ").trim();
          if (labelledBy) return labelledBy;
          const labels = element.labels ? [...element.labels].map(label => label.innerText || label.textContent || "").join(" ").trim() : "";
          if (labels) return labels;
          const nearbyLabel = element.closest(".text-content")?.previousElementSibling;
          const nearbyName = nearbyLabel?.classList.contains("text-title")
            ? (nearbyLabel.innerText || nearbyLabel.textContent || "").trim()
            : "";
          if (nearbyName) return nearbyName;
          return (element.innerText || element.title || element.value || "").trim();
        };
        const candidates = [...document.querySelectorAll("button,a,input,select,textarea,[role],[title],[aria-label],[tabindex]")]
          .filter(visible);
        const elements = candidates
          .sort((a, b) => Number(roleFor(b) !== null) - Number(roleFor(a) !== null))
          .slice(0, 120).map(element => {
            const rect = rectFor(element);
            return { tag: element.tagName.toLowerCase(), role: roleFor(element),
              text: (element.innerText || element.value || "").trim().slice(0, 100),
              name: nameFor(element).slice(0, 100),
              title: element.getAttribute("title"), ariaLabel: element.getAttribute("aria-label"),
              labelSelector: labelSelectorFor(element),
              ariaChecked: element.getAttribute("aria-checked"),
              ariaDisabled: element.getAttribute("aria-disabled"),
              ariaLabelledBy: element.getAttribute("aria-labelledby"),
              ariaSelected: element.getAttribute("aria-selected"),
              ariaExpanded: element.getAttribute("aria-expanded"),
              ariaControls: element.getAttribute("aria-controls"),
              checked: element instanceof HTMLInputElement && ["checkbox", "radio"].includes(element.type) ? element.checked : undefined,
              testId: element.getAttribute("data-testid"),
              id: element.id || null, selector: selectorFor(element),
              rect: { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) } };
          });
        return { title: document.title, url: location.href, ready: document.readyState,
          bodyText: (document.body?.innerText || "").slice(0, 2500), elements,
          totalInteractiveElements: candidates.length, elementsTruncated: candidates.length > elements.length };
      })()`,
      returnByValue: true,
    });
    return { ...state, snapshot: result.result?.value ?? null };
  } finally {
    cdp.close();
  }
}

async function waitForWindow(windowId, { selector, text, state = "visible", timeoutMs = 5000 }) {
  if ((!selector && !text) || !["visible", "hidden"].includes(state)
    || !Number.isInteger(timeoutMs) || timeoutMs < 0 || timeoutMs > 30000) {
    throw new Error("Provide selector or text; state must be visible or hidden; timeoutMs must be 0–30000.");
  }
  const { target, cdp } = await findWindowTarget(windowId);
  const expression = `(() => {
    const selector = ${JSON.stringify(selector ?? null)};
    const text = ${JSON.stringify(text ?? null)};
    const state = ${JSON.stringify(state)};
    const found = !selector || [...document.querySelectorAll(selector)].some(element => {
      const rect = element.getBoundingClientRect(), style = getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
    });
    const hasText = !text || (document.body?.innerText || "").includes(text);
    return { windowId: window.baseWindow?.appInfo?.windowId ?? null,
      matched: (state === "visible" ? found : !found) && hasText,
      bodyText: (document.body?.innerText || "").slice(0, 500) };
  })()`;
  const deadline = Date.now() + timeoutMs;
  try {
    while (true) {
      const result = await cdp.call("Runtime.evaluate", { expression, returnByValue: true });
      const current = result.result?.value;
      if (current?.windowId !== windowId) {
        throw new Error(`Target identity changed while waiting; expected ${windowId}, found ${current?.windowId ?? "none"}.`);
      }
      if (current.matched) return { windowId, selector: selector ?? null, text: text ?? null, state, bodyText: current.bodyText };
      if (Date.now() >= deadline) throw new Error(`Timed out waiting for ${selector ? `selector ${selector} to be ${state}` : "text condition"}.`);
      await new Promise(resolve => setTimeout(resolve, Math.min(100, deadline - Date.now())));
    }
  } finally {
    cdp.close();
  }
}

const mcpTools = [
  { name: "tiefsee_pages", description: "列出目前 Debug 測試版的 WebView 視窗。以 windowId 區分視窗；null 是尚未初始化的預載頁。", inputSchema: { type: "object", properties: {}, additionalProperties: false } },
  { name: "tiefsee_state", description: "讀取指定 windowId 的標題、啟動參數與頁面文字。", inputSchema: { type: "object", properties: { windowId: { type: "string" } }, required: ["windowId"], additionalProperties: false } },
  { name: "tiefsee_snapshot", description: "讀取指定視窗的可見互動 DOM、文字和座標；不執行網頁程式碼。", inputSchema: { type: "object", properties: { windowId: { type: "string" } }, required: ["windowId"], additionalProperties: false } },
  { name: "tiefsee_inspect", description: "以 CSS selector 檢查指定視窗中的元素名稱、可見性、值、checkbox 狀態和座標；隱藏 input 會回報可見關聯標籤 selector。", inputSchema: { type: "object", properties: { windowId: { type: "string" }, selector: { type: "string" } }, required: ["windowId"], additionalProperties: false } },
  { name: "tiefsee_click", description: "找出唯一可見的 CSS selector，並向指定視窗送出 CDP 滑鼠點擊事件。button 可選 left、right、middle，預設 left；clickCount 可設為 2 送出雙擊，預設 1；includeSnapshot 可在同一回覆附上操作後 DOM 快照。", inputSchema: { type: "object", properties: { windowId: { type: "string" }, selector: { type: "string" }, button: { type: "string", enum: ["left", "right", "middle"] }, clickCount: { type: "integer", enum: [1, 2] }, includeSnapshot: { type: "boolean" } }, required: ["windowId", "selector"], additionalProperties: false } },
  { name: "tiefsee_click_at", description: "依指定視窗 viewport CSS 座標送出真實 CDP 滑鼠點擊；座標應先由 DOM inspect/snapshot 確認。", inputSchema: { type: "object", properties: { windowId: { type: "string" }, x: { type: "number" }, y: { type: "number" }, button: { type: "string", enum: ["left", "right", "middle"] } }, required: ["windowId", "x", "y"], additionalProperties: false } },
  { name: "tiefsee_click_text", description: "找出唯一可見且互動的精確文字項目，向指定視窗送出真實 CDP 左鍵點擊；適合快照已看到文字但沒有 CSS selector 的選單。includeSnapshot 可在同一回覆附上操作後 DOM 快照。", inputSchema: { type: "object", properties: { windowId: { type: "string" }, text: { type: "string", minLength: 1, maxLength: 500 }, includeSnapshot: { type: "boolean" } }, required: ["windowId", "text"], additionalProperties: false } },
  { name: "tiefsee_press", description: "向指定視窗送出鍵盤快捷鍵；例：Ctrl+C、Ctrl+V、F2、Escape。", inputSchema: { type: "object", properties: { windowId: { type: "string" }, keys: { type: "string" }, waitMs: { type: "integer", minimum: 0, maximum: 30000 } }, required: ["windowId", "keys"], additionalProperties: false } },
  { name: "tiefsee_type", description: "向指定視窗目前焦點輸入文字；先用實際點擊或鍵盤操作聚焦輸入框。", inputSchema: { type: "object", properties: { windowId: { type: "string" }, text: { type: "string", maxLength: 10000 } }, required: ["windowId", "text"], additionalProperties: false } },
  { name: "tiefsee_move", description: "向指定視窗送出滑鼠移動事件。座標是 viewport CSS pixels。", inputSchema: { type: "object", properties: { windowId: { type: "string" }, x: { type: "number" }, y: { type: "number" } }, required: ["windowId", "x", "y"], additionalProperties: false } },
  { name: "tiefsee_resize_window", description: "將指定測試視窗調整為指定外框大小（400–3840 × 300–2160），用於重現小視窗版面。", inputSchema: { type: "object", properties: { windowId: { type: "string" }, width: { type: "integer", minimum: 400, maximum: 3840 }, height: { type: "integer", minimum: 300, maximum: 2160 } }, required: ["windowId", "width", "height"], additionalProperties: false } },
  { name: "tiefsee_wheel", description: "向指定視窗送出滑鼠滾輪事件。deltaY 負值通常代表向上滾；captureScreenshot 可在輸入後擷取畫面，delayMs 可等候短暫視覺更新。", inputSchema: { type: "object", properties: { windowId: { type: "string" }, x: { type: "number" }, y: { type: "number" }, deltaY: { type: "number" }, deltaX: { type: "number" }, captureScreenshot: { type: "boolean" }, captureScreenshotDelayMs: { type: "integer", minimum: 0, maximum: 250 } }, required: ["windowId", "x", "y", "deltaY"], additionalProperties: false } },
  { name: "tiefsee_touch_gesture", description: "透過 CDP 真實多點觸控事件，在指定 WebView 視窗執行受限的雙指縮放或旋轉手勢。kind=pinch 時 value 是倍率；kind=rotate 時 value 是角度。", inputSchema: { type: "object", properties: { windowId: { type: "string" }, kind: { type: "string", enum: ["pinch", "rotate"] }, x: { type: "number" }, y: { type: "number" }, radius: { type: "number", minimum: 20, maximum: 300 }, value: { type: "number" }, steps: { type: "integer", minimum: 2, maximum: 60 }, durationMs: { type: "number", minimum: 0, maximum: 5000 } }, required: ["windowId", "kind", "x", "y", "radius", "value"], additionalProperties: false } },
  { name: "tiefsee_drag", description: "在指定視窗內送出拖曳輸入。steps 與 durationMs 可控制移動點數和耗時；captureConsoleMs 可回傳 Renderer 摘要；captureTrace 可收集短時間 Chromium compositor／GPU trace。這些量測不執行頁面 JavaScript。", inputSchema: { type: "object", properties: { windowId: { type: "string" }, x1: { type: "number" }, y1: { type: "number" }, x2: { type: "number" }, y2: { type: "number" }, steps: { type: "integer", minimum: 1, maximum: 60 }, durationMs: { type: "number", minimum: 0, maximum: 5000 }, captureConsoleMs: { type: "integer", minimum: 0, maximum: 5000 }, captureTrace: { type: "boolean" } }, required: ["windowId", "x1", "y1", "x2", "y2"], additionalProperties: false } },
  { name: "tiefsee_wait", description: "等待指定視窗的 selector 可見／隱藏或文字出現；以狀態輪詢取代固定長時間 sleep。", inputSchema: { type: "object", properties: { windowId: { type: "string" }, selector: { type: "string" }, text: { type: "string" }, state: { type: "string", enum: ["visible", "hidden"] }, timeoutMs: { type: "integer", minimum: 0, maximum: 30000 } }, required: ["windowId"], additionalProperties: false } },
  { name: "tiefsee_screenshot", description: "擷取指定 WebView 視窗畫面；只在需要確認視覺結果時使用。", inputSchema: { type: "object", properties: { windowId: { type: "string" } }, required: ["windowId"], additionalProperties: false } },
];

async function callMcpTool(name, args) {
  const definition = mcpTools.find(tool => tool.name === name);
  if (!definition) throw new Error(`Unknown tool: ${name}`);
  if (!args || typeof args !== "object" || Array.isArray(args)) {
    throw new Error("Tool arguments must be a JSON object.");
  }
  const schema = definition.inputSchema;
  for (const key of schema.required ?? []) {
    if (!(key in args)) throw new Error(`Missing required argument: ${key}`);
  }
  for (const [key, value] of Object.entries(args)) {
    const property = schema.properties[key];
    if (!property && schema.additionalProperties === false) {
      throw new Error(`Unknown argument for ${name}: ${key}`);
    }
    if (!property) continue;
    const typeMatches = property.type === "integer"
      ? Number.isInteger(value)
      : property.type === "number"
        ? typeof value === "number" && Number.isFinite(value)
        : typeof value === property.type;
    if (!typeMatches) throw new Error(`Argument ${key} must be ${property.type}.`);
    if (property.enum && !property.enum.includes(value)) {
      throw new Error(`Argument ${key} must be one of: ${property.enum.join(", ")}.`);
    }
    if (typeof value === "string" && property.minLength !== undefined && value.length < property.minLength) {
      throw new Error(`Argument ${key} must contain at least ${property.minLength} characters.`);
    }
    if (typeof value === "string" && property.maxLength !== undefined && value.length > property.maxLength) {
      throw new Error(`Argument ${key} must contain at most ${property.maxLength} characters.`);
    }
    if (typeof value === "number" && property.minimum !== undefined && value < property.minimum) {
      throw new Error(`Argument ${key} must be at least ${property.minimum}.`);
    }
    if (typeof value === "number" && property.maximum !== undefined && value > property.maximum) {
      throw new Error(`Argument ${key} must be at most ${property.maximum}.`);
    }
  }

  switch (name) {
    case "tiefsee_pages": return await listWindows();
    case "tiefsee_state": {
      const windows = await listWindows();
      const matches = windows.filter(window => window.windowId === args.windowId);
      if (matches.length !== 1) throw new Error(`Expected one page for windowId ${args.windowId}, found ${matches.length}.`);
      return matches[0];
    }
    case "tiefsee_snapshot": return await snapshotForWindow(args.windowId);
    case "tiefsee_inspect": return await inspectForWindow(args.windowId, args.selector);
    case "tiefsee_click": return await clickForWindow(args.windowId, args.selector, args.button ?? "left", args.includeSnapshot === true, args.clickCount ?? 1);
    case "tiefsee_click_at": return await clickAtForWindow(args.windowId, args.x, args.y, args.button ?? "left");
    case "tiefsee_click_text": return await clickTextForWindow(args.windowId, args.text, args.includeSnapshot === true);
    case "tiefsee_press": return await pressForWindow(args.windowId, args.keys, args.waitMs);
    case "tiefsee_type": return await typeForWindow(args.windowId, args.text);
    case "tiefsee_move": return await moveForWindow(args.windowId, args.x, args.y);
    case "tiefsee_resize_window": return await resizeWindowForWindow(args.windowId, args.width, args.height);
    case "tiefsee_wheel": return await wheelForWindow(args.windowId, args.x, args.y, args.deltaY, args.deltaX ?? 0, args.captureScreenshot === true, args.captureScreenshotDelayMs ?? 0);
    case "tiefsee_touch_gesture": return await touchGestureForWindow(args.windowId, args.kind, args.x, args.y, args.radius, args.value, args.steps ?? 12, args.durationMs ?? 300);
    case "tiefsee_drag": return await dragForWindow(args.windowId, args.x1, args.y1, args.x2, args.y2, args.steps ?? 1, args.durationMs ?? 0, args.captureConsoleMs ?? 0, args.captureTrace ?? false);
    case "tiefsee_wait": return await waitForWindow(args.windowId, args);
    case "tiefsee_screenshot": {
      const { target, cdp } = await findWindowTarget(args.windowId);
      try {
        const state = await readState(target, cdp);
        if (state?.windowId !== args.windowId) throw new Error("Target identity changed before screenshot.");
        const image = await cdp.call("Page.captureScreenshot", { format: "png", fromSurface: true });
        return { image: image.data, state };
      } finally { cdp.close(); }
    }
    default: throw new Error(`Unknown tool: ${name}`);
  }
}

async function runMcpServer() {
  keepCdpConnections = true;
  const input = createInterface({ input: process.stdin, crlfDelay: Infinity });
  const send = message => process.stdout.write(`${JSON.stringify(message)}\n`);
  try {
    for await (const line of input) {
      let message;
      try { message = JSON.parse(line); }
      catch { continue; }
      if (message.method === "notifications/exit") {
        closeCdpConnections();
        process.exit(0);
      }
      if (message.method === "notifications/initialized" || message.method === "notifications/cancelled") continue;
      if (message.method === "initialize") {
        send({ jsonrpc: "2.0", id: message.id, result: {
          protocolVersion: message.params?.protocolVersion ?? "2025-03-26",
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name: "tiefsee-webview", version: "1.0.0" },
        } });
        continue;
      }
      if (message.method === "ping") {
        send({ jsonrpc: "2.0", id: message.id, result: {} });
        continue;
      }
      if (message.method === "tools/list") {
        send({ jsonrpc: "2.0", id: message.id, result: { tools: mcpTools } });
        continue;
      }
      if (message.method === "tools/call") {
        try {
          const result = await callMcpTool(message.params?.name, message.params?.arguments ?? {});
          if (result?.image) {
            send({ jsonrpc: "2.0", id: message.id, result: { content: [
              { type: "image", data: result.image, mimeType: "image/png" },
              { type: "text", text: JSON.stringify(result.state) },
            ] } });
          } else {
            send({ jsonrpc: "2.0", id: message.id, result: { content: [{ type: "text", text: JSON.stringify(result) }] } });
          }
        } catch (error) {
          send({ jsonrpc: "2.0", id: message.id, result: { isError: true, content: [{ type: "text", text: error.message }] } });
        }
        continue;
      }
      if (message.id !== undefined) {
        send({ jsonrpc: "2.0", id: message.id, error: { code: -32601, message: `Method not found: ${message.method}` } });
      }
    }
  } finally {
    closeCdpConnections();
  }
}

const [command, ...args] = process.argv.slice(2);
try {
  if (command === "mcp" && args.length === 0) {
    await runMcpServer();
  } else if (command === "call" && args.length === 2) {
    let toolArgs;
    try { toolArgs = JSON.parse(args[1]); }
    catch { throw new Error("Tool arguments must be valid JSON."); }
    if (!toolArgs || typeof toolArgs !== "object" || Array.isArray(toolArgs)) {
      throw new Error("Tool arguments must be a JSON object.");
    }
    console.log(JSON.stringify(await callMcpTool(args[0], toolArgs)));
  } else if (command === "pages" && args.length === 0) {
    console.log(JSON.stringify(await listWindows()));
  } else if (command === "state" && args.length === 1) {
    const windows = await listWindows();
    const matches = windows.filter(window => window.windowId === args[0]);
    if (matches.length !== 1) {
      throw new Error(`Expected one page for windowId ${args[0]}, found ${matches.length}.`);
    }
    console.log(JSON.stringify(matches[0]));
  } else if (command === "press" && (args.length === 2 || args.length === 3)) {
    const waitMs = args[2] === undefined ? undefined : Number(args[2]);
    if (waitMs !== undefined && (!Number.isInteger(waitMs) || waitMs < 0 || waitMs > 30000)) {
      throw new Error("waitMs must be an integer from 0 to 30000.");
    }
    console.log(JSON.stringify(await pressForWindow(args[0], args[1], waitMs)));
  } else if (command === "click" && args.length >= 2) {
    console.log(JSON.stringify(await clickForWindow(args[0], args.slice(1).join(" "))));
  } else if (command === "inspect" && (args.length === 1 || args.length >= 2)) {
    console.log(JSON.stringify(await inspectForWindow(args[0], args.slice(1).join(" ") || undefined)));
  } else if (command === "move" && args.length === 3) {
    console.log(JSON.stringify(await moveForWindow(args[0], Number(args[1]), Number(args[2]))));
  } else if (command === "wheel" && (args.length === 4 || args.length === 5)) {
    console.log(JSON.stringify(await wheelForWindow(args[0], Number(args[1]), Number(args[2]), Number(args[3]), args[4] === undefined ? 0 : Number(args[4]))));
  } else {
    throw new Error("Usage: node CdpTest.mjs call <toolName> <jsonArgs> | pages | state <windowId> | press <windowId> <shortcut> [waitMs] | click <windowId> <cssSelector> | inspect <windowId> [cssSelector] | move <windowId> <x> <y> | wheel <windowId> <x> <y> <deltaY> [deltaX]");
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  if (command !== "mcp") closeCdpConnections();
}
