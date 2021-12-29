
class InitMenu {



    constructor(M: MainWindow) {

        initOpen();
        initCopy();
        initRotate();

        //-----------------

        /**
         * 初始化 menu-開啟
         */
        async function initOpen() {

            //載入檔案
            var dom_OpenFile = document.getElementById("menuitem-OpenFile");
            if (dom_OpenFile !== null) {
                dom_OpenFile.onclick = async () => {
                    M.menu.close();//關閉menu
                    M.script.open.openFile();
                }
            }


            //另開視窗
            var dom_newWindow = document.getElementById("menuitem-newWindow");
            if (dom_newWindow !== null) {
                dom_newWindow.onclick = async () => {
                    M.menu.close();//關閉menu
                    M.script.open.newWindow();
                }
            }

            //開啟檔案位置
            var dom_ShowOnExplorer = document.getElementById("menuitem-ShowOnExplorer");
            if (dom_ShowOnExplorer !== null) {
                dom_ShowOnExplorer.onclick = async () => {
                    M.menu.close();//關閉menu
                    M.script.open.showOnExplorer();
                }
            }

            //顯示檔案右鍵選單
            var dom_ShowSystemMenu = document.getElementById("menuitem-ShowSystemMenu");
            if (dom_ShowSystemMenu !== null) {
                dom_ShowSystemMenu.onclick = async () => {
                    M.menu.close();//關閉menu
                    M.script.open.ShowContextMenu();
                }
            }

            //列印
            var dom_PrintFile = document.getElementById("menuitem-PrintFile");
            if (dom_PrintFile !== null) {
                dom_PrintFile.onclick = async () => {
                    M.menu.close();//關閉menu
                    M.script.open.PrintFile();
                }
            }

            //設成桌布
            var dom_SetWallpaper = document.getElementById("menuitem-SetWallpaper");
            if (dom_SetWallpaper !== null) {
                dom_SetWallpaper.onclick = async () => {
                    M.menu.close();//關閉menu
                    M.script.open.SetWallpaper();
                }
            }

            //選擇其他應用程式
            var dom_RunApp = document.getElementById("menuitem-RunApp");
            if (dom_RunApp !== null) {
                dom_RunApp.onclick = async () => {
                    M.menu.close();//關閉menu
                    M.script.open.RunApp();
                }
            }

            //以3D小畫家開啟
            var dom_Open3DMSPaint = document.getElementById("menuitem-Open3DMSPaint");
            if (dom_Open3DMSPaint !== null) {
                dom_Open3DMSPaint.onclick = async () => {
                    M.menu.close();//關閉menu
                    M.script.open.Open3DMSPaint();
                }
            }

            //以第三方程式開啟
            var dom_menuOtherAppOpen = document.getElementById("menu-otherAppOpen");
            let ar_lnk = await WV_RunApp.GetStartMenuList();//取得開始選單裡面的所有lnk
            async function OtherAppOpenCheck(lnk: string, name: string) {
                //let name = await WV_Path.GetFileNameWithoutExtension(lnk);

                for (let i = 0; i < M.config.OtherAppOpenList.startMenu.length; i++) {
                    const item = M.config.OtherAppOpenList.startMenu[i];
                    if (name.toLocaleLowerCase().indexOf(item.name.toLocaleLowerCase()) > -1) {
                        return true;
                    }
                }
                return false;
            }
            for (let i = 0; i < ar_lnk.length; i++) {
                const lnk = ar_lnk[i];
                let name = lnk.substr(lnk.lastIndexOf("\\") + 1);//取得檔名
                name = name.substr(0, name.length - 4);
                if (await OtherAppOpenCheck(lnk, name)) {

                    let exePath = await WV_System.LnkToExePath(lnk);

                    //let imgBase64 = await WV_Image.GetExeIcon_32(exePath);
                    let imgBase64 = await WV_Image.GetFileIcon(exePath, 32);

                    let dom = newDiv(`
                    <div class="menu-hor-item">
                        <div class="menu-hor-icon">
                            <img src="${imgBase64}">
                        </div>
                        <div class="menu-hor-txt" i18n="">${name}</div>
                    </div>
                `);

                    dom.onclick = async () => {
                        let filePath = M.fileLoad.getFilePath();//目前顯示的檔案
                        if (await WV_File.Exists(filePath) === false) { return; }
                        M.menu.close();//關閉menu
                        WV_RunApp.ProcessStart(exePath, `"${filePath}"`, true, false);//開啟檔案
                    };
                    dom_menuOtherAppOpen?.append(dom);
                }
            }


        }


        /**
         * 初始化 menu-複製
         */
        async function initCopy() {

            //複製 檔案
            var dom_copyFile = document.getElementById("menuitem-img-copyFile");
            if (dom_copyFile !== null) {
                dom_copyFile.onclick = async () => {
                    M.menu.close();//關閉menu
                    let filePath = M.fileLoad.getFilePath();//目前顯示的檔案
                    if (await WV_File.Exists(filePath) === false) { return; }

                    WV_System.SetClipboard_File(filePath);
                }
            }

            //複製 檔名
            var dom_copyName = document.getElementById("menuitem-img-copyName");
            if (dom_copyName !== null) {
                dom_copyName.onclick = async () => {
                    M.menu.close();//關閉menu
                    let filePath = M.fileLoad.getFilePath();//目前顯示的檔案
                    if (await WV_File.Exists(filePath) === false) { return; }

                    let name = Lib.GetFileName(filePath)
                    WV_System.SetClipboard_Txt(name);
                }
            }

            //複製 完整路徑
            var dom_copyPath = document.getElementById("menuitem-img-copyPath");
            if (dom_copyPath !== null) {
                dom_copyPath.onclick = async () => {
                    M.menu.close();//關閉menu
                    let filePath = M.fileLoad.getFilePath();//目前顯示的檔案
                    if (await WV_File.Exists(filePath) === false) { return; }

                    WV_System.SetClipboard_Txt(filePath);
                }
            }

            //複製 影像
            var dom_copyImg = document.getElementById("menuitem-img-copyImg");
            if (dom_copyImg !== null) {
                dom_copyImg.onclick = async () => {
                    M.menu.close();//關閉menu

                    let filePath = M.fileLoad.getFilePath();//目前顯示的檔案
                    if (await WV_File.Exists(filePath) === false) { return; }

                    WV_System.SetClipboard_FileToImg(filePath);
                }
            }

            //複製 base64
            var dom_copyBase64 = document.getElementById("menuitem-img-copyBase64");
            if (dom_copyBase64 !== null) {
                dom_copyBase64.onclick = async () => {
                    M.menu.close();//關閉menu
                    let filePath = M.fileLoad.getFilePath();//目前顯示的檔案
                    if (await WV_File.Exists(filePath) === false) { return; }

                    WV_System.SetClipboard_FileToBase64(filePath);

                }
            }

            //複製 影像(含透明色)
            var dom_copyPng = document.getElementById("menuitem-img-copyPng");
            if (dom_copyPng !== null) {
                dom_copyPng.onclick = async () => {
                    M.menu.close();//關閉menu
                    let filePath = M.fileLoad.getFilePath();//目前顯示的檔案
                    if (await WV_File.Exists(filePath) === false) { return; }

                    WV_System.SetClipboard_FileToPng(filePath);

                }
            }

            //複製 SVG 文字
            var dom_copyTxt = document.getElementById("menuitem-img-copyTxt");
            if (dom_copyTxt !== null) {
                dom_copyTxt.onclick = async () => {
                    M.menu.close();//關閉menu
                    let filePath = M.fileLoad.getFilePath();//目前顯示的檔案
                    if (await WV_File.Exists(filePath) === false) { return; }

                    WV_System.SetClipboard_FileToTxt(filePath);

                }
            }

        }


        /**
         * 初始化 menu-旋轉與鏡像
         */
        async function initRotate() {

            //順時針90°
            var dom_rotateCw = document.getElementById("menuitem-img-rotateCw");
            if (dom_rotateCw !== null) {
                dom_rotateCw.onclick = async () => {
                    M.menu.close();//關閉menu

                    M.fileShow.view_image.setDegForward(undefined, undefined);
                }
            }

            //逆時針90°
            var dom_rotateCcw = document.getElementById("menuitem-img-rotateCcw");
            if (dom_rotateCcw !== null) {
                dom_rotateCcw.onclick = async () => {
                    M.menu.close();//關閉menu

                    M.fileShow.view_image.setDegReverse(undefined, undefined);
                }
            }

            //水平鏡像
            var dom_mirroringH = document.getElementById("menuitem-img-mirroringH");
            if (dom_mirroringH !== null) {
                dom_mirroringH.onclick = async () => {
                    M.menu.close();//關閉menu

                    M.fileShow.view_image.setMirrorHorizontal(!M.fileShow.view_image.getMirrorHorizontal());

                }
            }

            //垂直鏡像
            var dom_mirroringV = document.getElementById("menuitem-img-mirroringV");
            if (dom_mirroringV !== null) {
                dom_mirroringV.onclick = async () => {
                    M.menu.close();//關閉menu

                    M.fileShow.view_image.setMirrorVertica(!M.fileShow.view_image.getMirrorVertica());
                }
            }

            //初始化旋轉
            var dom_initRotate = document.getElementById("menuitem-img-initRotate");
            if (dom_initRotate !== null) {
                dom_initRotate.onclick = async () => {
                    M.menu.close();//關閉menu

                    M.fileShow.view_image.transformRefresh(true);
                }
            }
        }


    }



}