/**
 * 資料夾預覽視窗
 */
class MainDirList {

	public init;
	public select;
	public updateLocation;
	public setStartLocation;
	public setHide;
	public setEnabled;
	public setShowNo;
	public setShowName;
	public setItemWidth;
	public setImgNumber;
	public dragbar;

	constructor(M: MainWindow) {

		this.init = init;
		this.select = select;
		this.updateLocation = updateLocation;
		this.setStartLocation = setStartLocation;
		this.setHide = setHide;
		this.setEnabled = setEnabled;
		this.setShowNo = setShowNo;
		this.setShowName = setShowName;
		this.setItemWidth = setItemWidth;
		this.setImgNumber = setImgNumber;

		const _domDirList = document.getElementById("main-dirList") as HTMLElement; // 螢幕看得到的區域
		const _domDirListBody = document.getElementById("main-dirListBody") as HTMLElement; // 整體的高
		const _domDirListData = document.getElementById("main-dirListData") as HTMLElement; // 資料
		const _domDragbarMainDirList = document.getElementById("dragbar-mainDirList") as HTMLElement;

		var _isHide = false; // 暫時隱藏
		var _isEnabled = true; // 啟用 檔案預覽視窗
		var _isShowNo = true; // 顯示編號
		var _isShowName = true; // 顯示檔名
		var _itemWidth = 1; // 單個項目的寬度
		var _itemHeight = 1; // 單個項目的高度
		var _imgNumber = 3; // 資料夾顯示的圖片數量

		var _tempLoaded: string[] = []; // 已經載入過的圖片編號
		var _tempStart = 0; // 用於判斷是否需要重新渲染UI
		var _tempCount = 0;
		var _tempItemHeight = 0; // 用於判斷物件高度是否需要更新

		const _sc = new TiefseeScroll(); // 滾動條元件
		_sc.initGeneral(_domDirList, "y");

		// 拖曳改變 size
		const _dragbar = this.dragbar = new Dragbar();
		_dragbar.init("right", _domDirList, _domDragbarMainDirList, M.domMainL);
		// 拖曳開始
		_dragbar.setEventStart(() => { })
		// 拖曳
		_dragbar.setEventMove((val: number) => {
			if (val < 10) { // 小於10的話就暫時隱藏
				_domDirList.style.opacity = "0";
				_dragbar.setDragbarPosition(0);
			} else {
				_domDirList.style.opacity = "1";
				setItemWidth(val);
			}
		})
		// 拖曳 結束
		_dragbar.setEventEnd((val: number) => {
			if (val < 10) { // 小於10的話，關閉檔案預覽視窗
				setEnabled(false);
			}
		})

		// 更新畫面
		_domDirList.addEventListener("scroll", () => { // 捲動時
			updateItem()
		})
		new ResizeObserver(() => { // 區塊改變大小時
			updateItem()
		}).observe(_domDirList)

		/**
		 * 檔案預覽視窗初始化 (重新讀取列表
		 */
		async function init() {
			_tempStart = -999;
			_tempLoaded = [];
			_tempItemHeight = -1;
			updateItem();
		}

		/**
		 * 暫時隱藏(不影響設定值，強制隱藏
		 */
		function setHide(val: boolean) {
			_isHide = val;
			if (val) {
				_domDirList.setAttribute("hide", "true");
				_dragbar.setEnabled(false);
			} else {
				_domDirList.setAttribute("hide", "");
				_dragbar.setEnabled(M.config.settings.layout.dirListEnabled);
			}
		}

		/**
		 * 設定是否啟用
		 * @param val 
		 * @param onlyRun 單純執行而不儲存設定
		 * @returns 
		 */
		function setEnabled(val: boolean) {

			if (val) {
				_domDirList.setAttribute("active", "true");
			} else {
				_domDirList.setAttribute("active", "");
			}

			M.config.settings.layout.dirListEnabled = val;
			_dragbar.setEnabled(val);
			_domDirList.style.opacity = "1";

			if (_isEnabled === val) { return; }
			_isEnabled = val;
			_tempStart = -1; // 強制必須重新繪製
			_domDirListData.innerHTML = ""; // 移除之前的所有物件
			updateItem();
			setStartLocation(); // 捲到中間
		}

		/**
		 * 設定是否顯示編號
		 * @param val 
		 * @returns 
		 */
		function setShowNo(val: boolean) {
			if (_isShowNo === val) { return; }
			_isShowNo = val;
			_tempStart = -1; // 強制必須重新繪製
			_domDirListData.innerHTML = ""; // 移除之前的所有物件
			updateItem();
			setStartLocation(); // 捲到中間
		}

		/**
		 * 設定是否顯示檔名
		 */
		function setShowName(val: boolean) {
			if (_isShowName === val) { return; }
			_isShowName = val;
			_tempStart = -1; // 強制必須重新繪製
			_domDirListData.innerHTML = ""; // 移除之前的所有物件
			updateItem();
			setStartLocation(); // 捲到中間
		}

		/**
		 * 設定資料夾顯示的圖片數量
		 */
		function setImgNumber(val: number) {
			if (_imgNumber === val) { return; }
			_imgNumber = val;
			_tempStart = -1; // 強制必須重新繪製
			_domDirListData.innerHTML = ""; // 移除之前的所有物件
			updateItem();
			setStartLocation(); // 捲到中間
		}

		/**
		 * 設定size
		 * @param val 
		 */
		function setItemWidth(val: number) {

			if (_itemWidth === val) { return; }

			let valMin = 100;
			let valMax = 400;
			if (val <= valMin) { val = valMin; }
			if (val >= valMax) { val = valMax; }

			_itemWidth = val;
			M.config.settings.layout.dirListShowWidth = val;

			var cssRoot = document.body;
			cssRoot.style.setProperty("--dirList-width", val + "px");
			_dragbar.setDragbarPosition(val);

			_tempStart = -1; // 強制必須重新繪製
			updateItem();
			setStartLocation(); // 捲到中間
			// updateLocation()
		}

		/**
		 * 刷新UI
		 * @returns 
		 */
		function updateItem() {

			if (_isEnabled === false) {
				_domDirListData.innerHTML = ""; // 移除之前的所有物件
				return;
			}

			const noDelay = _tempStart === -999; // true=首次執行，載入圖片不需要延遲

			const arDir = M.fileLoad.getWaitingDir();
			const arDirKey = M.fileLoad.getWaitingDirKey();

			if (arDirKey.length === 0) { // 如果沒資料
				_domDirListData.innerHTML = ""; // 移除之前的所有物件
				return;
			}

			// 取得單個項目的高度
			let dirListItem = _domDirListData.querySelector(".dirList-item");
			if (dirListItem === null) {
				newItem(-1, "", []);
				dirListItem = _domDirListData.querySelector(".dirList-item");
			}
			if (dirListItem !== null) {
				_itemHeight = dirListItem.getBoundingClientRect().height + 6;
			}

			// 重新計算整體的高度
			if (_tempItemHeight !== _itemHeight) {
				_domDirListBody.style.height = (arDirKey.length * _itemHeight) + 4 + "px";
			}
			_tempItemHeight = _itemHeight;

			let start = Math.floor(_domDirList.scrollTop / _itemHeight) - 1; // 開始位置
			let count = Math.floor(_domDirList.clientHeight / _itemHeight) + 5; // 抓取數量

			if (start < 0) { start = 0 }
			if (_tempStart === start && _tempCount === count) { // 沒變化就離開
				return;
			}
			_tempStart = start;
			_tempCount = count;

			_domDirListData.innerHTML = ""; // 移除之前的所有物件
			_domDirListData.style.marginTop = (start * _itemHeight) + "px";

			let end = start + count;
			if (end > arDirKey.length) { end = arDirKey.length }
			for (let i = start; i < end; i++) {
				newItem(i, arDirKey[i], arDir[arDirKey[i]], noDelay);
			}

			select();
		}

		/**
		 * 產生一個新項目
		 * @param i 
		 * @param path 
		 * @returns 
		 */
		function newItem(n: number, dirPath: string, arPath: string[], noDelay = false) {

			let len = arPath.length;
			if (len > _imgNumber) { len = _imgNumber; }

			let htmlImgBox = "";
			for (let i = 0; i < len; i++) {
				const path = Lib.combine([dirPath, arPath[i]]);
				let htmlImg = "";
				if (_tempLoaded.indexOf(n + "-" + i) !== -1) { // 圖片已經載入過了，直接顯示
					let imgUrl = getImgUrl(path);
					htmlImg = `<img src="${imgUrl}" fetchpriority="low"/>`;
				}
				htmlImgBox += `<div class="dirList-img dirList-img__${_imgNumber}" data-imgid="${i}">${htmlImg}</div>`;
			}
			if (len === 0) {
				htmlImgBox += `<div class="dirList-img dirList-img__${_imgNumber}" data-imgid=""></div>`;
			}

			let name = Lib.getFileName(dirPath); // 檔名
			let htmlNo = ``;
			let htmlName = ``;
			if (_isShowNo === true) {
				htmlNo = `<div class="dirList-no">${n + 1}</div>`;
			}
			if (_isShowName === true) {
				htmlName = `<div class="dirList-name">${name}</div>`;
			}

			const div = Lib.newDom(`
                <div class="dirList-item" data-id="${n}">
                    <div class="dirList-title">
                        ${htmlNo} ${htmlName}
                    </div>
                    <div class="dirList-imgbox">
                        ${htmlImgBox}   
                    </div>
                </div>
            `);
			_domDirListData.append(div);
			div.setAttribute("data-path", dirPath);

			// click 載入圖片
			div.addEventListener("click", () => {
				M.fileLoad.showDir(n);
			})

			// 快速拖曳
			Lib.addDragThresholdListener(div, 5, () => {
				M.script.file.dragDropFile(dirPath);
			})

			if (arPath.length !== 0) {
				if (noDelay === false) {
					setTimeout(() => {
						if (_domDirListData.contains(div) === false) { return; } // 如果物件不在網頁上，就不載入圖片
						for (let i = 0; i < len; i++) {
							const path = Lib.combine([dirPath, arPath[i]]);
							if (_tempLoaded.indexOf(n + "-" + i) === -1) { // 第一次載入圖片，延遲30毫秒，避免快速捲動時載入太多圖片
								_tempLoaded.push(n + "-" + i); // 加到全域變數，表示已經載入過
								const url = getImgUrl(path);
								const domImg = div.getElementsByClassName("dirList-img")[i] as HTMLImageElement;
								domImg.innerHTML = `<img src="${url}" fetchpriority="low"/>`;
							}
						}
					}, 30);
				} else {
					for (let i = 0; i < len; i++) {
						const path = Lib.combine([dirPath, arPath[i]]);
						//if (temp_loaded.indexOf(n + "-" + i) === -1) { // 第一次載入圖片，延遲30毫秒，避免快速捲動時載入太多圖片
						_tempLoaded.push(n + "-" + i); // 加到全域變數，表示已經載入過
						const url = getImgUrl(path);
						const domImg = div.getElementsByClassName("dirList-img")[i] as HTMLImageElement;
						domImg.innerHTML = `<img src="${url}" fetchpriority="low"/>`;
						//}
					}
				}
			}

			return div;
		}

		/**
		 * 
		 */
		function getImgUrl(path: string) {
			if (Lib.getExtension(path) === ".svg") {
				return WebAPI.getFile(path);
			}
			return WebAPI.Img.fileIcon(path);
		}

		/**
		 * 設定 檔案預覽視窗 目前選中的項目
		 * @returns 
		 */
		function select() {

			if (_isEnabled === false) { return; }

			// 移除上一次選擇的項目
			document.querySelector(`.dirList-item[active=true]`)?.setAttribute("active", "");

			const id = M.fileLoad.getFlagDir(); // 取得id

			const div = document.querySelector(`.dirList-item[data-id="${id}"]`);
			if (div == null) { return; }
			div.setAttribute("active", "true");
		}

		/**
		 * 檔案預覽視窗 捲動到選中項目的中間
		 */
		function setStartLocation() {

			if (_isEnabled === false) { return; }

			const id = M.fileLoad.getFlagDir(); // 取得id
			const f = (_domDirList.clientHeight - _itemHeight) / 2; // 計算距離中心的距離
			_domDirList.scrollTop = id * _itemHeight - f;
		}

		/**
		 * 檔案預覽視窗 自動捲動到選中項目的地方
		 */
		function updateLocation() {

			if (_isEnabled === false) { return; }

			const id = M.fileLoad.getFlagDir(); // 取得id

			// 如果選中的項目在上面
			const start = Math.floor(_domDirList.scrollTop / _itemHeight); // 開始位置
			if (id <= start) {
				_domDirList.scrollTop = id * _itemHeight;
				return
			}

			// 如果選中的項目在下面
			const count = Math.floor(_domDirList.clientHeight / _itemHeight); // 抓取數量
			const end = (id - count + 1) * _itemHeight - (_domDirList.clientHeight % _itemHeight) + 3;
			if (_domDirList.scrollTop < end) {
				_domDirList.scrollTop = end;
			}
		}

	}
}
