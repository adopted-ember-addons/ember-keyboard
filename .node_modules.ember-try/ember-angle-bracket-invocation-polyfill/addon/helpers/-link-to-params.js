import { helper } from '@ember/component/helper';

function linkToParams(_params, { route, model, models, query }) {
  let params = [];

  if (route) {
    params.push(route);
  }

  if (model) {
    params.push(model);
  }

  if (models) {
    params.push(...models);
  }

  if (query) {
    params.push({
      isQueryParams: true,
      values: query,
    });
  }

  return params;
}

export default helper(linkToParams);
