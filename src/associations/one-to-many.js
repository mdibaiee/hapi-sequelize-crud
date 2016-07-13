import joi from 'joi';
import error from '../error';
import _ from 'lodash';
import { parseInclude, parseWhere, getMethod } from '../utils';

let prefix;
let defaultConfig;

export default (server, a, b, names, options) => {
  prefix = options.prefix;
  defaultConfig = options.defaultConfig;

  get(server, a, b, names);
  list(server, a, b, names);
  scope(server, a, b, names);
  scopeScope(server, a, b, names);
  destroy(server, a, b, names);
  destroyScope(server, a, b, names);
  update(server, a, b, names);
};

export const get = (server, a, b, names) => {
  server.route({
    method: 'GET',
    path: `${prefix}/${names.a.singular}/{aid}/${names.b.singular}/{bid}`,

    @error
    async handler(request, reply) {
      const include = parseInclude(request);

      const base = await a.findOne({
        where: {
          [a.primaryKeyField]: request.params.aid,
        },
      });

      const method = getMethod(base, names.b);

      const list = await method({ where: {
        [b.primaryKeyField]: request.params.bid,
      }, include });

      if (Array.isArray(list)) {
        reply(list[0]);
      } else {
        reply(list);
      }
    },

    config: defaultConfig,
  });
};

export const list = (server, a, b, names) => {
  server.route({
    method: 'GET',
    path: `${prefix}/${names.a.singular}/{aid}/${names.b.plural}`,

    @error
    async handler(request, reply) {
      const include = parseInclude(request);
      const where = parseWhere(request);

      const base = await a.findOne({
        where: {
          [a.primaryKeyField]: request.params.aid,
        },
      });

      const method = getMethod(base, names.b);
      const list = await method({ where, include });

      reply(list);
    },

    config: defaultConfig,
  });
};

export const scope = (server, a, b, names) => {
  const scopes = Object.keys(b.options.scopes);

  server.route({
    method: 'GET',
    path: `${prefix}/${names.a.singular}/{aid}/${names.b.plural}/{scope}`,

    @error
    async handler(request, reply) {
      const include = parseInclude(request);
      const where = parseWhere(request);

      const base = await a.findOne({
        where: {
          [a.primaryKeyField]: request.params.aid,
        },
      });

      const method = getMethod(base, names.b);
      const list = await method({
        scope: request.params.scope,
        where,
        include,
      });

      reply(list);
    },

    config: _.defaultsDeep({
      validate: {
        params: joi.object().keys({
          scope: joi.string().valid(...scopes),
          aid: joi.number().integer().required(),
        }),
      },
    }, defaultConfig),
  });
};

export const scopeScope = (server, a, b, names) => {
  const scopes = {
    a: Object.keys(a.options.scopes),
    b: Object.keys(b.options.scopes),
  };

  server.route({
    method: 'GET',
    path: `${prefix}/${names.a.plural}/{scopea}/${names.b.plural}/{scopeb}`,

    @error
    async handler(request, reply) {
      const include = parseInclude(request);
      const where = parseWhere(request);

      const list = await b.scope(request.params.scopeb).findAll({
        where,
        include: include.concat({
          model: a.scope(request.params.scopea),
        }),
      });

      reply(list);
    },

    config: _.defaultsDeep({
      validate: {
        params: joi.object().keys({
          scopea: joi.string().valid(...scopes.a),
          scopeb: joi.string().valid(...scopes.b),
        }),
      },
    }, defaultConfig),
  });
};

export const destroy = (server, a, b, names) => {
  server.route({
    method: 'DELETE',
    path: `${prefix}/${names.a.singular}/{aid}/${names.b.plural}`,

    @error
    async handler(request, reply) {
      const include = parseInclude(request);
      const where = parseWhere(request);

      const base = await a.findOne({
        where: {
          [a.primaryKeyField]: request.params.aid,
        },
      });

      const method = getMethod(base, names.b, true, 'get');
      const list = await method({ where, include });
      await Promise.all(list.map(item =>
        item.destroy()
      ));

      reply(list);
    },
  });
};

export const destroyScope = (server, a, b, names) => {
  const scopes = Object.keys(b.options.scopes);

  server.route({
    method: 'DELETE',
    path: `${prefix}/${names.a.singular}/{aid}/${names.b.plural}/{scope}`,

    @error
    async handler(request, reply) {
      const include = parseInclude(request);
      const where = parseWhere(request);

      const base = await a.findOne({
        where: {
          [a.primarykeyField]: request.params.aid,
        },
      });

      const method = getMethod(base, names.b, true, 'get');

      const list = await method({
        scope: request.params.scope,
        where,
        include,
      });

      await Promise.all(list.map(instance => instance.destroy()));

      reply(list);
    },

    config: _.defaultsDeep({
      validate: {
        params: joi.object().keys({
          scope: joi.string().valid(...scopes),
          aid: joi.number().integer().required(),
        }),
      },
    }, defaultConfig),
  });
};

export const update = (server, a, b, names) => {
  server.route({
    method: 'PUT',
    path: `${prefix}/${names.a.singular}/{aid}/${names.b.plural}`,

    @error
    async handler(request, reply) {
      const include = parseInclude(request);
      const where = parseWhere(request);

      const base = await a.findOne({
        where: {
          [a.primaryKeyField]: request.params.aid,
        },
      });

      const method = getMethod(base, names.b);
      const list = await method({ where, include });

      await Promise.all(list.map(instance => instance.update(request.payload)));

      reply(list);
    },

    config: defaultConfig,
  });
};
