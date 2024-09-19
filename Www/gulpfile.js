const fs = require("fs");
const path = require("path");
const gulp = require("gulp");
const ejs = require("gulp-ejs");
const rename = require("gulp-rename");
const gulpEsbuild = require("gulp-esbuild");
const sass = require("gulp-sass")(require("sass"));
const newer = require("gulp-newer");
const { exec } = require("child_process");

const fc2json = require("gulp-file-contents-to-json"); // 處理 svg
const jsonTransform = require("gulp-json-transform"); // 處理 svg

const output2 = "./../Output/Www"; // 把打包後的檔案也複製到開發資料夾 (用於方便測試)

// 將資料夾內的所有 svg 打包成一個 js
gulp.task("svg", async () => {
    await sleep(1);
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
        .pipe(gulp.dest("./js"))
        .pipe(gulp.dest(output2 + "/js"))
});

// scss -> css
gulp.task("scss", async () => {
    await sleep(1);
    return gulp.src("./scss/**/*.scss") // 指定要處理的 Scss 檔案目錄
        .pipe(sass({
            // outputStyle: "compressed", // 壓縮
        }))
        .pipe(gulp.dest("./css")) // 指定編譯後的 css 檔案目錄
        .pipe(gulp.dest(output2 + "/css"))

});

// ejs -> html
gulp.task("ejs-main", async () => {
    await sleep(1);
    return gulp.src("./ejs/MainWindow/MainWindow.ejs")
        .pipe(ejs({ readFile: readFile }, { async: true }))
        .pipe(rename({ extname: ".html" })) // 修改輸出的副檔名
        .pipe(gulp.dest("./"))
        .pipe(gulp.dest(output2 + "/"))
});
gulp.task("ejs-setting", async () => {
    await sleep(1);
    return gulp.src("./ejs/SettingWindow/SettingWindow.ejs")
        .pipe(ejs({ readFile: readFile }, { async: true }))
        .pipe(rename({ extname: ".html" }))
        .pipe(gulp.dest("./"))
        .pipe(gulp.dest(output2 + "/"))

});

// ts -> js
gulp.task("ts", async () => {
    await sleep(1);
    return gulp.src("./ts/**/*.ts")
        .pipe(gulpEsbuild({
            // minify: true, // 壓縮
            // outfile: "bundle.js",
            // bundle: true,
            // loader: { ".tsx": "tsx", },
        }))
        .pipe(gulp.dest("./js"))
        .pipe(gulp.dest(output2 + "/js"))
});

// 把檔案複製到開發資料夾。 (有非 ts、scss、ejs 的資源需要複製到開發資料夾時使用
gulp.task("copy-files", async () => {
    await sleep(1);
    // 使用 "!" 前綴符號來排除指定的檔案跟目錄
    return gulp
        .src([
            "./**/**",
            "!./scss/**", "!./ts/**", "!./ejs/**",
            "!./img/.vscode/**", "!./img/default/**",
            "!./rust/**",
            "!./node_modules/**",
            "!./package-lock.json", "!./.eslintrc.json", "!./gulpfile.js", "!./package.json", "!./tsconfig.json", "!./nuget.config",
            "!./Www.esproj", "!./Www.esproj.user"
        ])
        .pipe(newer(output2)) // 使用 gulp-newer 檢查目標資料夾中的檔案是否已更新
        .pipe(gulp.dest(output2))
});

// rust -> wasm
gulp.task("build-rust", (done) => {
    exec("wasm-pack build --target web --out-dir ../wasm", { cwd: "./rust" }, (err, stdout, stderr) => {
        if (err) {
            console.error(`Error: ${stderr}`);
            done(err);
        } else {
            done();
        }
    });
});

// 打包 - 單次
gulp.task("build", gulp.series("scss", "ts", "svg", "ejs-main", "ejs-setting",
    "copy-files", "build-rust"));

// 打包 - 持續監控檔案變化
gulp.task("watch", gulp.series("scss", "ts", "svg", "ejs-main", "ejs-setting", () => {
    gulp.watch("./scss/**/*.scss", gulp.series("scss"));
    gulp.watch("./ts/**/*.ts", gulp.series("ts"));
    gulp.watch("./ejs/MainWindow/*.ejs", gulp.series("ejs-main"));
    gulp.watch("./ejs/SettingWindow/*.ejs", gulp.series("ejs-setting"));

    gulp.watch("./img/default/*.svg", gulp.series("ejs-main")); // svg 圖示
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
            resolve(data);
        });
    })
    return t;
}

async function sleep(ms) {
    await new Promise((resolve, reject) => {
        setTimeout(function () {
            resolve();
        }, ms);
    })
}
