/** 圖片請求失敗時插入本機 SVG，避免瀏覽器破圖圖示露出。 */
export function setImageErrorFallback(image: HTMLImageElement | null, kind: "file" | "directory" = "file"): void {
    if (image === null) { return; }

    image.addEventListener("error", () => {
        const fallback = document.createElement("span");
        fallback.className = "image-error-fallback";
        fallback.setAttribute("aria-hidden", "true");
        fallback.innerHTML = kind === "directory"
            ? SvgList["folder_dismiss_20_regular.svg"]
            : SvgList["document_dismiss_20_regular.svg"];
        image.replaceWith(fallback);
    }, { once: true });
}
