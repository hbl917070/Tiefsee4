English | [中文](../zh-TW/building.md)

# Tiefsee Project Description

Tiefsee4 consists of the following 4 sub-projects:

## Tiefsee
The main program, using WinForm to host WebView2.<br>
It provides Web APIs through HttpListener to enable features such as window management, file operations, and image processing.

<br>

## TiefseeAppPackager
Used to package the Tiefsee project into MSIX format.

<br>

## BuildAll
Used to compile Tiefsee and the native host, and then package the output into a ZIP file.

<br>

## Build Environment

### Native Host (C++)

`TiefseeNativeHost` is the native Windows bootstrapper. It handles startup modes and forwards launch requests between instances before the .NET CLR is loaded.

To build this project, install:

- Visual Studio's Desktop development with C++ workload
- MSVC v143 Platform Toolset
- Windows 10 SDK
- MSBuild
- An x64 build environment

When using Visual Studio 18, install MSVC v143 toolset version 14.44.35207 as well. Visual Studio 17 uses its default v143 toolset version.

The project uses `/MT` to statically link the C/C++ runtime, so the target computer does not need a separate Visual C++ Redistributable installation. The source files use UTF-8, and the C++ project enables `/utf-8`.

### Complete Tiefsee Project

In addition to the C++ build tools above, a complete build requires:

- .NET 10 SDK
- Network access to restore NuGet packages
- WebView2 SDK, provided through NuGet packages
- Node.js, Gulp, Rust, `wasm32-unknown-unknown`, and `wasm-pack` (see the Www installation steps below)

The project currently targets x64. MSIX packaging also requires Visual Studio's Windows App Packaging tools and a package signing environment.

For the packaged MSIX build, the .NET runtime is included in the package. The portable build requires .NET 10 Desktop Runtime to be installed on the target computer. WebView2 Runtime is still required when the application creates its WebView2 windows.

<br>

## Www
A web project where most of the core logic of the program resides.<br>
It uses Gulp to bundle and compile EJS, TypeScript, SCSS, and Rust, then outputs the generated static files to `Output/Www`.

### Directory Structure
`Www` contains the frontend source files, including EJS, SCSS, TypeScript, Rust, images, and other static assets used during development.

`Output/Www` contains the generated build output after running `gulp build`, including HTML, CSS, JS, WASM, and third-party files copied during the build process.

### Initial Installation

1. Install nodejs<br>
	https://nodejs.org/

<br>

2. Install Gulp
	```
	npm install gulp -g	
	```

<br>

3. Open the Www directory in Tiefsee4
	```
	cd Www
	```
<br>

4. Update npm packages
	```
	npm i
	```
5. Install Rust<br>
	https://www.rust-lang.org/tools/install

<br>

6. Install wasm32-unknown-unknown
	```
	rustup target add wasm32-unknown-unknown
	```

<br>

7. Install wasm-pack
	```
	cargo install wasm-pack
	```
<br>

### Compilation

- Bundle and compile EJS, TypeScript, SCSS, and Rust, then copy the processed files into the output folder of the Tiefsee project.
	```
	gulp build
	```
	
<br>

- Continuously monitor file changes, and automatically trigger bundling and compilation whenever changes are detected.
	```
	gulp watch
	```

<br>


### SVG Icon Usage Instructions
Tiefsee UI icons use Fluent System Icons and project-specific SVGs. The official icon source is [microsoft/fluentui-system-icons](https://github.com/microsoft/fluentui-system-icons), which is MIT licensed. The official SVG assets currently included in the project come from `@fluentui/svg-icons@1.1.345`.

- `Www/img/fluent` contains the official Fluent SVGs, retaining package filenames such as `add_20_regular.svg`.
- `Www/img/fluent-overrides` contains modified Fluent icons and project-specific icons included in the same registry. When a filename exists in both directories, the `fluent-overrides` version takes precedence.
- Put theme fill directly in each monochrome SVG source file using `var(--color-white)`, for example:
	```svg
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
		<g style="fill:var(--color-white)">
			<path d="..." />
		</g>
	</svg>
	```
	Remove or replace any hard-coded child `fill` value, or it will override the group fill. Keep `fill="none"` when a transparent shape is required. The source SVG is the same content inserted into the page; Gulp does not rewrite SVGs during the build.
- `gulp svg` combines both directories into `Output/Www/js/SvgList.js`, keyed by filename. A same-name icon from `fluent-overrides` replaces the one from `fluent`. TypeScript can retrieve an icon with `SvgList["add_20_regular.svg"]`:
	```javascript
	const svgText = SvgList["add_20_regular.svg"];
	```
- EJS uses the `readSvg` helper to retrieve an icon from the same merged registry. Do not include the source directory in the template path:
	```ejs
	<div>
		<%- await readSvg("app_folder_20_regular.svg") %>
	</div>
	```
	EJS compilation reports an error if the icon is missing or the filename is invalid. Use `readFile` for non-SVG files.
	
## Supplement

Tiefsee is a program where all UI is rendered with WebView2, <br>
Commonly used C# features have been encapsulated so that JavaScript can call them directly, <br>
In most cases, there is no need to write C#, so you can directly open the `Www` project with Visual Studio Code for development.
