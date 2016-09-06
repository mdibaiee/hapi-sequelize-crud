import { defaultsDeep } from 'lodash';
import joi from 'joi';

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

export default ({ method, attributeValidation, associationValidation, config = {} }) => {
  const hasWhere = whereMethods.includes(method);
  const hasInclude = includeMethods.includes(method);
  const hasPayload = payloadMethods.includes(method);
  const methodConfig = { ...config };

  if (hasWhere) {
    defaultsDeep(methodConfig, {
      validate: {
        query: {
          ...attributeValidation,
          ...sequelizeOperators,
        },
      },
    });
  }

  if (hasInclude) {
    defaultsDeep(methodConfig, {
      validate: {
        query: {
          ...associationValidation,
        },
      },
    });
  }

  if (hasPayload) {
    defaultsDeep(methodConfig, {
      validate: {
        payload: {
          ...attributeValidation,
        },
      },
    });
  }

  return methodConfig;
};
