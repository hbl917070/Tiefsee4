const fs = require('fs');
const gulp = require("gulp");
const ejs = require("gulp-ejs");
const rename = require("gulp-rename");
const gulpEsbuild = require("gulp-esbuild");
const sass = require("gulp-sass")(require("sass"));


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

gulp.task("scss", function () {
    return gulp.src("./scss/**/*.scss") // 指定要處理的 Scss 檔案目錄
        .pipe(sass({
            outputStyle: "compressed", //壓縮
        }))
        .pipe(gulp.dest("./css")); // 指定編譯後的 css 檔案目錄
});

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
gulp.task("watch", gulp.series("scss", "ts", "ejs-main", "ejs-setting", () => {
    gulp.watch("./scss/**/*.scss", gulp.series("scss"));
    gulp.watch("./ts/**/*.ts", gulp.series("ts"));
    gulp.watch("./ejs/MainWindow/*.ejs", gulp.series("ejs-main"));
    gulp.watch("./img/default/*.svg", gulp.series("ejs-main"));//svg圖示
    gulp.watch("./ejs/SettingWindow/*.ejs", gulp.series("ejs-setting"));
}));