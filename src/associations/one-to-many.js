import joi from 'joi';
import error from '../error';

let prefix;

export default (server, a, b, options) => {
  prefix = options.prefix;

  list(server, a, b);
  scope(server, a, b);
  scopeScope(server, a, b);
  destroy(server, a, b);
  update(server, a, b);
}

export const list = (server, a, b) => {
  server.route({
    method: 'GET',
    path: `${prefix}/${a._singular}/{aid}/${b._plural}`,

    @error
    async handler(request, reply) {
      let list = await b.findAll({
        include: [{
          model: a,
          where: {
            id: request.params.aid,

            ...request.query
          }
        }]
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
      let list = await b.scope(request.params.scope).findAll({
        include: [{
          model: a,
          where: {
            id: request.params.aid,

            ...request.query
          }
        }]
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
      let list = await b.scope(request.params.scopeb).findAll({
        include: [{
          model: a.scope(request.params.scopea),
          where: {
            ...request.query
          }
        }]
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
      let list = await b.findAll({
        include: [{
          model: a,
          where: {
            id: request.params.aid,

            ...request.query
          }
        }]
      });

      await* list.map(instance => instance.destroy());

      reply();
    }
  })
}

export const update = (server, a, b) => {
  server.route({
    method: 'PUT',
    path: `${prefix}/${a._singular}/{aid}/${b._plural}`,

    @error
    async handler(request, reply) {
      let list = await b.findOne({
        include: [{
          model: a,
          where: {
            id: request.params.aid,

            ...request.query
          }
        }]
      });

      await* list.map(instance => instance.update(request.payload));

      reply(list);
    }
  })
}
