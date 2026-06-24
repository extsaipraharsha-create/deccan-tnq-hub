import { o as __toESM } from "./chunk-CNf5ZN-e.mjs";
import { n as require_react } from "./jsx-runtime-BIM3nkd3.mjs";
import { a as useRouter } from "./useRouter-CJ_RcCZ1.mjs";
import { A as replaceEqualDeep, I as useStore, b as invariant } from "./useStore-B3O8xYXt.mjs";
import { n as matchContext, t as dummyMatchContext } from "./matchContext-lGSPxC8z.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/useParams-C6vAigTq.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var dummyStore = {
	get: () => void 0,
	subscribe: () => ({ unsubscribe: () => {} })
};
/**
* Read and select the nearest or targeted route match.
* @link https://tanstack.com/router/latest/docs/framework/react/api/router/useMatchHook
*/
function useMatch(opts) {
	const router = useRouter();
	const nearestMatchId = import_react.useContext(opts.from ? dummyMatchContext : matchContext);
	const key = opts.from ?? nearestMatchId;
	const matchStore = key ? opts.from ? router.stores.getRouteMatchStore(key) : router.stores.matchStores.get(key) : void 0;
	{
		const match = matchStore?.get();
		if ((opts.shouldThrow ?? true) && !match) invariant();
		if (match === void 0) return;
		return opts.select ? opts.select(match) : match;
	}
	const previousResult = import_react.useRef(void 0);
	return useStore(matchStore ?? dummyStore, (match) => {
		if ((opts.shouldThrow ?? true) && !match) invariant();
		if (match === void 0) return;
		const selected = opts.select ? opts.select(match) : match;
		if (opts.structuralSharing ?? router.options.defaultStructuralSharing) {
			const shared = replaceEqualDeep(previousResult.current, selected);
			previousResult.current = shared;
			return shared;
		}
		return selected;
	});
}
/**
* Access the current route's path parameters with type-safety.
*
* Options:
* - `from`/`strict`: Specify the matched route and whether to enforce strict typing
* - `select`: Project the params object to a derived value for memoized renders
* - `structuralSharing`: Enable structural sharing for stable references
* - `shouldThrow`: Throw if the route is not found in strict contexts
*
* @returns The params object (or selected value) for the matched route.
* @link https://tanstack.com/router/latest/docs/framework/react/api/router/useParamsHook
*/
function useParams(opts) {
	return useMatch({
		from: opts.from,
		shouldThrow: opts.shouldThrow,
		structuralSharing: opts.structuralSharing,
		strict: opts.strict,
		select: (match) => {
			const params = opts.strict === false ? match.params : match._strictParams;
			return opts.select ? opts.select(params) : params;
		}
	});
}
//#endregion
export { useParams as n, useMatch as t };
