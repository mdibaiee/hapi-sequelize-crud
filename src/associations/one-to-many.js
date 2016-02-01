import joi from 'joi';
import error from '../error';
import _ from 'lodash';

let prefix;

export default (server, a, b, options) => {
  prefix = options.prefix;

  get(server, a, b);
  list(server, a, b);
  scope(server, a, b);
  scopeScope(server, a, b);
  destroy(server, a, b);
  destroyScope(server, a, b);
  update(server, a, b);
}

export const get = (server, a, b) => {
  server.route({
    method: 'GET',
    path: `${prefix}/${a._singular}/{aid}/${b._singular}/{bid}`,

    @error
    async handler(request, reply) {
      let include = [];
      if (request.query.include)
        include = [request.models[request.query.include]];

      let instance = await b.findOne({
        where: {
          id: request.params.bid
        },

        include: include.concat({
          where: {
            id: request.params.aid
          },
          model: a
        })
      });

      reply(list);
    }
  })
}

export const list = (server, a, b) => {
  server.route({
    method: 'GET',
    path: `${prefix}/${a._singular}/{aid}/${b._plural}`,

    @error
    async handler(request, reply) {
      let include = [];
      if (request.query.include)
        include = [request.models[request.query.include]];

      let where = _.omit(request.query, 'include');

      for (const key of Object.keys(where)) {
        try {
          where[key] = JSON.parse(where[key]);
        } catch (e) {
          //
        }
      }

      let list = await b.findAll({
        where,

        include: include.concat({
          where: {
            id: request.params.aid
          },
          model: a
        })
      });

      reply(list);
    }
  })
}

export const scope = (server, a, b) => {
  let scopes = Object.keys(b.options.scopes);

  server.route({
    method: 'GET',
    path: `${prefix}/${a._singular}/{aid}/${b._plural}/{scope}`,

    @error
    async handler(request, reply) {
      let include = [];
      if (request.query.include)
        include = [request.models[request.query.include]];

      let where = _.omit(request.query, 'include');

      for (const key of Object.keys(where)) {
        try {
          where[key] = JSON.parse(where[key]);
        } catch (e) {
          //
        }
      }

      let list = await b.scope(request.params.scope).findAll({
        where,
        include: include.concat({
          where: {
            id: request.params.aid
          },
          model: a
        })
      });

      reply(list);
    },

    config: {
      validate: {
        params: joi.object().keys({
          scope: joi.string().valid(...scopes),
          aid: joi.number().integer().required()
        })
      }
    }
  })
}

export const scopeScope = (server, a, b) => {
  let scopes = {
    a: Object.keys(a.options.scopes),
    b: Object.keys(b.options.scopes)
  };

  server.route({
    method: 'GET',
    path: `${prefix}/${a._plural}/{scopea}/${b._plural}/{scopeb}`,

    @error
    async handler(request, reply) {
      let include = [];
      if (request.query.include)
        include = [request.models[request.query.include]];

      let where = _.omit(request.query, 'include');

      for (const key of Object.keys(where)) {
        try {
          where[key] = JSON.parse(where[key]);
        } catch (e) {
          //
        }
      }

      let list = await b.scope(request.params.scopeb).findAll({
        where,
        include: include.concat({
          model: a.scope(request.params.scopea)
        })
      })

      reply(list);
    },

    config: {
      validate: {
        params: joi.object().keys({
          scopea: joi.string().valid(...scopes.a),
          scopeb: joi.string().valid(...scopes.b)
        })
      }
    }
  })
}

export const destroy = (server, a, b) => {
  server.route({
    method: 'DELETE',
    path: `${prefix}/${a._singular}/{aid}/${b._plural}`,

    @error
    async handler(request, reply) {
      let where = _.omit(request.query, 'include');

      for (const key of Object.keys(where)) {
        try {
          where[key] = JSON.parse(where[key]);
        } catch (e) {
          //
        }
      }

      let list = await b.findAll({
        where,
        include: {
          model: a,
          where: {
            id: request.params.aid
          }
        }
      });

      await* list.map(instance => instance.destroy());

      reply(list);
    }
  })
}

export const destroyScope = (server, a, b) => {
  let scopes = Object.keys(b.options.scopes);

  server.route({
    method: 'DELETE',
    path: `${prefix}/${a._singular}/{aid}/${b._plural}/{scope}`,

    @error
    async handler(request, reply) {
      let where = _.omit(request.query, 'include');

      for (const key of Object.keys(where)) {
        try {
          where[key] = JSON.parse(where[key]);
        } catch (e) {
          //
        }
      }

      let list = await b.scope(request.params.scope).findAll({
        where,

        include: {
          model: a,
          where: {
            id: request.params.aid
          }
        }
      });

      await* list.map(instance => instance.destroy());

      reply(list);
    },

    config: {
      validate: {
        params: joi.object().keys({
          scope: joi.string().valid(...scopes),
          aid: joi.number().integer().required()
        })
      }
    }
  });
}

export const update = (server, a, b) => {
  server.route({
    method: 'PUT',
    path: `${prefix}/${a._singular}/{aid}/${b._plural}`,

    @error
    async handler(request, reply) {
      let list = await b.findOne({
        include: {
          model: a,
          where: {
            id: request.params.aid,

            ...request.query
          }
        }
      });

      await* list.map(instance => instance.update(request.payload));

      reply(list);
    }
  })
}
