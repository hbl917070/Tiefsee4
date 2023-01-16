class MainExif {

	public init;
	public setEnabled;
	public setHide;
	public setItemWidth;

	constructor(M: MainWindow) {

		this.init = init;
		this.setEnabled = setEnabled;
		this.setHide = setHide;
		this.setItemWidth = setItemWidth;

		var dom_mainExif = document.getElementById("mainExif") as HTMLElement;
		var dom_mainExifList = document.getElementById("mainExifList") as HTMLElement;
		var dom_dragbar_mainFileList = document.getElementById("dragbar-mainExif") as HTMLElement;//拖曳條

		var fileInfo2: FileInfo2;

		var isHide = false;//暫時隱藏
		var isEnabled = true;//啟用 檔案預覽視窗


		//拖曳改變size
		var dragbar = new Dragbar();
		dragbar.init("left", dom_mainExif, dom_dragbar_mainFileList, M.dom_mainR);
		//拖曳開始
		dragbar.setEventStart(() => { })
		//拖曳
		dragbar.setEventMove((val: number) => {
			if (val < 10) {//小於10的話就暫時隱藏
				dom_mainExif.style.opacity = "0";
				dragbar.setPosition(0);
			} else {
				dom_mainExif.style.opacity = "1";
				setItemWidth(val);
			}
		})
		//拖曳 結束
		dragbar.setEventEnd((val: number) => {
			if (val < 10) {//小於10的話，關閉檔案預覽視窗
				setEnabled(false);
			}
		})


		/**
		 * 暫時隱藏(不影響設定值，強制隱藏
		 */
		function setHide(val: boolean) {
			isHide = val;
			if (val) {
				dom_mainExif.setAttribute("hide", "true");
				dragbar.setEnabled(false);
			} else {
				dom_mainExif.setAttribute("hide", "");
				dragbar.setEnabled(M.config.settings.layout.mainExifEnabled);
			}
		}


		/**
		 * 設定是否啟用
		 * @param val 
		 * @returns 
		 */
		function setEnabled(val: boolean) {

			if (val) {
				dom_mainExif.setAttribute("active", "true");
			} else {
				dom_mainExif.setAttribute("active", "");
			}

			M.config.settings.layout.mainExifEnabled = val;
			dragbar.setEnabled(val);
			dom_mainExif.style.opacity = "1";

			if (isEnabled === val) { return; }
			isEnabled = val;

			load();
		}


		/**
		 * 設定size
		 * @param val 
		 */
		function setItemWidth(val: number) {

			let valMin = 150;
			let valMax = 300;
			if (val <= valMin) { val = valMin; }
			if (val >= valMax) { val = valMax; }

			M.config.settings.layout.mainExifShowWidth = val;

			//var cssRoot = document.body;
			//cssRoot.style.setProperty("--mainExif-width", val + "px");
			dom_mainExif.style.width = val + "px";
			dragbar.setPosition(val);
		}


		/**
		 * 初始化
		 * @param _fileInfo2 
		 * @param noCheckPath true=不在載入完成後檢查是否已經切換到其他檔案
		 */
		function init(_fileInfo2: FileInfo2, noCheckPath = false) {
			fileInfo2 = _fileInfo2;
			load(noCheckPath);
		}


		/**
		 * 讀取exif(於初始化後呼叫)
		 */
		async function load(noCheckPath = false) {

			if (isEnabled === false) { return; }

			dom_mainExifList.innerHTML = "";

			if (fileInfo2.Type === "none") {//如果檔案不存在
				return;
			}

			let path = fileInfo2.Path;
			let json = await WebAPI.getExif(fileInfo2);

			if (json.code != "1") {
				return;
			}
			if (noCheckPath === false) {
				if (M.fileLoad.getFilePath() !== path) {//如果已經在載入期間已經切換到其他檔案
					return;
				}
			}
			//取得經緯度
			let GPS_lat = getItem(json.data, "GPS Latitude");//緯度
			let GPS_lng = getItem(json.data, "GPS Longitude");//經度
			if (GPS_lat === `0° 0' 0"` && GPS_lng === `0° 0' 0"`) {//避免空白資料
				GPS_lat = undefined;
				GPS_lng = undefined;
			}
			let hasGPS = GPS_lat !== undefined && GPS_lng !== undefined;
			if (hasGPS) {//如果經緯度不是空，就新增「Map」欄位
				json.data.push({ group: "GPS", name: "Map", value: `${GPS_lat},${GPS_lng}` });
			}

			//更新舊資料，Flash(key) 改為 Flash
			/*let flashIndex = M.config.exif.whitelist.indexOf("Flash(key)");
			if (flashIndex !== -1) {
				M.config.exif.whitelist[flashIndex] = "Flash";
			}*/

			let ar = json.data;
			let html = "";
			let whitelist = M.config.exif.whitelist;

			for (let i = 0; i < whitelist.length; i++) {
				let name = whitelist[i];
				let value = getItem(ar, name);

				if (value === undefined) {
					continue;

				} else if (name === "Map") {

					value = encodeURIComponent(value);//移除可能破壞html的跳脫符號

					html += `
					<div class="mainExifItem">
						<div class="mainExifMap">
							<iframe class="mainExifMapIframe" src="https://maps.google.com.tw/maps?q=${value}&z=16&output=embed"></iframe>
						</div>
					</div>`

				} else if (name === "Textual Data") {//PNG iTXt / zTXt / tEXt

					let vals = getItems(ar, name);
					for (let i = 0; i < vals.length; i++) {
						let val = vals[i];
						let x = val.indexOf(": "); //資料格式通常為 aaaaa: xxxxxx
						if (x === -1) {
							dom_mainExifList.appendChild(getItemHtml(name, val));
						} else {

							name = val.substring(0, x);
							val = val.substring(x + 1);

							if (name === "Comment") { // NovelAI 才有的欄位
								try {
									//val = JSON.stringify(JSON.parse(val), null, 2);//格式化json再顯示
									//html += getItemHtml(name, val);
									if (val.indexOf(`"steps": `) !== -1) {
										let jsonComment = JSON.parse(val); //把json裡面的每一筆資料進行剖析
										let arCommentkey = Object.keys(jsonComment);
										for (let i = 0; i < arCommentkey.length; i++) {
											let keyComment = arCommentkey[i];
											let valComment = jsonComment[keyComment];
											dom_mainExifList.appendChild(getItemHtml(keyComment, valComment));
										}
									} else {
										dom_mainExifList.appendChild(getItemHtml(name, val));
									}
								} catch (e) {
									dom_mainExifList.appendChild(getItemHtml(name, val));
								}

							} else if (name === "parameters") { // Stable Diffusion webui 才有的欄位

								let promptSplit = val.indexOf("Negative prompt: ");//負面提示
								let otherSplit = val.indexOf("Steps: ");//其他參數
								if (promptSplit !== -1 && otherSplit !== -1) {
									dom_mainExifList.appendChild(getItemHtml("Prompt", val.substring(0, promptSplit)));//提示
									dom_mainExifList.appendChild(getItemHtml("Negative prompt", val.substring(promptSplit + 17, otherSplit)));//負面提示
									//html += getItemHtml("Other", val.substring(otherSplit));
									let arOther = val.substring(otherSplit).split(", ");//其他參數
									for (let i = 0; i < arOther.length; i++) {
										const itemOther = arOther[i];
										let itemOtherSplit = itemOther.split(": ");
										if (itemOtherSplit.length > 0) {
											dom_mainExifList.appendChild(getItemHtml(itemOtherSplit[0], itemOtherSplit[1]));
										} else {
											dom_mainExifList.appendChild(getItemHtml("", itemOther));
										}
									}

								} else if (promptSplit === -1 && otherSplit !== -1) {//沒有輸入負面詞的情況

									dom_mainExifList.appendChild(getItemHtml("Prompt", val.substring(0, otherSplit)));//提示
									let arOther = val.substring(otherSplit).split(", ");//其他參數
									for (let i = 0; i < arOther.length; i++) {
										const itemOther = arOther[i];
										let itemOtherSplit = itemOther.split(": ");
										if (itemOtherSplit.length > 0) {
											dom_mainExifList.appendChild(getItemHtml(itemOtherSplit[0], itemOtherSplit[1]));
										} else {
											dom_mainExifList.appendChild(getItemHtml("", itemOther));
										}
									}

								} else {
									dom_mainExifList.appendChild(getItemHtml(name, val));
								}

							} else {
								dom_mainExifList.appendChild(getItemHtml(name, val));
							}

						}

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
					dom_mainExifList.appendChild(getItemHtml(name, value, nameI18n, valueI18n));
				}
			}

		}

		/** 
		 * exif項目的html
		 */
		function getItemHtml(name: string, value: string, nameI18n = "", valueI18n = "") {


			let oVal = value; //原始資料

			name = name.toString();
			value = value.toString();
			name = Lib.escape(name); //移除可能破壞html的跳脫符號
			value = Lib.escape(value);

			value = value.replace(/\n/g, "<br>"); //處理換行

			let html = `
				<div class="mainExifItem">
					<div class="mainExifCopyBtn" title="${M.i18n.t("menu.copy")}">${SvgList["tool-copy.svg"]}</div>
					<div class="mainExifName" i18n="${nameI18n}">${name}</div>
					<div class="mainExifValue" i18n="${valueI18n}">${value}</div>
				</div>`

			let div = newDiv(html);
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



	}

}

