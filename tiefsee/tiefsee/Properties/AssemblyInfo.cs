using System.Reflection;
using System.Resources;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;
using System.Windows;

// 組件的一般資訊是由下列的屬性集控制。
// 變更這些屬性的值即可修改組件的相關
// 資訊。
[assembly: AssemblyTitle("tiefsee")]
[assembly: AssemblyDescription("")]
[assembly: AssemblyConfiguration("")]
[assembly: AssemblyCompany("")]
[assembly: AssemblyProduct("tiefsee")]
[assembly: AssemblyCopyright("Copyright ©  2021")]
[assembly: AssemblyTrademark("")]
[assembly: AssemblyCulture("")]

// 將 ComVisible 設為 false 可對 COM 元件隱藏
// 組件中的類型。若必須從 COM 存取此組件中的類型，
// 的類型，請在該類型上將 ComVisible 屬性設定為 true。
[assembly: ComVisible(false)]

//若要開始建置可當地語系化的應用程式，請在
//.csproj 檔案中的 <UICulture>CultureYouAreCodingWith</UICulture>
//<UICulture>CultureYouAreCodingWith</UICulture>。例如，如果原始程式檔使用美式英文， 
//請將 <UICulture> 設為 en-US。然後取消註解下列
//NeutralResourceLanguage 屬性。在下一行中更新 "en-US"，
//以符合專案檔中的 UICulture 設定。

//[assembly: NeutralResourcesLanguage("en-US", UltimateResourceFallbackLocation.Satellite)]


[assembly: ThemeInfo(
    ResourceDictionaryLocation.None, //主題特定資源字典的位置
                                     //(在頁面中找不到時使用，
                                     // 或應用程式資源字典中找不到資源時)
    ResourceDictionaryLocation.SourceAssembly //泛型資源字典的位置
                                              //(在頁面中找不到時使用，
                                              // 或是應用程式或任何主題特定資源字典中找不到資源時)
)]


// 組件的版本資訊由下列四個值所組成:
//
//      主要版本
//      次要版本
//      組建編號
//      修訂
//
// 您可以指定所有的值，也可以使用 '*' 將組建和修訂編號
// 設為預設，如下所示:
// [assembly: AssemblyVersion("1.0.*")]
[assembly: AssemblyVersion("1.0.0.0")]
[assembly: AssemblyFileVersion("1.0.0.0")]
