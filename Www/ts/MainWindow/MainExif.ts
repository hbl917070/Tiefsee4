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
		var domDragbar_mainFileList = document.getElementById("dragbar-mainExif") as HTMLElement; // 拖曳條

		var domTabBtns = domMainExif.querySelector(".js-tabBtns") as HTMLElement;
		var domTabBtnInfo = domMainExif.querySelector(".js-tabBtn-info") as HTMLElement;
		var domTabBtnRelated = domMainExif.querySelector(".js-tabBtn-related") as HTMLElement;
		var domTabContentInfo = domMainExif.querySelector(".js-tabContent-info") as HTMLElement;
		var domTabContentRelated = domMainExif.querySelector(".js-tabContent-related") as HTMLElement;

		var relatedFileExtList = ["txt", "json", "xml", "info", "ini", "config"];
		var fileInfo2: FileInfo2;

		var isHide = false; // 暫時隱藏
		var isEnabled = true; // 啟用 檔案預覽視窗

		/** 請求限制器 */
		const limiter = new RequestLimiter(3);

		/** 頁籤的類型 */
		var TabType = {
			/** 資訊 */
			info: "info",
			/** 相關檔案 */
			related: "related"
		}
		/** 當前頁籤的類型 */
		var tabType = TabType.info;

		// 在工具列滾動時，進行水平移動
		domTabBtns.addEventListener("wheel", (e: WheelEvent) => {

			let scrollLeft = domTabBtns.scrollLeft;
			let deltaY = e.deltaY; // 上下滾動的量

			if (deltaY > 0) { // 往右
				domTabBtns.scroll(scrollLeft + 20, 0);
			}
			if (deltaY < 0) { // 往左
				domTabBtns.scroll(scrollLeft - 20, 0);
			}
		}, false);

		new TiefseeScroll().initGeneral(domTabBtns, "x"); // 滾動條元件

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

		// 拖曳改變 size
		var dragbar = new Dragbar();
		dragbar.init("left", domMainExif, domDragbar_mainFileList, M.dom_mainR);
		// 拖曳開始
		dragbar.setEventStart(() => { })
		// 拖曳
		dragbar.setEventMove((val: number) => {
			if (val < 10) { // 小於10的話就暫時隱藏
				domMainExif.style.opacity = "0";
				dragbar.setPosition(0);
			} else {
				domMainExif.style.opacity = "1";
				setItemWidth(val);
			}
		})
		// 拖曳 結束
		dragbar.setEventEnd((val: number) => {
			if (val < 10) { // 小於10的話，關閉檔案預覽視窗
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

				// 讀取上次的設定
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

			// var cssRoot = document.body;
			// cssRoot.style.setProperty("--mainExif-width", val + "px");
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

			if (fileInfo2.Type === "none") { // 如果檔案不存在
				return;
			}

			let path = fileInfo2.FullPath;
			let maxLength = M.config.settings.advanced.exifReadMaxLength;
			let json = await WebAPI.getExif(fileInfo2, maxLength);

			if (json.code != "1") {
				return;
			}
			if (noCheckPath === false) {
				if (M.fileLoad.getFilePath() !== path) { // 如果已經在載入期間已經切換到其他檔案
					return;
				}
			}
			let groupType = M.fileShow.getGroupType();

			// 取得經緯度
			let gpsLat = getItem(json.data, "GPS Latitude")?.value; // 緯度
			let gpsLng = getItem(json.data, "GPS Longitude")?.value; // 經度
			if (gpsLat === `0° 0' 0"` && gpsLng === `0° 0' 0"`) { // 避免空白資料
				gpsLat = undefined;
				gpsLng = undefined;
			}
			let hasGPS = gpsLat !== undefined && gpsLng !== undefined;
			if (hasGPS) { // 如果經緯度不是空，就新增「Map」欄位
				json.data.push({ group: "GPS", name: "Map", value: `${gpsLat},${gpsLng}` });
			}

			let deferredFunc: (() => void)[] = []; // 最後才執行的函數
			let comfyuiPrompt: string | undefined;
			let comfyuiWorkflow: string | undefined;
			let comfyuiGenerationData: any | undefined;
			let comfyScript: any | undefined;
			let civitai = {
				civitaiResources: undefined as string | undefined,
				lorahashes: undefined as string | undefined,
				hashes: undefined as string | undefined,
				tiHashes: undefined as string | undefined,
				modelHash: undefined as string | undefined,
			};

			// 待影片載入完畢，更新「影片長度」的資訊
			async function updateVideoDuration(domVideo: HTMLElement) {
				await Lib.sleep(10);
				for (let i = 0; i < 100; i++) {

					let duration = M.fileShow.tiefseeview.getVideoDuration();

					if (isNaN(duration) === false) {

						let value = formatVideoLength(duration);

						// 產生新的 dom
						let name = M.i18n.t(`exif.name.Video Duration`);
						let domVideoNew = getItemDom(name, value);
						domTabContentInfo.appendChild(domVideoNew);

						// 把新的 dom 插到原有的 dom 後面，然後刪除原有的 dom
						domVideo.insertAdjacentElement("afterend", domVideoNew);
						domVideo.parentNode?.removeChild(domVideo);

						return;
					}
					await Lib.sleep(100);
				}
			}

			// 不重要的資訊，排到最後面才顯示
			function lastItem(name: string, val: string) {
				let itemDom = getItemDom(name, val);
				deferredFunc.push(() => {
					domTabContentInfo.appendChild(itemDom);
				})
			}

			let ar = json.data;
			let whitelist = M.config.exif.whitelist;
			for (let i = 0; i < whitelist.length; i++) {

				let name = whitelist[i];

				// 如果是影片
				if (groupType === GroupType.video && name === "Video Duration") {
					// 先產生一個沒有資料的項目
					let domVideo = getItemDom(M.i18n.t(`exif.name.${name}`), " ");
					domTabContentInfo.appendChild(domVideo);
					// 待影片載入完畢，更新「影片長度」的資訊
					updateVideoDuration(domVideo);
					continue;
				}

				let exifItem = getItem(ar, name);
				if (exifItem === undefined) { continue; }
				let value = exifItem.value;
				let group = exifItem.group;
				if (value === "") { continue; }

				if (name === "Map") {

					value = encodeURIComponent(value); // 移除可能破壞html的跳脫符號

					let mapHtml = `
						<div class="mainExifItem">
							<div class="mainExifMap">
								<iframe class="mainExifMapIframe" src="https://maps.google.com.tw/maps?q=${value}&z=16&output=embed"></iframe>
							</div>
						</div>`;
					domTabContentInfo.appendChild(Lib.newDom(mapHtml));

				}
				else if (name === "Frame Count") { // 總幀數
					let nameI18n = `exif.name.${name}`;
					name = M.i18n.t(`exif.name.${name}`);

					let domValue = Lib.newDom(`<span>${value}<div class="btnExport" title="${M.i18n.t("menu.export")}"> ${SvgList["tool-export.svg"]} </div><span>`);
					let domBtn = domValue.querySelector(".btnExport") as HTMLElement;
					domBtn.addEventListener("click", () => {
						console.log(path)
						M.script.open.showFrames(path);
					})
					let itemDom = getItemDom(name, domValue, nameI18n, "");

					domTabContentInfo.appendChild(itemDom);

				}
				else if (name === "Make" && value.startsWith("Prompt:{")) { // ComfyUI 的 webp

					comfyuiPrompt = value.substring(7);

				}
				else if (name === "Image Description" && value.startsWith("Workflow:{")) { // ComfyUI 的 webp

					comfyuiWorkflow = value.substring(9);

				}
				else if (name === "Comment" || name === "User Comment" || name === "Windows XP Comment" || name === "Image Description") {

					// Stable Diffusion webui 輸出的 jpg 或 webp
					if (value.includes("Steps: ") && value.includes("Seed: ")) {
						ar.push({
							group: "PNG-tEXt",
							name: "Textual Data",
							value: "parameters: " + value
						});
					} else {

						let jsonF = Lib.jsonStrFormat(value);
						if (jsonF.ok) { // 解析欄位
							if (value.startsWith(`{"prompt":`)) { // ComfyUI
								comfyuiPrompt = JSON.parse(value)["prompt"];
							}
						} else {
							domTabContentInfo.appendChild(getItemDom(name, value));
						}
					}

				}
				else if (name === "Textual Data") { // PNG iTXt / zTXt / tEXt

					let vals = getItems(ar, name);
					for (let i = 0; i < vals.length; i++) {
						let val = vals[i];
						let x = val.indexOf(": "); // 資料格式通常為 aaaaa: xxxxxx
						if (x === -1) {
							domTabContentInfo.appendChild(getItemDom(name, val));

						} else {

							let name = val.substring(0, x);
							val = val.substring(x + 1).trim();

							//  NovelAI 才有的欄位。此欄位與解析後的 prompt 相同，所以不顯示
							if (name === "Description") {
								let prompt = ar.find(x => x.name === "Textual Data" && x.value.startsWith("Comment: {\"prompt\": "));
								if (prompt !== undefined) {
									try {
										let json = JSON.parse(prompt.value.substring(9));
										if (json.prompt.trim() == val) { // 開頭為「Comment: {"prompt": "」
											continue;
										}
									} catch (e) { }
								}
							}

							if (name === "Comment") { // NovelAI 才有的欄位
								if (val.includes(`"steps": `)) {
									AiDrawingPrompt.getNovelai(val).forEach(item => {
										domTabContentInfo.appendChild(getItemDom(item.title, item.text));
									})
								} else {
									domTabContentInfo.appendChild(getItemDom(name, val));
								}
							}
							else if (name === "Generation time") { // ComfyUI
								// 這個資訊不重要，所以排到最後面
								lastItem(name, val);
								continue;
							}

							else if (name === "metadata") { // 不明，資料為一般的 json
								if (val.includes(`"seed": `)) {
									AiDrawingPrompt.getNormalJson(val).forEach(item => {
										domTabContentInfo.appendChild(getItemDom(item.title, item.text));
									})
								} else {
									domTabContentInfo.appendChild(getItemDom(name, val));
								}
							}

							else if (name === "parameters") { // Stable Diffusion webui 才有的欄位
								if (val.includes(`"sui_image_params":`)) { // StableSwarmUI
									let json = JSON.parse(val)["sui_image_params"];
									AiDrawingPrompt.getNormalJson(json).forEach(item => {
										domTabContentInfo.appendChild(getItemDom(item.title, item.text));
									})
								}
								else if (val.includes("Steps: ")) { // A1111
									AiDrawingPrompt.getSdwebui(val).forEach(item => {
										if (item.title == "Civitai resources") {
											civitai.civitaiResources = item.text;
										}
										if (item.title == "Lora hashes") {
											civitai.lorahashes = item.text;
										}
										if (item.title == "Model hash") {
											civitai.modelHash = item.text;
										}
										if (item.title == "Hashes") {
											civitai.hashes = item.text;
										}
										if (item.title == "TI hashes") {
											civitai.tiHashes = item.text;
										}
										domTabContentInfo.appendChild(getItemDom(item.title, item.text));
									})
								} else {
									domTabContentInfo.appendChild(getItemDom(name, val));
								}
							}

							else if (name === "prompt") { // ComfyUI
								comfyuiPrompt = val;
							}
							else if (name === "workflow") { // ComfyUI
								comfyuiWorkflow = val;
							}
							else if (name === "generation_data") { // ComfyUI
								comfyuiGenerationData = val;
							}
							else if (name === "ComfyScript") { // ComfyUI
								comfyScript = val;
							}

							else if (name === "sd-metadata" || name === "invokeai_metadata" || name === "invokeai_graph" || name === "Dream") { // invoke ai
								if (name === "invokeai_graph") {
									continue;
								}

								// 這個資訊不重要，所以排到最後面
								if (name === "Dream") {
									lastItem(name, val);
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
					}

				}
				else {

					let nameI18n = `exif.name.${name}`;
					let valueI18n = "";

					// 處理 value 的值
					if (name === "Metering Mode") {
						valueI18n = `exif.value.${name}.${value}`;
						value = M.i18n.t(`exif.value.${name}.${value}`);
					}
					else if (name === "Flash") {
						valueI18n = `exif.value.${name}.${value}`;
						value = M.i18n.t(`exif.value.${name}.${value}`);
					}
					else if (name === "Length") {
						value = Lib.getFileLength(Number(value));
					}

					name = M.i18n.t(`exif.name.${name}`);
					domTabContentInfo.appendChild(getItemDom(name, value, nameI18n, valueI18n));
				}
			}

			// 最後才執行的函數
			deferredFunc.forEach(func => {
				func();
			});

			// 初始化 Civitai Resources 區塊
			initCivitaiResources(civitai);

			// 解析 ComfyUI 
			if (comfyuiPrompt !== undefined) {
				let jsonF = Lib.jsonStrFormat(comfyuiPrompt);
				if (jsonF.ok) { // 解析欄位		
					let cdata = AiDrawingPrompt.getComfyui(comfyuiPrompt);
					for (let i = 0; i < cdata.length; i++) {
						const node = cdata[i].node;
						const data = cdata[i].data;

						// 折疊面板
						let collapseDom = await getCollapseDom(node, true);
						data.forEach(item => {
							collapseDom.domContent.appendChild(getItemDom(item.title, item.text));
						});
						domTabContentInfo.appendChild(collapseDom.domBox);
					}
				}
			}

			// 把 ComfyScript 放在最下面，並預設展開
			if (comfyScript !== undefined) {
				// 折疊面板
				let collapseDom = await getCollapseDom("ComfyScript", true);
				collapseDom.domContent.appendChild(getItemDom("ComfyScript", comfyScript));
				domTabContentInfo.appendChild(collapseDom.domBox);
			}
			// 把 ComfyUI 的原始資料放在最下面，並預設折疊
			if (comfyuiPrompt !== undefined || comfyuiWorkflow !== undefined) {
				// 折疊面板
				let collapseDom = await getCollapseDom("ComfyUI Data", false);

				if (comfyuiGenerationData !== undefined) {
					let jsonF = Lib.jsonStrFormat(comfyuiGenerationData);
					if (jsonF.ok) { // 解析欄位
						collapseDom.domContent.appendChild(getItemDom("Generation Data", jsonF.jsonFormat));
					} else {
						collapseDom.domContent.appendChild(getItemDom("Generation Data", comfyuiGenerationData));
					}
				}
				if (comfyuiPrompt !== undefined) {
					if (typeof comfyuiPrompt === "object") { // 從 mp4 提取出來的 Prompt 是 json，所以要轉回 string
						try {
							comfyuiPrompt = JSON.stringify(comfyuiPrompt);
						} catch { }
					}
					collapseDom.domContent.appendChild(getItemDom("Prompt", comfyuiPrompt));
				}
				if (comfyuiWorkflow !== undefined) {
					collapseDom.domContent.appendChild(getItemDom("Workflow", comfyuiWorkflow));
				}
				domTabContentInfo.appendChild(collapseDom.domBox);
			}
			// 不存在 ComfyUI 的資料，但是有 GenerationData，則直接顯示
			else if (comfyuiGenerationData !== undefined) {

				if (comfyuiGenerationData.includes(`"seed":`)) {
					AiDrawingPrompt.getNormalJson(comfyuiGenerationData).forEach(item => {
						domTabContentInfo.appendChild(getItemDom(item.title, item.text));
					})
				} else {
					domTabContentInfo.appendChild(getItemDom("Generation Data", comfyuiGenerationData));
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

			if (fileInfo2.Type === "none") { // 如果檔案不存在
				return;
			}

			let path = fileInfo2.FullPath;
			let json = await WebAPI.getRelatedFileList(path, relatedFileExtList);

			if (noCheckPath === false) {
				if (M.fileLoad.getFilePath() !== path) { // 如果已經在載入期間已經切換到其他檔案
					return;
				}
			}

			for (let i = 0; i < json.length; i++) {
				const item = json[i];
				let itemPath = item.path;
				let itemText = item.text;
				let domBox = await getRelatedDom(itemPath, itemText);
				if (noCheckPath === false) {
					if (M.fileLoad.getFilePath() !== path) { // 如果已經在載入期間已經切換到其他檔案
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
		 * 初始化 Civitai Resources 區塊
		 */
		async function initCivitaiResources(civitai: {
			civitaiResources: string | undefined,
			lorahashes: string | undefined,
			hashes: string | undefined,
			tiHashes: string | undefined,
			modelHash: string | undefined,
		}) {

			// 記錄當前的 path，如果在載入期間已經切換到其他檔案，則離開
			let path = fileInfo2.FullPath;

			// 如果全部都沒有資料，就離開
			if (civitai.civitaiResources === undefined &&
				civitai.lorahashes === undefined &&
				civitai.hashes === undefined &&
				civitai.tiHashes === undefined &&
				civitai.modelHash === undefined
			) {
				return;
			}

			let data: any = civitai.civitaiResources;
			if (typeof data === "string") {
				try {
					data = JSON.parse(data);
				} catch (e) {
					console.warn("Civitai resources 解析失敗");
					console.warn(data);
					return;
				}
			}
			// 如果不是集合
			if (data instanceof Array === false) {
				data = [];
			}

			if (civitai.modelHash !== undefined) {
				data.push({ type: "", hash: civitai.modelHash });
			}

			/** 	
				Lora hashes 範例
				aaa: 69d6c487ff4c, 
				bbb: 7a1336916118
			 */
			function addHash(hashList: string | undefined) {
				if (typeof hashList !== "string") { return; }
				let hashes = hashList.split(",");
				hashes.forEach((item: string) => {
					let x = item.split(": ");
					if (x.length !== 2) { return; }

					// 取最後一個
					let value = x[x.length - 1].trim();
					// 移除非英數字元
					value = value.replace(/[^a-zA-Z0-9]/g, "");

					// 如果已經存在，就不再加入
					let isExist = data.some((item: any) => {
						return item.hash === value;
					})
					if (isExist === false) {
						data.push({ type: "", hash: value });
					}
				})
			}
			addHash(civitai.lorahashes);
			addHash(civitai.hashes);
			addHash(civitai.tiHashes);

			// 判斷是否有重複的項目
			let tempId: any[] = [];

			// 折疊面板
			let collapseDom = await getCollapseDom("Civitai Resources", true, "civitaiResources", (type) => { });

			for (let i = 0; i < data.length; i++) {
				const item = data[i];
				let hash = item.hash;
				let modelVersionId = item.modelVersionId;
				let dbKey = modelVersionId || hash;
				if (dbKey === undefined || dbKey === null) {
					console.warn("Civitai 未預期的格式");
					console.warn(item);
					continue;
				}

				let modelId: any;
				let modelType: any = item.type;
				let modelName: any;
				let name: any;
				let images: any[];
				let error: any;

				// 先嘗試從 indexedDB 取得資料
				let dbData = await M.db?.getData(DbStoreName.civitaiResources, dbKey);

				if (dbData !== undefined) {
					// 如果發生過錯誤，且時間超過 1 天，就重新下載
					if (dbData.error !== undefined) {
						let time = new Date(dbData.time).getTime();
						let timeNow = new Date().getTime();
						//if (isNaN(time) || timeNow - time > 20 * 1000) {
						if (isNaN(time) || timeNow - time > 24 * 60 * 60 * 1000) {
							dbData = undefined;
						}
					}
				}

				if (dbData !== undefined) {

					modelId = dbData.modelId;
					modelType = dbData.modelType;
					modelName = dbData.modelName;
					name = dbData.name;
					images = dbData.images;
					modelVersionId = dbData.modelVersionId;
					error = dbData.error;
					// console.log("indexedDB 取得資料", modelId, modelName, error);

					// 重複的項目
					if (tempId.includes(modelVersionId)) { continue; }
					tempId.push(modelVersionId);
				}

				// 避免在載入期間已經切換到其他檔案
				if (path !== fileInfo2.FullPath) { return; }

				// 曾經下載過，且資料是 error，就不再載入
				if (error === "Model not found") { continue; }

				// 先產生一個空的 dom 項目，待資料載入完畢後，再替換
				let oldDom = getItemDom(dbKey, "Loading" + "\n" + "-");
				collapseDom.domContent.appendChild(oldDom);

				let ompleteCount = 0;
				// 項目完成時呼叫的函數，用與判斷是否全部都已經完成
				let completeFunc = () => {
					ompleteCount++;
					if (ompleteCount === data.length) {
						// 如果移除項目後，折疊面板沒有任何項目，則移除折疊面板
						if (collapseDom.domContent.children.length === 0) {
							collapseDom.domBox.parentNode?.removeChild(collapseDom.domBox);
						}
					}
				}

				setTimeout(async () => {

					// 如果 indexedDB 沒有資料，則從 Civitai 取得資料
					if (error === undefined &&
						(modelId === undefined || modelName === undefined || images === undefined)) {
						let url: string = "";
						let result;
						let timeout = 10 * 1000;

						try {
							if (hash) {

								url = `https://civitai.com/api/v1/model-versions/by-hash/` + hash;
								result = await Lib.sendGet("json", url, timeout);

								// 如果 hash 超過 10 個字，且找不到資源，則只取前 10 個字再試一次
								if (result.error && hash.length > 10) {
									hash = hash.substring(0, 10);
									url = `https://civitai.com/api/v1/model-versions/by-hash/` + hash;
									result = await Lib.sendGet("json", url, timeout);
									// console.log("Civitai 重新請求資料", url);
								}
							} else {
								url = `https://civitai.com/api/v1/model-versions/` + modelVersionId;
								result = await Lib.sendGet("json", url, timeout);
							}
						} catch (e) {

							console.error("Civitai 請求失敗", e);
							let exifValue = oldDom.querySelector(".mainExifValue") as HTMLElement
							exifValue.innerHTML = "Error";
							result = {
								error: "Request error"
							}
						}

						// console.log("Civitai 請求資料", url);

						modelId = result.modelId;
						modelName = result.model?.name;
						modelType = result.model?.type;
						name = result.name;
						images = result.images;
						modelVersionId = result.id;
						error = result.error;

						if (result.error) {
							console.log("Civitai 返回 error", url, result);
							let exifValue = oldDom.querySelector(".mainExifValue") as HTMLElement
							exifValue.innerHTML = "Error";

							// 如果找不到資源，則一樣存到 indexedDB
							M.db?.saveData(DbStoreName.civitaiResources, {
								id: dbKey,
								time: new Date().format("yyyy-MM-dd hh:mm:ss"),
								error: result.error
							});
						} else {
							if (modelId === undefined || modelName === undefined) {
								console.log("Civitai 返回資料解析失敗", url, result);
							}

							// 存到 indexedDB
							let images2 = result.images.map((item: any) => {
								return {
									url: item.url,
									nsfwLevel: item.nsfwLevel,
									type: item.type
								};
							});
							await M.db?.saveData(DbStoreName.civitaiResources, {
								id: dbKey,
								time: new Date().format("yyyy-MM-dd hh:mm:ss"),
								modelId: modelId,
								modelVersionId: modelVersionId,
								modelName: modelName,
								modelType: modelType,
								name: name,
								images: images2
							});
							console.log("Civitai 成功", url);

						}

						// 重複的項目
						if (modelVersionId !== undefined && tempId.includes(modelVersionId)) {
							oldDom.parentNode?.removeChild(oldDom);
							completeFunc();
							return;
						}
						tempId.push(modelVersionId);
					}

					if (error) {
						oldDom.parentNode?.removeChild(oldDom);
						completeFunc();
						return;
					}

					if (modelId === undefined || modelName === undefined) {
						completeFunc();
						return;
					}

					// 檢查 oldDom 是否還存在
					if (oldDom.parentNode !== null) {

						if (baseWindow.appInfo === undefined) { return; }

						// 產生新的 dom
						let newItem = Lib.newDom(`
							<div class="mainExifItem">
								<div class="mainExifName">${Lib.escape(modelType)}</div>
								<div class="mainExifValue mainExifValue__nowrap">
									${Lib.escape(modelName)}<br>
									${Lib.escape(name)}
									<div class="mainExifImgList">
									</div>
								</div>
								<div class="mainExifBtns">
									<div class="btn mainExifBtnExpand" title="${M.i18n.t("menu.expand")}">${SvgList["expand.svg"]}</div>
									<div class="btn mainExifBtnCollapse" title="${M.i18n.t("menu.collapse")}">${SvgList["collapse.svg"]}</div>
									<div class="btn mainExifBtnCivitai" title="Civitai">${SvgList["tool-civitai.svg"]}</div>
								</div>
							</div>`);
						domTabContentInfo.appendChild(newItem);

						let btnExpand = newItem.querySelector(".mainExifBtnExpand") as HTMLElement; // 折疊
						let btnCollapse = newItem.querySelector(".mainExifBtnCollapse") as HTMLElement; // 折疊			
						let btnCivitai = newItem.querySelector(".mainExifBtnCivitai") as HTMLElement;
						let divImgList = newItem.querySelector(".mainExifImgList") as HTMLElement;

						// 產生預覽圖
						let imgCount = M.config.settings.layout.civitaiResourcesImgNumber;
						let nsfwLevel = M.config.settings.layout.civitaiResourcesNsfwLevel;

						// 判斷是否有圖片
						let isHaveImg = false;
						// 載入圖片
						let funcLoadImg: (() => void)[] = [];

						for (let i = 0; i < images.length; i++) {
							const item = images[i];
							if (item.type === "image" && item.nsfwLevel <= nsfwLevel) {

								isHaveImg = true;

								// 開啟網址時下載圖片，並回傳其 icon
								let name = `Civitai\\${dbKey}-${i + 1}.jpg`;
								let imgPath = Lib.Combine([baseWindow.appInfo.tempDirWebFile, name]);
								let imgUrl = WebAPI.Img.webIcon(item.url, name);

								let imgItem = Lib.newDom(`
									<div class="mainExifImgItem">
										<img>
									</div>
								`);
								divImgList.appendChild(imgItem);
								imgItem.setAttribute("data-path", imgPath);

								const domImg = imgItem.querySelector("img") as HTMLImageElement;

								// 展開時，載入圖片，已經載入過的就不再載入
								let isLoad = false;
								funcLoadImg.push(() => {
									if (isLoad) { return; }
									isLoad = true;
									limiter.addRequest(domImg, imgUrl); // 發出請求
								})

								// 圖片載入失敗時，顯示錯誤圖示
								domImg.onerror = () => {
									domImg.src = "./img/error.svg";
									domImg.style.objectFit = "contain";
								}

								// 雙擊左鍵
								Lib.addEventDblclick(imgItem, async (e: MouseEvent) => { // 圖片物件
									let imgPath = imgItem.getAttribute("data-path");
									if (imgPath === null) { return; }
									M.script.open.openNewWindow(imgPath);
								});

								imgCount--;
								if (imgCount <= 0) { break; }
							}
						}

						btnCivitai.addEventListener("click", async () => {
							let url = "https://civitai.com/models/" + modelId + "?modelVersionId=" + modelVersionId;
							WV_RunApp.OpenUrl(url);
						});

						// 套用狀態。 true=展開 、 false=折疊、 null=不顯示
						function setCollapse(t: boolean | null) {
							if (t) { // 狀態是展開，顯示折疊按鈕	
								btnExpand.style.display = "none";
								btnCollapse.style.display = "";
								divImgList.setAttribute("active", "true");

								// 展開時，載入圖片
								funcLoadImg.forEach(func => {
									func();
								})

							} else if (t === false) {
								btnExpand.style.display = "";
								btnCollapse.style.display = "none";
								divImgList.setAttribute("active", "");
							} else {
								// 什麼都不顯示
								btnExpand.style.display = "none";
								btnCollapse.style.display = "none";
								divImgList.removeAttribute("active");
							}
						}
						btnExpand.addEventListener("click", async () => { // 展開
							setCollapse(true);
							// 儲存折疊狀態
							M.db?.saveData(DbStoreName.infoPanelCollapse, { id: "civitaiImg-" + dbKey, collapse: true });
						});
						btnCollapse.addEventListener("click", async () => { // 折疊
							setCollapse(false);
							// 儲存折疊狀態
							M.db?.saveData(DbStoreName.infoPanelCollapse, { id: "civitaiImg-" + dbKey, collapse: false });
						});

						// 從 db 讀取折疊狀態
						let dbCollapse = await M.db?.getData(DbStoreName.infoPanelCollapse, "civitaiImg-" + dbKey);
						if (dbCollapse !== undefined) {
							setCollapse(dbCollapse.collapse);
						} else {
							setCollapse(M.config.settings.layout.civitaiResourcesDefault);
						}
						// 如果沒有圖片，就不顯示展開按鈕
						if (isHaveImg === false) {
							setCollapse(null);
						}

						// 把新的 dom 插到原有的 dom 後面，然後刪除原有的 dom
						oldDom.insertAdjacentElement("afterend", newItem);
						oldDom.parentNode?.removeChild(oldDom);

						completeFunc();
					}

				}, 1);
			}

			if (collapseDom.domContent.children.length > 0) {
				domTabContentInfo.appendChild(collapseDom.domBox);
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
				// let pathF = Lib.GetExtension(path).split(".")[0];
				let txtName = Lib.GetFileName(path).split(".")[0] + ".txt";
				let txtPath = Lib.Combine([dirPath, txtName]);
				if (await WV_File.Exists(txtPath) === true) { // 如果檔案已經存在
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
		 * 格式化影片長度。毫秒 → 00:00
		 */
		function formatVideoLength(input: any): string {
			if (input === undefined || input === null || input === "") { return ""; }

			let milliseconds = Number(input);
			if (isNaN(milliseconds)) { return input; }

			//let totalSeconds = Math.floor(milliseconds / 1000);
			let totalSeconds = Math.floor(milliseconds);
			let hours = Math.floor(totalSeconds / 3600);
			let minutes = Math.floor((totalSeconds % 3600) / 60);
			let seconds = totalSeconds % 60;

			// 如果小時數小於1，則只返回分鐘和秒數
			if (hours < 1) {
				return (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
			} else {
				// 否則，返回格式化的小時、分鐘和秒數
				return (hours < 10 ? "0" : "") + hours + ":" + (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
			}
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
				return Lib.escape(text);
			}

			// 外框物件
			let domBox = Lib.newDom(`
				<div class="mainExifRelatedBox" data-menu="file">	
				</div>
			`);
			domBox.setAttribute("data-path", itemPath);
			// domTabContentRelated.appendChild(domBox);

			// 標題物件
			let title = itemName.substring(name.split(".")[0].length);
			let domTitle = Lib.newDom(`
				<div class="mainExifRelatedTitle collapse-title">
					<span>${Lib.escape(title)}</span>
					<div class="mainExifRelatedTitleBtnList"></div>
				</div>
			`);
			domBox.appendChild(domTitle);

			let btnList = domTitle.querySelector(".mainExifRelatedTitleBtnList") as HTMLElement;

			// 內容物件
			let domContent: HTMLElement;
			if (itemText !== null) {

				let text = itemText;

				if (title.toLowerCase().endsWith(".txt")
					&& (
						text.includes("Negative prompt: ")  // 負面提示
						|| text.includes("Steps: ") // 其他參數
					)
				) { // 如果是 SDwebUI 的 info

					domContent = Lib.newDom(`
						<div class="mainExifRelatedContent collapse-content">
							<div class="mainExifList">
							</div>
						</div>
					`);
					let domContentList = domContent.querySelector(".mainExifList") as HTMLElement;
					AiDrawingPrompt.getSdwebui(text).forEach(item => {
						domContentList.appendChild(getItemDom(item.title, item.text));
					});
				} else { // 一般的文字檔

					domContent = Lib.newDom(`
						<div class="mainExifRelatedContent collapse-content">
							<div class="mainExifRelatedText">
								<span>${getText(itemText)}</span>
							</div>
						</div>
					`);

				}

				// 按鈕 - civitai
				if (title.toLowerCase().endsWith(".civitai.info")) {
					try {
						let civitaiInfo = JSON.parse(text);
						let modelId = civitaiInfo.modelId;
						if (modelId !== undefined) {
							let btnCivitai = Lib.newDom(`<div class="mainExifRelatedTitleBtn" title="Civitai">${SvgList["tool-civitai.svg"]}</div>`)
							btnList.appendChild(btnCivitai);
							btnCivitai.addEventListener("click", async () => {
								let url = "https://civitai.com/models/" + modelId;
								WV_RunApp.OpenUrl(url);
							})
						}
					} catch (e) { }
				}

				// 按鈕 - 編輯
				let btnEdit = Lib.newDom(`<div class="mainExifRelatedTitleBtn" title="${M.i18n.t("menu.edit")}">${SvgList["tool-edit.svg"]}</div>`)
				btnList.appendChild(btnEdit);
				btnEdit.addEventListener("click", async () => {
					M.textEditor.show(domBox.getAttribute("data-path"));
					M.textEditor.setOnSave(async (t: string) => { // 儲存時更新面板裡面的文字
						let newItemDom = await getRelatedDom(itemPath, t);
						domBox.insertAdjacentElement("afterend", newItemDom);
						domBox.remove();
					});
				})

				// 按鈕 - 複製
				let btnCoyp = Lib.newDom(`<div class="mainExifRelatedTitleBtn" title="${M.i18n.t("menu.copy")}">${SvgList["tool-copy.svg"]}</div>`)
				btnList.appendChild(btnCoyp);
				btnCoyp.addEventListener("click", async () => {
					await WV_System.SetClipboard_Text(itemText ?? "");
					Toast.show(M.i18n.t("msg.copyExif", { v: title }), 1000 * 3); // 已將「.txt」複製至剪貼簿
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

				// 快速拖曳
				Lib.addDragThresholdListener(domContent, 5, () => {
					let path = domBox.getAttribute("data-path");
					if (path !== null) {
						M.script.file.dragDropFile(path);
					}
				});

				// 雙擊左鍵
				Lib.addEventDblclick(domContent, async (e: MouseEvent) => { // 圖片物件
					let path = domBox.getAttribute("data-path");
					if (path !== null) {
						M.fileLoad.loadFile(path);
					}
				});

			}
			domBox.appendChild(domContent);

			// 初始化 折疊面板
			let open = M.config.settings.layout.mainExifCollapse[title]; // 從設定讀取折疊狀態
			if (open === undefined) { open = true; } // 不存在就預設為開
			Lib.collapse(domBox, "init-" + open); // 不使用動畫直接初始化狀態
			domTitle.addEventListener("click", (e) => {

				// 如果是右上角的按鈕，則不處理
				let target = e.target as HTMLElement;
				if (target !== null && target.classList.contains("mainExifRelatedTitleBtn")) {
					return;
				}

				Lib.collapse(domBox, "toggle", (type) => { //切換折疊狀態

					M.config.settings.layout.mainExifCollapse[title] = type; //更改狀態後，儲存折疊狀態
				});
			})

			return domBox;
		}

		/**
		 * 折疊面板的 dom
		 * @param title 標題
		 * @param type 初始狀態
		 * @param key 儲存設定值的key
		 */
		async function getCollapseDom(title: string, type: boolean, key?: string, funcChange?: (type: boolean) => void) {

			// 外框物件
			let domBox = Lib.newDom(`
				<div class="mainExifRelatedBox">	
				</div>
			`);

			// 標題物件
			let domTitle = Lib.newDom(`
				<div class="mainExifRelatedTitle collapse-title">
					<span>${Lib.escape(title)}</span>
					<div class="mainExifRelatedTitleBtnList"></div>
				</div>
			`);
			domBox.appendChild(domTitle);

			// 內容物件
			let domContent: HTMLElement = Lib.newDom(`
				<div class="mainExifRelatedContent collapse-content">
					<div class="mainExifList">
					</div>
				</div>
			`);
			let domContentList = domContent.querySelector(".mainExifList") as HTMLElement;
			domBox.appendChild(domContent);

			// 從設定讀取折疊狀態
			let open;
			// 從 db 讀取折疊狀態
			if (key !== undefined) {
				let dbCollapse = await M.db?.getData(DbStoreName.infoPanelCollapse, key);
				if (dbCollapse !== undefined) { open = dbCollapse.collapse; }
			}
			if (open === undefined) {
				open = type;
			}

			// 初始化 折疊面板
			Lib.collapse(domBox, "init-" + open); // 不使用動畫直接初始化狀態
			domTitle.addEventListener("click", (e) => {
				// 如果是右上角的按鈕，則不處理
				let target = e.target as HTMLElement;
				if (target !== null && target.classList.contains("mainExifRelatedTitleBtn")) {
					return;
				}
				Lib.collapse(domBox, "toggle", async (type) => {
					if (key !== undefined) {
						funcChange?.(type);
						// 更改狀態後，儲存折疊狀態
						await M.db?.saveData(DbStoreName.infoPanelCollapse, { id: key, collapse: type });
					}
				}); // 切換折疊狀態
			});

			return {
				domBox: domBox,
				domTitle: domTitle,
				domContent: domContentList,
			};
		}

		/** 
		 * exif 項目的 dom
		 */
		function getItemDom(name: string, value: string | HTMLElement, nameI18n = "", valueI18n = "") {

			if (name === undefined || name === null) { name = ""; }
			if (value === undefined || value === null) { value = ""; }

			name = name.toString();
			name = Lib.escape(name); // 移除可能破壞html的跳脫符號

			// 如果是 value 是 dom
			if (typeof value !== "string") {
				let div = Lib.newDom(`
					<div class="mainExifItem">
						<div class="mainExifName" i18n="${nameI18n}">${name}</div>
						<div class="mainExifValue"></div>
					</div>`
				);
				let divValue = div.querySelector(".mainExifValue") as HTMLElement;
				divValue.appendChild(value);
				return div;
			}

			value = value.toString();
			let oVal = value; // 原始資料
			value = Lib.escape(value);

			let html = `
				<div class="mainExifItem">
					<div class="mainExifName" i18n="${nameI18n}">${name}</div>
					<div class="mainExifValue" i18n="${valueI18n}">${value}</div>
					<div class="mainExifBtns">
						<div class="btn mainExifBtnExpand" title="${M.i18n.t("menu.expand")}">${SvgList["expand.svg"]}</div>
						<div class="btn mainExifBtnCollapse" title="${M.i18n.t("menu.collapse")}">${SvgList["collapse.svg"]}</div>
						<div class="btn mainExifBtnCopy" title="${M.i18n.t("menu.copy")}">${SvgList["tool-copy.svg"]}</div>
					</div>
				</div>`;

			let div = Lib.newDom(html);
			let divValue = div.querySelector(".mainExifValue") as HTMLElement;
			let btnCopy = div.querySelector(".mainExifBtnCopy") as HTMLElement; // 複製
			let btnExpand = div.querySelector(".mainExifBtnExpand") as HTMLElement; // 折疊
			let btnCollapse = div.querySelector(".mainExifBtnCollapse") as HTMLElement; // 折疊

			btnCopy.addEventListener("click", async () => { // 複製到剪貼簿
				await WV_System.SetClipboard_Text(oVal);
				Toast.show(M.i18n.t("msg.copyExif", { v: name }), 1000 * 3); // 已將「exifName」複製至剪貼簿
			});

			let type: "collapse" | "expand" = "collapse"; // 狀態 折疊|展開

			// 套用狀態
			function setType(t: "collapse" | "expand") {
				if (t === "collapse") { // 狀態是折疊，顯示展開按鈕
					type = "collapse";
					let lineClamp = divValue.scrollHeight > divValue.clientHeight; // 超出範圍，結尾顯示出「...」
					if (lineClamp) {
						btnExpand.style.display = "";
						btnCollapse.style.display = "none";
					} else {
						btnExpand.style.display = "none";
						btnCollapse.style.display = "none";
					}
				} else { // 狀態是展開，顯示折疊按鈕
					type = "expand";
					btnExpand.style.display = "none";
					btnCollapse.style.display = "";
				}
			}

			btnExpand.addEventListener("click", async () => { // 折疊
				divValue.style.webkitLineClamp = "9999"; // 最大顯示行數
				setType("expand");
			});

			btnCollapse.addEventListener("click", async () => { // 折疊
				divValue.style.webkitLineClamp = ""; // 沒有設定就會使用設定值
				setType("collapse");
			});

			div.addEventListener("mouseenter", async () => { // 滑鼠進入時
				setType(type);
			});

			return div;
		}

		/** 
		 * 從 exif 裡面取得全部的 value
		 */
		function getItems(ar: { group: string, name: string, value: string }[], key: string) {
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
		 * 從 exif 裡面取得第一筆的 value
		 */
		function getItem(ar: { group: string, name: string, value: string }[], key: string) {
			for (let i = 0; i < ar.length; i++) {
				let item = ar[i];
				if (item.name == key) {
					return {
						"group": item.group,
						"value": item.value
					};
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

			// 取得標題，null 表示不是相關檔案，例如 .min.js
			function getTitle() {
				let name = Lib.GetFileName(fileInfo2.FullPath); // 目前檔案的檔名
				let itemName = Lib.GetFileName(fileWatcherData.FullPath);
				let nameF = name.split(".")[0]; // 取得檔名第一個.之前的部分
				let itemNameF = itemName.split(".")[0];

				if (nameF.toLowerCase() === itemNameF.toLowerCase()) { // 檔名與原先檔名一樣
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

				// 如果沒有其他檔案，就顯示 新增按鈕
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
						let title = getTitle(); // 取得新標題
						if (title !== null) {
							relatedTitle.innerText = Lib.escape(title);
						} else { // 取得標題失敗表示不是相關檔案，則移除舊項目
							relatedBox.remove();

							// 如果沒有其他檔案，就顯示 新增按鈕
							if (domTabContentRelated.querySelectorAll(".mainExifRelatedBox").length === 0) {
								let btnNew = await getRelatedBtnAdd()
								domTabContentRelated.appendChild(btnNew);
							}
						}
					}

				} else {
					changeType = "created"; // 如果更改檔名後是不存在於列表的項目，就視為新增
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

					// 新增檔案後就隱藏 新增按鈕
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

		// 讓 Textarea 支援 tab
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
				Toast.show(M.i18n.t("msg.formattingFailed"), 1000 * 3); // 儲存完成
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

			// 設定焦點
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
				Toast.show(M.i18n.t("msg.saveComplete"), 1000 * 3); // 儲存完成
			} catch (e) {
				Toast.show(M.i18n.t("msg.saveFailed") + ":\n" + e, 1000 * 3); // 儲存失敗
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
