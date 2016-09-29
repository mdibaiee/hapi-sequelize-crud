import { set, get } from 'lodash';
import joi from 'joi';

// if the custom validation is a joi object we need to concat
// else, assume it's an plain object and we can just add it in with .keys
const concatToJoiObject = (joi, candidate) => {
  if (!candidate) return joi;
  else if (candidate.isJoi) return joi.concat(candidate);
  else return joi.keys(candidate);
};


export const sequelizeOperators = {
  $and: joi.any(),
  $or: joi.any(),
  $gt: joi.any(),
  $gte: joi.any(),
  $lt: joi.any(),
  $lte: joi.any(),
  $ne: joi.any(),
  $eq: joi.any(),
  $not: joi.any(),
  $between: joi.any(),
  $notBetween: joi.any(),
  $in: joi.any(),
  $notIn: joi.any(),
  $like: joi.any(),
  $notLike: joi.any(),
  $iLike: joi.any(),
  $notILike: joi.any(),
  $overlap: joi.any(),
  $contains: joi.any(),
  $contained: joi.any(),
  $any: joi.any(),
  $col: joi.any(),
};

export const whereMethods = [
  'list',
  'get',
  'scope',
  'destroy',
  'destoryScope',
  'destroyAll',
];

export const includeMethods = [
  'list',
  'get',
  'scope',
  'destoryScope',
];

export const payloadMethods = [
  'create',
  'update',
];

export const scopeParamsMethods = [
  'destroyScope',
  'scope',
];

export const idParamsMethods = [
  'get',
  'update',
];

export const restrictMethods = [
  'list',
  'scope',
];

export default ({
  method, attributeValidation, associationValidation, scopes = [], config = {},
}) => {
  const hasWhere = whereMethods.includes(method);
  const hasInclude = includeMethods.includes(method);
  const hasPayload = payloadMethods.includes(method);
  const hasScopeParams = scopeParamsMethods.includes(method);
  const hasIdParams = idParamsMethods.includes(method);
  const hasRestrictMethods = restrictMethods.includes(method);
  // clone the config so we don't modify it on multiple passes.
  let methodConfig = { ...config, validate: { ...config.validate } };

  if (hasWhere) {
    const query = concatToJoiObject(joi.object()
      .keys({
        ...attributeValidation,
        ...sequelizeOperators,
      }),
      get(methodConfig, 'validate.query')
    );

    methodConfig = set(methodConfig, 'validate.query', query);
  }

  if (hasInclude) {
    const query = concatToJoiObject(joi.object()
      .keys({
        ...associationValidation,
      }),
      get(methodConfig, 'validate.query')
    );

    methodConfig = set(methodConfig, 'validate.query', query);
  }

  if (hasPayload) {
    const payload = concatToJoiObject(joi.object()
      .keys({
        ...attributeValidation,
      }),
      get(methodConfig, 'validate.payload')
    );

    methodConfig = set(methodConfig, 'validate.payload', payload);
  }

  if (hasScopeParams) {
    const params = concatToJoiObject(joi.object()
      .keys({
        scope: joi.string().valid(...scopes),
      }),
      get(methodConfig, 'validate.params')
    );

    methodConfig = set(methodConfig, 'validate.params', params);
  }

  if (hasIdParams) {
    const params = concatToJoiObject(joi.object()
      .keys({
        id: joi.any(),
      }),
      get(methodConfig, 'validate.params')
    );

    methodConfig = set(methodConfig, 'validate.params', params);
  }

  if (hasRestrictMethods) {
    const query = concatToJoiObject(joi.object()
      .keys({
        limit: joi.number().min(0).integer(),
        offset: joi.number().min(0).integer(),
        order: joi.array(),
      }),
      get(methodConfig, 'validate.query')
    );

    methodConfig = set(methodConfig, 'validate.query', query);
  }

  return methodConfig;
};
