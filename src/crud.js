import joi from 'joi';
import path from 'path';
import error from './error';
import _ from 'lodash';
import { parseInclude, parseWhere } from './utils';
import { notFound } from 'boom';
import * as associations from './associations/index';

const createAll = ({ server, model, prefix, config }) => {
  Object.keys(methods).forEach((method) => {
    methods[method]({ server, model, prefix, config });
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

  if (!permissions) {
    createAll({ server, model, prefix, config });
  } else if (!Array.isArray(permissions)) {
    throw new Error('hapi-sequelize-crud: `models` property must be an array');
  } else if (permissions.includes(modelName)) {
    createAll({ server, model, prefix, config });
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
              config: permissionConfig,
            });
          });
        } else {
          createAll({ server, model, prefix, config: permissionConfig });
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

      const instance = await model.findOne({ where, include });

      if (!instance) return void reply(notFound(`${id} not found.`));

      reply(instance);
    },
    config: _.defaultsDeep({
      validate: {
        params: joi.object().keys({
          id: joi.any(),
        }),
      },
    }, config),
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

      const list = await model.scope(request.params.scope).findAll({ include, where });

      reply(list);
    },
    config: _.defaultsDeep({
      validate: {
        params: joi.object().keys({
          scope: joi.string().valid(...scopes),
        }),
      },
    }, config),
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

      const list = await model.scope(request.params.scope).findAll({ include, where });

      await Promise.all(list.map(instance => instance.destroy()));

      reply(list);
    },
    config: _.defaultsDeep({
      validate: {
        params: joi.object().keys({
          scope: joi.string().valid(...scopes),
        }),
      },
    }, config),
  });
};

export const update = ({ server, model, prefix = '/', config }) => {
  server.route({
    method: 'PUT',
    path: path.join(prefix, model._singular, '{id}'),

    @error
    async handler(request, reply) {
      const { id } = request.params;
      const instance = await model.findOne({
        where: {
          id,
        },
      });

      if (!instance) return void reply(notFound(`${id} not found.`));

      await instance.update(request.payload);

      reply(instance);
    },

    config: _.defaultsDeep({
      validate: {
        payload: joi.object().required(),
      },
    }, config),
  });
};

const methods = {
  list, get, scope, create, destroy, destroyAll, destroyScope, update,
};
