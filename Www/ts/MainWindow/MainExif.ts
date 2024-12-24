import { MainWindow } from "./MainWindow";
import { Dragbar } from "./Dragbar";
import { DbStoreName } from "./IndexedDBManager";
import { WebAPI } from "../WebAPI";
import { GroupType } from "../Config";
import { Toast } from "../Toast";
import { TiefseeScroll } from "../TiefseeScroll";
import { Lib } from "../Lib";
import { RequestLimiter } from "../RequestLimiter";
import { AiParsingUtility } from "./AiParsingUtility/AiParsingUtility";

export class MainExif {

	public init;
	public setEnabled;
	public setRelatedFilesEnabled;
	public setHide;
	public setItemWidth;
	public setHorizontal;
	public updateFileWatcher;
	public dragbar;

	constructor(M: MainWindow) {

		this.init = init;
		this.setEnabled = setEnabled;
		this.setRelatedFilesEnabled = setRelatedFilesEnabled;
		this.setHide = setHide;
		this.setItemWidth = setItemWidth;
		this.setHorizontal = setHorizontal;
		this.updateFileWatcher = updateFileWatcher;

		const _domMainExif = document.getElementById("mainExif") as HTMLElement;
		const _domDragbarMainFileList = document.getElementById("dragbar-mainExif") as HTMLElement; // 拖曳條

		const _domTabBtns = _domMainExif.querySelector(".js-tabBtns") as HTMLElement;
		const _domTabBtnInfo = _domMainExif.querySelector(".js-tabBtn-info") as HTMLElement;
		const _domTabBtnRelated = _domMainExif.querySelector(".js-tabBtn-related") as HTMLElement;
		const _domTabContentInfo = _domMainExif.querySelector(".js-tabContent-info") as HTMLElement;
		const _domTabContentRelated = _domMainExif.querySelector(".js-tabContent-related") as HTMLElement;

		const _relatedFileExtList = ["txt", "json", "xml", "info", "ini", "config"];
		var _fileInfo2: FileInfo2;

		var _isHide = false; // 暫時隱藏
		var _isEnabled = true; // 啟用 檔案預覽視窗

		/** 請求限制器 */
		const _limiter = new RequestLimiter(1);

		/** 頁籤的類型 */
		const TabType = {
			/** 資訊 */
			info: "info",
			/** 相關檔案 */
			related: "related"
		}
		/** 當前頁籤的類型 */
		var _tabType = TabType.info;

		// 在工具列滾動時，進行水平移動
		_domTabBtns.addEventListener("wheel", (e: WheelEvent) => {

			let scrollLeft = _domTabBtns.scrollLeft;
			let deltaY = e.deltaY; // 上下滾動的量

			if (deltaY > 0) { // 往右
				_domTabBtns.scroll(scrollLeft + 20, 0);
			}
			if (deltaY < 0) { // 往左
				_domTabBtns.scroll(scrollLeft - 20, 0);
			}
		}, false);

		new TiefseeScroll().initGeneral(_domTabBtns, "x"); // 滾動條元件

		_domTabBtnInfo.addEventListener("click", () => {
			setTab(TabType.info);
			if (_fileInfo2 !== undefined) {
				loadInfo();
				loadRelated();
			}
		})
		_domTabBtnRelated.addEventListener("click", () => {
			setTab(TabType.related);
			if (_fileInfo2 !== undefined) {
				loadInfo();
				loadRelated();
			}
		})
		function setTab(type: string) {

			if (type === TabType.related) {
				_tabType = TabType.related;
				_domTabBtnInfo.setAttribute("active", "");
				_domTabBtnRelated.setAttribute("active", "true");
				_domTabContentInfo.style.display = "none";
				_domTabContentRelated.style.display = "";
			} else {
				_tabType = TabType.info;
				_domTabBtnInfo.setAttribute("active", "true");
				_domTabBtnRelated.setAttribute("active", "");
				_domTabContentInfo.style.display = "";
				_domTabContentRelated.style.display = "none";
			}

			M.config.settings.layout.mainExifTabs = _tabType;
		}

		// 拖曳改變 size
		const _dragbar = this.dragbar = new Dragbar();
		_dragbar.init("left", _domMainExif, _domDragbarMainFileList, M.domMainR);
		// 拖曳開始
		_dragbar.setEventStart(() => { })
		// 拖曳
		_dragbar.setEventMove((val: number) => {
			if (val < 10) { // 小於10的話就暫時隱藏
				_domMainExif.style.opacity = "0";
				_dragbar.setDragbarPosition(0);
			} else {
				_domMainExif.style.opacity = "1";
				setItemWidth(val);
			}
		})
		// 拖曳 結束
		_dragbar.setEventEnd((val: number) => {
			if (val < 10) { // 小於10的話，關閉檔案預覽視窗
				setEnabled(false);
			}
		})

		/**
		 * 暫時隱藏(不影響設定值，強制隱藏
		 */
		function setHide(val: boolean) {
			_isHide = val;
			if (val) {
				_domMainExif.setAttribute("hide", "true");
				_dragbar.setEnabled(false);
			} else {
				_domMainExif.setAttribute("hide", "");
				_dragbar.setEnabled(M.config.settings.layout.mainExifEnabled);
			}
		}

		/**
		 * 啟用 或 關閉
		 */
		function setEnabled(val: boolean) {

			if (val) {
				_domMainExif.setAttribute("active", "true");

				// 讀取上次的設定
				_tabType = M.config.settings.layout.mainExifTabs;
				setTab(_tabType);

			} else {
				_domMainExif.setAttribute("active", "");
			}

			M.config.settings.layout.mainExifEnabled = val;
			_dragbar.setEnabled(val);
			_domMainExif.style.opacity = "1";

			if (_isEnabled === val) { return; }
			_isEnabled = val;

			loadInfo();
			loadRelated();
		}

		/**
		 * 設定是否顯示 相關檔案
		 */
		function setRelatedFilesEnabled(val: boolean) {
			if (val) {
				_domTabBtns.setAttribute("active", "true");
			} else {
				_domTabBtns.setAttribute("active", "false");
				if (_tabType === TabType.related) {
					setTab(TabType.info);
					loadInfo();
				}
			}
		}

		/**
		 * 設定 size
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
			_domMainExif.style.width = val + "px";
			_dragbar.setDragbarPosition(val);
		}

		/**
		 * 初始化
		 * @param _fileInfo2 
		 * @param noCheckPath true=不在載入完成後檢查是否已經切換到其他檔案
		 */
		function init(fileInfo2: FileInfo2, noCheckPath = false) {
			_fileInfo2 = fileInfo2;
			loadInfo(noCheckPath);
			loadRelated(noCheckPath);
		}

		/**
		 * 讀取 資訊(於初始化後呼叫)
		 */
		async function loadInfo(noCheckPath = false) {

			if (_isEnabled === false) { return; }
			if (_tabType !== TabType.info) { return; }

			_domTabContentInfo.innerHTML = "";

			if (_fileInfo2.Type === "none") { // 如果檔案不存在
				return;
			}

			const path = _fileInfo2.FullPath;
			const maxLength = M.config.settings.advanced.exifReadMaxLength;
			const json = await WebAPI.getExif(_fileInfo2, maxLength);

			if (json.code != "1") {
				return;
			}
			if (noCheckPath === false) {
				if (M.fileLoad.getFilePath() !== path) { // 如果已經在載入期間已經切換到其他檔案
					return;
				}
			}
			const groupType = M.fileShow.getGroupType();

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
						let domVideoNew = getItemDom({ name: name, value: value });
						_domTabContentInfo.appendChild(domVideoNew);

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
				const itemDom = getItemDom({ name: name, value: val });
				deferredFunc.push(() => {
					_domTabContentInfo.appendChild(itemDom);
				})
			}

			let ar = json.data;
			let whitelist = M.config.exif.whitelist;
			for (let i = 0; i < whitelist.length; i++) {

				let name = whitelist[i];

				// 如果是影片
				if (groupType === GroupType.video && name === "Video Duration") {
					// 先產生一個沒有資料的項目
					let domVideo = getItemDom({ name: M.i18n.t(`exif.name.${name}`), value: " " });
					_domTabContentInfo.appendChild(domVideo);
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

					const mapHtml = `
						<div class="mainExifItem">
							<div class="mainExifMap">
								<iframe class="mainExifMapIframe" credentialless src="https://maps.google.com.tw/maps?q=${value}&z=16&output=embed"></iframe>
							</div>
						</div>`;
					_domTabContentInfo.appendChild(Lib.newDom(mapHtml));

				}
				else if (name === "Frame Count") { // 總幀數
					const nameI18n = `exif.name.${name}`;
					name = M.i18n.t(`exif.name.${name}`);

					const domValue = Lib.newDom(`<span>${value}<div class="btnExport" title="${M.i18n.t("menu.export")}"> ${SvgList["tool-export.svg"]} </div><span>`);
					const domBtn = domValue.querySelector(".btnExport") as HTMLElement;
					domBtn.addEventListener("click", () => {
						M.script.open.showFrames(path);
					})
					const itemDom = getItemDom({ name: name, value: domValue, nameI18n: nameI18n });

					_domTabContentInfo.appendChild(itemDom);

				}
				else if (name === "Make" && value.startsWith("Prompt:{")) { // ComfyUI 的 webp

					comfyuiPrompt = value.substring(7);

				}
				else if (name === "Image Description" && value.startsWith("Workflow:{")) { // ComfyUI 的 webp

					comfyuiWorkflow = value.substring(9);

				}
				else if (name === "Comment" || name === "User Comment" || name === "Windows XP Comment" || name === "Image Description") {

					// Stable Diffusion webui 輸出的 jpg 或 webp
					if (value.includes("Steps: ") &&
						(value.includes("Size: ") || value.includes("Samplers: ") || value.includes("Model: "))
					) {
						ar.push({
							group: "PNG-tEXt",
							name: "Textual Data",
							value: "parameters: " + value
						});
					}
					else {

						const jsonF = Lib.jsonStrFormat(value);
						if (jsonF.ok) {
							// 某些情況下 ComfyUI 的資料會被放在 User Comment 裡面
							if (value.startsWith(`{"prompt":`) && value.includes(`class_type`)) { // ComfyUI
								comfyuiPrompt = JSON.parse(value)["prompt"];
								// console.log("ComfyUI User Comment----");
							}
							// 可能來自於某種 ComfyUI 的 civitai 插件，裡面通常包含 extraMetadata 欄位
							else if (value.includes(`"class_type":"`) && value.includes(`"inputs":{"`)) {
								comfyuiPrompt = jsonF.json;
								try {
									const json = JSON.parse(jsonF.json.extraMetadata);
									if (json.resources !== undefined) {
										civitai.civitaiResources = json.resources;
									}
								} catch (e) {
									console.warn("extraMetadata 內缺少 resources 欄位", jsonF.json);
								}
							}
							else {
								_domTabContentInfo.appendChild(getItemDom({ name: name, value: value }));
							}
						} else {
							_domTabContentInfo.appendChild(getItemDom({ name: name, value: value }));
						}
					}

				}
				else if (name === "Textual Data") { // PNG iTXt / zTXt / tEXt

					let vals = getItems(ar, name);
					for (let i = 0; i < vals.length; i++) {
						let val = vals[i];
						let x = val.indexOf(": "); // 資料格式通常為 aaaaa: xxxxxx
						if (x === -1) {
							_domTabContentInfo.appendChild(getItemDom({ name: name, value: val }));

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
									AiParsingUtility.getNovelai(val).forEach(item => {
										_domTabContentInfo.appendChild(getItemDom({ name: item.title, value: item.text }));
									})
								} else {
									_domTabContentInfo.appendChild(getItemDom({ name: name, value: val }));
								}
							}
							else if (name === "Generation time") { // ComfyUI
								// 這個資訊不重要，所以排到最後面
								lastItem(name, val);
								continue;
							}

							else if (name === "metadata") { // 不明，資料為一般的 json
								if (val.includes(`"seed": `)) {
									AiParsingUtility.getNormalJson(val).forEach(item => {
										_domTabContentInfo.appendChild(getItemDom({ name: item.title, value: item.text }));
									})
								} else {
									_domTabContentInfo.appendChild(getItemDom({ name: name, value: val }));
								}
							}

							else if (name === "parameters") { // Stable Diffusion webui 才有的欄位
								if (val.includes(`"sui_image_params":`)) { // StableSwarmUI
									let json = JSON.parse(val)["sui_image_params"];
									AiParsingUtility.getNormalJson(json).forEach(item => {
										_domTabContentInfo.appendChild(getItemDom({ name: item.title, value: item.text }));
									})
								}
								else if (val.includes("Steps: ")) { // A1111
									AiParsingUtility.getA1111(val).forEach(item => {

										//if (["Prompt", "Negative prompt", "TIPO prompt", "DTG prompt", "ADetailer prompt"].indexOf(item.title) !== -1) {
										if (item.title.search(/prompt/ig) !== -1) {
											parseLoraSyntax(item.title, item.text, true);
										}
										else if (item.title.toLowerCase() === "model") {
											parseLoraSyntax(item.title, item.text, false);
										}
										else {

											if (item.title == "Civitai resources") {
												civitai.civitaiResources = item.text;
											}
											else if (item.title === "Lora hashes") {
												civitai.lorahashes = item.text;
											}
											else if (item.title === "Model hash") {
												civitai.modelHash = item.text;
											}
											else if (item.title === "Hashes") {
												civitai.hashes = item.text;
											}
											else if (item.title === "TI hashes") {
												civitai.tiHashes = item.text;
											}
											_domTabContentInfo.appendChild(getItemDom({ name: item.title, value: item.text }));
										}
									})
								} else {
									_domTabContentInfo.appendChild(getItemDom({ name: name, value: val }));
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

								let items = AiParsingUtility.getInvokeai(val);
								if (items.length > 0) {
									items.forEach(item => {
										_domTabContentInfo.appendChild(getItemDom({ name: item.title, value: item.text }));
									})
								} else {
									_domTabContentInfo.appendChild(getItemDom({ name: name, value: val }));
								}
							}

							else {
								_domTabContentInfo.appendChild(getItemDom({ name: name, value: val }));
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
					_domTabContentInfo.appendChild(getItemDom({ name: name, value: value, nameI18n: nameI18n, valueI18n: valueI18n }));
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
					let cdata = AiParsingUtility.getComfyui(comfyuiPrompt);
					for (let i = 0; i < cdata.length; i++) {
						const node = cdata[i].nodeTitle;
						const data = cdata[i].data;

						// 折疊面板
						let collapseDom = await getCollapseDom(node, true);
						data.forEach(item => {
							collapseDom.domContent.appendChild(getItemDom({ name: item.title, value: item.text }));
						});
						_domTabContentInfo.appendChild(collapseDom.domBox);
					}
				}
			}

			// 把 ComfyScript 放在最下面，並預設展開
			if (comfyScript !== undefined) {
				// 折疊面板
				let collapseDom = await getCollapseDom("ComfyScript", true);
				collapseDom.domContent.appendChild(getItemDom({ name: "ComfyScript", value: comfyScript }));
				_domTabContentInfo.appendChild(collapseDom.domBox);
			}
			// 把 ComfyUI 的原始資料放在最下面，並預設折疊
			if (comfyuiPrompt !== undefined || comfyuiWorkflow !== undefined) {
				// 折疊面板
				let collapseDom = await getCollapseDom("ComfyUI Data", false);

				if (comfyuiGenerationData !== undefined) {
					let jsonF = Lib.jsonStrFormat(comfyuiGenerationData);
					if (jsonF.ok) { // 解析欄位
						collapseDom.domContent.appendChild(getItemDom({ name: "Generation Data", value: jsonF.jsonFormat }));
					} else {
						collapseDom.domContent.appendChild(getItemDom({ name: "Generation Data", value: comfyuiGenerationData }));
					}
				}
				if (comfyuiPrompt !== undefined) {
					if (typeof comfyuiPrompt === "object") { // 從 mp4 提取出來的 Prompt 是 json，所以要轉回 string
						try {
							comfyuiPrompt = JSON.stringify(comfyuiPrompt);
						} catch { }
					}
					collapseDom.domContent.appendChild(getItemDom({ name: "Prompt", value: comfyuiPrompt }));
				}
				if (comfyuiWorkflow !== undefined) {
					collapseDom.domContent.appendChild(getItemDom({ name: "Workflow", value: comfyuiWorkflow }));
				}
				_domTabContentInfo.appendChild(collapseDom.domBox);
			}
			// 不存在 ComfyUI 的資料，但是有 GenerationData，則直接顯示
			else if (comfyuiGenerationData !== undefined) {

				if (comfyuiGenerationData.includes(`"seed":`)) {
					AiParsingUtility.getNormalJson(comfyuiGenerationData).forEach(item => {
						_domTabContentInfo.appendChild(getItemDom({ name: item.title, value: item.text }));
					})
				} else {
					_domTabContentInfo.appendChild(getItemDom({ name: "Generation Data", value: comfyuiGenerationData }));
				}
			}

		}

		/**
		 * 剖析 LoRA 語法，加入開啟預覽卡片的功能
		 * @param title 
		 * @param input 
		 * @param isPrompt true=解析 Lora 語法，false=把全部的文字當作檔名
		 */
		function parseLoraSyntax(title: string, input: string, isPrompt: boolean) {

			let parsed = "";
			if (isPrompt) {
				// 分段處理：先拆分 LoRA 語法與非 LoRA 文本
				parsed = input
					.replace(/<([^<>]*:[^<>]*:[^<>]*)>/g, (match, loraContent) => {
						const fileName = loraContent.split(':')[1].replace(/\"/, `\"`);
						return `<font class="lora" data-name="${fileName}">&lt;${Lib.escape(loraContent)}&gt;</font>`;
					})
					.split(/(<font class="lora"[^>]*>.*?<\/font>)/g) // 分割 Lora 語法與其餘文字
					.map((segment) => {
						// 對非 LoRA 語法段落去除可能破壞 html 的跳脫符號
						if (!segment.startsWith(`<font class="lora"`)) {
							return Lib.escape(segment).replace(/\n/g, "<br>");
						}
						return segment; // 保留 LoRA 語法標籤不變
					})
					.join("");
			}
			else {
				const fileName = input.replace(/\"/, `\"`);
				parsed = `<font class="lora" data-name="${fileName}">${Lib.escape(input)}</font>`;
			}

			const domMenu = document.querySelector("#menu-lora") as HTMLElement;
			const domMenuFile = document.querySelector("#menu-lora-file") as HTMLElement;
			const domMenuFileBody = domMenuFile.querySelector(".menu-box") as HTMLElement;

			const domImg = domMenu.querySelector(".js-img") as HTMLElement;
			const domInfo = domMenu.querySelector(".js-info") as HTMLElement;
			const domLoading = domMenu.querySelector(".js-loading") as HTMLElement;
			const domNotFound = domMenu.querySelector(".js-notFound") as HTMLElement;
			const domNotSpecified = domMenu.querySelector(".js-notSpecified") as HTMLElement;
			const domMain = domMenu.querySelector(".js-main") as HTMLElement;
			const btnSearch = domMenu.querySelector(".js-search") as HTMLElement;
			const btnSetting = domMenu.querySelector(".js-setting") as HTMLElement;
			const btnFile = domMenu.querySelector(".js-file") as HTMLElement;
			const btnCivitai = domMenu.querySelector(".js-civitai") as HTMLElement;

			function showMenu(domLora: Element, domMenu: HTMLElement, type: "loading" | "main" | "notFound" | "notSpecified") {

				domLoading.style.display = "none";
				domNotFound.style.display = "none";
				domNotSpecified.style.display = "none";
				domMain.style.display = "none";

				if (type === "loading") domLoading.style.display = "";
				if (type === "notFound") domNotFound.style.display = "";
				if (type === "notSpecified") domNotSpecified.style.display = "";
				if (type === "main") domMain.style.display = "";

				M.menu.openAtButton(domMenu, domLora as HTMLElement, "active", "leftOrRight");
			}

			const itemDom = getItemDom({ name: title, value: parsed, isEscape: false, copyText: input });
			const loraDoms = itemDom.querySelectorAll(".lora");
			loraDoms.forEach((dom: Element) => {
				dom.addEventListener("mouseup", async (e) => {

					//e.preventDefault();

					// 如果有選取文字，就不執行
					if (Lib.isTxtSelect()) { return; }

					const name = dom.getAttribute("data-name") as string;

					domImg.style.backgroundImage = ``;
					domInfo.innerHTML = "";

					let a1111Models = M.config.settings.layout.a1111Models;

					// 未指定 A1111 Models
					if (a1111Models === undefined || a1111Models === "") {
						showMenu(dom, domMenu, "notSpecified");
						btnSetting.onclick = () => {
							M.script.setting.showSetting("layout", "a1111Models");
						}
						return;
					}

					showMenu(dom, domMenu, "loading");
					const excludeDirs = [
						"node_modules",
						".git",
						"cache",
						"venv",
						".venv",
						"extensions",
						"ldm_patched",
						"modules",
						"repositories",
						"python",
						"outputs",
					];
					const loraResource = await WebAPI.getA1111LoraResource(a1111Models.split("\n"), [name], excludeDirs);
					const files = loraResource[name].sort() as string[];

					// 找不到檔案
					if (files.length === 0) {
						showMenu(dom, domMenu, "notFound");
						const urlCivitai = `https://civitai.com/search/models?query=${name}`;
						btnSearch.onclick = () => {
							WV_RunApp.OpenUrl(urlCivitai);
						}
						return;
					}

					// 取出預覽圖
					const ext = [".jpg", ".png", "webp", ".avif", ".bmp", ".gif", ".mp4", ".webm"];
					let img = files.find(x => ext.some(y =>
						x.toLowerCase().endsWith(y) &&
						x.toLowerCase().endsWith(".preview." + y) === false));
					// 優先取出非 preview 的圖片
					if (img === undefined) {
						img = files.find(x => ext.some(y => x.toLowerCase().endsWith(y)));
					}
					// 如果都沒有圖片，就取第一個檔案
					if (img === undefined) {
						img = files[0];
					}

					const imgUrl = WebAPI.Img.fileIcon(img);

					// 避免重複註冊
					if (domImg.getAttribute("data-path") === null)
						Lib.addEventDblclick(domImg, () => {
							const p = domImg.getAttribute("data-path") as string;
							M.script.open.openNewWindow(p);
						});
					domImg.setAttribute("data-path", img);
					domImg.style.backgroundImage = `url(${imgUrl.replace(/\(/g, "\\(").replace(/\)/g, "\\)")})`;

					// 取得 .json
					const jsonPath = files.find(x => x.toLowerCase().endsWith(".json"));
					if (jsonPath !== undefined) {
						try {

							const json = JSON.parse(await WebAPI.getText(jsonPath));

							const jsonKeys = Object.keys(json);

							for (let i = 0; i < jsonKeys.length; i++) {
								const key = jsonKeys[i];
								let value = json[key];

								if (typeof value === "string") {
									if (value === "" || value === "Unknown") {
										continue;
									}
									value = value.trim();
								}
								else if (typeof value === "object") {
									value = Lib.jsonStrFormat(value).jsonFormat;
								} else {
									continue;
								}

								const infoDiv = Lib.newDom(`
									<div class="loraBox-item">
										<div class="loraBox-title"></div>
										<div class="loraBox-text"></div>
									</div>`);
								infoDiv.querySelector(".loraBox-title")!.innerHTML = Lib.escape(key);
								infoDiv.querySelector(".loraBox-text")!.innerHTML = Lib.escape(value).replace(/\n/g, "<br>");
								domInfo.appendChild(infoDiv);
							}
						} catch (e) {
							console.warn("Lora json 解析失敗", e);
						}
					}

					// 如果有 *.civitai.info
					const civitaiInfoPath = files.find(x => x.toLowerCase().endsWith(".civitai.info"));
					if (civitaiInfoPath !== undefined) {
						btnCivitai.style.display = "";
						btnCivitai.onclick = async () => {
							const civitaiUrl = await civitaiInfoToUrl(civitaiInfoPath, null);
							if (civitaiUrl !== null)
								WV_RunApp.OpenUrl(civitaiUrl);
							else
								Toast.show("civitai.info Error", 1000 * 3); // Civitai info 解析失敗
						}

					} else {
						btnCivitai.style.display = "none";
					}

					btnFile.onclick = () => {
						domMenuFileBody.innerHTML = "";

						// 複製路徑
						files.forEach(filePath => {
							const text = `<spen>${M.i18n.t("menu.copyFilePath")}: </span>` +
								"<b>" + Lib.getFileName(filePath).substring(name.length) + "</b>";
							const dom = Lib.newDom(`
								<div class="menu-hor-item">
									<div class="menu-hor-icon"></div>
									<div class="menu-hor-txt">${text}</div>
								</div>
							`);
							dom.onclick = async () => {
								await WV_System.SetClipboard_Text(filePath);
								Toast.show(M.i18n.t("msg.copyFilePath"), 1000 * 3); // 已將「檔案路徑」複製至剪貼簿
								M.script.menu.close(domMenuFile);
							}
							domMenuFileBody.appendChild(dom);
						});

						// 水平線
						domMenuFileBody.appendChild(Lib.newDom(`<div class="menu-hor-hr"></div>`));

						// 在檔案總管中顯示
						files.forEach(filePath => {
							const text = `<spen>${M.i18n.t("menu.revealInFileExplorer")}: </span>` +
								"<b>" + Lib.getFileName(filePath).substring(name.length) + "</b>";
							const dom = Lib.newDom(`
								<div class="menu-hor-item">
									<div class="menu-hor-icon"></div>
									<div class="menu-hor-txt">${text}</div>
								</div>
							`);
							dom.onclick = async () => {
								M.script.open.revealInFileExplorer(filePath);
								M.script.menu.close(domMenuFile);
							}
							domMenuFileBody.appendChild(dom);
						});

						M.menu.openAtButton(domMenuFile, btnFile as HTMLElement, "active", "leftOrRight");
					}

					showMenu(dom, domMenu, "main");
				})
			})
			_domTabContentInfo.appendChild(itemDom);
		}


		/**
		 * 讀取 相關檔案(於初始化後呼叫)
		 */
		async function loadRelated(noCheckPath = false) {

			if (_isEnabled === false) { return; }
			if (_tabType !== TabType.related) { return; }

			_domTabContentRelated.innerHTML = "";

			if (_fileInfo2.Type === "none") { // 如果檔案不存在
				return;
			}

			const path = _fileInfo2.FullPath;
			const json = await WebAPI.getRelatedFileList(path, _relatedFileExtList);

			if (noCheckPath === false) {
				if (M.fileLoad.getFilePath() !== path) { // 如果已經在載入期間已經切換到其他檔案
					return;
				}
			}

			for (let i = 0; i < json.length; i++) {
				const item = json[i];
				const itemPath = item.path;
				const itemText = item.text;
				const domBox = await getRelatedDom(itemPath, itemText);
				if (noCheckPath === false) {
					if (M.fileLoad.getFilePath() !== path) { // 如果已經在載入期間已經切換到其他檔案
						return;
					}
				}
				_domTabContentRelated.appendChild(domBox);
			}

			if (json.length === 0) {
				const btnNew = await getRelatedBtnAdd()
				_domTabContentRelated.appendChild(btnNew);
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

			if (M.config.settings.layout.civitaiResourcesEnabled === false) { return; }

			// 記錄當前的 path，如果在載入期間已經切換到其他檔案，則離開
			const path = _fileInfo2.FullPath;

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
					console.warn("Civitai resources 解析失敗", data);
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
			const collapseDom = await getCollapseDom("Civitai Resources", true, "civitaiResources", (type) => { });

			for (let i = 0; i < data.length; i++) {
				const item = data[i];
				let hash = item.hash;
				let modelVersionId = item.modelVersionId;
				let dbKey = modelVersionId || hash;
				if (dbKey === undefined || dbKey === null) {
					console.warn("Civitai 未預期的格式", item);
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

				// 如果發生過錯誤
				if (dbData !== undefined && dbData.error !== undefined) {
					let time = new Date(dbData.time).getTime();
					let timeNow = new Date().getTime();

					if (dbData.error === "Model not found") { // 如果找不到資源，則 1 天後再重試			
						if (isNaN(time) || timeNow - time > 24 * 60 * 60 * 1000) {
							dbData = undefined;
						}
					} else { // 其他錯誤，1 小時後再重試
						if (isNaN(time) || timeNow - time > 60 * 60 * 1000) {
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
				if (path !== _fileInfo2.FullPath) { return; }

				// 曾經下載過，且發生過錯誤
				if (error !== undefined) { continue; }

				// 先產生一個空的 dom 項目，待資料載入完畢後，再替換
				let oldDom = getItemDom({ name: dbKey, value: "Loading" + "\n" + "-" });
				collapseDom.domContent.appendChild(oldDom);

				let ompleteCount = 0;
				// 項目完成時呼叫的函數，用與判斷是否全部都已經完成
				const completeFunc = () => {
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
							console.error("Civitai request error", url, e);
							let exifValue = oldDom.querySelector(".mainExifValue") as HTMLElement
							exifValue.innerHTML = "Error";
							result = {
								error: "Request error"
							}
						}

						modelId = result.modelId;
						modelName = result.model?.name;
						modelType = result.model?.type;
						name = result.name;
						images = result.images;
						modelVersionId = result.id;
						error = result.error;

						if (result.error) {
							console.log("Civitai error", url, result);
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
							console.log("Civitai success", url);

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
						const newItem = Lib.newDom(`
							<div class="mainExifItem" data-hash="${Lib.escape(dbKey)}">
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
						_domTabContentInfo.appendChild(newItem);

						const btnExpand = newItem.querySelector(".mainExifBtnExpand") as HTMLElement; // 折疊
						const btnCollapse = newItem.querySelector(".mainExifBtnCollapse") as HTMLElement; // 折疊			
						const btnCivitai = newItem.querySelector(".mainExifBtnCivitai") as HTMLElement;
						const divImgList = newItem.querySelector(".mainExifImgList") as HTMLElement;

						// 產生預覽圖
						let imgCount = M.config.settings.layout.civitaiResourcesImgNumber;
						let nsfwLevel = M.config.settings.layout.civitaiResourcesNsfwLevel;

						// 判斷是否有圖片
						let isHaveImg = false;

						for (let i = 0; i < images.length; i++) {
							const item = images[i];
							if (item.type === "image" && item.nsfwLevel <= nsfwLevel) {

								isHaveImg = true;

								// 開啟網址時下載圖片，並回傳其 icon
								const name = `Civitai\\${dbKey}-${i + 1}.jpg`;
								const imgPath = Lib.combine([baseWindow.appInfo.tempDirWebFile, name]);
								const imgUrl = WebAPI.Img.webIcon(item.url, name);

								const imgItem = Lib.newDom(`
									<div class="mainExifImgItem">
										<img fetchpriority="low"/>
									</div>
								`);

								imgItem.setAttribute("data-path", imgPath);

								const domImg = imgItem.querySelector("img") as HTMLImageElement;

								// 圖片出現在畫面時，載入圖片
								const observer = new IntersectionObserver(entries => {
									if (entries[0].intersectionRatio <= 0) { return; }
									_limiter.addRequest(domImg, imgUrl); // 發出請求
									observer.unobserve(imgItem); // 在第一次觸發後，停止觀察該元素
								}, {
									threshold: 0.1,
								});
								observer.observe(imgItem);

								divImgList.appendChild(imgItem);

								// 圖片載入失敗時
								domImg.addEventListener("error", () => {
									console.warn("Civitai image load error", imgPath);
									// 顯示錯誤圖示
									/*domImg.src = "./img/error.svg";
									domImg.style.objectFit = "contain";*/

									// 移除 dom
									imgItem.parentNode?.removeChild(imgItem);
									console.warn("Civitai image load error", imgPath);
								});

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
				_domTabContentInfo.appendChild(collapseDom.domBox);
			}

		}

		/**
		 * 取得 相關檔案的 新增按鈕
		 * @returns dom
		 */
		async function getRelatedBtnAdd() {
			const path = _fileInfo2.FullPath;
			const btnNew = Lib.newDom(`
				<div class="mainExifRelatedBtnAdd" i18n="menu.new">
					${M.i18n.t("menu.new")}
				</div>
			`);

			btnNew.addEventListener("click", async () => {
				const dirPath = Lib.getDirectoryName(path);
				if (dirPath === null) { return; }
				// let pathF = Lib.GetExtension(path).split(".")[0];
				let txtName = Lib.getFileName(path).split(".")[0] + ".txt";
				let txtPath = Lib.combine([dirPath, txtName]);
				if (await WV_File.Exists(txtPath) === true) { // 如果檔案已經存在
					txtName = Lib.getFileName(path).split(".")[0] + ".1.txt";
					txtPath = Lib.combine([dirPath, txtName]);
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

			const milliseconds = Number(input);
			if (isNaN(milliseconds)) { return input; }

			const totalSeconds = Math.floor(milliseconds);
			const hours = Math.floor(totalSeconds / 3600);
			const minutes = Math.floor((totalSeconds % 3600) / 60);
			const seconds = totalSeconds % 60;

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

			const name = Lib.getFileName(_fileInfo2.FullPath);
			const itemName = Lib.getFileName(itemPath);

			function getText(text: string) {
				let ext = Lib.getExtension(itemPath);
				if (ext === ".json" || ext === ".info") {
					text = Lib.jsonStrFormat(text).jsonFormat;
				}
				return Lib.escape(text);
			}

			// 外框物件
			const domBox = Lib.newDom(`
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

			const btnList = domTitle.querySelector(".mainExifRelatedTitleBtnList") as HTMLElement;

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
					AiParsingUtility.getA1111(text).forEach(item => {
						domContentList.appendChild(getItemDom({ name: item.title, value: item.text }));
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
					const civitaiUrl = await civitaiInfoToUrl(null, text);
					if (civitaiUrl !== null) {
						let btnCivitai = Lib.newDom(`<div class="mainExifRelatedTitleBtn" title="Civitai">${SvgList["tool-civitai.svg"]}</div>`)
						btnList.appendChild(btnCivitai);
						btnCivitai.addEventListener("click", async () => {
							WV_RunApp.OpenUrl(civitaiUrl);
						})
					}
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
				const imgData = await M.script.img.getImgData(await WebAPI.getFileInfo2(itemPath));
				const arUrl = imgData.arUrl;
				const imageWidth = imgData.width;
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
							<img src="${imgUrl}" fetchpriority="low"/>
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
				const target = e.target as HTMLElement;
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
		 * 從 *.civitai.info 取得 civitai 的網址
		 * @param civitaiInfoPath 
		 * @param civitaiInfoText 
		 * @returns 網址 或 null
		 */
		async function civitaiInfoToUrl(civitaiInfoPath: string | null, civitaiInfoText: string | null) {
			try {
				if (civitaiInfoPath === null && civitaiInfoText === null) { return null; }
				let civitaiInfo: any;
				if (civitaiInfoPath !== null) {
					civitaiInfo = JSON.parse(await WebAPI.getText(civitaiInfoPath));
				} else {
					if (typeof civitaiInfoText === "string") {
						civitaiInfo = JSON.parse(civitaiInfoText);
					}
					else {
						civitaiInfo = civitaiInfoText;
					}
				}
				const modelId = civitaiInfo.modelId;
				if (modelId !== undefined) {
					return "https://civitai.com/models/" + modelId;
				}
			} catch (e) { }
			return null;
		}

		/**
		 * 折疊面板的 dom
		 * @param title 標題
		 * @param type 初始狀態
		 * @param key 儲存設定值的key
		 */
		async function getCollapseDom(title: string, type: boolean, key?: string, funcChange?: (type: boolean) => void) {

			// 外框物件
			const domBox = Lib.newDom(`
				<div class="mainExifRelatedBox">	
				</div>
			`);

			// 標題物件
			const domTitle = Lib.newDom(`
				<div class="mainExifRelatedTitle collapse-title">
					<span>${Lib.escape(title)}</span>
					<div class="mainExifRelatedTitleBtnList"></div>
				</div>
			`);
			domBox.appendChild(domTitle);

			// 內容物件
			const domContent: HTMLElement = Lib.newDom(`
				<div class="mainExifRelatedContent collapse-content">
					<div class="mainExifList">
					</div>
				</div>
			`);
			const domContentList = domContent.querySelector(".mainExifList") as HTMLElement;
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
				const target = e.target as HTMLElement;
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
		function getItemDom(data: {
			name: string;
			value: string | HTMLElement;
			nameI18n?: string;
			valueI18n?: string;
			isEscape?: boolean;
			copyText?: string;
		}) {

			let name = data.name;
			let value = data.value;
			let nameI18n = data.nameI18n ?? "";
			let valueI18n = data.valueI18n ?? "";
			let isEscape = data.isEscape ?? true;
			let copyText = data.copyText ?? value.toString();

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
			if (isEscape)
				value = Lib.escape(value);

			const div = Lib.newDom(`
				<div class="mainExifItem">
					<div class="mainExifName" i18n="${nameI18n}">${name}</div>
					<div class="mainExifValue" i18n="${valueI18n}">${value}</div>
					<div class="mainExifBtns">
						<div class="btn mainExifBtnExpand" title="${M.i18n.t("menu.expand")}">${SvgList["expand.svg"]}</div>
						<div class="btn mainExifBtnCollapse" title="${M.i18n.t("menu.collapse")}">${SvgList["collapse.svg"]}</div>
						<div class="btn mainExifBtnCopy" title="${M.i18n.t("menu.copy")}">${SvgList["tool-copy.svg"]}</div>
					</div>
				</div>`
			);
			const divValue = div.querySelector(".mainExifValue") as HTMLElement;
			const btnCopy = div.querySelector(".mainExifBtnCopy") as HTMLElement; // 複製
			const btnExpand = div.querySelector(".mainExifBtnExpand") as HTMLElement; // 折疊
			const btnCollapse = div.querySelector(".mainExifBtnCollapse") as HTMLElement; // 折疊

			btnCopy.addEventListener("click", async () => { // 複製到剪貼簿
				await WV_System.SetClipboard_Text(copyText);
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
				_domMainExif.classList.add("mainExif--horizontal");
			} else {
				_domMainExif.classList.remove("mainExif--horizontal");
			}
		}

		/**
		 * 檔案被修改時呼叫
		 */
		async function updateFileWatcher(fileWatcherData: FileWatcherData) {
			if (_isEnabled === false) { return; }
			if (_tabType !== TabType.related) { return; }

			// 取得要操作的dom，null 表示不存在此
			function getRelatedBox(path: string) {
				path = path.toLowerCase();
				let arContentRelated = _domTabContentRelated.querySelectorAll(".mainExifRelatedBox");
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
				let name = Lib.getFileName(_fileInfo2.FullPath); // 目前檔案的檔名
				let itemName = Lib.getFileName(fileWatcherData.FullPath);
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
				if (_domTabContentRelated.querySelectorAll(".mainExifRelatedBox").length === 0) {
					let btnNew = await getRelatedBtnAdd()
					_domTabContentRelated.appendChild(btnNew);
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
							if (_domTabContentRelated.querySelectorAll(".mainExifRelatedBox").length === 0) {
								let btnNew = await getRelatedBtnAdd()
								_domTabContentRelated.appendChild(btnNew);
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
					let ext = Lib.getExtension(path).replace(".", "");
					let text = null;
					if (_relatedFileExtList.includes(ext)) {
						text = await WV_File.GetText(path);
					}
					let domBox = await getRelatedDom(path, text);
					_domTabContentRelated.appendChild(domBox);

					// 新增檔案後就隱藏 新增按鈕
					let btnNew = _domTabContentRelated.querySelector(".mainExifRelatedBtnAdd");
					if (btnNew !== null) {
						btnNew.remove();
					}

				}

			}
		}

	}
}
