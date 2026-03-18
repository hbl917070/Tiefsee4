const fs = require("fs");
const path = require("path");
const gulp = require("gulp");
const ejs = require("gulp-ejs");
const rename = require("gulp-rename");
const gulpEsbuild = require("gulp-esbuild");
const sass = require("gulp-sass")(require("sass"));
const newer = require("gulp-newer");
const { exec } = require("child_process");

const fc2json = require("gulp-file-contents-to-json");
const jsonTransform = require("gulp-json-transform");

const output2 = "./../Output/Www";

// --- 輔助函數 ---
async function readFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, "utf8", (err, data) => {
            if (err) resolve(""); // 避免讀取失敗中斷流程
            resolve(data);
        });
    });
}

// --- Tasks ---

// 將資料夾內的所有 svg 打包成一個 js
gulp.task("svg", () => {
    return gulp.src("./img/default/*.svg")
        .pipe(fc2json("SvgList.js"))
        .pipe(jsonTransform(function (data) {
            let resultJson = "";
            let objects = Object.values(data);

            objects.forEach((e, i) => {
                resultJson += JSON.stringify(e) + (i === objects.length - 1 ? "" : ",\n");
            });

            return "var SvgList = " + resultJson;
        }))
        .pipe(gulp.dest("./js"))
        .pipe(gulp.dest(output2 + "/js"));
});

// scss -> css
gulp.task("scss", () => {
    return gulp.src([
        "./scss/MainWindow/MainWindow.scss",
        "./scss/SettingWindow/SettingWindow.scss"
    ], {})
        .pipe(sass().on("error", sass.logError))
        .pipe(gulp.dest("./css"))
        .pipe(gulp.dest(output2 + "/css"));
});

// ejs -> html
gulp.task("ejs", () => {
    return gulp.src([
        "./ejs/MainWindow/MainWindow.ejs",
        "./ejs/SettingWindow/SettingWindow.ejs"
    ], {})
        .pipe(ejs({ readFile: readFile }, { async: true }))
        .pipe(rename({ extname: ".html" }))
        .pipe(gulp.dest("./"))
        .pipe(gulp.dest(output2 + "/"));
});

// ts -> js
gulp.task("ts", async () => {
    const fileMappings = [
        { path: "./ts/MainWindow/MainWindow.ts", bundle: true },
        { path: "./ts/SettingWindow/SettingWindow.ts", bundle: true },
        { path: "./ts/TiefseeviewWorker.ts", bundle: true },
        { path: "./ts/TiefseeviewWorkerSub.ts", bundle: true },
        { path: "./ts/LibIframe.ts", bundle: false },
    ];

    const streams = fileMappings.map(file => {
        return new Promise((resolve, reject) => {
            gulp.src(file.path)
                .pipe(gulpEsbuild({
                    outfile: path.basename(file.path, ".ts") + ".js",
                    bundle: file.bundle,
                }))
                .on("error", reject)
                .pipe(gulp.dest("./js"))
                .pipe(gulp.dest(output2 + "/js"))
                .on("end", resolve);
        });
    });

    return Promise.all(streams);
});

// 把檔案複製到開發資料夾。 (有非 ts、scss、ejs 的資源需要複製到開發資料夾時使用
gulp.task("copy-files", () => {
    return gulp.src([
        "./**/**",
        "!./scss/**", "!./ts/**", "!./ejs/**",
        "!./img/.vscode/**", "!./img/default/**",
        "!./rust/**",
        "!./node_modules/**",
        "!./package-lock.json", "!./.eslintrc.json", "!./gulpfile.js", "!./package.json", "!./tsconfig.json", "!./nuget.config",
        "!./Www.esproj", "!./Www.esproj.user"
    ], {
        encoding: false,
        buffer: true
    })
        .pipe(newer(output2))
        .pipe(gulp.dest(output2));
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
gulp.task("build", gulp.series(
    "build-rust",
    "svg",
    "ejs",
    "scss",
    "ts", // 必須在 ts 之後
    "copy-files", // 必須放在最後
));

// 打包 - 持續監控
gulp.task("watch", gulp.series("scss", "ts", "svg", "ejs", () => {
    gulp.watch("./scss/**/*.scss", gulp.series("scss"));
    gulp.watch("./ts/**/*.ts", gulp.series("ts"));
    gulp.watch("./ejs/**/*.ejs", gulp.series("ejs"));
    gulp.watch("./img/default/*.svg", gulp.series("svg", "ejs"));
}));
