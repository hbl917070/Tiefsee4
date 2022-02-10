const fs = require("fs");
const path = require("path");

const gulp = require("gulp");
const ejs = require("gulp-ejs");
const rename = require("gulp-rename");
const gulpEsbuild = require("gulp-esbuild");
const sass = require("gulp-sass")(require("sass"));

const fc2json = require("gulp-file-contents-to-json");//處理svg
const jsonTransform = require("gulp-json-transform");//處理svg



//資料夾內的所有svg 封裝成一個 js
gulp.task("svg", function () {

    return gulp.src("./img/default/*.svg")
        .pipe(fc2json("SvgList.js"))
        .pipe(jsonTransform(function (data) {

            var resultJson = "",
                objects = [],
                keys = Object.keys(data);

            for (var i = 0; i < keys.length; i++) {
                objects.push(data[keys[i]]);
            }

            var i = 0;
            objects.map(function (e) {
                i++;
                resultJson += JSON.stringify(e) +
                    (i == keys.length ? "" : ",\n");
            });

            return "var SvgList = " + resultJson;
        }))
        .pipe(gulp.dest("./js"));
});

// scss 轉 css
gulp.task("scss", function () {
    return gulp.src("./scss/**/*.scss") // 指定要處理的 Scss 檔案目錄
        .pipe(sass({
            //outputStyle: "compressed", //壓縮
        }))
        .pipe(gulp.dest("./css")); // 指定編譯後的 css 檔案目錄
});

// ejs 轉 html
gulp.task("ejs-main", () => {
    return gulp.src("./ejs/MainWindow/MainWindow.ejs")
        .pipe(ejs({ readFile: readFile }, { async: true }))
        .pipe(rename({ extname: ".html" }))//修改輸出的副檔名
        .pipe(gulp.dest("./"))
});
gulp.task("ejs-setting", () => {
    return gulp.src("./ejs/SettingWindow/SettingWindow.ejs")
        .pipe(ejs({ readFile: readFile }, { async: true }))
        .pipe(rename({ extname: ".html" }))
        .pipe(gulp.dest("./"))
});

// ts 轉 js
gulp.task("ts", () => {
    return gulp.src("./ts/**/*.ts")
        .pipe(gulpEsbuild({
            //minify: true,//壓縮
            //outfile: "bundle.js",
            //bundle: true,
            //loader: { ".tsx": "tsx", },
        }))
        .pipe(gulp.dest("./js"));
});


//檔案變化時
gulp.task("watch", gulp.series("scss", "ts", "svg", "ejs-main", "ejs-setting", () => {
    gulp.watch("./scss/**/*.scss", gulp.series("scss"));
    gulp.watch("./ts/**/*.ts", gulp.series("ts"));
    gulp.watch("./ejs/MainWindow/*.ejs", gulp.series("ejs-main"));
    gulp.watch("./ejs/SettingWindow/*.ejs", gulp.series("ejs-setting"));

    gulp.watch("./img/default/*.svg", gulp.series("ejs-main"));//svg圖示
    gulp.watch("./img/default/*.svg", gulp.series("svg"));
}));


//------------------------------------------------


/**
 * 讀取文字檔(用於ejs匯入svg
 * @param {*} path 
 * @returns 
 */
 async function readFile(path) {
    let t = await new Promise((resolve, reject) => {
        fs.readFile(path, "utf8", function (err, data) {
            resolve(data);//繼續往下執行
        });
    })
    return t;
}
