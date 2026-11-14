/** 設定視窗各頁初始化時可使用的共用依賴。 */
import { Config } from "../Config";
import { I18n } from "../I18n";
import { MainToolbar } from "../MainWindow/MainToolbar";
import { Msgbox } from "../Msgbox";
import { ToolbarCustomization } from "../Toolbar/ToolbarCustomization";

export interface SettingWindowContext {
    _config: Config;
    _i18n: I18n;
    _mainToolbar: MainToolbar;
    _defaultConfig: Config["settings"];
    _defaultToolbarCustomization: ToolbarCustomization;
    _appInfo: AppInfo;
    _msgbox: Msgbox;
    getDom: (selectors: string) => HTMLElement;
    initSettingsGroups: (root: ParentNode) => void;
    isDarkMode: (bg: any) => boolean;
    appleSettingOfMain: () => void;
    saveSetting: () => Promise<void>;
    restartTiefsee: () => Promise<void>;
}
