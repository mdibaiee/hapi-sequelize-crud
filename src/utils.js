import { omit } from 'lodash';

export const parseInclude = request => {
  const include = Array.isArray(request.query.include) ? request.query.include
                                                       : [request.query.include];

  return include.map(a => {
    if (typeof a === 'string') return request.models[a];

    if (a && typeof a.model === 'string' && a.model.length) {
      a.model = request.models[a.model];
    }

    return a;
  }).filter(a => a);
};

export const parseWhere = request => {
  const where = omit(request.query, 'include');

  for (const key of Object.keys(where)) {
    try {
      where[key] = JSON.parse(where[key]);
    } catch (e) {
      //
    }
  }

  return where;
};

export const getMethod = (model, association, plural = true, method = 'get') => {
  const a = plural ? association.original.plural : association.original.singular;
  const b = plural ? association.original.singular : association.original.plural; // alternative
  const fn = model[`${method}${a}`] || model[`${method}${b}`];
  if (fn) return fn.bind(model);

  return false;
};
