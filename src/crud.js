import joi from 'joi';
import error from './error';
import _ from 'lodash';
import { parseInclude, parseWhere } from './utils';
import { notFound } from 'boom';

let prefix;
let defaultConfig;

export default (server, model, options) => {
  prefix = options.prefix;
  defaultConfig = options.defaultConfig;

  list(server, model);
  get(server, model);
  scope(server, model);
  create(server, model);
  destroy(server, model);
  destroyAll(server, model);
  destroyScope(server, model);
  update(server, model);
};

export const list = (server, model) => {
  server.route({
    method: 'GET',
    path: `${prefix}/${model._plural}`,

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

    config: defaultConfig,
  });
};

export const get = (server, model) => {
  server.route({
    method: 'GET',
    path: `${prefix}/${model._singular}/{id?}`,

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
    }, defaultConfig),
  });
};

export const scope = (server, model) => {
  const scopes = Object.keys(model.options.scopes);

  server.route({
    method: 'GET',
    path: `${prefix}/${model._plural}/{scope}`,

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
    }, defaultConfig),
  });
};

export const create = (server, model) => {
  server.route({
    method: 'POST',
    path: `${prefix}/${model._singular}`,

    @error
    async handler(request, reply) {
      const instance = await model.create(request.payload);

      reply(instance);
    },

    config: defaultConfig,
  });
};

export const destroy = (server, model) => {
  server.route({
    method: 'DELETE',
    path: `${prefix}/${model._singular}/{id?}`,

    @error
    async handler(request, reply) {
      const where = parseWhere(request);
      if (request.params.id) where[model.primaryKeyField] = request.params.id;

      const list = await model.findAll({ where });

      await Promise.all(list.map(instance => instance.destroy()));

      reply(list.length === 1 ? list[0] : list);
    },

    config: defaultConfig,
  });
};

export const destroyAll = (server, model) => {
  server.route({
    method: 'DELETE',
    path: `${prefix}/${model._plural}`,

    @error
    async handler(request, reply) {
      const where = parseWhere(request);

      const list = await model.findAll({ where });

      await Promise.all(list.map(instance => instance.destroy()));

      reply(list.length === 1 ? list[0] : list);
    },

    config: defaultConfig,
  });
};

export const destroyScope = (server, model) => {
  const scopes = Object.keys(model.options.scopes);

  server.route({
    method: 'DELETE',
    path: `${prefix}/${model._plural}/{scope}`,

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
    }, defaultConfig),
  });
};

export const update = (server, model) => {
  server.route({
    method: 'PUT',
    path: `${prefix}/${model._singular}/{id}`,

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
    }, defaultConfig),
  });
};

import * as associations from './associations/index';
export { associations };
