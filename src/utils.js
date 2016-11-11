import { omit, identity, toNumber, isString, isUndefined } from 'lodash';
import { notImplemented } from 'boom';
import joi from 'joi';
import Promise from 'bluebird';

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

const getModelInstance = (models, includeItem) => {
  return new Promise(async(resolve) => {
    if (includeItem) {
      if (typeof includeItem !== 'object') {
        const singluarOrPluralMatch = Object.keys(models).find((modelName) => {
          const { _singular, _plural } = models[modelName];
          return _singular === includeItem || _plural === includeItem;
        });

        if (singluarOrPluralMatch) {
          return resolve(models[singluarOrPluralMatch]);
        }
      }

      if (typeof includeItem === 'string' && models.hasOwnProperty(includeItem)) {
        return resolve(models[includeItem]);
      } else if (typeof includeItem === 'object') {
        if (
          typeof includeItem.model === 'string' &&
          includeItem.model.length &&
          models.hasOwnProperty(includeItem.model)
        ) {
          includeItem.model = models[includeItem.model];
        }
        if (includeItem.hasOwnProperty('include')) {
          includeItem.include = await getModelInstance(models, includeItem.include);
          return resolve(includeItem);
        } else {
          return resolve(includeItem);
        }
      }
    }
    return resolve(includeItem);
  });
};

export const parseInclude = async(request) => {
  if (typeof request.query.include === 'undefined') return [];

  const include = Array.isArray(request.query.include)
      ? request.query.include
      : [request.query.include]
    ;

  const models = getModels(request);
  if (models.isBoom) return models;

  const jsonValidation = joi.string().regex(/^\{.*?"model":.*?\}$/);
  const includes = include.map(async(b) => {
    let a = b;
    try {
      if (!jsonValidation.validate(a).error) {
        a = JSON.parse(b);
      }
    } catch (e) {
      //
    }

    return getModelInstance(models, a);
  }).filter(identity);

  return await Promise.all(includes);
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
