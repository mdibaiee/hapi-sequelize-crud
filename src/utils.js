import { omit, identity } from 'lodash';

export const parseInclude = request => {
  const include = Array.isArray(request.query.include) ? request.query.include
                                                       : [request.query.include];

  const noGetDb = typeof request.getDb !== 'function';
  const noRequestModels = !request.models;

  if (noGetDb && noRequestModels) {
    return new Error('`request.getDb` or `request.models` are not defined.'
                   + 'Be sure to load hapi-sequelize before hapi-sequelize-crud.');
  }

  const { models } = noGetDb ? request : request.getDb();

  return include.map(a => {
    if (typeof a === 'string') return models[a];

    if (a && typeof a.model === 'string' && a.model.length) {
      a.model = models[a.model];
    }

    return a;
  }).filter(identity);
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
