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
		var isEnabled = true;//啟用 檔案預覽列表


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
			if (val < 10) {//小於10的話，關閉檔案預覽列表
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
		 */
		function init(_fileInfo2: FileInfo2) {
			fileInfo2 = _fileInfo2;
			load();
		}


		/**
		 * 讀取exif(於初始化後呼叫)
		 */
		async function load() {

			if (isEnabled === false) { return; }

			dom_mainExifList.innerHTML = "";

			let path = fileInfo2.Path;
			let encodePath = encodeURIComponent(path);
			let fileTime = `LastWriteTimeUtc=${fileInfo2.LastWriteTimeUtc}`;
			let url = APIURL + `/api/getImgExif?path=${encodePath}&${fileTime}`;

			let json = await fetchGet_json(url);

			if (json.code != "1") {
				return;
			}
			if (M.fileLoad.getFilePath() !== path) {//如果已經在載入期間已經切換到其他檔案
				return;
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
					value = value.replace(/ /g, "").replace(/"/g, "");
					html += `
					<div class="mainExifItem">
						<div class="mainExifMap">
							<iframe class="mainExifMapIframe" src="https://maps.google.com.tw/maps?q=${value}&z=16&output=embed"></iframe>
						</div>
					</div>`

				} else {
					value = valueToString(name, value);
					value = Lib.escape(value);

					name = M.i18n.t(`exif.name.${name}`, "zh");
					name = Lib.escape(name);

					html += `
					<div class="mainExifItem">
						<div class="mainExifName">${name}</div>
						<div class="mainExifValue">${value}</div>
					</div>`
				}

			}

			dom_mainExifList.innerHTML = html;
		}
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
		 * 處理value的值
		 */
		function valueToString(name: string, value: string) {
			let lang = "zh";
			if (name === "Metering Mode") {
				return M.i18n.t(`exif.value.${name}.${value}`, lang);
			}
			if (name === "Flash") {
				return M.i18n.t(`exif.value.${name}.${value}`, lang);
			}
			if (name === "Length") {
				return Lib.getFileLength(Number(value));
			}
			return value;
		}

	}

}