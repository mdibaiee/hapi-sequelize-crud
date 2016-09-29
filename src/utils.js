import { omit, identity, toNumber, isString, isUndefined } from 'lodash';
import { notImplemented } from 'boom';

const sequelizeKeys = ['include', 'order', 'limit', 'offset'];

export const parseInclude = request => {
  const include = Array.isArray(request.query.include)
    ? request.query.include
    : [request.query.include]
    ;

  const noGetDb = typeof request.getDb !== 'function';
  const noRequestModels = !request.models;

  if (noGetDb && noRequestModels) {
    return notImplemented('`request.getDb` or `request.models` are not defined.'
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
  const where = omit(request.query, sequelizeKeys);

  for (const key of Object.keys(where)) {
    try {
      where[key] = JSON.parse(where[key]);
    } catch (e) {
      //
    }
  }

  return where;
};

export const parseLimitAndOffset = (request) => {
  const { limit, offset } = request.query;
  const out = {};
  if (!isUndefined(limit)) {
    out.limit = toNumber(limit);
  }
  if (!isUndefined(offset)) {
    out.offset = toNumber(offset);
  }
  return out;
};

export const parseOrder = (request) => {
  const { order } = request.query;

  if (!order) return null;

  // transform to an array so sequelize will escape the input for us and
  // maintain security. See http://docs.sequelizejs.com/en/latest/docs/querying/#ordering
  if (isString(order)) return order.split(' ');

  for (const key of Object.keys(order)) {
    try {
      order[key] = JSON.parse(order[key]);
    } catch (e) {
      //
    }
  }

  return order;
};

export const getMethod = (model, association, plural = true, method = 'get') => {
  const a = plural ? association.original.plural : association.original.singular;
  const b = plural ? association.original.singular : association.original.plural; // alternative
  const fn = model[`${method}${a}`] || model[`${method}${b}`];
  if (fn) return fn.bind(model);

  return false;
};
