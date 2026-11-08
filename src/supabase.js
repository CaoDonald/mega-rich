import { createClient, processLock } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    // 默认的 navigator.locks 是跨标签页的全局锁：其他标签页（尤其是后台被节流的）
    // 持有该锁时，本页所有 Supabase 请求会一直排队等待，表现为无网络请求、界面卡住。
    // 改用进程内锁，避免跨标签页死锁。
    lock: processLock
  }
})