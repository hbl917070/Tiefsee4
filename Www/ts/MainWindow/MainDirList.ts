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

		let dom_dirList = document.getElementById("main-dirList") as HTMLElement; // 螢幕看得到的區域
		let dom_dirListBody = document.getElementById("main-dirListBody") as HTMLElement; // 整體的高
		let dom_dirListData = document.getElementById("main-dirListData") as HTMLElement; // 資料
		var dom_dragbar_mainDirList = document.getElementById("dragbar-mainDirList") as HTMLElement;

		var isHide = false; // 暫時隱藏
		var isEnabled = true; // 啟用 檔案預覽視窗
		var isShowNo = true; // 顯示編號
		var isShowName = true; // 顯示檔名
		var itemWidth = 1; // 單個項目的寬度
		var itemHeight = 1; // 單個項目的高度
		var imgNumber = 3; // 資料夾顯示的圖片數量

		var temp_loaded: string[] = []; // 已經載入過的圖片編號
		var temp_start = 0; // 用於判斷是否需要重新渲染UI
		var temp_count = 0;
		var temp_itemHeight = 0; // 用於判斷物件高度是否需要更新

		var sc = new TiefseeScroll(); // 滾動條元件
		sc.initGeneral(dom_dirList, "y");

		// 拖曳改變 size
		var dragbar = this.dragbar = new Dragbar();
		dragbar.init("right", dom_dirList, dom_dragbar_mainDirList, M.dom_mainL);
		// 拖曳開始
		dragbar.setEventStart(() => { })
		// 拖曳
		dragbar.setEventMove((val: number) => {
			if (val < 10) { // 小於10的話就暫時隱藏
				dom_dirList.style.opacity = "0";
				dragbar.setDragbarPosition(0);
			} else {
				dom_dirList.style.opacity = "1";
				setItemWidth(val);
			}
		})
		// 拖曳 結束
		dragbar.setEventEnd((val: number) => {
			if (val < 10) { // 小於10的話，關閉檔案預覽視窗
				setEnabled(false);
			}
		})

		//更新畫面
		dom_dirList.addEventListener("scroll", () => { // 捲動時
			updateItem()
		})
		new ResizeObserver(() => { // 區塊改變大小時
			updateItem()
		}).observe(dom_dirList)

		/**
		 * 檔案預覽視窗初始化 (重新讀取列表
		 */
		async function init() {

			temp_start = -999;
			temp_loaded = [];
			temp_itemHeight = -1;
			updateItem();
		}

		/**
		 * 暫時隱藏(不影響設定值，強制隱藏
		 */
		function setHide(val: boolean) {
			isHide = val;
			if (val) {
				dom_dirList.setAttribute("hide", "true");
				dragbar.setEnabled(false);
			} else {
				dom_dirList.setAttribute("hide", "");
				dragbar.setEnabled(M.config.settings.layout.dirListEnabled);
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
				dom_dirList.setAttribute("active", "true");
			} else {
				dom_dirList.setAttribute("active", "");
			}

			M.config.settings.layout.dirListEnabled = val;
			dragbar.setEnabled(val);
			dom_dirList.style.opacity = "1";

			if (isEnabled === val) { return; }
			isEnabled = val;
			temp_start = -1; // 強制必須重新繪製
			dom_dirListData.innerHTML = ""; // 移除之前的所有物件
			updateItem();
			setStartLocation(); // 捲到中間
		}

		/**
		 * 設定是否顯示編號
		 * @param val 
		 * @returns 
		 */
		function setShowNo(val: boolean) {
			if (isShowNo === val) { return; }
			isShowNo = val;
			temp_start = -1; // 強制必須重新繪製
			dom_dirListData.innerHTML = ""; // 移除之前的所有物件
			updateItem();
			setStartLocation(); // 捲到中間
		}

		/**
		 * 設定是否顯示檔名
		 */
		function setShowName(val: boolean) {
			if (isShowName === val) { return; }
			isShowName = val;
			temp_start = -1; // 強制必須重新繪製
			dom_dirListData.innerHTML = ""; // 移除之前的所有物件
			updateItem();
			setStartLocation(); // 捲到中間
		}

		/**
		 * 設定資料夾顯示的圖片數量
		 */
		function setImgNumber(val: number) {
			if (imgNumber === val) { return; }
			imgNumber = val;
			temp_start = -1; // 強制必須重新繪製
			dom_dirListData.innerHTML = ""; // 移除之前的所有物件
			updateItem();
			setStartLocation(); // 捲到中間
		}

		/**
		 * 設定size
		 * @param val 
		 */
		function setItemWidth(val: number) {

			if (itemWidth === val) { return; }

			let valMin = 100;
			let valMax = 400;
			if (val <= valMin) { val = valMin; }
			if (val >= valMax) { val = valMax; }

			itemWidth = val;
			M.config.settings.layout.dirListShowWidth = val;

			var cssRoot = document.body;
			cssRoot.style.setProperty("--dirList-width", val + "px");
			dragbar.setDragbarPosition(val);

			temp_start = -1; // 強制必須重新繪製
			updateItem();
			setStartLocation(); // 捲到中間
			// updateLocation()
		}

		/**
		 * 刷新UI
		 * @returns 
		 */
		function updateItem() {

			if (isEnabled === false) {
				dom_dirListData.innerHTML = ""; // 移除之前的所有物件
				return;
			}

			let noDelay = temp_start === -999; // true=首次執行，載入圖片不需要延遲

			let arDir = M.fileLoad.getWaitingDir();
			let arDirKey = M.fileLoad.getWaitingDirKey();

			if (arDirKey.length === 0) { // 如果沒資料
				dom_dirListData.innerHTML = ""; // 移除之前的所有物件
				return;
			}

			// 取得單個項目的高度
			let dirListItem = dom_dirListData.querySelector(".dirList-item");
			if (dirListItem === null) {
				newItem(-1, "", []);
				dirListItem = dom_dirListData.querySelector(".dirList-item");
			}
			if (dirListItem !== null) {
				itemHeight = dirListItem.getBoundingClientRect().height + 6;
			}

			// 重新計算整體的高度
			if (temp_itemHeight !== itemHeight) {
				dom_dirListBody.style.height = (arDirKey.length * itemHeight) + 4 + "px";
			}
			temp_itemHeight = itemHeight;

			let start = Math.floor(dom_dirList.scrollTop / itemHeight) - 1; // 開始位置
			let count = Math.floor(dom_dirList.clientHeight / itemHeight) + 5; // 抓取數量

			if (start < 0) { start = 0 }
			if (temp_start === start && temp_count === count) { // 沒變化就離開
				return;
			}
			temp_start = start;
			temp_count = count;

			dom_dirListData.innerHTML = ""; // 移除之前的所有物件
			dom_dirListData.style.marginTop = (start * itemHeight) + "px";

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
		function newItem(n: number, _dirPath: string, arPath: string[], noDelay = false) {

			let len = arPath.length;
			if (len > imgNumber) { len = imgNumber; }

			let htmlImgBox = "";
			for (let i = 0; i < len; i++) {
				const path = Lib.Combine([_dirPath, arPath[i]]);
				let htmlImg = "";
				if (temp_loaded.indexOf(n + "-" + i) !== -1) { // 圖片已經載入過了，直接顯示
					let imgUrl = getImgUrl(path);
					htmlImg = `<img src="${imgUrl}" fetchpriority="low"/>`;
				}
				htmlImgBox += `<div class="dirList-img dirList-img__${imgNumber}" data-imgid="${i}">${htmlImg}</div>`;
			}
			if (len === 0) {
				htmlImgBox += `<div class="dirList-img dirList-img__${imgNumber}" data-imgid=""></div>`;
			}

			let name = Lib.GetFileName(_dirPath); // 檔名
			let htmlNo = ``;
			let htmlName = ``;
			if (isShowNo === true) {
				htmlNo = `<div class="dirList-no">${n + 1}</div>`;
			}
			if (isShowName === true) {
				htmlName = `<div class="dirList-name">${name}</div>`;
			}

			let div = Lib.newDom(`
                <div class="dirList-item" data-id="${n}">
                    <div class="dirList-title">
                        ${htmlNo} ${htmlName}
                    </div>
                    <div class="dirList-imgbox">
                        ${htmlImgBox}   
                    </div>
                </div>
            `);
			dom_dirListData.append(div);
			div.setAttribute("data-path", _dirPath);

			// click 載入圖片
			div.addEventListener("click", () => {
				M.fileLoad.showDir(n);
			})

			// 快速拖曳
			Lib.addDragThresholdListener(div, 5, () => {
				M.script.file.dragDropFile(_dirPath);
			})

			if (arPath.length !== 0) {
				if (noDelay === false) {
					setTimeout(() => {
						if (dom_dirListData.contains(div) === false) { return; } // 如果物件不在網頁上，就不載入圖片
						for (let i = 0; i < len; i++) {
							const path = Lib.Combine([_dirPath, arPath[i]]);
							if (temp_loaded.indexOf(n + "-" + i) === -1) { // 第一次載入圖片，延遲30毫秒，避免快速捲動時載入太多圖片
								temp_loaded.push(n + "-" + i); // 加到全域變數，表示已經載入過
								let _url = getImgUrl(path);
								let domImg = div.getElementsByClassName("dirList-img")[i] as HTMLImageElement;
								domImg.innerHTML = `<img src="${_url}" fetchpriority="low"/>`;
							}
						}
					}, 30);
				} else {
					for (let i = 0; i < len; i++) {
						const path = Lib.Combine([_dirPath, arPath[i]]);
						//if (temp_loaded.indexOf(n + "-" + i) === -1) { // 第一次載入圖片，延遲30毫秒，避免快速捲動時載入太多圖片
						temp_loaded.push(n + "-" + i); // 加到全域變數，表示已經載入過
						let _url = getImgUrl(path);
						let domImg = div.getElementsByClassName("dirList-img")[i] as HTMLImageElement;
						domImg.innerHTML = `<img src="${_url}" fetchpriority="low"/>`;
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
			if (Lib.GetExtension(path) === ".svg") {
				return Lib.pathToURL(path);
			}
			return WebAPI.Img.fileIcon(path);
		}

		/**
		 * 設定 檔案預覽視窗 目前選中的項目
		 * @returns 
		 */
		function select() {

			if (isEnabled === false) { return; }

			// 移除上一次選擇的項目
			document.querySelector(`.dirList-item[active=true]`)?.setAttribute("active", "");

			let id = M.fileLoad.getFlagDir(); // 取得id

			let div = document.querySelector(`.dirList-item[data-id="${id}"]`);
			if (div == null) { return; }
			div.setAttribute("active", "true");
		}

		/**
		 * 檔案預覽視窗 捲動到選中項目的中間
		 */
		function setStartLocation() {

			if (isEnabled === false) { return; }

			let id = M.fileLoad.getFlagDir(); // 取得id
			let f = (dom_dirList.clientHeight - itemHeight) / 2; // 計算距離中心的距離
			dom_dirList.scrollTop = id * itemHeight - f;
		}

		/**
		 * 檔案預覽視窗 自動捲動到選中項目的地方
		 */
		function updateLocation() {

			if (isEnabled === false) { return; }

			let id = M.fileLoad.getFlagDir(); // 取得id

			// 如果選中的項目在上面
			let start = Math.floor(dom_dirList.scrollTop / itemHeight); // 開始位置
			if (id <= start) {
				dom_dirList.scrollTop = id * itemHeight;
				return
			}

			// 如果選中的項目在下面
			let count = Math.floor(dom_dirList.clientHeight / itemHeight); // 抓取數量
			let end = (id - count + 1) * itemHeight - (dom_dirList.clientHeight % itemHeight) + 3;
			if (dom_dirList.scrollTop < end) {
				dom_dirList.scrollTop = end;
			}
		}

	}
}
