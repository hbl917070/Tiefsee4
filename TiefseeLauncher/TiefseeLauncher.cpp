// 不顯示終端機
#pragma comment(linker, "/subsystem:windows /entry:mainCRTStartup")

#include <iostream>
#include <Windows.h>

// 設定應用程式的圖示
#define IDI_MYICON 101
int APIENTRY WinMain(HINSTANCE hInstance,
	HINSTANCE hPrevInstance,
	LPSTR     lpCmdLine,
	int       nCmdShow)
{
	WNDCLASSEX wcex;

	wcex.hIcon = LoadIcon(hInstance, MAKEINTRESOURCE(IDI_MYICON));
	wcex.hIconSm = LoadIcon(wcex.hInstance, MAKEINTRESOURCE(IDI_MYICON));

	return 0;
}

int main(int argc, char* argv[])
{
	HMODULE handle = LoadLibrary(L"..\\TiefseeLauncherDll\\TiefseeLauncherDll.dll");
	if (handle == NULL)
	{
		handle = LoadLibrary(L"TiefseeLauncherDll.dll");
	}

	if (handle != NULL)
	{
		typedef void* (*Run)(int argc, void* argv);
		Run run = (Run)GetProcAddress(handle, "run");
		if (run == NULL)
		{
			std::cerr << "Failed to get function pointer." << std::endl;
			return 1;
		}

		// 去除第一個參數
		argc--;
		argv++;

		// 呼叫函數
		void* argvPtr = reinterpret_cast<void*>(argv);
		void* resultPtr = run(argc, argvPtr);
		char* result = reinterpret_cast<char*>(resultPtr);
		std::cout << "result=" << result << std::endl;

		// 釋放記憶體和 DLL
		CoTaskMemFree(result);
		FreeLibrary(handle);

		// 等待使用者輸入任意鍵後結束
		// std::cout << "Press any key to exit." << std::endl;
		// std::cin.get();
	}
	else
	{
		std::cerr << "Failed to load DLL." << std::endl;
		return 1;
	}

	return 0;
}
