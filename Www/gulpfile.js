const fs = require("fs");
const path = require("path");
const gulp = require("gulp");
const ejs = require("gulp-ejs");
const rename = require("gulp-rename");
const gulpEsbuild = require("gulp-esbuild");
const sass = require("gulp-sass")(require("sass"));
const newer = require("gulp-newer");
const { exec } = require("child_process");

const output = "./../Output/Www";

// --- 輔助函數 ---
async function readFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, "utf8", (err, data) => {
            if (err) resolve(""); // 避免讀取失敗中斷流程
            resolve(data);
        });
    });
}

/**
 * 載入 Fluent 圖示並建立以檔名為 key 的 SVG 字典。
 * 先讀 fluent，再讀 fluent-overrides；同名檔案由後者覆蓋。
 * fluent-overrides 資料夾可不存在；fluent 是必要來源。
 * 此處不改寫 SVG，字典內容會與來源檔案一致。
 */
async function loadSvgList() {
    const svgList = Object.create(null);
    const sourceDirectories = ["fluent", "fluent-overrides"];

    for (const directoryName of sourceDirectories) {
        const directoryPath = path.join(__dirname, "img", directoryName);
        let entries;

        try {
            entries = await fs.promises.readdir(directoryPath, { withFileTypes: true });
        } catch (error) {
            if (directoryName === "fluent-overrides" && error.code === "ENOENT") {
                continue;
            }
            throw error;
        }

        const svgFiles = entries
            .filter(entry => entry.isFile() && path.extname(entry.name).toLowerCase() === ".svg")
            .sort((a, b) => a.name.localeCompare(b.name));

        for (const file of svgFiles) {
            const filePath = path.join(directoryPath, file.name);
            svgList[file.name] = await fs.promises.readFile(filePath, "utf8");
        }
    }

    return svgList;
}

/**
 * 為 EJS 建立 readSvg(name) helper。
 * 只接受單一 .svg 檔名，並從合併後的字典取值，沿用 overrides 優先順序。
 * 檔名無效或圖示不存在時拋出錯誤，讓 EJS 建置指出缺少的資產。
 */
function createSvgReader(svgList) {
    return async function readSvg(fileName) {
        if (typeof fileName !== "string" || path.basename(fileName) !== fileName || path.extname(fileName).toLowerCase() !== ".svg") {
            throw new Error(`Invalid SVG file name: ${fileName}`);
        }

        const svg = svgList[fileName];
        if (svg === undefined) {
            throw new Error(`SVG not found in fluent or fluent-overrides: ${fileName}`);
        }
        return svg;
    };
}

// --- Tasks ---

// 將 fluent 與 fluent-overrides 合併後輸出為 SvgList.js。
gulp.task("svg", async () => {
    const svgList = await loadSvgList();
    const outputDirectory = path.resolve(__dirname, output, "js");
    await fs.promises.mkdir(outputDirectory, { recursive: true });
    await fs.promises.writeFile(
        path.join(outputDirectory, "SvgList.js"),
        "var SvgList = " + JSON.stringify(svgList) + ";",
        "utf8"
    );
});

// scss -> css
gulp.task("scss", () => {
    return gulp.src([
        "./scss/MainWindow/MainWindow.scss",
        "./scss/SettingWindow/SettingWindow.scss"
    ], {})
        .pipe(sass().on("error", sass.logError))
        .pipe(gulp.dest(output + "/css"));
});

// ejs -> html
gulp.task("ejs", async () => {
    const readSvg = createSvgReader(await loadSvgList());
    return gulp.src([
        "./ejs/MainWindow/MainWindow.ejs",
        "./ejs/SettingWindow/SettingWindow.ejs"
    ], {})
        .pipe(ejs({ readFile: readFile, readSvg: readSvg }, { async: true }))
        .pipe(rename({ extname: ".html" }))
        .pipe(gulp.dest(output + "/"));
});

// ts -> js
gulp.task("ts", async () => {
    const fileMappings = [
        { path: "./ts/MainWindow/MainWindow.ts", bundle: true },
        { path: "./ts/SettingWindow/SettingWindow.ts", bundle: true },
        { path: "./ts/Tiefseeview/TiefseeviewWorker.ts", bundle: true },
        { path: "./ts/Tiefseeview/TiefseeviewWorkerSub.ts", bundle: true },
        { path: "./ts/Tiefseeview/TiefseeviewImageWorker.ts", bundle: true },
        { path: "./ts/LibIframe.ts", bundle: true },
        { path: "./ts/lang/langData.ts", bundle: true, outDir: output + "/lang", format: "iife", charset: "utf8" },
    ];

    const streams = fileMappings.map(file => {
        return new Promise((resolve, reject) => {
            gulp.src(file.path)
                .pipe(gulpEsbuild({
                    outfile: path.basename(file.path, ".ts") + ".js",
                    bundle: file.bundle,
                    format: file.format,
                    charset: file.charset,
                    loader: { ".wgsl": "text" },
                }))
                .on("error", reject)
                .pipe(gulp.dest(file.outDir || output + "/js"))
                .on("end", resolve);
        });
    });

    return Promise.all(streams);
});

// 把檔案複製到開發資料夾。 (有非 ts、scss、ejs 的資源需要複製到開發資料夾時使用
gulp.task("copy-files", () => {
    return Promise.all([

        new Promise((resolve, reject) => {
            gulp.src([
                "./**/**",
                "!./scss/**", "!./ts/**", "!./ejs/**",
                "!./img/fluent/**", "!./img/fluent-overrides/**",
                "!./rust/**",
                "!./node_modules/**",
                "!./package-lock.json", "!./.eslintrc.json", "!./gulpfile.js", "!./package.json", "!./tsconfig.json", "!./nuget.config",
                "!./Www.esproj", "!./Www.esproj.user"
            ], {
                encoding: false,
                buffer: true
            })
                .pipe(newer(output))
                .pipe(gulp.dest(output))
                .on("end", resolve)
                .on("error", reject);
        }),

        // 把從 npm 安裝的套件複製到 vender
        new Promise((resolve, reject) => {
            gulp
                .src([
                    "./node_modules/jquery/dist/jquery.min.js",
                ], {
                    encoding: false,
                    buffer: true
                })
                .pipe(gulp.dest(output + "/vender/jquery"))
                .pipe(gulp.dest(output + "/vender/jquery"))
                .on("end", resolve)
                .on("error", reject);
        }),
        new Promise((resolve, reject) => {
            gulp
                .src([
                    "./node_modules/@claviska/jquery-minicolors/jquery.minicolors.png",
                    "./node_modules/@claviska/jquery-minicolors/jquery.minicolors.css",
                    "./node_modules/@claviska/jquery-minicolors/jquery.minicolors.min.js",
                ], {
                    encoding: false,
                    buffer: true
                })
                .pipe(gulp.dest(output + "/vender/jquery-minicolors"))
                .pipe(gulp.dest(output + "/vender/jquery-minicolors"))
                .on("end", resolve)
                .on("error", reject);
        }),
        new Promise((resolve, reject) => {
            gulp
                .src([
                    "./node_modules/jquery.easing/jquery.easing.min.js",
                ], {
                    encoding: false,
                    buffer: true
                })
                .pipe(gulp.dest(output + "/vender/jquery-easing"))
                .pipe(gulp.dest(output + "/vender/jquery-easing"))
                .on("end", resolve)
                .on("error", reject);
        }),
    ]);
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
    "ts", // 必須在 build-rust 之後
    "copy-files", // 必須放在最後
));

// 打包 - 持續監控
gulp.task("watch", gulp.series("scss", "ts", "svg", "ejs", () => {
    gulp.watch("./scss/**/*.scss", gulp.series("scss"));
    gulp.watch("./ts/**/*.ts", gulp.series("ts"));
    gulp.watch("./ejs/**/*.ejs", gulp.series("ejs"));
    gulp.watch("./img/fluent/*.svg", gulp.series("svg", "ejs"));
    gulp.watch("./img/fluent-overrides/*.svg", gulp.series("svg", "ejs"));
}));
