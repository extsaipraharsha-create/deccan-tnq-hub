import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/client-BOZcJ6jf.js
function createSupabaseClient() {
	return createClient("https://pdmwnegijkabaozcmpvy.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkbXduZWdpamthYmFvemNtcHZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNzMxODAsImV4cCI6MjA5Njc0OTE4MH0.N6TGd_HsqBe6J28itAXYV9NMGr0Y3ipR-B_8U4xzeMc", { auth: {
		storage: typeof window !== "undefined" ? localStorage : void 0,
		persistSession: true,
		autoRefreshToken: true
	} });
}
var _supabase;
var supabase = new Proxy({}, { get(_, prop, receiver) {
	if (!_supabase) _supabase = createSupabaseClient();
	return Reflect.get(_supabase, prop, receiver);
} });
//#endregion
export { supabase as t };
