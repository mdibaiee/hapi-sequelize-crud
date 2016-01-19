import joi from 'joi';
import error from './error';

let prefix;

export default (server, model, options) => {
  prefix = options.prefix;

  list(server, model);
  get(server, model);
  scope(server, model);
  create(server, model);
  destroy(server, model);
  update(server, model);
}

export const list = (server, model) => {
  server.route({
    method: 'GET',
    path: `${prefix}/${model._plural}`,

    @error
    async handler(request, reply) {
      let list = await model.findAll({
        where: request.query
      });

      reply(list);
    }
  });
}

export const get = (server, model) => {
  server.route({
    method: 'GET',
    path: `${prefix}/${model._singular}/{id?}`,

    @error
    async handler(request, reply) {
      let where = request.params.id ? { id : request.params.id } : request.query;

      let instance = await model.findOne({ where });

      reply(instance);
    },
    config: {
      validate: {
        params: joi.object().keys({
          id: joi.number().integer()
        })
      }
    }
  })
}

export const scope = (server, model) => {
  let scopes = Object.keys(model.options.scopes);

  server.route({
    method: 'GET',
    path: `${prefix}/${model._plural}/{scope}`,

    @error
    async handler(request, reply) {
      let list = await model.scope(request.params.scope).findAll();

      reply(list);
    },
    config: {
      validate: {
        params: joi.object().keys({
          scope: joi.string().valid(...scopes)
        })
      }
    }
  });
}

export const create = (server, model) => {
  server.route({
    method: 'POST',
    path: `${prefix}/${model._singular}`,

    @error
    async handler(request, reply) {
      let instance = await model.create(request.payload);

      reply(instance);
    }
  })
}

export const destroy = (server, model) => {
  server.route({
    method: 'DELETE',
    path: `${prefix}/${model._singular}/{id?}`,

    @error
    async handler(request, reply) {
      let where = request.params.id ? { id : request.params.id } : request.query;

      let list = await model.findAll({ where });

      await* list.map(instance => instance.destroy());

      reply();
    }
  })
}

export const update = (server, model) => {
  server.route({
    method: 'PUT',
    path: `/v1/${model._singular}/{id}`,

    @error
    async handler(request, reply) {
      let instance = await model.findOne({
        where: {
          id: request.params.id
        }
      });

      await instance.update(request.payload);

      reply(instance);
    }
  })
}

import * as associations from './associations/index';
export { associations };
