import joi from 'joi';
import path from 'path';
import error from './error';
import _ from 'lodash';
import { parseInclude, parseWhere } from './utils';
import { notFound } from 'boom';
import * as associations from './associations/index';

const sequelizeOperators = {
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

const whereMethods = [
  'list',
  'get',
  'scope',
  'destroy',
  'destoryScope',
  'destroyAll',
];

const includeMethods = [
  'list',
  'get',
  'scope',
  'destoryScope',
];

const payloadMethods = [
  'create',
  'update',
];

const getConfigForMethod = ({ method, attributeValidation, associationValidation, config }) => {
  const hasWhere = whereMethods.includes(method);
  const hasInclude = includeMethods.includes(method);
  const hasPayload = payloadMethods.includes(method);
  const methodConfig = { ...config };

  if (hasWhere) {
    _.defaultsDeep(methodConfig, {
      validate: {
        query: {
          ...attributeValidation,
          ...sequelizeOperators,
        },
      },
    });
  }

  if (hasInclude) {
    _.defaultsDeep(methodConfig, {
      validate: {
        query: {
          ...associationValidation,
        },
      },
    });
  }

  if (hasPayload) {
    _.defaultsDeep(methodConfig, {
      validate: {
        payload: {
          ...attributeValidation,
        },
      },
    });
  }

  return methodConfig;
};

const createAll = ({
  server,
  model,
  prefix,
  config,
  attributeValidation,
  associationValidation,
}) => {
  Object.keys(methods).forEach((method) => {
    methods[method]({
      server,
      model,
      prefix,
      config: getConfigForMethod({
        method,
        attributeValidation,
        associationValidation,
        config,
      }),
    });
  });
};

export { associations };

/*
The `models` option, becomes `permissions`, and can look like:

```
models: ['cat', 'dog']
```

or

```
models: {
  cat: ['list', 'get']
  , dog: true // all
}
```

*/

export default (server, model, { prefix, defaultConfig: config, models: permissions }) => {
  const modelName = model._singular;
  const modelAttributes = Object.keys(model.attributes);
  const modelAssociations = Object.keys(model.associations);

  const attributeValidation = modelAttributes.reduce((params, attribute) => {
    params[attribute] = joi.any();
    return params;
  }, {});

  const associationValidation = {
    include: joi.array().items(joi.string().valid(...modelAssociations)),
  };

  // if we don't have any permissions set, just create all the methods
  if (!permissions) {
    createAll({
      server,
      model,
      prefix,
      config,
      attributeValidation,
      associationValidation,
    });
  // if permissions are set, but we can't parse them, throw an error
  } else if (!Array.isArray(permissions)) {
    throw new Error('hapi-sequelize-crud: `models` property must be an array');
  // if permissions are set, but the only thing we've got is a model name, there
  // are no permissions to be set, so just create all methods and move on
  } else if (permissions.includes(modelName)) {
    createAll({
      server,
      model,
      prefix,
      config,
      attributeValidation,
      associationValidation,
    });
  // if we've gotten here, we have complex permissions and need to set them
  } else {
    const permissionOptions = permissions.filter((permission) => {
      return permission.model === modelName;
    });

    permissionOptions.forEach((permissionOption) => {
      if (_.isPlainObject(permissionOption)) {
        const permissionConfig = permissionOption.config || config;

        if (permissionOption.methods) {
          permissionOption.methods.forEach((method) => {
            methods[method]({
              server,
              model,
              prefix,
              config: getConfigForMethod({
                method,
                attributeValidation,
                associationValidation,
                config: permissionConfig,
              }),
            });
          });
        } else {
          createAll({
            server,
            model,
            prefix,
            attributeValidation,
            associationValidation,
            config: permissionConfig,
          });
        }
      }
    });
  }
};

export const list = ({ server, model, prefix = '/', config }) => {
  server.route({
    method: 'GET',
    path: path.join(prefix, model._plural),

    @error
    async handler(request, reply) {
      const include = parseInclude(request);
      const where = parseWhere(request);

      if (include instanceof Error) return void reply(include);

      const list = await model.findAll({
        where, include,
      });

      reply(list);
    },

    config,
  });
};

export const get = ({ server, model, prefix = '/', config }) => {
  server.route({
    method: 'GET',
    path: path.join(prefix, model._singular, '{id?}'),

    @error
    async handler(request, reply) {
      const include = parseInclude(request);
      const where = parseWhere(request);
      const { id } = request.params;
      if (id) where[model.primaryKeyField] = id;

      if (include instanceof Error) return void reply(include);

      const instance = await model.findOne({ where, include });

      if (!instance) return void reply(notFound(`${id} not found.`));

      reply(instance);
    },
    config: _.defaultsDeep(config, {
      validate: {
        params: joi.object().keys({
          id: joi.any(),
        }),
      },
    }),
  });
};

export const scope = ({ server, model, prefix = '/', config }) => {
  const scopes = Object.keys(model.options.scopes);

  server.route({
    method: 'GET',
    path: path.join(prefix, model._plural, '{scope}'),

    @error
    async handler(request, reply) {
      const include = parseInclude(request);
      const where = parseWhere(request);

      if (include instanceof Error) return void reply(include);

      const list = await model.scope(request.params.scope).findAll({ include, where });

      reply(list);
    },
    config: _.defaultsDeep(config, {
      validate: {
        params: joi.object().keys({
          scope: joi.string().valid(...scopes),
        }),
      },
    }),
  });
};

export const create = ({ server, model, prefix = '/', config }) => {
  server.route({
    method: 'POST',
    path: path.join(prefix, model._singular),

    @error
    async handler(request, reply) {
      const instance = await model.create(request.payload);

      reply(instance);
    },

    config,
  });
};

export const destroy = ({ server, model, prefix = '/', config }) => {
  server.route({
    method: 'DELETE',
    path: path.join(prefix, model._singular, '{id?}'),

    @error
    async handler(request, reply) {
      const where = parseWhere(request);
      if (request.params.id) where[model.primaryKeyField] = request.params.id;

      const list = await model.findAll({ where });

      await Promise.all(list.map(instance => instance.destroy()));

      reply(list.length === 1 ? list[0] : list);
    },

    config,
  });
};

export const destroyAll = ({ server, model, prefix = '/', config }) => {
  server.route({
    method: 'DELETE',
    path: path.join(prefix, model._plural),

    @error
    async handler(request, reply) {
      const where = parseWhere(request);

      const list = await model.findAll({ where });

      await Promise.all(list.map(instance => instance.destroy()));

      reply(list.length === 1 ? list[0] : list);
    },

    config,
  });
};

export const destroyScope = ({ server, model, prefix = '/', config }) => {
  const scopes = Object.keys(model.options.scopes);

  server.route({
    method: 'DELETE',
    path: path.join(prefix, model._plural, '{scope}'),

    @error
    async handler(request, reply) {
      const include = parseInclude(request);
      const where = parseWhere(request);

      if (include instanceof Error) return void reply(include);

      const list = await model.scope(request.params.scope).findAll({ include, where });

      await Promise.all(list.map(instance => instance.destroy()));

      reply(list);
    },
    config: _.defaultsDeep(config, {
      validate: {
        params: joi.object().keys({
          scope: joi.string().valid(...scopes),
        }),
      },
    }),
  });
};

export const update = ({ server, model, prefix = '/', config }) => {
  server.route({
    method: 'PUT',
    path: path.join(prefix, model._singular, '{id}'),

    @error
    async handler(request, reply) {
      const { id } = request.params;
      const instance = await model.findById(id);

      if (!instance) return void reply(notFound(`${id} not found.`));

      await instance.update(request.payload);

      reply(instance);
    },

    config: _.defaultsDeep(config, {
      validate: {
        payload: joi.object().required(),
        params: joi.object().keys({
          id: joi.any(),
        }),
      },
    }),
  });
};

const methods = {
  list, get, scope, create, destroy, destroyAll, destroyScope, update,
};
