using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Tiefsee {
    public static class Adapter {
        public static SynchronizationContext Dispacher { get; private set; }
        /// <summary>
        /// 請於UI執行緒呼叫此方法。
        /// </summary>
        public static void Initialize() {
            if (Adapter.Dispacher == null)
                Adapter.Dispacher = SynchronizationContext.Current;
        }
        /// <summary>
        /// 在 Dispatcher 關聯的執行緒上以同步方式執行指定的委派。
        /// </summary>
        public static void Invoke(SendOrPostCallback d, object state) {
            Dispacher.Send(d, state);
        }
        /// <summary>
        /// 在 Dispatcher 關聯的執行緒上以非同步方式執行指定的委派。
        /// </summary>
        public static void BeginInvoke(SendOrPostCallback d, object state) {
            Dispacher.Post(d, state);
        }

        /// <summary>
        /// 在UI執行緒執行
        /// </summary>
        /// <param name="ac"></param>
        public static void UIThread(Action ac) {

            Adapter.Invoke(new SendOrPostCallback(obj => { // 呼叫UI執行緒
                ac();
            }), null);

        }

    }
}
