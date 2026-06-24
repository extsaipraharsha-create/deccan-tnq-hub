import { o as __toESM } from "./chunk-CNf5ZN-e.mjs";
import { n as require_react } from "./jsx-runtime-BIM3nkd3.mjs";
import { a as useRouter } from "./useRouter-CJ_RcCZ1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/useNavigate-BaLgIK1y.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
/**
* Imperative navigation hook.
*
* Returns a stable `navigate(options)` function to change the current location
* programmatically. Prefer the `Link` component for user-initiated navigation,
* and use this hook from effects, callbacks, or handlers where imperative
* navigation is required.
*
* Options:
* - `from`: Optional route base used to resolve relative `to` paths.
*
* @returns A function that accepts `NavigateOptions`.
* @link https://tanstack.com/router/latest/docs/framework/react/api/router/useNavigateHook
*/
function useNavigate(_defaultOpts) {
	const router = useRouter();
	return import_react.useCallback((options) => {
		return router.navigate({
			...options,
			from: options.from ?? _defaultOpts?.from
		});
	}, [_defaultOpts?.from, router]);
}
//#endregion
export { useNavigate as t };
