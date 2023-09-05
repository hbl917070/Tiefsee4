class MainExif {

	public init;
	public setEnabled;
	public setRelatedFilesEnabled;
	public setHide;
	public setItemWidth;
	public setHorizontal;
	public updateFileWatcher;

	constructor(M: MainWindow) {

		this.init = init;
		this.setEnabled = setEnabled;
		this.setRelatedFilesEnabled = setRelatedFilesEnabled;
		this.setHide = setHide;
		this.setItemWidth = setItemWidth;
		this.setHorizontal = setHorizontal;
		this.updateFileWatcher = updateFileWatcher;

		var domMainExif = document.getElementById("mainExif") as HTMLElement;
		var domDragbar_mainFileList = document.getElementById("dragbar-mainExif") as HTMLElement; //拖曳條

		var domTabBtns = domMainExif.querySelector(".js-tabBtns") as HTMLElement;
		var domTabBtnInfo = domMainExif.querySelector(".js-tabBtn-info") as HTMLElement;
		var domTabBtnRelated = domMainExif.querySelector(".js-tabBtn-related") as HTMLElement;
		var domTabContentInfo = domMainExif.querySelector(".js-tabContent-info") as HTMLElement;
		var domTabContentRelated = domMainExif.querySelector(".js-tabContent-related") as HTMLElement;

		var relatedFileExtList = ["txt", "json", "xml", "info", "ini", "config"];
		var fileInfo2: FileInfo2;

		var isHide = false; //暫時隱藏
		var isEnabled = true; //啟用 檔案預覽視窗

		/** 頁籤的類型 */
		var TabType = {
			/** 資訊 */
			info: "info",
			/** 相關檔案 */
			related: "related"
		}
		/** 當前頁籤的類型 */
		var tabType = TabType.info;

		//在工具列滾動時，進行水平移動
		domTabBtns.addEventListener("wheel", (e: WheelEvent) => {

			let scrollLeft = domTabBtns.scrollLeft;
			let deltaY = e.deltaY; //上下滾動的量

			if (deltaY > 0) { //往右
				domTabBtns.scroll(scrollLeft + 20, 0);
			}
			if (deltaY < 0) { //往左
				domTabBtns.scroll(scrollLeft - 20, 0);
			}
		}, false);

		new TiefseeScroll().initGeneral(domTabBtns, "x"); //滾動條元件

		domTabBtnInfo.addEventListener("click", () => {
			setTab(TabType.info);
			if (fileInfo2 !== undefined) {
				loadInfo();
				loadRelated();
			}
		})
		domTabBtnRelated.addEventListener("click", () => {
			setTab(TabType.related);
			if (fileInfo2 !== undefined) {
				loadInfo();
				loadRelated();
			}
		})
		function setTab(type: string) {

			if (type === TabType.related) {
				tabType = TabType.related;
				domTabBtnInfo.setAttribute("active", "");
				domTabBtnRelated.setAttribute("active", "true");
				domTabContentInfo.style.display = "none";
				domTabContentRelated.style.display = "";
			} else {
				tabType = TabType.info;
				domTabBtnInfo.setAttribute("active", "true");
				domTabBtnRelated.setAttribute("active", "");
				domTabContentInfo.style.display = "";
				domTabContentRelated.style.display = "none";
			}

			M.config.settings.layout.mainExifTabs = tabType;
		}

		//拖曳改變size
		var dragbar = new Dragbar();
		dragbar.init("left", domMainExif, domDragbar_mainFileList, M.dom_mainR);
		//拖曳開始
		dragbar.setEventStart(() => { })
		//拖曳
		dragbar.setEventMove((val: number) => {
			if (val < 10) { //小於10的話就暫時隱藏
				domMainExif.style.opacity = "0";
				dragbar.setPosition(0);
			} else {
				domMainExif.style.opacity = "1";
				setItemWidth(val);
			}
		})
		//拖曳 結束
		dragbar.setEventEnd((val: number) => {
			if (val < 10) { //小於10的話，關閉檔案預覽視窗
				setEnabled(false);
			}
		})


		/**
		 * 暫時隱藏(不影響設定值，強制隱藏
		 */
		function setHide(val: boolean) {
			isHide = val;
			if (val) {
				domMainExif.setAttribute("hide", "true");
				dragbar.setEnabled(false);
			} else {
				domMainExif.setAttribute("hide", "");
				dragbar.setEnabled(M.config.settings.layout.mainExifEnabled);
			}
		}


		/**
		 * 啟用 或 關閉
		 */
		function setEnabled(val: boolean) {

			if (val) {
				domMainExif.setAttribute("active", "true");

				//讀取上次的設定
				tabType = M.config.settings.layout.mainExifTabs;
				setTab(tabType);

			} else {
				domMainExif.setAttribute("active", "");
			}

			M.config.settings.layout.mainExifEnabled = val;
			dragbar.setEnabled(val);
			domMainExif.style.opacity = "1";

			if (isEnabled === val) { return; }
			isEnabled = val;

			loadInfo();
			loadRelated();
		}


		/**
		 * 設定是否顯示 相關檔案
		 */
		function setRelatedFilesEnabled(val: boolean) {

			if (val) {
				domTabBtns.setAttribute("active", "true");
			} else {
				domTabBtns.setAttribute("active", "false");
				if (tabType === TabType.related) {
					setTab(TabType.info);
					loadInfo();
				}
			}
		}


		/**
		 * 設定size
		 * @param val 
		 */
		function setItemWidth(val: number) {

			let valMin = 150;
			let valMax = 400;
			if (val <= valMin) { val = valMin; }
			if (val >= valMax) { val = valMax; }

			M.config.settings.layout.mainExifShowWidth = val;

			//var cssRoot = document.body;
			//cssRoot.style.setProperty("--mainExif-width", val + "px");
			domMainExif.style.width = val + "px";
			dragbar.setPosition(val);
		}


		/**
		 * 初始化
		 * @param _fileInfo2 
		 * @param noCheckPath true=不在載入完成後檢查是否已經切換到其他檔案
		 */
		function init(_fileInfo2: FileInfo2, noCheckPath = false) {
			fileInfo2 = _fileInfo2;
			loadInfo(noCheckPath);
			loadRelated(noCheckPath);
		}

		/**
		 * 讀取 資訊(於初始化後呼叫)
		 */
		async function loadInfo(noCheckPath = false) {

			if (isEnabled === false) { return; }
			if (tabType !== TabType.info) { return; }

			domTabContentInfo.innerHTML = "";

			if (fileInfo2.Type === "none") { //如果檔案不存在
				return;
			}

			let path = fileInfo2.FullPath;
			let maxLength = M.config.settings.advanced.exifReadMaxLength;
			let json = await WebAPI.getExif(fileInfo2, maxLength);

			if (json.code != "1") {
				return;
			}
			if (noCheckPath === false) {
				if (M.fileLoad.getFilePath() !== path) { //如果已經在載入期間已經切換到其他檔案
					return;
				}
			}
			//取得經緯度
			let GPS_lat = getItem(json.data, "GPS Latitude"); //緯度
			let GPS_lng = getItem(json.data, "GPS Longitude"); //經度
			if (GPS_lat === `0° 0' 0"` && GPS_lng === `0° 0' 0"`) { //避免空白資料
				GPS_lat = undefined;
				GPS_lng = undefined;
			}
			let hasGPS = GPS_lat !== undefined && GPS_lng !== undefined;
			if (hasGPS) { //如果經緯度不是空，就新增「Map」欄位
				json.data.push({ group: "GPS", name: "Map", value: `${GPS_lat},${GPS_lng}` });
			}

			//更新舊資料，Flash(key) 改為 Flash
			/*let flashIndex = M.config.exif.whitelist.indexOf("Flash(key)");
			if (flashIndex !== -1) {
				M.config.exif.whitelist[flashIndex] = "Flash";
			}*/

			let deferredFunc: (() => void)[] = []; //最後才執行的函數
			let ar = json.data;
			let whitelist = M.config.exif.whitelist;

			for (let i = 0; i < whitelist.length; i++) {
				let name = whitelist[i];
				let value = getItem(ar, name);

				if (value === undefined) {
					continue;

				} else if (name === "Map") {

					value = encodeURIComponent(value); //移除可能破壞html的跳脫符號

					let mapHtml = `
						<div class="mainExifItem">
							<div class="mainExifMap">
								<iframe class="mainExifMapIframe" src="https://maps.google.com.tw/maps?q=${value}&z=16&output=embed"></iframe>
							</div>
						</div>`;
					domTabContentInfo.appendChild(Lib.newDom(mapHtml));

				} else if (name === "User Comment" && value.indexOf("Steps: ") !== -1 && value.indexOf("Seed: ") !== -1) { // Stable Diffusion webui 輸出的jpg或webp

					ar.push({
						group: "PNG-tEXt",
						name: "Textual Data",
						value: "parameters: " + value
					})

				} else if (name === "Textual Data") { //PNG iTXt / zTXt / tEXt

					let vals = getItems(ar, name);
					for (let i = 0; i < vals.length; i++) {
						let val = vals[i];
						let x = val.indexOf(": "); //資料格式通常為 aaaaa: xxxxxx
						if (x === -1) {
							domTabContentInfo.appendChild(getItemDom(name, val));

						} else {

							let name = val.substring(0, x);
							val = val.substring(x + 1).trim();

							if (name === "Comment") { // NovelAI 才有的欄位
								if (val.indexOf(`"steps": `) !== -1) {
									AiDrawingPrompt.getNovelai(val).forEach(item => {
										domTabContentInfo.appendChild(getItemDom(item.title, item.text));
									})
								} else {
									domTabContentInfo.appendChild(getItemDom(name, val));
								}
							}

							else if (name === "parameters") { // Stable Diffusion webui 才有的欄位
								if (val.includes("Steps: ")) {
									AiDrawingPrompt.getSdwebui(val).forEach(item => {
										domTabContentInfo.appendChild(getItemDom(item.title, item.text));
									})
								} else {
									domTabContentInfo.appendChild(getItemDom(name, val));
								}
							}

							else if (name === "prompt") { // ComfyUI
								let jsonF = Lib.jsonStrFormat(val);
								if (jsonF.ok) { // 解析欄位
									AiDrawingPrompt.getComfyui(val).forEach(item => {
										domTabContentInfo.appendChild(getItemDom(item.title, item.text));
									})
								}
								if (jsonF.ok) { // 如果是json
									val = jsonF.jsonFormat; // 格式化json再顯示
								}
								domTabContentInfo.appendChild(getItemDom(name, val));
							}
							else if (name === "workflow") { // ComfyUI
								let jsonF = Lib.jsonStrFormat(val);
								if (jsonF.ok) { // 如果是json (例如 Hashes
									val = jsonF.jsonFormat; // 格式化json再顯示
								}
								domTabContentInfo.appendChild(getItemDom(name, val));
							}

							else if (name === "sd-metadata" || name === "invokeai_metadata" || name === "invokeai_graph" || name === "Dream") { // invoke ai
								if (name === "invokeai_graph") {
									continue;
								}

								//這個資訊不重要，所以排到最後面
								if (name === "Dream") {
									let itemDom = getItemDom(name, val);
									deferredFunc.push(() => {
										domTabContentInfo.appendChild(itemDom);
									})
									continue;
								}

								let items = AiDrawingPrompt.getInvokeai(val);
								if (items.length > 0) {
									items.forEach(item => {
										domTabContentInfo.appendChild(getItemDom(item.title, item.text));
									})
								} else {
									domTabContentInfo.appendChild(getItemDom(name, val));
								}
							}

							else {
								domTabContentInfo.appendChild(getItemDom(name, val));
							}
						}

						deferredFunc.forEach(func => {
							func();
						});
					}

				} else {

					let nameI18n = `exif.name.${name}`;
					let valueI18n = "";

					//處理value的值
					if (name === "Metering Mode") {
						value = M.i18n.t(`exif.value.${name}.${value}`);
						valueI18n = `exif.value.${name}.${value}`;
					}
					if (name === "Flash") {
						value = M.i18n.t(`exif.value.${name}.${value}`);
						valueI18n = `exif.value.${name}.${value}`
					}
					if (name === "Length") {
						value = Lib.getFileLength(Number(value));
					}
					name = M.i18n.t(`exif.name.${name}`);
					domTabContentInfo.appendChild(getItemDom(name, value, nameI18n, valueI18n));
				}
			}

		}


		/**
		 * 讀取 相關檔案(於初始化後呼叫)
		 */
		async function loadRelated(noCheckPath = false) {

			if (isEnabled === false) { return; }
			if (tabType !== TabType.related) { return; }

			domTabContentRelated.innerHTML = "";

			if (fileInfo2.Type === "none") { //如果檔案不存在
				return;
			}

			let path = fileInfo2.FullPath;
			let json = await WebAPI.getRelatedFileList(path, relatedFileExtList);

			if (noCheckPath === false) {
				if (M.fileLoad.getFilePath() !== path) { //如果已經在載入期間已經切換到其他檔案
					return;
				}
			}

			for (let i = 0; i < json.length; i++) {
				const item = json[i];
				let itemPath = item.path;
				let itemText = item.text;
				let domBox = await getRelatedDom(itemPath, itemText);
				if (noCheckPath === false) {
					if (M.fileLoad.getFilePath() !== path) { //如果已經在載入期間已經切換到其他檔案
						return;
					}
				}
				domTabContentRelated.appendChild(domBox);
			}

			if (json.length === 0) {
				let btnNew = await getRelatedBtnAdd()
				domTabContentRelated.appendChild(btnNew);
			}
		}


		/**
		 * 取得 相關檔案的 新增按鈕
		 * @returns dom
		 */
		async function getRelatedBtnAdd() {
			let path = fileInfo2.FullPath;
			let btnNew = Lib.newDom(`
				<div class="mainExifRelatedBtnAdd" i18n="menu.new">
					${M.i18n.t("menu.new")}
				</div>
			`);

			btnNew.addEventListener("click", async () => {
				let dirPath = Lib.GetDirectoryName(path);
				if (dirPath === null) { return; }
				//let pathF = Lib.GetExtension(path).split(".")[0];
				let txtName = Lib.GetFileName(path).split(".")[0] + ".txt";
				let txtPath = Lib.Combine([dirPath, txtName]);
				if (await WV_File.Exists(txtPath) === true) { //如果檔案已經存在
					txtName = Lib.GetFileName(path).split(".")[0] + ".1.txt";
					txtPath = Lib.Combine([dirPath, txtName]);
				}
				M.textEditor.show(txtPath);
				M.textEditor.setOnSave(async (text: string) => {
					M.textEditor.close();
					btnNew.remove();
				})
			})

			return btnNew;
		}


		/**
		 * 取得 相關檔案的 項目
		 * @param itemPath 
		 * @param itemText 
		 * @returns dom
		 */
		async function getRelatedDom(itemPath: string, itemText: string | null) {

			let name = Lib.GetFileName(fileInfo2.FullPath);
			let itemName = Lib.GetFileName(itemPath);

			function getText(text: string) {
				let ext = Lib.GetExtension(itemPath);
				if (ext === ".json" || ext === ".info") {
					text = Lib.jsonStrFormat(text).jsonFormat;
				}
				text = Lib.escape(text);
				text = text.replace(/[ ]/g, "&nbsp;");
				text = text.replace(/\n/g, "<br>");
				return text;
			}

			// 外框物件
			let domBox = Lib.newDom(`
				<div class="mainExifRelatedBox" data-menu="file">	
				</div>
			`);
			domBox.setAttribute("data-path", itemPath);
			//domTabContentRelated.appendChild(domBox);

			// 標題物件
			let title = itemName.substring(name.split(".")[0].length);
			let domTitle = Lib.newDom(`
				<div class="mainExifRelatedTitle collapse-title">
					<span>${Lib.escape(title)}</span>
				</div>
			`);
			domBox.appendChild(domTitle);

			// 內容物件
			let domContent: HTMLElement;
			if (itemText !== null) {

				let text = itemText;

				if (title.toLowerCase().endsWith(".txt")
					&&
					(
						text.indexOf("Negative prompt: ") !== -1 //負面提示
						|| text.indexOf("Steps: ") !== -1 //其他參數
					)
				) { //如果是 SDwebUI 的 info

					domContent = Lib.newDom(`
						<div class="mainExifRelatedContent collapse-content">
							<div class="mainExifList">
							</div>
						</div>
					`);
					let domContentList = domContent.querySelector(".mainExifList") as HTMLElement;
					AiDrawingPrompt.getSdwebui(text).forEach(item => {
						domContentList.appendChild(getItemDom(item.title, item.text));
					})
				} else { //一般的文字檔

					domContent = Lib.newDom(`
						<div class="mainExifRelatedContent collapse-content">
							<div class="mainExifRelatedText">
								<span>${getText(itemText)}</span>
							</div>
						</div>
					`);

				}

				//按鈕 - civitai
				if (title.toLowerCase() === ".civitai.info") {
					try {
						let civitaiInfo = JSON.parse(text);
						let modelId = civitaiInfo.modelId;
						if (modelId !== undefined) {
							let btnCivitai = Lib.newDom(`<div class="mainExifRelatedTitleBtn" title="Civitai">${SvgList["tool-civitai.svg"]}</div>`)
							domTitle.appendChild(btnCivitai);
							btnCivitai.addEventListener("click", async () => {
								let url = "https://civitai.com/models/" + modelId;
								WV_RunApp.OpenUrl(url);
							})
						}
					} catch (e) { }
				}

				//按鈕 - 編輯
				let btnEdit = Lib.newDom(`<div class="mainExifRelatedTitleBtn" title="${M.i18n.t("menu.edit")}">${SvgList["tool-edit.svg"]}</div>`)
				domTitle.appendChild(btnEdit);
				btnEdit.addEventListener("click", async () => {
					M.textEditor.show(domBox.getAttribute("data-path"));
					M.textEditor.setOnSave(async (t: string) => { //儲存時更新面板裡面的文字
						let newItemDom = await getRelatedDom(itemPath, t);
						domBox.insertAdjacentElement("afterend", newItemDom);
						domBox.remove();
					});
				})

				//按鈕 - 複製
				let btnCoyp = Lib.newDom(`<div class="mainExifRelatedTitleBtn" title="${M.i18n.t("menu.copy")}">${SvgList["tool-copy.svg"]}</div>`)
				domTitle.appendChild(btnCoyp);
				btnCoyp.addEventListener("click", async () => {
					await WV_System.SetClipboard_Txt(itemText ?? "");
					Toast.show(M.i18n.t("msg.copyExif", { v: title }), 1000 * 3); //已將「.txt」複製至剪貼簿
				})

			} else {

				// 取得圖片網址
				let imgData = await M.script.img.getImgData(await WebAPI.getFileInfo2(itemPath));
				let arUrl = imgData.arUrl;
				let imageWidth = imgData.width;
				let imgUrl = arUrl[0].url;
				for (let i = arUrl.length - 1; i >= 0; i--) {
					if (imageWidth * arUrl[i].scale >= 400) {
						imgUrl = arUrl[i].url;
						break;
					}
				}

				domContent = Lib.newDom(`
					<div class="mainExifRelatedContent collapse-content">
						<div class="mainExifRelatedImg">
							<img src="${imgUrl}" />
						</div>
					</div>
				`);

				//快速拖曳
				Lib.addDragThresholdListener(domContent, 5, () => {
					let path = domBox.getAttribute("data-path");
					if (path !== null) {
						M.script.file.dragDropFile(path);
					}
				});

				//雙擊左鍵
				Lib.addEventDblclick(domContent, async (e: MouseEvent) => { //圖片物件
					let path = domBox.getAttribute("data-path");
					if (path !== null) {
						M.fileLoad.loadFile(path);
					}
				});

			}
			domBox.appendChild(domContent);

			//初始化 折疊面板
			let open = M.config.settings.layout.mainExifCollapse[title]; //從設定讀取折疊狀態
			if (open === undefined) { open = true; } //不存在就預設為開
			Lib.collapse(domBox, "init-" + open); //不使用動畫直接初始化狀態
			domTitle.addEventListener("click", (e) => {

				//如果是右上角的按鈕，則不處理
				let target = e.target as HTMLElement;
				if (target !== null && target.classList.contains("mainExifRelatedTitleBtn")) {
					return;
				}

				Lib.collapse(domBox, "toggle", (type) => { //切換折疊狀態
					let t = (type === "true");
					M.config.settings.layout.mainExifCollapse[title] = t; //更改狀態後，儲存折疊狀態
				});
			})

			return domBox;
		}


		/** 
		 * exif項目的dom
		 */
		function getItemDom(name: string, value: string, nameI18n = "", valueI18n = "") {

			if (name == undefined || name == null) { name = ""; }
			if (value == undefined || value == null) { value = ""; }

			let oVal = value; //原始資料
			name = name.toString();
			value = value.toString();
			name = Lib.escape(name); //移除可能破壞html的跳脫符號
			value = Lib.escape(value);

			value = value.replace(/\n/g, "<br>"); //處理換行
			value = value.replace(/[ ]/g, "&nbsp;"); //處理空白

			let html = `
				<div class="mainExifItem">
					<div class="mainExifName" i18n="${nameI18n}">${name}</div>
					<div class="mainExifValue" i18n="${valueI18n}">${value}</div>
					<div class="mainExifCopyBtn" title="${M.i18n.t("menu.copy")}">${SvgList["tool-copy.svg"]}</div>
				</div>`

			let div = Lib.newDom(html);
			let btn = div.querySelector(".mainExifCopyBtn") as HTMLElement;
			btn.addEventListener("click", async () => {
				await WV_System.SetClipboard_Txt(oVal);
				Toast.show(M.i18n.t("msg.copyExif", { v: name }), 1000 * 3); //已將「exifName」複製至剪貼簿
			})

			return div;
		}

		/** 
		 * 從exif裡面取得全部的value
		 */
		function getItems(ar: any, key: string) {
			let arOutput = [];
			for (let i = 0; i < ar.length; i++) {
				let item = ar[i];
				if (item.name == key) {
					arOutput.push(item.value);
				}
			}
			return arOutput;
		}

		/**
		 * 從exif裡面取得第一筆的value
		 */
		function getItem(ar: any, key: string) {
			for (let i = 0; i < ar.length; i++) {
				let item = ar[i];
				if (item.name == key) {
					return item.value;
				}
			}
			return undefined;
		}

		/**
		 * 設定 「寬度足夠時，橫向排列」
		 */
		function setHorizontal(val: boolean) {
			if (val) {
				domMainExif.classList.add("mainExif--horizontal");
			} else {
				domMainExif.classList.remove("mainExif--horizontal");
			}
		}





		/**
		 * 檔案被修改時呼叫
		 */
		async function updateFileWatcher(fileWatcherData: FileWatcherData) {
			if (isEnabled === false) { return; }
			if (tabType !== TabType.related) { return; }

			// 取得要操作的dom，null 表示不存在此
			function getRelatedBox(path: string) {
				path = path.toLowerCase();
				let arContentRelated = domTabContentRelated.querySelectorAll(".mainExifRelatedBox");
				for (let i = 0; i < arContentRelated.length; i++) {
					const item = arContentRelated[i];
					let dataPath = item.getAttribute("data-path");
					if (dataPath !== null) {
						if (dataPath.toLowerCase() === path) {
							return item;
						}
					}
				}
				return null;
			}

			//取得標題，null 表示不是相關檔案，例如 .min.js
			function getTitle() {
				let name = Lib.GetFileName(fileInfo2.FullPath); //目前檔案的檔名
				let itemName = Lib.GetFileName(fileWatcherData.FullPath);
				let nameF = name.split(".")[0]; //取得檔名第一個.之前的部分
				let itemNameF = itemName.split(".")[0];

				if (nameF.toLowerCase() === itemNameF.toLowerCase()) { //檔名與原先檔名一樣
					let title = itemName.substring(nameF.length);
					return title;
				}
				return null;
			}

			let changeType = fileWatcherData.ChangeType;

			if (changeType === "deleted") {
				let relatedBox = getRelatedBox(fileWatcherData.FullPath);
				if (relatedBox === null) { return; }
				relatedBox.remove();

				//如果沒有其他檔案，就顯示 新增按鈕
				if (domTabContentRelated.querySelectorAll(".mainExifRelatedBox").length === 0) {
					let btnNew = await getRelatedBtnAdd()
					domTabContentRelated.appendChild(btnNew);
				}
			}

			else if (changeType === "renamed") {
				let relatedBox = getRelatedBox(fileWatcherData.OldFullPath);
				if (relatedBox !== null) {

					relatedBox.setAttribute("data-path", fileWatcherData.FullPath);

					let relatedTitle = relatedBox.querySelector(".mainExifRelatedTitle span") as HTMLElement;
					if (relatedTitle !== null) {
						let title = getTitle(); //取得新標題
						if (title !== null) {
							relatedTitle.innerText = Lib.escape(title);
						} else { //取得標題失敗表示不是相關檔案，則移除舊項目
							relatedBox.remove();

							//如果沒有其他檔案，就顯示 新增按鈕
							if (domTabContentRelated.querySelectorAll(".mainExifRelatedBox").length === 0) {
								let btnNew = await getRelatedBtnAdd()
								domTabContentRelated.appendChild(btnNew);
							}
						}
					}

				} else {
					changeType = "created"; //如果更改檔名後是不存在於列表的項目，就視為新增
				}

			}
			else if (changeType === "changed") {

			}


			if (changeType === "created") {

				let title = getTitle();
				if (title !== null) {
					let path = fileWatcherData.FullPath;
					let ext = Lib.GetExtension(path).replace(".", "");
					let text = null;
					if (relatedFileExtList.includes(ext)) {
						text = await WV_File.GetText(path);
					}
					let domBox = await getRelatedDom(path, text);
					domTabContentRelated.appendChild(domBox);

					//新增檔案後就隱藏 新增按鈕
					let btnNew = domTabContentRelated.querySelector(".mainExifRelatedBtnAdd");
					if (btnNew !== null) {
						btnNew.remove();
					}

				}

			}
		}

	}

}


class TextEditor {

	public show;
	public close;
	public save;
	public getIsShow;
	public getText;
	public setText;
	public setOnSave;

	constructor(M: MainWindow) {
		let dom = document.querySelector("#textEditor") as HTMLElement;
		let domTextarea = dom?.querySelector(".textEditor-textarea") as HTMLTextAreaElement;
		let domBtnSave = dom?.querySelector(".js-save") as HTMLElement;
		let domBtnPretty = dom?.querySelector(".js-pretty") as HTMLElement;
		let domBtnClose = dom?.querySelector(".js-close") as HTMLElement;
		let filePath = "";
		let isShow = false;
		let onSave = (text: string) => { };

		this.show = show;
		this.close = close;
		this.save = save;
		this.getIsShow = getIsShow;
		this.getText = getText;
		this.setText = setText;
		this.setOnSave = setOnSave;


		//讓 Textarea 支援 tab
		domTextarea.addEventListener("keydown", function (e) {

			if (e.code === "Tab") {
				// selection
				if (this.selectionStart == this.selectionEnd) {
					// These single character operations are undoable
					if (!e.shiftKey) {
						document.execCommand("insertText", false, "\t");
					}
					else {
						var text = this.value;
						if (this.selectionStart > 0 && text[this.selectionStart - 1] == "\t") {
							document.execCommand("delete");
						}
					}
				}
				else {
					// Block indent/unindent trashes undo stack.
					// Select whole lines
					var selStart = this.selectionStart;
					var selEnd = this.selectionEnd;
					var text = domTextarea.value;
					while (selStart > 0 && text[selStart - 1] != "\n")
						selStart--;
					while (selEnd > 0 && text[selEnd - 1] != "\n" && selEnd < text.length)
						selEnd++;

					// Get selected text
					var lines = text.substring(selStart, selEnd).split("\n");

					// Insert tabs
					for (var i = 0; i < lines.length; i++) {
						// Don't indent last line if cursor at start of line
						if (i == lines.length - 1 && lines[i].length == 0)
							continue;

						// Tab or Shift+Tab?
						if (e.shiftKey) {
							if (lines[i].startsWith("\t"))
								lines[i] = lines[i].substring(1);
							else if (lines[i].startsWith("    "))
								lines[i] = lines[i].substring(4);
						}
						else
							lines[i] = "\t" + lines[i];
					}
					let linesJoin = lines.join("\n");

					// Update the text area
					this.value = text.substring(0, selStart) + linesJoin + text.substring(selEnd);
					this.selectionStart = selStart;
					this.selectionEnd = selStart + linesJoin.length;
				}

				return false;
			}

			return true;
		});

		domBtnSave.addEventListener("click", async () => {
			await save();
		})
		domBtnPretty.addEventListener("click", () => {
			let t = getText();
			try {
				let j = JSON.parse(t);
				t = JSON.stringify(j, null, "\t");
				setText(t);
			} catch (e) {
				Toast.show(M.i18n.t("msg.formattingFailed"), 1000 * 3); //儲存完成
			}
		})
		domBtnClose.addEventListener("click", () => {
			close();
		})

		/**
		 * 取得目前是否顯示
		 */
		function getIsShow() {
			return isShow;
		}

		/**
		 * 顯示視窗
		 * @param path 檔案路徑
		 */
		async function show(path: string | null) {

			isShow = true;
			dom.style.display = "";
			await Lib.sleep(1);
			dom.setAttribute("active", "true");

			if (path === null) { path = "" }
			filePath = path;
			let t = "";
			if (await WV_File.Exists(filePath)) {
				t = await WV_File.GetText(filePath);
			}
			setText(t);

			//設定焦點
			domTextarea.focus();
			domTextarea.setSelectionRange(0, 0);

			domTextarea.scrollTop = 0;

			// 如果是json，就顯示 格式化 的按鈕
			if (
				Lib.GetExtension(filePath) === ".json"
				|| t.startsWith("{")
			) {
				domBtnPretty.style.display = "";
			} else {
				domBtnPretty.style.display = "none";
			}
		}

		/**
		 * 關閉視窗
		 */
		function close() {
			isShow = false;
			dom.setAttribute("active", "false");

			setTimeout(() => {
				if (dom.getAttribute("active") == "false") {
					domTextarea.value = "";
					dom.style.display = "none";
				}
			}, 300);
		}

		/**
		 * 設定 儲存後執行的回調
		 */
		function setOnSave(funcSave: (text: string) => void) {
			onSave = funcSave;
		}

		/**
		 * 儲存
		 */
		async function save() {
			let t = getText();
			try {
				await WV_File.SetText(filePath, t);
				onSave(t);
				Toast.show(M.i18n.t("msg.saveComplete"), 1000 * 3); //儲存完成
			} catch (e) {
				Toast.show(M.i18n.t("msg.saveFailed") + ":\n" + e, 1000 * 3); //儲存失敗
			}
		}

		/**
		 * 取得 文字
		 */
		function getText() {
			return domTextarea.value;
		}

		/**
		 * 設定 文字
		 */
		function setText(t: string) {
			domTextarea.value = t;
		}
	}
}
