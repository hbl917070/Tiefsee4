import Hammer from "hammerjs";
import { MainWindow } from "./MainWindow";

/**
 * 影片播放工具列
 * 控制既有 Tiefseeview 內的 video 元素，不使用瀏覽器原生 controls
 */
export class VideoToolbar {

    public setVisible;
    public setSettings: (muted: boolean, volume: number, playbackRate: number) => void;

    constructor(M: MainWindow) {

        const _domVideo = document.querySelector("#mView-tiefseeview .view-video") as HTMLVideoElement;
        const _domToolbar = document.querySelector("#video-toolbar") as HTMLElement;

        // 工具列內的控制項
        const _domProgress = _domToolbar.querySelector(".video-toolbar-progress-input") as HTMLInputElement;
        const _domPlay = _domToolbar.querySelector(".video-toolbar-play") as HTMLButtonElement;
        const _domVolumeButton = _domToolbar.querySelector(".video-toolbar-volume-button") as HTMLButtonElement;
        const _domVolume = _domToolbar.querySelector(".video-toolbar-volume-input") as HTMLInputElement;
        const _domTime = _domToolbar.querySelector(".video-toolbar-time") as HTMLElement;
        const _domRateButton = _domToolbar.querySelector(".video-toolbar-rate-button") as HTMLButtonElement;
        const _domRateValue = _domToolbar.querySelector(".video-toolbar-rate-value") as HTMLElement;
        const _domRateMenu = document.querySelector("#menu-video-toolbar-rate") as HTMLElement;
        const _domRateMenuBg = _domRateMenu.parentElement as HTMLElement;
        const _domRate = _domRateMenu.querySelector(".video-toolbar-rate-input") as HTMLInputElement;
        const _domRateDecrease = _domRateMenu.querySelector(".video-toolbar-rate-decrease") as HTMLButtonElement;
        const _domRateIncrease = _domRateMenu.querySelector(".video-toolbar-rate-increase") as HTMLButtonElement;
        const _domRatePresets = _domRateMenu.querySelectorAll(".video-toolbar-rate-presets button") as NodeListOf<HTMLButtonElement>;

        // 拖曳進度時暫停由 video 的 timeupdate 更新進度，避免播放事件覆蓋拖曳中的數值
        var _isSeeking = false;
        // 記住最近一次非零音量，供取消靜音時恢復
        var _lastVolume = 1;

        this.setVisible = setVisible;
        this.setSettings = setSettings;

        // 進度條：原生 range 保留鍵盤操作；Hammer 負責滑鼠、觸控板與觸控拖曳
        const _progressHammer = new Hammer.Manager(_domProgress, { touchAction: "none" });
        _progressHammer.add(new Hammer.Pan({
            direction: Hammer.DIRECTION_HORIZONTAL,
            threshold: 0,
        }));
        _progressHammer.on("panstart", (event: HammerInput) => {
            _isSeeking = true;
            setCurrentTime(event.center.x);
        });
        _progressHammer.on("panmove", (event: HammerInput) => {
            setCurrentTime(event.center.x);
        });
        _progressHammer.on("panend pancancel", () => {
            _isSeeking = false;
            updateProgress();
        });

        _domProgress.addEventListener("input", () => {
            const duration = getDuration();
            if (duration <= 0) { return; }
            _domVideo.currentTime = Number(_domProgress.value);
        });

        // 點擊進度條也直接跳轉，補足沒有觸發 pan 的短點擊情境
        _domProgress.addEventListener("click", (event) => {
            // range 以鍵盤操作時可能產生沒有座標的 click，避免把進度重設到 0
            if (event.detail === 0) { return; }
            setCurrentTime(event.clientX);
        });

        // 播放／暫停控制
        _domPlay.addEventListener("click", () => {
            if (_domVideo.paused || _domVideo.ended) {
                if (_domVideo.ended) {
                    _domVideo.currentTime = 0;
                }
                const playPromise = _domVideo.play();
                if (playPromise !== undefined) {
                    playPromise.catch(() => { });
                }
            } else {
                _domVideo.pause();
            }
        });

        // 音量按鈕與音量拉條控制
        _domVolumeButton.addEventListener("click", () => {
            if (_domVideo.muted || _domVideo.volume === 0) {
                _domVideo.muted = false;
                _domVideo.volume = _lastVolume > 0 ? _lastVolume : 1;
            } else {
                _lastVolume = _domVideo.volume;
                _domVideo.muted = true;
            }
            saveVideoSettings();
        });

        // 播放速度選單由共用 Menu 管理，避免影響 Tiefseeview 的版面與捲動區域
        _domRateButton.addEventListener("click", () => {
            const menu = M.menu;
            if (_domRateMenuBg.getAttribute("active") === "true") {
                menu.close(_domRateMenu);
                return;
            }

            menu.close();
            _domToolbar.setAttribute("menu-open", "true");
            menu.openAtButton(
                _domRateMenu,
                _domRateButton,
                "active",
                "bottom",
                () => _domToolbar.removeAttribute("menu-open"));
        });

        _domVolume.addEventListener("input", () => {
            const volume = Number(_domVolume.value);
            _domVideo.volume = volume;
            _domVideo.muted = false;
            if (volume > 0) {
                _lastVolume = volume;
            }
            syncVideoSettings();
        });

        _domVolume.addEventListener("change", () => {
            saveVideoSettings();
        });

        // 播放速度拉條、微調按鈕與預設速度
        _domRate.addEventListener("input", () => {
            setPlaybackRate(Number(_domRate.value));
            syncVideoSettings();
        });

        _domRate.addEventListener("change", () => {
            saveVideoSettings();
        });

        _domRateDecrease.addEventListener("click", () => {
            setPlaybackRate(_domVideo.playbackRate - 0.1);
            saveVideoSettings();
        });

        _domRateIncrease.addEventListener("click", () => {
            setPlaybackRate(_domVideo.playbackRate + 0.1);
            saveVideoSettings();
        });

        _domRatePresets.forEach((domPreset) => {
            domPreset.addEventListener("click", () => {
                setPlaybackRate(Number(domPreset.dataset.rate));
                saveVideoSettings();
            });
        });

        // video 狀態同步到工具列 UI
        // 影片切換來源後，瀏覽器可能重設播放速率；完成載入後重新套用保存的播放設定
        _domVideo.addEventListener("loadedmetadata", applyVideoSettings);
        _domVideo.addEventListener("durationchange", updateProgress);
        _domVideo.addEventListener("timeupdate", updateProgress);
        _domVideo.addEventListener("play", updatePlayingState);
        _domVideo.addEventListener("pause", updatePlayingState);
        _domVideo.addEventListener("ended", updatePlayingState);
        _domVideo.addEventListener("volumechange", updateVolumeState);
        _domVideo.addEventListener("ratechange", updateRateState);
        _domVideo.addEventListener("emptied", resetProgress);

        updateAll();

        /** 
         * 顯示或隱藏工具列
         **/
        function setVisible(value: boolean) {
            _domToolbar.setAttribute("visible", value ? "true" : "false");
            if (value) {
                updateAll();
                return;
            }

            _isSeeking = false;
            closeRateMenu();
            _domVideo.pause();
            resetProgress();
        }

        /** 
         * 套用設定檔中的影片播放狀態
         **/
        function setSettings(muted: boolean, volume: number, playbackRate: number) {
            const nextVolume = Number.isFinite(volume) ? Math.max(0, Math.min(1, volume)) : 1;
            const nextPlaybackRate = Number.isFinite(playbackRate) ? playbackRate : 1;

            _domVideo.volume = nextVolume;
            _domVideo.muted = muted === true;
            setPlaybackRate(nextPlaybackRate);
            _lastVolume = nextVolume > 0 ? nextVolume : 1;
            syncVideoSettings();
            updateAll();
        }

        /**
         * 從 MainWindow 設定套用影片播放狀態
         **/
        function applyVideoSettings() {
            const settings = M.config.settings.video;
            setSettings(settings.muted, settings.volume, settings.playbackRate);
        }

        /** 
         * 將目前播放狀態同步回設定物件，但不立即寫入檔案
         **/
        function syncVideoSettings() {
            const settings = M.config.settings.video;

            settings.muted = _domVideo.muted;
            settings.volume = _domVideo.volume;
            settings.playbackRate = _domVideo.playbackRate;
        }

        /** 
         * 儲存目前播放設定；拉條只在 change 時呼叫，避免拖曳期間大量寫檔
         **/
        function saveVideoSettings() {
            syncVideoSettings();
            M.saveSetting();
        }

        /** 
         * 關閉速度選單，並解除播放列的保持顯示狀態
         **/
        function closeRateMenu() {
            _domToolbar.removeAttribute("menu-open");
            if (_domRateMenuBg.getAttribute("active") === "true") {
                M.menu.close(_domRateMenu);
            }
        }

        /** 
         * 取得有效影片長度；尚未載入或無限長影片回傳 0 
         **/
        function getDuration() {
            return Number.isFinite(_domVideo.duration) && _domVideo.duration > 0
                ? _domVideo.duration
                : 0;
        }

        /** 
         * 依滑鼠／觸控座標換算並設定影片時間
         **/
        function setCurrentTime(clientX: number) {
            const duration = getDuration();
            if (duration <= 0) { return; }

            const rect = _domProgress.getBoundingClientRect();
            if (rect.width <= 0) { return; }

            const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
            const currentTime = ratio * duration;
            _domProgress.value = currentTime.toString();
            _domVideo.currentTime = currentTime;
        }

        /** 
         * 重新同步所有控制項狀態
         **/
        function updateAll() {
            updateProgress();
            updatePlayingState();
            updateVolumeState();
            updateRateState();
        }

        /** 
         * 更新進度條、進度比例與時間文字
         **/
        function updateProgress() {
            const duration = getDuration();
            M.mainExif?.updateVideoDuration(duration);
            _domProgress.max = duration.toString();
            _domProgress.disabled = duration <= 0;
            if (_isSeeking === false) {
                const videoCurrentTime = Number.isFinite(_domVideo.currentTime) ? _domVideo.currentTime : 0;
                _domProgress.value = duration > 0 ? Math.min(videoCurrentTime, duration).toString() : "0";
            }

            const videoCurrentTime = Number.isFinite(_domVideo.currentTime) ? _domVideo.currentTime : 0;
            const currentTime = duration > 0 ? Math.min(videoCurrentTime, duration) : 0;
            const progress = duration > 0 ? currentTime / duration * 100 : 0;
            _domProgress.style.setProperty("--progress", `${progress}%`);
            _domTime.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
        }

        /** 
         * 切換檔案或離開影片時清空進度條
         **/
        function resetProgress() {
            _domProgress.max = "0";
            _domProgress.value = "0";
            _domProgress.disabled = true;
            M.mainExif?.updateVideoDuration(0);
        }

        /** 
         * 更新播放／暫停圖示與 tooltip
         **/
        function updatePlayingState() {
            const isPlaying = !_domVideo.paused && !_domVideo.ended;
            _domPlay.setAttribute("data-playing", isPlaying ? "true" : "false");
            const i18nKey = isPlaying ? "videoToolbar.pause" : "videoToolbar.play";
            const label = M.i18n.t(i18nKey);
            _domPlay.setAttribute("i18n", i18nKey);
            _domPlay.setAttribute("title", label);
        }

        /** 
         * 更新靜音圖示、音量比例與 tooltip
         **/
        function updateVolumeState() {
            const isMuted = _domVideo.muted || _domVideo.volume === 0;
            if (_domVideo.muted === false && _domVideo.volume > 0) {
                _lastVolume = _domVideo.volume;
            }
            _domVolume.value = _domVideo.volume.toString();
            _domVolume.style.setProperty("--progress", `${_domVideo.volume * 100}%`);
            _domVolumeButton.setAttribute("data-muted", isMuted ? "true" : "false");
            const i18nKey = isMuted ? "videoToolbar.unmute" : "videoToolbar.mute";
            const label = M.i18n.t(i18nKey);
            _domVolumeButton.setAttribute("i18n", i18nKey);
            _domVolumeButton.setAttribute("title", label);
        }

        /** 
         * 更新速度拉條位置、按鈕文字與目前選取的預設速度
         **/
        function updateRateState() {
            const rate = _domVideo.playbackRate;
            const rateText = formatRate(rate);
            const rateProgress = Math.max(0, Math.min(100, (rate - 0.25) / (3 - 0.25) * 100));
            _domRate.value = rate.toString();
            _domRate.style.setProperty("--progress", `${rateProgress}%`);
            _domRateValue.textContent = `${rateText}x`;

            _domRatePresets.forEach((domPreset) => {
                const presetRate = Number(domPreset.dataset.rate);
                domPreset.setAttribute("data-active", Math.abs(presetRate - rate) < 0.01 ? "true" : "false");
            });
        }

        /** 
         * 將播放速度限制在 0.25～3，並以 0.05 為最小刻度
         **/
        function setPlaybackRate(rate: number) {
            rate = Math.max(0.25, Math.min(3, rate));
            rate = Math.round(rate / 0.05) * 0.05;
            _domVideo.playbackRate = rate;
        }

        function formatRate(rate: number) {
            return rate.toFixed(2).replace(/\.?(0+)$/, "");
        }

        function formatTime(seconds: number) {
            if (Number.isFinite(seconds) === false || seconds < 0) {
                seconds = 0;
            }

            const totalSeconds = Math.floor(seconds);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const remainingSeconds = totalSeconds % 60;

            if (hours > 0) {
                return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
            }
            return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
        }
    }
}
