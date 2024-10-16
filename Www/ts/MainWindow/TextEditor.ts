import { Lib } from "../Lib";
import { Toast } from "../Toast";
import { MainWindow } from "./MainWindow";

export class TextEditor {

	public show;
	public close;
	public save;
	public getIsShow;
	public getText;
	public setText;
	public setOnSave;

	constructor(M: MainWindow) {
		const _dom = document.querySelector("#textEditor") as HTMLElement;
		const _domTextarea = _dom?.querySelector(".textEditor-textarea") as HTMLTextAreaElement;
		const _domBtnSave = _dom?.querySelector(".js-save") as HTMLElement;
		const _domBtnPretty = _dom?.querySelector(".js-pretty") as HTMLElement;
		const _domBtnClose = _dom?.querySelector(".js-close") as HTMLElement;
		let _filePath = "";
		let _isShow = false;
		let _onSave = (text: string) => { };

		this.show = show;
		this.close = close;
		this.save = save;
		this.getIsShow = getIsShow;
		this.getText = getText;
		this.setText = setText;
		this.setOnSave = setOnSave;

		// 讓 Textarea 支援 tab
		_domTextarea.addEventListener("keydown", function (e) {

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
					let selStart = this.selectionStart;
					let selEnd = this.selectionEnd;
					let text = _domTextarea.value;
					while (selStart > 0 && text[selStart - 1] != "\n")
						selStart--;
					while (selEnd > 0 && text[selEnd - 1] != "\n" && selEnd < text.length)
						selEnd++;

					// Get selected text
					let lines = text.substring(selStart, selEnd).split("\n");

					// Insert tabs
					for (let i = 0; i < lines.length; i++) {
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

		_domBtnSave.addEventListener("click", async () => {
			await save();
		})
		_domBtnPretty.addEventListener("click", () => {
			let t = getText();
			try {
				const j = JSON.parse(t);
				t = JSON.stringify(j, null, "\t");
				setText(t);
			} catch (e) {
				Toast.show(M.i18n.t("msg.formattingFailed"), 1000 * 3); // 儲存完成
			}
		})
		_domBtnClose.addEventListener("click", () => {
			close();
		})

		/**
		 * 取得目前是否顯示
		 */
		function getIsShow() {
			return _isShow;
		}

		/**
		 * 顯示視窗
		 * @param path 檔案路徑
		 */
		async function show(path: string | null) {

			_isShow = true;
			_dom.style.display = "";
			await Lib.sleep(1);
			_dom.setAttribute("active", "true");

			if (path === null) { path = "" }
			_filePath = path;
			let t = "";
			if (await WV_File.Exists(_filePath)) {
				t = await WV_File.GetText(_filePath);
			}
			setText(t);

			// 設定焦點
			_domTextarea.focus();
			_domTextarea.setSelectionRange(0, 0);

			_domTextarea.scrollTop = 0;

			// 如果是json，就顯示 格式化 的按鈕
			if (
				Lib.getExtension(_filePath) === ".json"
				|| t.startsWith("{")
			) {
				_domBtnPretty.style.display = "";
			} else {
				_domBtnPretty.style.display = "none";
			}
		}

		/**
		 * 關閉視窗
		 */
		function close() {
			_isShow = false;
			_dom.setAttribute("active", "false");

			setTimeout(() => {
				if (_dom.getAttribute("active") == "false") {
					_domTextarea.value = "";
					_dom.style.display = "none";
				}
			}, 300);
		}

		/**
		 * 設定 儲存後執行的回調
		 */
		function setOnSave(funcSave: (text: string) => void) {
			_onSave = funcSave;
		}

		/**
		 * 儲存
		 */
		async function save() {
			let t = getText();
			try {
				await WV_File.SetText(_filePath, t);
				_onSave(t);
				Toast.show(M.i18n.t("msg.saveComplete"), 1000 * 3); // 儲存完成
			} catch (e) {
				Toast.show(M.i18n.t("msg.saveFailed") + ":\n" + e, 1000 * 3); // 儲存失敗
			}
		}

		/**
		 * 取得 文字
		 */
		function getText() {
			return _domTextarea.value;
		}

		/**
		 * 設定 文字
		 */
		function setText(t: string) {
			_domTextarea.value = t;
		}

	}
}
