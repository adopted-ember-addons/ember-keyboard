import { assign } from '@ember/polyfills';
import { shallowEqual } from '../utils';
export default class RouterState {
  constructor(emberRouter, router, routerJsState) {
    this.emberRouter = emberRouter;
    this.router = router;
    this.routerJsState = routerJsState;
  }

  isActiveIntent(routeName, models, queryParams, queryParamsMustMatch) {
    let state = this.routerJsState;

    if (!this.router.isActiveIntent(routeName, models, undefined, state)) {
      return false;
    }

    if (queryParamsMustMatch && Object.keys(queryParams).length > 0) {
      let visibleQueryParams = assign({}, queryParams);

      this.emberRouter._prepareQueryParams(routeName, models, visibleQueryParams);

      return shallowEqual(visibleQueryParams, state.queryParams);
    }

    return true;
  }

}