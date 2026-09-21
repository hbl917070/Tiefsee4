#include <windows.h>
#include <objbase.h>
#include <shellapi.h>

#include <algorithm>
#include <cstdint>
#include <filesystem>
#include <string>
#include <vector>

#pragma comment(lib, "Shell32.lib")

#ifdef max
#undef max
#endif

namespace {

// Native host 只負責快速完成啟動前的判斷；真正的 WinForms/WebView2 程式仍在 Tiefsee.dll 裡執行。
using hostfxr_handle = void*;

// 目前只需要取得「載入 managed assembly 並取得指定方法指標」的 hostfxr delegate。
enum hostfxr_delegate_type {
    hdt_load_assembly_and_get_function_pointer = 5
};

// 這些型別是 hostfxr.h 的必要函式簽名。為了讓啟動器保持輕量，這裡不直接連結 hostfxr.lib，
// 而是在執行時從本機的 hostfxr.dll 取得函式位址。
using hostfxr_initialize_for_dotnet_command_line_fn = int32_t(__cdecl*)(
    int, const wchar_t* const*, const void*, hostfxr_handle*);
using hostfxr_get_runtime_delegate_fn = int32_t(__cdecl*)(
    hostfxr_handle, hostfxr_delegate_type, void**);
using hostfxr_set_runtime_property_value_fn = int32_t(__cdecl*)(
    hostfxr_handle, const wchar_t*, const wchar_t*);
using hostfxr_close_fn = int32_t(__cdecl*)(hostfxr_handle);
using load_assembly_and_get_function_pointer_fn = int(__stdcall*)(
    const wchar_t*, const wchar_t*, const wchar_t*, const wchar_t*, void*, void**);
using managed_entry_point_fn = int(__stdcall*)();

constexpr const wchar_t* kManagedTypeName = L"Tiefsee.Program, Tiefsee";
constexpr const wchar_t* kManagedMethodName = L"RunFromNativeHost";
// load_assembly_and_get_function_pointer 以這個特殊型別名稱表示目標方法具有 UnmanagedCallersOnly。
const wchar_t* const kUnmanagedCallerOnlyMethod = reinterpret_cast<const wchar_t*>(-1);

// 取得目前執行檔所在的資料夾。使用動態大小的 buffer，避免路徑超過 MAX_PATH 時被截斷。
std::wstring GetBaseDirectory() {
    std::vector<wchar_t> buffer(MAX_PATH);

    while (true) {
        DWORD length = GetModuleFileNameW(nullptr, buffer.data(), static_cast<DWORD>(buffer.size()));
        if (length == 0) {
            return L"";
        }
        if (length < buffer.size() - 1) {
            std::wstring path(buffer.data(), length);
            const size_t slash = path.find_last_of(L"\\/");
            return slash == std::wstring::npos ? L"." : path.substr(0, slash);
        }
        buffer.resize(buffer.size() * 2);
    }
}

bool HasManagedApplicationFiles(const std::filesystem::path& directory) {
    std::error_code error;
    return std::filesystem::is_regular_file(directory / L"Tiefsee.dll", error) &&
        std::filesystem::is_regular_file(directory / L"Tiefsee.runtimeconfig.json", error);
}

// 找到 managed 程式所在資料夾。
// 免安裝版通常把 Tiefsee.exe、Tiefsee.dll 放在同一層；MSIX 則把 native host 放在
// TiefseeNativeHost，而 managed 檔案放在上一層的 Tiefsee 資料夾。
std::wstring FindManagedDirectory(const std::wstring& executableDirectory) {
    const std::filesystem::path nativeDirectory(executableDirectory);
    const std::filesystem::path candidates[] = {
        nativeDirectory,
        nativeDirectory.parent_path() / L"Tiefsee",
        nativeDirectory.parent_path()
    };

    std::wstring managedDirectory = executableDirectory;
    for (const auto& candidate : candidates) {
        if (HasManagedApplicationFiles(candidate)) {
            managedDirectory = candidate.wstring();
            break;
        }
    }

    return managedDirectory;
}

std::wstring GetEnvironmentValue(const wchar_t* name) {
    DWORD length = GetEnvironmentVariableW(name, nullptr, 0);
    if (length == 0) {
        return L"";
    }

    std::wstring value(length, L'\0');
    DWORD written = GetEnvironmentVariableW(name, value.data(), length);
    if (written == 0 || written >= length) {
        return L"";
    }
    value.resize(written);
    return value;
}

// 將 .NET 版本字串拆成數字，讓 8.0.31 能正確大於 8.0.9，而不是使用字串排序。
std::vector<int> ParseVersion(const std::wstring& value) {
    std::vector<int> result;
    size_t start = 0;
    while (start < value.size()) {
        size_t end = value.find(L'.', start);
        if (end == std::wstring::npos) {
            end = value.size();
        }

        try {
            result.push_back(std::stoi(value.substr(start, end - start)));
        }
        catch (...) {
            return {};
        }
        start = end + 1;
    }
    return result;
}

bool VersionGreater(const std::wstring& left, const std::wstring& right) {
    const std::vector<int> leftParts = ParseVersion(left);
    const std::vector<int> rightParts = ParseVersion(right);
    if (leftParts.empty() || rightParts.empty()) {
        return left > right;
    }

    const size_t count = std::max(leftParts.size(), rightParts.size());
    for (size_t i = 0; i < count; i++) {
        const int leftPart = i < leftParts.size() ? leftParts[i] : 0;
        const int rightPart = i < rightParts.size() ? rightParts[i] : 0;
        if (leftPart != rightPart) {
            return leftPart > rightPart;
        }
    }
    return false;
}

// 優先使用 MSIX 內附的 hostfxr.dll，因為 self-contained MSIX 必須使用同一份 runtime。
// 免安裝版沒有附帶 hostfxr.dll 時，才回退到電腦上安裝的 .NET runtime。
std::wstring FindHostFxr(const std::wstring& managedDirectory) {
    const std::filesystem::path localHostFxr = std::filesystem::path(managedDirectory) / L"hostfxr.dll";
    std::error_code localError;
    if (std::filesystem::is_regular_file(localHostFxr, localError)) {
        return localHostFxr.wstring();
    }

    std::vector<std::filesystem::path> roots;
    const std::wstring dotnetRoot = GetEnvironmentValue(L"DOTNET_ROOT_X64");
    if (!dotnetRoot.empty()) {
        roots.emplace_back(dotnetRoot);
    }

    const std::wstring programW6432 = GetEnvironmentValue(L"ProgramW6432");
    if (!programW6432.empty()) {
        roots.emplace_back(std::filesystem::path(programW6432) / L"dotnet");
    }

    const std::wstring programFiles = GetEnvironmentValue(L"ProgramFiles");
    if (!programFiles.empty()) {
        roots.emplace_back(std::filesystem::path(programFiles) / L"dotnet");
    }

    // 多個 .NET 版本並存時，選擇版本號最大的 hostfxr.dll。
    std::filesystem::path bestPath;
    std::wstring bestVersion;
    for (const std::filesystem::path& root : roots) {
        const std::filesystem::path fxrDirectory = root / L"host" / L"fxr";
        std::error_code error;
        if (!std::filesystem::is_directory(fxrDirectory, error)) {
            continue;
        }

        for (const auto& entry : std::filesystem::directory_iterator(fxrDirectory, error)) {
            if (error || !entry.is_directory(error)) {
                continue;
            }

            const std::wstring version = entry.path().filename().wstring();
            const std::filesystem::path hostFxrPath = entry.path() / L"hostfxr.dll";
            if (!std::filesystem::exists(hostFxrPath, error)) {
                continue;
            }
            if (bestVersion.empty() || VersionGreater(version, bestVersion)) {
                bestVersion = version;
                bestPath = hostFxrPath;
            }
        }
    }

    return bestPath.empty() ? L"" : bestPath.wstring();
}

bool IsValidHandle(HANDLE handle) {
    return handle != nullptr && handle != INVALID_HANDLE_VALUE;
}

// 取得傳給 Tiefsee.exe 的命令列參數；argv[0] 是執行檔本身，所以從 argv[1] 開始保存。
std::vector<std::wstring> GetArguments() {
    int argumentCount = 0;
    LPWSTR* argumentValues = CommandLineToArgvW(GetCommandLineW(), &argumentCount);
    if (argumentValues == nullptr) {
        return {};
    }

    std::vector<std::wstring> arguments;
    for (int i = 1; i < argumentCount; i++) {
        arguments.emplace_back(argumentValues[i]);
    }
    LocalFree(argumentValues);
    return arguments;
}

bool EndsWith(const std::wstring& value, const std::wstring& suffix) {
    return value.size() >= suffix.size() &&
        value.compare(value.size() - suffix.size(), suffix.size(), suffix) == 0;
}

// 將參數串成 port pipe 使用的訊息格式。每個參數一行，managed 端會再還原成參數陣列。
std::wstring JoinArguments(const std::vector<std::wstring>& arguments) {
    std::wstring result;
    for (size_t i = 0; i < arguments.size(); i++) {
        if (i != 0) {
            result += L'\n';
        }
        result += arguments[i];
    }
    return result;
}

std::string ToUtf8(const std::wstring& value) {
    if (value.empty()) {
        return {};
    }

    int length = WideCharToMultiByte(CP_UTF8, 0, value.data(), static_cast<int>(value.size()), nullptr, 0, nullptr, nullptr);
    if (length <= 0) {
        return {};
    }

    std::string result(length, '\0');
    WideCharToMultiByte(CP_UTF8, 0, value.data(), static_cast<int>(value.size()), result.data(), length, nullptr, nullptr);
    return result;
}

// 嘗試把這次啟動要求轉交給已經執行中的 Tiefsee。
// Port 資料夾中的檔名同時是 instance 的識別碼；鎖定檔案可避免在 instance 正建立 pipe
// 時誤判，Named Pipe 則負責真正傳送命令列參數。
bool TryForwardToRunningInstance(const std::wstring& appData, const std::vector<std::wstring>& arguments) {
    const std::filesystem::path portDirectory = std::filesystem::path(appData) / L"Port";
    std::error_code error;
    if (!std::filesystem::is_directory(portDirectory, error)) {
        return false;
    }

    const std::wstring messageText = JoinArguments(arguments);
    const std::string message = ToUtf8(messageText);
    const std::wstring searchPattern = (portDirectory / L"*").wstring();

    WIN32_FIND_DATAW findData{};
    HANDLE findHandle = FindFirstFileW(searchPattern.c_str(), &findData);
    if (findHandle == INVALID_HANDLE_VALUE) {
        return false;
    }

    bool forwarded = false;
    do {
        if ((findData.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY) != 0) {
            continue;
        }

        const std::wstring fileName = findData.cFileName;
        const std::filesystem::path portFile = portDirectory / fileName;
        HANDLE portHandle = CreateFileW(
            portFile.c_str(), GENERIC_READ, 0, nullptr, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, nullptr);

        if (IsValidHandle(portHandle)) {
            CloseHandle(portHandle);
            DeleteFileW(portFile.c_str());
            continue;
        }

        const std::wstring pipeName = L"\\\\.\\pipe\\tiefsee-" + fileName;
        if (!WaitNamedPipeW(pipeName.c_str(), 3000)) {
            // 等待逾時通常表示 Port 檔案已經過期，避免下次啟動再次等待同一個無效 Port。
            DeleteFileW(portFile.c_str());
            continue;
        }

        HANDLE pipe = CreateFileW(
            pipeName.c_str(), GENERIC_WRITE, 0, nullptr, OPEN_EXISTING, 0, nullptr);
        if (!IsValidHandle(pipe)) {
            // Pipe 在等待後仍無法開啟，這個 Port 已不能使用，清除它再繼續尋找其他執行個體。
            DeleteFileW(portFile.c_str());
            continue;
        }

        DWORD written = 0;
        forwarded = WriteFile(pipe, message.data(), static_cast<DWORD>(message.size()), &written, nullptr) != FALSE &&
            written == message.size();
        CloseHandle(pipe);
        if (forwarded) {
            break;
        }

        // 傳送失敗時不要保留可能已失效的 Port 檔案，否則後續啟動會重複浪費等待時間。
        DeleteFileW(portFile.c_str());
    } while (FindNextFileW(findHandle, &findData));

    FindClose(findHandle);
    return forwarded;
}

int ReadStartType(const std::wstring& baseDirectory, std::wstring& appData) {
    const std::filesystem::path portableMode = std::filesystem::path(baseDirectory) / L"PortableMode";
    std::error_code error;
    if (std::filesystem::is_directory(portableMode, error)) {
        appData = portableMode.wstring();
    }
    else {
        const std::wstring localAppData = GetEnvironmentValue(L"LOCALAPPDATA");
        if (localAppData.empty()) {
            return 3;
        }
        appData = (std::filesystem::path(localAppData) / L"Tiefsee").wstring();
    }

    const std::filesystem::path initialStartIni = std::filesystem::path(appData) / L"Start.ini";

    // 商店版會把實際的 LocalCacheFolder.Path 寫到 temporary.appData。
    // 必須在載入 CLR 前讀取，native host 才能直接找到 managed 程式使用的同一個 Port 資料夾。
    wchar_t redirectedAppData[32768]{};
    GetPrivateProfileStringW(
        L"temporary", L"appData", L"", redirectedAppData,
        static_cast<DWORD>(sizeof(redirectedAppData) / sizeof(redirectedAppData[0])), initialStartIni.c_str());
    if (redirectedAppData[0] != L'\0') {
        appData = redirectedAppData;
    }

    const std::filesystem::path startIni = std::filesystem::path(appData) / L"Start.ini";
    return static_cast<int>(GetPrivateProfileIntW(
        L"setting", L"startType", 3, startIni.c_str()));
}

int RunManagedApplication(const std::wstring& baseDirectory, const std::vector<std::wstring>& arguments) {
    // 透過 hostfxr 動態載入 CLR。這裡不能只使用 runtimeconfig 初始化 API，因為 MSIX
    // publish 是 self-contained runtime；command-line API 同時支援 framework-dependent
    // 與 self-contained application。
    const std::wstring hostFxrPath = FindHostFxr(baseDirectory);
    if (hostFxrPath.empty()) {
        return 0x80131700;
    }

    HMODULE hostFxr = LoadLibraryW(hostFxrPath.c_str());
    if (hostFxr == nullptr) {
        return static_cast<int>(GetLastError());
    }

    const auto initialize = reinterpret_cast<hostfxr_initialize_for_dotnet_command_line_fn>(
        GetProcAddress(hostFxr, "hostfxr_initialize_for_dotnet_command_line"));
    const auto getDelegate = reinterpret_cast<hostfxr_get_runtime_delegate_fn>(
        GetProcAddress(hostFxr, "hostfxr_get_runtime_delegate"));
    const auto setRuntimeProperty = reinterpret_cast<hostfxr_set_runtime_property_value_fn>(
        GetProcAddress(hostFxr, "hostfxr_set_runtime_property_value"));
    const auto close = reinterpret_cast<hostfxr_close_fn>(GetProcAddress(hostFxr, "hostfxr_close"));
    if (initialize == nullptr || getDelegate == nullptr || setRuntimeProperty == nullptr || close == nullptr) {
        FreeLibrary(hostFxr);
        return 0x80131701;
    }

    const std::filesystem::path assembly = std::filesystem::path(baseDirectory) / L"Tiefsee.dll";
    // 把 Tiefsee.dll 當成 managed application 的第一個命令列項目，後面接上原始參數。
    // 這讓 hostfxr 能依照該 assembly 的 runtimeconfig/deps 設定初始化 runtime。
    std::vector<const wchar_t*> commandLine;
    commandLine.reserve(arguments.size() + 1);
    commandLine.push_back(assembly.c_str());
    for (const auto& argument : arguments) {
        commandLine.push_back(argument.c_str());
    }

    hostfxr_handle context = nullptr;
    int32_t result = initialize(static_cast<int>(commandLine.size()), commandLine.data(), nullptr, &context);
    if (result != 0 || context == nullptr) {
        FreeLibrary(hostFxr);
        return result;
    }

    std::wstring baseDirectoryWithSlash = baseDirectory;
    if (baseDirectoryWithSlash.empty() || baseDirectoryWithSlash.back() != L'\\') {
        baseDirectoryWithSlash += L'\\';
    }
    // Native host 位於 MSIX 的 TiefseeNativeHost 子資料夾；明確設定 BaseDirectory，
    // 讓 AppContext.BaseDirectory 指向包含 Tiefsee.dll、Www 與其相依檔案的 Tiefsee 資料夾。
    result = setRuntimeProperty(context, L"APP_CONTEXT_BASE_DIRECTORY", baseDirectoryWithSlash.c_str());
    if (result != 0) {
        close(context);
        FreeLibrary(hostFxr);
        return result;
    }

    void* loadDelegateValue = nullptr;
    result = getDelegate(context, hdt_load_assembly_and_get_function_pointer, &loadDelegateValue);
    if (result != 0 || loadDelegateValue == nullptr) {
        close(context);
        FreeLibrary(hostFxr);
        return result;
    }

    const auto loadAssemblyAndGetFunctionPointer = reinterpret_cast<load_assembly_and_get_function_pointer_fn>(loadDelegateValue);
    void* managedEntryPointValue = nullptr;
    result = loadAssemblyAndGetFunctionPointer(
        assembly.c_str(), kManagedTypeName, kManagedMethodName,
        kUnmanagedCallerOnlyMethod, nullptr, &managedEntryPointValue);
    close(context);
    if (result != 0 || managedEntryPointValue == nullptr) {
        FreeLibrary(hostFxr);
        return result;
    }

    const auto managedEntryPoint = reinterpret_cast<managed_entry_point_fn>(managedEntryPointValue);
    const HRESULT apartmentResult = CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED);
    // CLR 已完成初始化後，呼叫 C# 的 RunFromNativeHost；從這裡開始交回 managed 程式控制。
    const int managedResult = managedEntryPoint();
    if (SUCCEEDED(apartmentResult)) {
        CoUninitialize();
    }
    FreeLibrary(hostFxr);
    return managedResult;
}

} // namespace

int WINAPI wWinMain(HINSTANCE, HINSTANCE, PWSTR, int) {
    // 啟動順序必須維持在載入 CLR 之前：先定位檔案、讀取啟動設定，再決定是否轉交給
    // 已存在的 instance。只有確定需要建立新視窗時，才載入重量級的 .NET runtime 與 DLL。
    const std::wstring executableDirectory = GetBaseDirectory();
    if (executableDirectory.empty()) {
        return 1;
    }
    const std::wstring managedDirectory = FindManagedDirectory(executableDirectory);
    // 後續的相對路徑（例如 Start.ini、Www）都以 managed 資料夾為基準。
    SetCurrentDirectoryW(managedDirectory.c_str());

    const std::vector<std::wstring> arguments = GetArguments();
    if (!arguments.empty() && EndsWith(arguments[0], L"!App") &&
        GetFileAttributesW(arguments[0].c_str()) == INVALID_FILE_ATTRIBUTES) {
        // Windows 啟動工作可能留下已不存在的啟動參數；這種情況直接結束即可。
        return 0;
    }

    std::wstring appData;
    const int startType = ReadStartType(managedDirectory, appData);
    if (arguments.size() == 1 && arguments[0] == L"closeAll") {
        // closeAll 是關閉既有視窗的特殊命令，必須載入 managed 程式才能執行原本的關閉邏輯。
        return RunManagedApplication(managedDirectory, arguments);
    }

    if (startType != 1 && TryForwardToRunningInstance(appData, arguments)) {
        // 已有 instance 且啟動模式允許快速啟動：參數已轉交，新的 process 立即結束。
        return 0;
    }

    // 沒有可轉交的 instance，才真正啟動 C# 應用程式。
    return RunManagedApplication(managedDirectory, arguments);
}
