/** 渲染診斷僅在啟動程序明確啟用時執行；AppInfo 初始化前視為關閉。 */
export function isRenderDiagnosticsEnabled(): boolean {
    return window.baseWindow?.appInfo?.renderDiagnostics === true;
}
