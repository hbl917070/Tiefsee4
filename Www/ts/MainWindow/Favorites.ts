import { Lib } from "../Lib";
import { getExceptionMessage } from "../ApiResponse";
import { WebAPI } from "../WebAPI";
import { Toast } from "../Toast";
import { MainWindow } from "./MainWindow";

type FavoriteLoadContent = "firstFile" | "firstDirectory";

interface FavoriteItemBase {
    id: string;
    name: string;
}
interface FavoriteFile extends FavoriteItemBase {
    type: "file";
    path: string;
}
interface FavoriteDirectory extends FavoriteItemBase {
    type: "directory";
    path: string;
    loadContent: FavoriteLoadContent;
}
interface FavoriteGroup extends FavoriteItemBase {
    type: "group";
    items: FavoriteLeaf[];
}
type FavoriteLeaf = FavoriteFile | FavoriteDirectory;
type FavoriteItem = FavoriteLeaf | FavoriteGroup;

interface FavoritesDocument {
    version: 1;
    items: FavoriteItem[];
}

interface FavoritesDragState {
    source: HTMLElement;
    proxy: HTMLElement;
    placeholder: HTMLElement;
    from: HTMLElement;
    list: HTMLElement;
    item: FavoriteItem;
    id: string;
    pointerId: number;
    pointerType: string;
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    width: number;
    height: number;
    started: boolean;
    scrolling: boolean;
    holdTimer: number;
    scrollTarget: HTMLElement | null;
}

/** 主視窗的收藏面板、編輯流程與 AppData 收藏資料。 */
export class Favorites {

    private readonly M: MainWindow;
    private readonly host: HTMLElement;
    private readonly panel: HTMLElement;
    private readonly rootGrid: HTMLElement;
    private readonly folderView: HTMLElement;
    private readonly folderGrid: HTMLElement;
    private readonly addMenu: HTMLElement;
    private readonly itemMenu: HTMLElement;
    private readonly editor: HTMLElement;
    private readonly editorForm: HTMLFormElement;
    private items: FavoriteItem[] = [];
    private opened = false;
    private editing = false;
    private activeGroupId: string | null = null;
    private intent: { mode: "reorder" | "create" | "into"; draggedId: string; targetId: string; position: number | null; slotEdge: "before" | "after" | null; ready: boolean; timer: number } | null = null;
    private drag: FavoritesDragState | null = null;
    private suppressClick = false;
    private folderMotion: Animation | null = null;
    private editingItemId: string | null = null;
    private activeMenuItemId: string | null = null;
    private imageObserver: IntersectionObserver;

    constructor(M: MainWindow) {
        this.M = M;
        this.host = document.createElement("div");
        this.host.className = "favorites-host";
        this.host.innerHTML = `
            <section class="favorites-panel" id="favorites-panel" aria-label="收藏" aria-hidden="true" hidden>
                <header class="favorites-header">
                    <h2 class="favorites-title"><span i18n="favorites.title">收藏</span><span class="favorites-count" aria-live="polite"></span></h2>
                    <div class="favorites-header-actions">
                        <button class="favorites-add" type="button" data-action="add" i18n="favorites.add" aria-label="新增收藏" title="新增收藏">${SvgList["tool-zoomIn.svg"]}</button>
                    </div>
                </header>
                <div class="favorites-root-view">
                    <div class="favorites-grid" role="list" aria-label="收藏項目"></div>
                    <div class="favorites-empty" i18n="favorites.empty" hidden>尚無收藏，使用「＋」新增。</div>
                </div>
            </section>
            <section class="favorites-folder-view" aria-label="收藏資料夾" hidden>
                <header class="favorites-folder-header">
                    <button class="favorites-folder-back" type="button" i18n="favorites.folderBack" aria-label="返回收藏" title="返回收藏">${SvgList["tool-back.svg"]}</button>
                    <input class="favorites-folder-title" type="text" i18n="favorites.renameGroup" aria-label="收藏資料夾名稱" autocomplete="off" spellcheck="false">
                </header>
                <div class="favorites-grid favorites-folder-grid" role="list" aria-label="資料夾內的收藏項目"></div>
                <div class="favorites-folder-empty" i18n="favorites.folderEmpty" hidden>將收藏項目拖到這裡。</div>
                <div class="favorites-folder-out-hint" i18n="favorites.dragOut">拖曳項目到外部可移出收藏資料夾</div>
            </section>
            <div class="menu favorites-menu" data-menu="none" active="">
                <div class="menu-content favorites-add-menu">
                    <div class="menu-box">
                        <button class="menu-hor-item" type="button" data-action="add-current-file" i18n="favorites.addCurrentFile">新增目前檔案</button>
                        <button class="menu-hor-item" type="button" data-action="add-current-directory" i18n="favorites.addCurrentDirectory">新增目前資料夾</button>
                        <button class="menu-hor-item" type="button" data-action="add-custom" i18n="favorites.addCustom">自訂…</button>
                    </div>
                </div>
            </div>
            <div class="menu favorites-menu" data-menu="none" active="">
                <div class="menu-content favorites-item-actions">
                    <div class="menu-box">
                        <button class="menu-hor-item" type="button" data-action="open-new-window" i18n="menu.openNewWindow">另開視窗</button>
                        <div class="menu-hor-hr"></div>
                        <button class="menu-hor-item" type="button" data-action="edit" i18n="favorites.edit">編輯</button>
                        <button class="menu-hor-item" type="button" data-action="remove" i18n="favorites.remove">移除</button>
                    </div>
                </div>
            </div>
            <section class="favorites-editor-layer" hidden>
                <div class="favorites-editor" role="dialog" aria-modal="true" aria-labelledby="favorites-editor-title">
                    <button class="favorites-editor-close" type="button" data-action="cancel-edit" i18n="msg.close" aria-label="關閉" title="關閉"><span aria-hidden="true"></span></button>
                    <h3 id="favorites-editor-title" i18n="favorites.editorTitle">新增收藏</h3>
                    <form>
                        <label><span i18n="favorites.type">類型</span>
                            <select name="type"><option value="file" i18n="favorites.file">檔案</option><option value="directory" i18n="favorites.directory">資料夾</option></select>
                        </label>
                        <label><span i18n="favorites.name">名稱</span><input name="name" type="text" autocomplete="off"></label>
                        <label><span i18n="favorites.path">路徑</span><div class="favorites-path-row"><input name="path" type="text" required autocomplete="off"><button class="msgbox-btn" type="button" data-action="browse" i18n="favorites.browse">瀏覽…</button></div></label>
                        <label class="favorites-load-row"><span i18n="favorites.loadContent">載入內容</span>
                            <select name="loadContent"><option value="firstFile" i18n="favorites.firstFile">第一個檔案</option><option value="firstDirectory" i18n="favorites.firstDirectory">第一個資料夾</option></select>
                        </label>
                        <div class="favorites-editor-actions"><button type="submit" class="msgbox-btn" data-action="save-edit" i18n="favorites.save">儲存</button></div>
                    </form>
                </div>
            </section>`;
        document.body.appendChild(this.host);
        this.panel = this.host.querySelector(".favorites-panel")!;
        this.rootGrid = this.host.querySelector(".favorites-root-view .favorites-grid")!;
        this.folderView = this.host.querySelector(".favorites-folder-view")!;
        this.folderGrid = this.host.querySelector(".favorites-folder-grid")!;
        this.addMenu = this.host.querySelector(".favorites-add-menu")!;
        this.itemMenu = this.host.querySelector(".favorites-item-actions")!;
        this.editor = this.host.querySelector(".favorites-editor-layer")!;
        this.editorForm = this.host.querySelector(".favorites-editor form")!;
        this.imageObserver = new IntersectionObserver(entries => {
            for (const entry of entries) {
                if (entry.isIntersecting === false) continue;
                const image = entry.target as HTMLImageElement;
                const url = image.dataset.requestUrl;
                if (!url) continue;
                delete image.dataset.requestUrl;
                this.imageObserver.unobserve(image);
                this.M.imageRequestLimiter.addRequest(image, url);
            }
        }, { rootMargin: "100px" });
        this.bindEvents();
    }

    public async toggle(button?: HTMLElement) {
        if (this.opened) {
            this.close();
            return;
        }
        try {
            // 面板每次開啟都讀最新文件；不在視窗初始化時快取收藏清單。
            this.items = this.parseDocument(await WV_Favorites.ReadJson()).items;
            this.opened = true;
            this.panel.hidden = false;
            this.panel.setAttribute("aria-hidden", "false");
            this.host.classList.add("is-open");
            document.querySelectorAll(".main-toolbar-favorites").forEach(toolbarButton => toolbarButton.setAttribute("aria-expanded", "true"));
            const currentFile = this.M.fileLoad.getFilePath();
            const currentDirectory = this.M.fileLoad.getDirPath();
            const addCurrentFile = this.host.querySelector<HTMLButtonElement>('[data-action="add-current-file"]')!;
            const addCurrentDirectory = this.host.querySelector<HTMLButtonElement>('[data-action="add-current-directory"]')!;
            addCurrentFile.disabled = !currentFile || this.M.fileLoad.getIsArchiveMode();
            addCurrentDirectory.disabled = !currentDirectory;
            this.render();
            this.positionPanel(button);
        } catch (error) {
            console.error("[Favorites] 無法讀取收藏資料。", error);
            this.M.msgbox.show({ txt: `${this.M.i18n.t("favorites.readFailed")}\n${String(error)}` });
        }
    }

    public close() {
        if (this.editing) return;
        this.closeFolder(false);
        this.opened = false;
        this.panel.hidden = true;
        this.panel.setAttribute("aria-hidden", "true");
        this.host.classList.remove("is-open");
        document.querySelectorAll(".main-toolbar-favorites").forEach(button => button.setAttribute("aria-expanded", "false"));
        this.M.menu.close(this.addMenu);
        this.M.menu.close(this.itemMenu);
    }

    /** 直接收藏路徑，不開啟編輯視窗；每次加入前先讀取最新的 JSON。 */
    public async quickAdd(type: "file" | "directory", path: string) {
        if (!path) return;
        try {
            this.items = this.parseDocument(await WV_Favorites.ReadJson()).items;
            const item: FavoriteLeaf = type === "directory" ? {
                id: this.randomId(),
                type,
                name: "",
                path,
                loadContent: "firstFile",
            } : {
                id: this.randomId(),
                type,
                name: "",
                path,
            };
            this.items.push(item);
            const saved = await this.save();
            if (this.opened) this.render();
            if (!saved) return;
            Toast.show(this.M.i18n.t(type === "file" ? "favorites.quickAddedFile" : "favorites.quickAddedDirectory"), 3000);
        } catch (error) {
            console.error("[Favorites] 快速新增收藏失敗。", error);
            this.M.msgbox.show({ txt: `${this.M.i18n.t("favorites.saveFailed")}\n${String(error)}` });
        }
    }

    private positionPanel(button?: HTMLElement) {
        const anchor = button?.getBoundingClientRect();
        const panelWidth = this.panel.offsetWidth;
        const panelHeight = this.panel.offsetHeight;
        const anchorCenterX = anchor ? anchor.left + anchor.width / 2 : window.innerWidth / 2;
        const minLeft = 8;
        const maxLeft = Math.max(minLeft, window.innerWidth - panelWidth - 8);
        const left = Math.min(maxLeft, Math.max(minLeft, anchorCenterX - panelWidth / 2));
        const preferredTop = anchor ? anchor.bottom + 1 : 67;
        const maxTop = Math.max(8, window.innerHeight - panelHeight - 8);
        const top = Math.min(maxTop, Math.max(8, preferredTop));
        this.panel.style.left = `${left}px`;
        this.panel.style.top = `${top}px`;
    }

    private bindEvents() {
        this.host.addEventListener("click", event => {
            if (this.suppressClick) return;
            const target = event.target as HTMLElement;
            const folderTitle = this.host.querySelector<HTMLInputElement>(".favorites-folder-title");
            if (folderTitle && target !== folderTitle && document.activeElement === folderTitle) folderTitle.blur();
            const actionElement = target.closest<HTMLElement>("[data-action]");
            const action = actionElement?.dataset.action;
            if (action === "add") { this.toggleMenu(this.addMenu, actionElement); return; }
            if (action === "add-current-file") {
                this.M.menu.close(this.addMenu);
                const path = this.M.fileLoad.getFilePath();
                if (path && !this.M.fileLoad.getIsArchiveMode()) this.openEditor({ type: "file", path });
                return;
            }
            if (action === "add-current-directory") {
                this.M.menu.close(this.addMenu);
                const path = this.M.fileLoad.getDirPath();
                if (path) this.openEditor({ type: "directory", path });
                return;
            }
            if (action === "add-custom") { this.M.menu.close(this.addMenu); this.openEditor(); return; }
            if (action === "browse") { void this.browsePath(); return; }
            if (action === "cancel-edit") { this.closeEditor(); return; }
            if (action === "save-edit") { event.preventDefault(); void this.saveEditor(); return; }
            if (action === "folder-back") { this.closeFolder(true); return; }
            if (action === "open-new-window") {
                const item = this.findItem(this.activeMenuItemId ?? "");
                this.M.menu.close(this.itemMenu);
                this.activeMenuItemId = null;
                if (item && item.type !== "group") void this.openItemInNewWindow(item);
                return;
            }
            if (action === "edit") {
                const itemId = this.activeMenuItemId;
                this.M.menu.close(this.itemMenu);
                const item = this.findItem(itemId ?? "");
                this.activeMenuItemId = null;
                if (item && item.type !== "group") this.openEditor(item);
                return;
            }
            if (action === "remove") {
                const itemId = this.activeMenuItemId;
                this.M.menu.close(this.itemMenu);
                this.activeMenuItemId = null;
                if (itemId) void this.removeItem(itemId);
                return;
            }
            if (action === "item-menu") {
                const tile = actionElement?.closest<HTMLElement>(".favorite-tile");
                if (tile) {
                    this.configureItemMenu(tile);
                    this.toggleMenu(this.itemMenu, actionElement);
                }
                return;
            }

            const groupBack = target.closest(".favorites-folder-back");
            if (groupBack) { this.closeFolder(true); return; }
            if (this.activeGroupId && !this.folderView.contains(target)) {
                this.closeFolder(true);
                return;
            }
            const tile = target.closest<HTMLElement>(".favorite-tile");
            if (!tile) return;
            const item = this.findItem(tile.dataset.id ?? "");
            if (!item) return;
            if (item.type === "group") this.openFolder(item, tile);
            else void this.openItem(item);
        });

        this.host.addEventListener("dblclick", event => {
            const title = (event.target as HTMLElement).closest<HTMLElement>(".favorite-group-name");
            if (!title) return;
            const item = title.closest<HTMLElement>(".favorite-tile")
                ? this.findItem(title.closest<HTMLElement>(".favorite-tile")!.dataset.id ?? "")
                : this.activeGroupId ? this.findItem(this.activeGroupId) : undefined;
            if (item?.type === "group") this.beginInlineRename(title, item);
        });

        this.host.addEventListener("contextmenu", event => {
            const target = event.target as HTMLElement;
            if (target.closest("input:not([readonly]), textarea, [contenteditable='true']")) return;
            const tile = target.closest<HTMLElement>(".favorite-tile");
            if (!tile) return;
            event.preventDefault();
            event.stopPropagation();
            this.M.menu.close();
            this.configureItemMenu(tile);
            this.M.menu.openAtPoint(this.itemMenu, event.clientX, event.clientY);
        });

        this.editorForm.addEventListener("submit", event => {
            event.preventDefault();
            void this.saveEditor();
        });
        const folderTitle = this.host.querySelector<HTMLInputElement>(".favorites-folder-title")!;
        folderTitle.addEventListener("blur", () => {
            const group = this.activeGroupId ? this.findItem(this.activeGroupId) : undefined;
            if (group?.type !== "group") return;
            group.name = folderTitle.value.trim() || "資料夾";
            folderTitle.value = group.name;
            void this.save().then(() => this.render());
        });
        folderTitle.addEventListener("keydown", event => {
            event.stopPropagation();
            if (event.key === "Enter") {
                event.preventDefault();
                folderTitle.blur();
            } else if (event.key === "Escape") {
                event.preventDefault();
                const group = this.activeGroupId ? this.findItem(this.activeGroupId) : undefined;
                if (group?.type === "group") folderTitle.value = group.name || "資料夾";
                folderTitle.blur();
            }
        });
        this.host.addEventListener("change", event => {
            if ((event.target as HTMLElement).matches('[name="type"]')) this.updateLoadContentVisibility();
        });
        this.host.addEventListener("keydown", event => {
            const keyboardEvent = event as KeyboardEvent;
            if (keyboardEvent.key === "Escape") {
                if (this.editing) { this.closeEditor(); keyboardEvent.stopPropagation(); }
                else if (this.activeGroupId) this.closeFolder(true);
                else this.close();
            }
        });
        const closeOnOutsidePress = (event: MouseEvent | TouchEvent) => {
            if (!this.opened || this.editing) return;
            const target = event.target as HTMLElement;
            if (this.panel.contains(target) || this.folderView.contains(target)) return;
            if (target.closest(".favorites-menu")) {
                if (target.closest(".menu-hor-item")) return;
                const rect = this.panel.getBoundingClientRect();
                const point = "touches" in event ? event.touches[0] : event;
                if (point && point.clientX >= rect.left && point.clientX <= rect.right && point.clientY >= rect.top && point.clientY <= rect.bottom) return;
            }
            event.preventDefault();
            this.close();
        };
        this.host.addEventListener("mousedown", closeOnOutsidePress);
        this.host.addEventListener("touchstart", closeOnOutsidePress, { passive: false });
        const suppressFavoritesContextMenu = (event: MouseEvent) => {
            if (event.button !== 2) return;
            const target = event.target as HTMLElement;
            if (target.closest("input:not([readonly]), textarea, [contenteditable='true']")) return;
            event.preventDefault();
            event.stopPropagation();
        };
        this.host.addEventListener("mousedown", suppressFavoritesContextMenu);
        this.host.addEventListener("mouseup", suppressFavoritesContextMenu);
        this.rootGrid.addEventListener("pointerdown", event => this.beginDrag(event));
        this.folderGrid.addEventListener("pointerdown", event => this.beginDrag(event));
        const textMenuRoot = document.querySelector<HTMLElement>("#menu-text")?.parentElement;
        if (textMenuRoot) {
            const updateTextMenuLayer = () => {
                this.host.classList.toggle("has-text-context-menu", this.opened && textMenuRoot.getAttribute("active") === "true");
            };
            new MutationObserver(updateTextMenuLayer).observe(textMenuRoot, { attributes: true, attributeFilter: ["active"] });
        }
        window.addEventListener("blur", () => {
            if (this.opened && !this.editing) this.close();
        });
    }

    private render() {
        const existingTiles = new Map<string, HTMLElement>();
        for (const grid of [this.rootGrid, this.folderGrid]) {
            for (const tile of grid.querySelectorAll<HTMLElement>(":scope > .favorite-tile")) {
                const id = tile.dataset.id;
                if (id) existingTiles.set(id, tile);
            }
        }
        const retainedIds = new Set<string>();
        const getTile = (item: FavoriteItem) => {
            const tile = existingTiles.get(item.id);
            if (tile?.dataset.renderKey === this.getTileRenderKey(item)) {
                retainedIds.add(item.id);
                return tile;
            }
            tile?.querySelectorAll<HTMLImageElement>("img").forEach(image => this.imageObserver.unobserve(image));
            const newTile = this.createTile(item);
            retainedIds.add(item.id);
            return newTile;
        };
        const rootTiles = this.items.map(getTile);
        const empty = this.host.querySelector<HTMLElement>(".favorites-empty")!;
        this.host.querySelector<HTMLElement>(".favorites-count")!.textContent = String(this.items.length);
        empty.hidden = this.items.length > 0;
        if (this.activeGroupId) {
            const group = this.findItem(this.activeGroupId);
            if (group?.type === "group") {
                this.folderView.hidden = false;
                this.folderView.dataset.id = group.id;
                this.folderGrid.replaceChildren(...group.items.map(getTile));
                const title = this.host.querySelector<HTMLInputElement>(".favorites-folder-title")!;
                if (document.activeElement !== title) title.value = group.name || "資料夾";
                this.host.querySelector<HTMLElement>(".favorites-folder-empty")!.hidden = group.items.length > 0;
            } else {
                this.activeGroupId = null;
                this.folderView.hidden = true;
                this.folderGrid.replaceChildren();
            }
        } else {
            this.folderView.hidden = true;
            this.folderGrid.replaceChildren();
        }
        this.rootGrid.replaceChildren(...rootTiles);
        for (const [id, tile] of existingTiles) {
            if (!retainedIds.has(id)) tile.querySelectorAll<HTMLImageElement>("img").forEach(image => this.imageObserver.unobserve(image));
        }
        this.host.querySelectorAll<HTMLImageElement>("img[data-request-url]").forEach(image => this.imageObserver.observe(image));
    }

    private getTileRenderKey(item: FavoriteItem): string {
        const previewItems = item.type === "group"
            ? item.items.slice(0, 4).map(child => [child.id, child.type, child.path])
            : [];
        return JSON.stringify([item.type, item.name, item.type === "group" ? "" : item.path, previewItems]);
    }

    private createTile(item: FavoriteItem): HTMLElement {
        const tile = document.createElement("article");
        tile.className = `favorite-tile${item.type === "group" ? " is-group" : ""}`;
        tile.dataset.id = item.id;
        tile.dataset.kind = item.type;
        tile.dataset.renderKey = this.getTileRenderKey(item);
        tile.setAttribute("role", "listitem");
        const icon = item.type === "group"
            ? `<div class="favorite-group-preview" aria-hidden="true">${item.items.slice(0, 4).map(child => `<img src="./img/transparent.svg" alt="" data-kind="${child.type}" data-request-url="${Lib.escape(WebAPI.Img.fileIcon(child.path, child.type === "directory"))}" loading="lazy">`).join("")}</div>`
            : `<img class="favorite-icon" src="./img/transparent.svg" alt="" data-kind="${item.type}" data-request-url="${Lib.escape(WebAPI.Img.fileIcon(item.path, item.type === "directory"))}" loading="lazy">`;
        const path = item.type === "group" ? "" : item.path;
        const defaultName = path ? Lib.getFileName(path.replace(/[\\/]+$/, "")) : "";
        tile.innerHTML = `${icon}<span class="favorite-name${item.type === "group" ? " favorite-group-name" : ""}" title="${Lib.escape(path || item.name)}">${Lib.escape(item.name || defaultName || "資料夾")}</span>
            <button type="button" class="favorite-item-menu" data-action="item-menu" aria-label="${this.M.i18n.t("favorites.itemActions")}">⋯</button>`;
        tile.querySelectorAll<HTMLImageElement>("img").forEach(image => image.addEventListener("error", () => {
            const fallback = document.createElement("span");
            const kind = image.dataset.kind === "directory" ? "directory" : "file";
            fallback.className = `favorite-icon-fallback is-${kind}`;
            fallback.setAttribute("aria-hidden", "true");
            fallback.innerHTML = kind === "directory"
                ? SvgList["error-folder.svg"]
                : SvgList["error-file.svg"];
            image.replaceWith(fallback);
        }, { once: true }));
        return tile;
    }

    private configureItemMenu(tile: HTMLElement) {
        this.activeMenuItemId = tile.dataset.id ?? null;
        const isGroup = tile.dataset.kind === "group";
        const editAction = this.itemMenu.querySelector<HTMLElement>('[data-action="edit"]');
        const openNewWindowAction = this.itemMenu.querySelector<HTMLElement>('[data-action="open-new-window"]');
        const separator = this.itemMenu.querySelector<HTMLElement>(".menu-hor-hr");
        if (editAction) editAction.hidden = isGroup;
        if (openNewWindowAction) openNewWindowAction.hidden = isGroup;
        if (separator) separator.hidden = isGroup;
    }

    private beginDrag(event: PointerEvent) {
        const target = event.target as HTMLElement;
        if (event.button !== 0 || this.drag || target.closest(".favorite-item-menu")) return;
        const tile = target.closest<HTMLElement>(".favorite-tile");
        if (!tile) return;
        const id = tile.dataset.id ?? "";
        const source = tile.parentElement;
        const group = this.activeGroupId ? this.findItem(this.activeGroupId) : undefined;
        const sourceItems = source === this.rootGrid ? this.items : source === this.folderGrid && group?.type === "group" ? group.items : undefined;
        const item = sourceItems?.find(entry => entry.id === id);
        if (!source || !item) return;
        const rect = tile.getBoundingClientRect();
        const proxy = tile.cloneNode(true) as HTMLElement;
        proxy.classList.add("favorite-drag-proxy");
        Object.assign(proxy.style, { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px` });
        const placeholder = document.createElement("div");
        placeholder.className = "favorite-tile-placeholder";
        placeholder.style.width = `${rect.width}px`;
        placeholder.style.height = `${rect.height}px`;
        const drag: FavoritesDragState = {
            source: tile,
            proxy,
            placeholder,
            from: source,
            list: source,
            item,
            id,
            pointerId: event.pointerId,
            pointerType: event.pointerType,
            startX: event.clientX,
            startY: event.clientY,
            lastX: event.clientX,
            lastY: event.clientY,
            width: rect.width,
            height: rect.height,
            started: false,
            scrolling: false,
            holdTimer: 0,
            scrollTarget: source === this.rootGrid ? this.rootGrid.parentElement : source === this.folderGrid ? this.folderGrid : null,
        };
        this.drag = drag;
        if (event.pointerType === "touch") {
            drag.holdTimer = window.setTimeout(() => {
                if (this.drag === drag && !drag.scrolling) {
                    drag.holdTimer = 0;
                    this.startDrag();
                }
            }, 450);
        }
        window.addEventListener("pointermove", this.onDragMove, true);
        window.addEventListener("pointerup", this.onDragEnd, true);
        window.addEventListener("pointercancel", this.onDragCancel, true);
    }

    private onDragMove = (event: PointerEvent) => {
        const drag = this.drag;
        if (!drag || event.pointerId !== drag.pointerId) return;
        if (!drag.started && drag.pointerType === "touch") {
            const movedY = event.clientY - drag.lastY;
            drag.lastX = event.clientX;
            drag.lastY = event.clientY;
            if (!drag.scrolling && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) >= 8) {
                drag.scrolling = true;
                if (drag.holdTimer) window.clearTimeout(drag.holdTimer);
                drag.holdTimer = 0;
            }
            if (drag.scrolling) {
                if (drag.scrollTarget) drag.scrollTarget.scrollTop -= movedY;
                event.preventDefault();
            }
            return;
        }
        if (!drag.started && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) >= 6) this.startDrag();
        if (!drag.started) return;
        event.preventDefault();
        const maxLeft = Math.max(0, window.innerWidth - drag.width);
        const maxTop = Math.max(0, window.innerHeight - drag.height);
        drag.proxy.style.left = `${Math.max(0, Math.min(event.clientX - drag.width / 2, maxLeft))}px`;
        drag.proxy.style.top = `${Math.max(0, Math.min(event.clientY - drag.height / 2, maxTop))}px`;
        const hit = this.getDropHit(event.clientX, event.clientY);
        if (!hit) { this.clearIntent(); return; }
        if (hit.list !== drag.list) {
            drag.list = hit.list;
            hit.list.append(drag.placeholder);
        }
        this.beginIntent(hit.target, hit.mode, drag.id, hit.position, hit.edge, hit.end);
    };

    private startDrag() {
        const drag = this.drag;
        if (!drag || drag.started) return;
        document.body.append(drag.proxy);
        drag.source.replaceWith(drag.placeholder);
        drag.started = true;
    }

    private getDropHit(clientX: number, clientY: number): { target: HTMLElement; list: HTMLElement; mode: "reorder" | "create" | "into"; position: number | null; edge: "before" | "after" | null; end: boolean } | null {
        const drag = this.drag;
        if (!drag) return null;
        const element = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
        if (drag.from === this.rootGrid && !this.folderView.hidden && this.activeGroupId && element && this.folderView.contains(element)) {
            if (drag.item.type === "group") return null;
            return { target: this.folderView, list: this.rootGrid, mode: "into", position: null, edge: null, end: false };
        }
        const placeholder = element?.closest<HTMLElement>(".favorite-tile-placeholder");
        if (placeholder) {
            const list = placeholder.parentElement === this.rootGrid || placeholder.parentElement === this.folderGrid ? placeholder.parentElement : drag.list;
            const position = this.placeholderPosition(list);
            const tiles = this.tilesIn(list);
            const target = tiles[Math.min(position, tiles.length - 1)] ?? list;
            const edge = tiles.length === 0 || position >= tiles.length ? "after" : "before";
            return { target, list, mode: "reorder", position, edge, end: position >= tiles.length };
        }
        const tile = element?.closest<HTMLElement>(".favorite-tile");
        if (tile && tile.dataset.id !== drag.id) {
            const list = tile.parentElement === this.rootGrid || tile.parentElement === this.folderGrid ? tile.parentElement : drag.list;
            const rect = tile.getBoundingClientRect();
            const center = clientX >= rect.left + rect.width * .2 && clientX <= rect.right - rect.width * .2
                && clientY >= rect.top + rect.height * .18 && clientY <= rect.bottom - rect.height * .34;
            // 只有卡片中央區域建立／加入收藏資料夾；卡片邊緣依所在列的左右格位排序。
            if (list === this.rootGrid && drag.from === this.rootGrid && center && drag.item.type !== "group") {
                const mode = tile.dataset.kind === "group" ? "into" : "create";
                return { target: tile, list, mode, position: null, edge: null, end: false };
            }
            const slot = this.slotForTile(list, tile, clientX);
            return { target: tile, list, mode: "reorder", position: slot.position, edge: slot.edge, end: slot.position >= this.tilesIn(list).length };
        }
        const list = this.isPointWithinRect(clientX, clientY, this.rootGrid.getBoundingClientRect()) ? this.rootGrid
            : !this.folderView.hidden && this.isPointWithinRect(clientX, clientY, this.folderGrid.getBoundingClientRect()) ? this.folderGrid : null;
        if (!list) return null;
        if (list === this.folderGrid && drag.from === this.rootGrid && this.activeGroupId && drag.item.type !== "group") {
            return { target: this.folderView, list: this.rootGrid, mode: "into", position: null, edge: null, end: false };
        }
        if (this.isTrailingBlank(list, clientX, clientY)) {
            return { target: list, list, mode: "reorder", position: this.tilesIn(list).length, edge: "after", end: true };
        }
        const candidate = this.getInsertionCandidate(list, clientX, clientY);
        return candidate ? { ...candidate, list, mode: "reorder", end: candidate.position >= this.tilesIn(list).length } : null;
    }

    private tilesIn(list: HTMLElement): HTMLElement[] {
        return [...list.querySelectorAll<HTMLElement>(":scope > .favorite-tile")].filter(tile => tile.dataset.id !== this.drag?.id);
    }

    private placeholderPosition(list: HTMLElement): number {
        const placeholder = this.drag?.placeholder;
        if (!placeholder || placeholder.parentElement !== list) return 0;
        return [...list.children].slice(0, [...list.children].indexOf(placeholder)).filter(child => child.classList.contains("favorite-tile")).length;
    }

    private slotForTile(list: HTMLElement, tile: HTMLElement, clientX: number): { position: number; edge: "before" | "after" } {
        const tiles = this.tilesIn(list);
        const index = tiles.indexOf(tile);
        const edge = clientX < tile.getBoundingClientRect().left + tile.getBoundingClientRect().width / 2 ? "before" : "after";
        return { position: Math.max(0, index + (edge === "after" ? 1 : 0)), edge };
    }

    private getInsertionCandidate(list: HTMLElement, clientX: number, clientY: number): { target: HTMLElement; position: number; edge: "before" | "after" } | null {
        const tiles = this.tilesIn(list);
        if (!tiles.length) return { target: list, position: 0, edge: "after" };
        const entries = tiles.map(tile => ({ tile, rect: tile.getBoundingClientRect() }))
            .sort((left, right) => left.rect.top - right.rect.top || left.rect.left - right.rect.left);
        const rows: { top: number; entries: typeof entries }[] = [];
        for (const entry of entries) {
            let row = rows[rows.length - 1];
            if (!row || Math.abs(row.top - entry.rect.top) >= 4) {
                row = { top: entry.rect.top, entries: [] };
                rows.push(row);
            }
            row.entries.push(entry);
        }
        const row = rows.reduce<{ row: typeof rows[number]; distance: number } | null>((closest, candidate) => {
            const first = candidate.entries[0].rect;
            const last = candidate.entries[candidate.entries.length - 1].rect;
            const distance = clientY < first.top ? first.top - clientY : clientY > last.bottom ? clientY - last.bottom : 0;
            return !closest || distance < closest.distance ? { row: candidate, distance } : closest;
        }, null)?.row;
        if (!row) return null;
        for (const entry of row.entries) {
            if (clientX < entry.rect.left + entry.rect.width / 2) {
                return { target: entry.tile, position: tiles.indexOf(entry.tile), edge: "before" };
            }
        }
        const last = row.entries[row.entries.length - 1].tile;
        return { target: last, position: tiles.indexOf(last) + 1, edge: "after" };
    }

    private isTrailingBlank(list: HTMLElement, clientX: number, clientY: number): boolean {
        const tiles = this.tilesIn(list);
        if (!tiles.length) return true;
        const last = tiles[tiles.length - 1].getBoundingClientRect();
        const bounds = list.getBoundingClientRect();
        return (clientY >= last.top && clientY <= last.bottom && clientX > last.right)
            || (clientY > last.bottom && clientY <= bounds.bottom);
    }

    private isPointWithinRect(clientX: number, clientY: number, rect: DOMRect): boolean {
        return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
    }

    private beginIntent(target: HTMLElement, mode: "reorder" | "create" | "into", draggedId: string, position: number | null, edge: "before" | "after" | null = null, end = false) {
        const targetId = target.dataset.id ?? (end ? "__end__" : "");
        if (this.intent?.mode === mode && this.intent.draggedId === draggedId && this.intent.position === position && this.intent.slotEdge === edge && this.intent.targetId === targetId) return;
        this.clearIntent();
        const intent = { mode, draggedId, targetId, position, slotEdge: edge, ready: false, timer: 0 };
        this.intent = intent;
        if (mode === "create" || mode === "into") target.classList.add(mode === "create" ? "drop-create" : "drop-into");
        if (mode === "create" || mode === "into") {
            // 建立／加入資料夾不延遲；只有排序要停留一段時間，避免掠過格位就改序。
            intent.ready = true;
            target.classList.add("drop-ready");
            return;
        }
        intent.timer = window.setTimeout(() => {
            if (this.intent !== intent) return;
            intent.ready = true;
            intent.timer = 0;
            if (mode === "reorder" && position !== null) {
                this.applyPlaceholderSlot(this.drag!.list, position);
            }
        }, 320);
    }

    private clearIntent() {
        if (this.intent?.timer) window.clearTimeout(this.intent.timer);
        this.host.querySelectorAll(".favorite-tile.drop-create, .favorite-tile.drop-into, .favorite-tile.drop-ready, .favorites-folder-view.drop-into, .favorites-folder-view.drop-ready")
            .forEach(element => element.classList.remove("drop-create", "drop-into", "drop-ready"));
        this.intent = null;
    }

    private applyPlaceholderSlot(list: HTMLElement, slot: number) {
        const drag = this.drag;
        if (!drag) return;
        if (drag.placeholder.parentElement !== list) { drag.list = list; list.append(drag.placeholder); }
        const tiles = this.tilesIn(list);
        const index = Math.max(0, Math.min(slot, tiles.length));
        const before = new Map(tiles.map(tile => [tile, tile.getBoundingClientRect()]));
        const current = this.placeholderPosition(list);
        if (current !== index) list.insertBefore(drag.placeholder, tiles[index] ?? null);
        requestAnimationFrame(() => {
            for (const tile of this.tilesIn(list)) {
                const from = before.get(tile);
                if (!from) continue;
                const to = tile.getBoundingClientRect();
                const dx = from.left - to.left;
                const dy = from.top - to.top;
                if (dx || dy) tile.animate([{ transform: `translate(${dx}px,${dy}px)` }, { transform: "translate(0,0)" }], { duration: 220, easing: "cubic-bezier(.2,.8,.2,1)" });
            }
        });
    }

    private onDragEnd = (event: PointerEvent) => { void this.finishDrag(event, false); };
    private onDragCancel = (event: PointerEvent) => { void this.finishDrag(event, true); };

    private async finishDrag(event: PointerEvent, canceled: boolean) {
        const drag = this.drag;
        if (!drag || event.pointerId !== drag.pointerId) return;
        const intent = this.intent;
        const valid = !canceled && drag.started && intent?.ready === true && intent.draggedId === drag.id;
        const sourceList = drag.from;
        const destinationList = drag.list;
        this.detachDrag();
        if (!drag.started) {
            if (drag.scrolling) {
                this.suppressClick = true;
                window.setTimeout(() => { this.suppressClick = false; }, 120);
            }
            return;
        }
        this.suppressClick = true;
        window.setTimeout(() => { this.suppressClick = false; }, 120);
        if (valid && intent?.mode === "create") {
            this.restoreDraggedTile(drag);
            await this.createGroup(drag.id, intent.targetId);
            return;
        }
        if (valid && intent?.mode === "into") {
            this.restoreDraggedTile(drag);
            const groupId = intent.targetId || this.activeGroupId || "";
            await this.moveIntoGroup(drag.id, groupId);
            return;
        }
        const releasedInsideFolderGrid = this.folderGrid.contains(document.elementFromPoint(event.clientX, event.clientY));
        // 從資料夾拖出但未落在有效排序格位時，預設追加到收藏最後。
        if (!canceled && drag.started && !valid && sourceList === this.folderGrid && this.activeGroupId
            && !releasedInsideFolderGrid) {
            this.restoreDraggedTile(drag);
            await this.moveOutOfGroup(drag.id, this.readOrder(this.rootGrid).length);
            return;
        }
        this.restoreDraggedTile(drag);
        if (valid && intent?.mode === "reorder" && intent.position !== null) {
            if (sourceList === this.folderGrid && destinationList === this.rootGrid) {
                await this.moveOutOfGroup(drag.id, intent.position);
                return;
            }
            if (sourceList === destinationList && sourceList === this.rootGrid) {
                this.items = this.orderFromDom(this.rootGrid, this.items);
                await this.save();
                this.render();
                return;
            }
            if (sourceList === destinationList && sourceList === this.folderGrid) {
                const group = this.activeGroupId ? this.findItem(this.activeGroupId) : undefined;
                if (group?.type === "group") {
                    group.items = this.orderFromDom(this.folderGrid, group.items);
                    await this.save();
                    this.render();
                }
            }
        }
    }

    private detachDrag() {
        this.clearIntent();
        if (this.drag?.holdTimer) window.clearTimeout(this.drag.holdTimer);
        window.removeEventListener("pointermove", this.onDragMove, true);
        window.removeEventListener("pointerup", this.onDragEnd, true);
        window.removeEventListener("pointercancel", this.onDragCancel, true);
        this.drag?.proxy.remove();
        this.drag = null;
    }

    private restoreDraggedTile(drag: FavoritesDragState) {
        if (drag.placeholder.isConnected) drag.placeholder.replaceWith(drag.source);
    }

    private readOrder(list: HTMLElement): string[] {
        return [...list.querySelectorAll<HTMLElement>(":scope > .favorite-tile")].map(tile => tile.dataset.id ?? "");
    }

    private orderFromDom<T extends FavoriteItem>(list: HTMLElement, source: T[]): T[] {
        const byId = new Map(source.map(item => [item.id, item]));
        return this.readOrder(list).map(id => byId.get(id)).filter((item): item is T => item !== undefined);
    }

    private async openItem(item: FavoriteLeaf) {
        const path = await this.resolveItemPath(item);
        if (!path) return;
        this.close();
        await this.M.fileLoad.loadFile(path);
    }

    private async openItemInNewWindow(item: FavoriteLeaf) {
        const path = await this.resolveItemPath(item);
        if (!path) return;
        this.close();
        await this.M.script.open.openNewWindow(path);
    }

    private async resolveItemPath(item: FavoriteLeaf): Promise<string | undefined> {
        let exists: boolean;
        try {
            exists = await WV_Favorites.Exists(item.type, item.path);
        } catch (error) {
            console.error("[Favorites] 路徑檢查失敗。", error);
            this.M.msgbox.show({ txt: this.M.i18n.t("msg.fileReadFailed", { message: getExceptionMessage(error) }) });
            return undefined;
        }
        if (exists === false) {
            const label = item.name || Lib.getFileName(item.path.replace(/[\\/]+$/, "")) || item.path;
            this.host.classList.add("has-message");
            this.M.msgbox.show({
                txt: `${this.M.i18n.t("favorites.notFound")}\n${label}\n${item.path}\n\n${this.M.i18n.t("favorites.removeQuestion")}`,
                funcYes: dom => {
                    this.M.msgbox.close(dom);
                    this.host.classList.remove("has-message");
                    void this.removeItem(item.id);
                },
                funcClose: dom => {
                    this.M.msgbox.close(dom);
                    this.host.classList.remove("has-message");
                },
            });
            return undefined;
        }
        let path = item.path;
        if (item.type === "directory" && item.loadContent === "firstDirectory") {
            try {
                const children = await WebAPI.Directory.getDirectories(path, "");
                const sorted = await this.M.dirSort.sortPaths(children, path);
                if (sorted.length > 0) path = sorted[0];
            } catch (error) {
                console.warn("[Favorites] 讀取子資料夾失敗，改用原資料夾流程。", error);
            }
        }
        return path;
    }

    private async removeItem(id: string) {
        const parent = this.activeGroupId ? this.findItem(this.activeGroupId) : undefined;
        if (parent?.type === "group" && parent.items.some(item => item.id === id)) {
            parent.items = parent.items.filter(item => item.id !== id);
            if (parent.items.length < 2) {
                const index = this.items.findIndex(item => item.id === parent.id);
                const remaining = parent.items[0];
                this.items.splice(index, 1, ...(remaining ? [remaining] : []));
                this.activeGroupId = null;
            }
        } else {
            this.items = this.items.filter(item => item.id !== id);
        }
        await this.save();
        this.render();
    }

    private async createGroup(draggedId: string, targetId: string) {
        const draggedIndex = this.items.findIndex(item => item.id === draggedId);
        const targetIndex = this.items.findIndex(item => item.id === targetId);
        if (draggedIndex < 0 || targetIndex < 0 || draggedId === targetId) return;
        const dragged = this.items[draggedIndex];
        const target = this.items[targetIndex];
        if (dragged.type === "group" || target.type === "group") return;
        const group: FavoriteGroup = { id: this.randomId(), type: "group", name: "資料夾", items: [target, dragged] };
        const insertAt = targetIndex - (draggedIndex < targetIndex ? 1 : 0);
        this.items = this.items.filter(item => item.id !== draggedId && item.id !== targetId);
        this.items.splice(insertAt, 0, group);
        await this.save();
        this.render();
    }

    private async moveIntoGroup(itemId: string, groupId: string) {
        const index = this.items.findIndex(item => item.id === itemId);
        const group = this.findItem(groupId);
        if (index < 0 || group?.type !== "group") return;
        const item = this.items[index];
        if (item.type === "group") return;
        if (this.activeGroupId === group.id) {
            group.items = this.orderFromDom(this.folderGrid, [...group.items, item]);
            if (!group.items.some(entry => entry.id === item.id)) group.items.push(item);
        } else {
            group.items.push(item);
        }
        this.items.splice(index, 1);
        await this.save();
        this.render();
    }

    private async moveOutOfGroup(itemId: string, rootPosition: number) {
        const group = this.activeGroupId ? this.findItem(this.activeGroupId) : undefined;
        if (group?.type !== "group") return;
        const rootOrder = this.readOrder(this.rootGrid);
        const groupIndex = this.items.findIndex(entry => entry.id === group.id);
        if (!rootOrder.includes(group.id)) rootOrder.splice(Math.max(0, Math.min(groupIndex, rootOrder.length)), 0, group.id);
        if (!rootOrder.includes(itemId)) rootOrder.splice(Math.max(0, Math.min(rootPosition, rootOrder.length)), 0, itemId);
        const index = group.items.findIndex(item => item.id === itemId);
        if (index < 0) return;
        const [item] = group.items.splice(index, 1);
        const byId = new Map(this.items.map(entry => [entry.id, entry]));
        byId.set(item.id, item);
        if (group.items.length === 1) {
            const remaining = group.items[0];
            if (remaining) byId.set(remaining.id, remaining);
            byId.delete(group.id);
            const orderedIds = rootOrder.map(id => id === group.id ? (remaining?.id ?? null) : id).filter((id): id is string => id !== null);
            this.items = orderedIds.map(id => byId.get(id)).filter((entry): entry is FavoriteItem => entry !== undefined);
            this.activeGroupId = null;
        } else {
            this.items = rootOrder.map(id => byId.get(id)).filter((entry): entry is FavoriteItem => entry !== undefined);
        }
        await this.save();
        this.render();
    }

    private async openFolder(group: FavoriteGroup, tile: HTMLElement) {
        if (group.type !== "group") return;
        this.folderMotion?.cancel();
        this.resetFolderMotionStyles();
        const rect = tile.getBoundingClientRect();
        this.activeGroupId = group.id;
        this.render();
        const initialView = this.folderView.getBoundingClientRect();
        const anchorCenterX = rect.left + rect.width / 2;
        const anchorCenterY = rect.top + rect.height / 2;
        const centerX = this.clampCenter(anchorCenterX, initialView.width, window.innerWidth);
        const panelTop = this.panel.getBoundingClientRect().top;
        const centerY = this.clampCenter(anchorCenterY, initialView.height, window.innerHeight, panelTop + 8);
        this.folderView.style.left = `${centerX}px`;
        this.folderView.style.top = `${centerY}px`;
        const view = this.folderView.getBoundingClientRect();
        const scaleX = rect.width / view.width;
        const scaleY = rect.height / view.height;
        this.folderView.style.left = `${view.left}px`;
        this.folderView.style.top = `${view.top}px`;
        this.folderView.style.width = `${view.width}px`;
        this.folderView.style.height = `${view.height}px`;
        this.folderView.style.transform = "none";
        this.folderView.style.transformOrigin = "top left";
        this.folderMotion = this.folderView.animate([
            {
                opacity: .7,
                transform: `translate3d(${rect.left - view.left}px, ${rect.top - view.top}px, 0) scale(${scaleX}, ${scaleY})`,
                borderRadius: "10px",
            },
            { opacity: 1, transform: "translate3d(0, 0, 0) scale(1, 1)", borderRadius: "12px" },
        ], { duration: 260, easing: "cubic-bezier(.2,.8,.2,1)", fill: "both" });
        this.folderMotion.finished.catch(() => {});
        this.folderView.hidden = false;
        this.folderView.querySelector<HTMLButtonElement>(".favorites-folder-back")?.focus();
    }

    private clampCenter(center: number, size: number, viewportSize: number, minEdge = 8) {
        const min = Math.min(viewportSize / 2, size / 2 + minEdge);
        const max = Math.max(viewportSize / 2, viewportSize - size / 2 - 8);
        return Math.min(max, Math.max(min, center));
    }

    private closeFolder(animate: boolean) {
        if (!this.activeGroupId) return;
        const title = this.host.querySelector<HTMLInputElement>(".favorites-folder-title");
        if (title && document.activeElement === title) title.blur();
        const finish = () => {
            this.folderMotion?.cancel();
            this.resetFolderMotionStyles();
            this.activeGroupId = null;
            this.folderMotion = null;
            this.render();
        };
        if (animate && this.folderMotion) {
            this.folderMotion.playbackRate = 1.5;
            this.folderMotion.reverse();
            this.folderMotion.finished.then(finish).catch(() => {});
        } else finish();
    }

    private resetFolderMotionStyles() {
        this.folderView.style.removeProperty("left");
        this.folderView.style.removeProperty("top");
        this.folderView.style.removeProperty("width");
        this.folderView.style.removeProperty("height");
        this.folderView.style.removeProperty("transform");
        this.folderView.style.removeProperty("transform-origin");
    }

    private openEditor(item?: FavoriteItem | { type: "file" | "directory"; path: string }) {
        this.editingItemId = item && "id" in item ? item.id : null;
        const typeInput = this.editorForm.elements.namedItem("type") as HTMLSelectElement;
        const nameInput = this.editorForm.elements.namedItem("name") as HTMLInputElement;
        const pathInput = this.editorForm.elements.namedItem("path") as HTMLInputElement;
        const loadInput = this.editorForm.elements.namedItem("loadContent") as HTMLSelectElement;
        typeInput.value = item?.type === "directory" ? "directory" : "file";
        nameInput.value = item && "name" in item ? item.name : "";
        pathInput.value = item && item.type !== "group" ? item.path : "";
        loadInput.value = item && "loadContent" in item ? item.loadContent : "firstFile";
        this.host.querySelector<HTMLElement>("#favorites-editor-title")!.textContent = this.M.i18n.t(this.editingItemId ? "favorites.editTitle" : "favorites.editorTitle");
        this.updateLoadContentVisibility();
        this.editing = true;
        this.editor.hidden = false;
        this.M.menu.close(this.addMenu);
        this.M.menu.close(this.itemMenu);
        window.setTimeout(() => pathInput.focus(), 0);
    }

    private toggleMenu(menu: HTMLElement, button: HTMLElement | null) {
        if (!button) return;
        if (menu.parentElement?.getAttribute("active") === "true") {
            this.M.menu.close(menu);
            return;
        }
        this.M.menu.close();
        button.setAttribute("aria-expanded", "true");
        this.M.menu.openAtButton(menu, button, "menuActive", "bottom", () => {
            button.setAttribute("aria-expanded", "false");
            if (menu === this.itemMenu) this.activeMenuItemId = null;
        });
    }

    private closeEditor() {
        this.editing = false;
        this.editingItemId = null;
        this.editor.hidden = true;
    }

    private updateLoadContentVisibility() {
        const typeInput = this.editorForm.elements.namedItem("type") as HTMLSelectElement;
        this.host.querySelector<HTMLElement>(".favorites-load-row")!.hidden = typeInput.value !== "directory";
    }

    private async browsePath() {
        const type = (this.editorForm.elements.namedItem("type") as HTMLSelectElement).value;
        const path = type === "directory"
            ? await WV_Favorites.BrowseDirectory(this.M.i18n.t("favorites.selectDirectory"))
            : await WV_Favorites.BrowseFile(this.M.i18n.t("favorites.selectFile"));
        if (path) (this.editorForm.elements.namedItem("path") as HTMLInputElement).value = path;
    }

    private async saveEditor() {
        const typeInput = this.editorForm.elements.namedItem("type") as HTMLSelectElement;
        const nameInput = this.editorForm.elements.namedItem("name") as HTMLInputElement;
        const pathInput = this.editorForm.elements.namedItem("path") as HTMLInputElement;
        const loadInput = this.editorForm.elements.namedItem("loadContent") as HTMLSelectElement;
        const path = pathInput.value.trim();
        if (!path) { pathInput.focus(); return; }
        const existing = this.editingItemId ? this.findItem(this.editingItemId) : undefined;
        if (existing?.type === "group") return;
        const itemBase = {
            id: existing?.id ?? this.randomId(),
            name: nameInput.value.trim(),
            path,
        };
        const item: FavoriteLeaf = typeInput.value === "directory" ? {
            ...itemBase,
            type: "directory",
            loadContent: loadInput.value as FavoriteLoadContent,
        } : {
            ...itemBase,
            type: "file",
        };
        if (this.editingItemId) {
            if (!existing || !this.replaceItem(existing.id, item)) return;
        } else this.items.push(item);
        await this.save();
        this.closeEditor();
        this.render();
    }

    private beginInlineRename(element: HTMLElement, item: FavoriteGroup) {
        if (element.querySelector("input")) return;
        const input = document.createElement("input");
        input.className = "favorites-group-rename";
        input.value = item.name;
        input.setAttribute("aria-label", this.M.i18n.t("favorites.renameGroup"));
        element.replaceChildren(input);
        input.focus();
        input.select();
        const save = () => {
            item.name = input.value.trim() || "資料夾";
            void this.save().then(() => this.render());
        };
        input.addEventListener("blur", save, { once: true });
        input.addEventListener("keydown", event => {
            event.stopPropagation();
            if (event.key === "Enter") {
                event.preventDefault();
                input.blur();
            }
            if (event.key === "Escape") {
                event.preventDefault();
                input.value = item.name;
                input.blur();
            }
        });
    }

    private async save(): Promise<boolean> {
        try {
            await WV_Favorites.SaveJson(JSON.stringify({ version: 1, items: this.items }));
            return true;
        } catch (error) {
            console.error("[Favorites] 儲存收藏資料失敗。", error);
            this.M.msgbox.show({ txt: `${this.M.i18n.t("favorites.saveFailed")}\n${String(error)}` });
            return false;
        }
    }

    private parseDocument(json: string): FavoritesDocument {
        const documentData: unknown = JSON.parse(json);
        if (!this.isRecord(documentData) || documentData.version !== 1 || !Array.isArray(documentData.items)) {
            throw new Error("不支援的收藏資料版本或格式。");
        }
        const ids = new Set<string>();
        const parsedItems = documentData.items.map(item => this.parseItem(item, ids));
        return {
            version: 1,
            items: parsedItems.flatMap(item => item.type === "group" && item.items.length < 2 ? item.items : [item]),
        };
    }

    private parseItem(value: unknown, ids: Set<string>, allowGroup = true): FavoriteItem {
        if (!this.isRecord(value) || typeof value.id !== "string" || value.id.length === 0
            || ids.has(value.id) || typeof value.name !== "string") {
            throw new Error("收藏項目格式錯誤。");
        }
        ids.add(value.id);

        if (value.type === "file" && typeof value.path === "string" && value.path.length > 0) {
            return { id: value.id, type: "file", name: value.name, path: value.path };
        }
        if (value.type === "directory" && typeof value.path === "string" && value.path.length > 0) {
            const loadContent = value.loadContent === undefined ? "firstFile" : value.loadContent;
            if (loadContent !== "firstFile" && loadContent !== "firstDirectory") {
                throw new Error("收藏資料夾的載入方式錯誤。");
            }
            return { id: value.id, type: "directory", name: value.name, path: value.path, loadContent };
        }
        if (allowGroup && value.type === "group" && Array.isArray(value.items)) {
            const items = value.items.map(item => this.parseItem(item, ids, false));
            if (items.some(item => item.type === "group")) throw new Error("收藏資料夾不能再包含資料夾。");
            return {
                id: value.id,
                type: "group",
                name: value.name || "資料夾",
                items: items.filter((item): item is FavoriteLeaf => item.type !== "group"),
            };
        }
        throw new Error("收藏項目類型或內容錯誤。");
    }

    private isRecord(value: unknown): value is Record<string, unknown> {
        return typeof value === "object" && value !== null && Array.isArray(value) === false;
    }

    private replaceItem(id: string, replacement: FavoriteLeaf): boolean {
        const rootIndex = this.items.findIndex(item => item.id === id);
        if (rootIndex >= 0) {
            this.items[rootIndex] = replacement;
            return true;
        }
        for (const item of this.items) {
            if (item.type !== "group") continue;
            const childIndex = item.items.findIndex(child => child.id === id);
            if (childIndex >= 0) {
                item.items[childIndex] = replacement;
                return true;
            }
        }
        return false;
    }

    private findItem(id: string): FavoriteItem | undefined {
        for (const item of this.items) {
            if (item.id === id) return item;
            if (item.type === "group") {
                const child = item.items.find(entry => entry.id === id);
                if (child) return child;
            }
        }
        return undefined;
    }

    private randomId(): string {
        const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        let id = "";
        do {
            id = Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
        } while (this.findItem(id));
        return id;
    }

}
