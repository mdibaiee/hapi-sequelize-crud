import { omit, identity, toNumber, isString, isUndefined } from 'lodash';
import { notImplemented } from 'boom';
import joi from 'joi';

const sequelizeKeys = ['include', 'order', 'limit', 'offset'];

const getModels = (request) => {
  const noGetDb = typeof request.getDb !== 'function';
  const noRequestModels = !request.models;
  if (noGetDb && noRequestModels) {
    return notImplemented('`request.getDb` or `request.models` are not defined.'
                   + 'Be sure to load hapi-sequelize before hapi-sequelize-crud.');
  }

  const { models } = noGetDb ? request : request.getDb();

  return models;
};

export const parseInclude = request => {
  const include = Array.isArray(request.query.include)
    ? request.query.include
    : [request.query.include]
    ;

  const models = getModels(request);
  if (models.isBoom) return models;

  return include.map(b => {
    let a = b;
    try {
      if (joi.string().regex(/^\{.*?"model":.*?\}$/)) {
        a = JSON.parse(b);
      }
    } catch (e) {
      //
    }
    if (typeof a !== 'object') {
      const singluarOrPluralMatch = Object.keys(models).find((modelName) => {
        const { _singular, _plural } = models[modelName];
        return _singular === a || _plural === a;
      });

      if (singluarOrPluralMatch) return models[singluarOrPluralMatch];
    }

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

const parseOrderArray = (order, models) => {
  return order.map((requestColumn) => {
    if (Array.isArray(requestColumn)) {
      return parseOrderArray(requestColumn, models);
    }

    let column;
    try {
      column = JSON.parse(requestColumn);
    } catch (e) {
      column = requestColumn;
    }

    if (column.model) column.model = models[column.model];

    return column;
  });
};

export const parseOrder = (request) => {
  const { order } = request.query;

  if (!order) return null;

  const models = getModels(request);
  if (models.isBoom) return models;

  // transform to an array so sequelize will escape the input for us and
  // maintain security. See http://docs.sequelizejs.com/en/latest/docs/querying/#ordering
  const requestOrderColumns = isString(order) ? [order.split(' ')] : order;

  const parsedOrder = parseOrderArray(requestOrderColumns, models);

  return parsedOrder;
};

export const getMethod = (model, association, plural = true, method = 'get') => {
  const a = plural ? association.original.plural : association.original.singular;
  const b = plural ? association.original.singular : association.original.plural; // alternative
  const fn = model[`${method}${a}`] || model[`${method}${b}`];
  if (fn) return fn.bind(model);

  return false;
};
