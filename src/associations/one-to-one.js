import joi from 'joi';
import error from '../error';
import _ from 'lodash';
import { parseInclude, parseWhere, getMethod } from '../utils';

let prefix;

export default (server, a, b, names, options) => {
  prefix = options.prefix;

  get(server, a, b, names);
  create(server, a, b, names);
  destroy(server, a, b, names);
  update(server, a, b, names);
}

export const get = (server, a, b, names) => {
  server.route({
    method: 'GET',
    path: `${prefix}/${names.a.singular}/{aid}/${names.b.singular}`,

    @error
    async handler(request, reply) {
      const include = parseInclude(request);
      const where = parseWhere(request);

      const base = await a.findOne({
        where: {
          id: request.params.aid
        }
      });
      const method = getMethod(base, names.b, false);

      const list = await method({ where, include, limit: 1 });

      if (Array.isArray(list)) {
        reply(list[0]);
      } else {
        reply(list);
      }
    }
  })
}

export const create = (server, a, b, names) => {
  server.route({
    method: 'POST',
    path: `${prefix}/${names.a.singular}/{id}/${names.b.singular}`,

    @error
    async handler(request, reply) {
      const base = await a.findOne({
        where: {
          id: request.params.id
        }
      });

      const method = getMethod(base, names.b, false, 'create');
      const instance = await method(request.payload);

      reply(instance);
    }
  })
}

export const destroy = (server, a, b, names) => {
  server.route({
    method: 'DELETE',
    path: `${prefix}/${names.a.singular}/{aid}/${names.b.singular}/{bid}`,

    @error
    async handler(request, reply) {
      const include = parseInclude(request);
      const where = parseWhere(request);

      const base = await a.findOne({
        where: {
          id: request.params.aid
        }
      });

      const method = getMethod(base, names.b, false);

      const instance = await method({ where, include });
      await instance.destroy();

      reply(instance);
    }
  })
}

export const update = (server, a, b, names) => {
  server.route({
    method: 'PUT',
    path: `${prefix}/${names.a.singular}/{aid}/${names.b.singular}/{bid}`,

    @error
    async handler(request, reply) {
      const include = parseInclude(request);
      const where = parseWhere(request);

      const base = await a.findOne({
        where: {
          id: request.params.aid
        }
      });

      const method = getMethod(base, names.b, false);

      const instance = await method({ where, include });
      await instance.update(request.payload);

      reply(instance);
    }
  })
}
