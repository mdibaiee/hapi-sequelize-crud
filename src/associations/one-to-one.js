import joi from 'joi';
import error from '../error';
import _ from 'lodash';

let prefix;

export default (server, a, b, options) => {
  prefix = options.prefix;

  get(server, a, b);
  create(server, a, b);
  destroy(server, a, b);
  update(server, a, b);
}

export const get = (server, a, b) => {
  server.route({
    method: 'GET',
    path: `${prefix}/${a._singular}/{aid}/${b._singular}`,

    @error
    async handler(request, reply) {
      let include = [];
      if (request.query.include)
        include = [request.models[request.query.include]];

      let where = _.omit(request.query, 'include');

      let [instance] = await b.findAll({
        where,

        include: include.concat({
          model: a,
          where: {
            id: request.params.aid
          }
        })
      });

      reply(instance);
    }
  })
}

export const create = (server, a, b) => {
  server.route({
    method: 'POST',
    path: `${prefix}/${a._singular}/{id}/${b._singular}`,

    @error
    async handler(request, reply) {
      request.payload[a.name + 'Id'] = request.params.id;
      let instance = await request.models[b.name].create(request.payload);

      reply(instance);
    }
  })
}

export const destroy = (server, a, b) => {
  server.route({
    method: 'DELETE',
    path: `${prefix}/${a._singular}/{aid}/${b._singular}/{bid}`,

    @error
    async handler(request, reply) {
      let instance = await b.findOne({
        where: {
          id: request.params.bid
        },

        include: [{
          model: a,
          where: {
            id: request.params.aid
          }
        }]
      });

      await instance.destroy();

      reply(instance);
    }
  })
}

export const update = (server, a, b) => {
  server.route({
    method: 'PUT',
    path: `${prefix}/${a._singular}/{aid}/${b._singular}/{bid}`,

    @error
    async handler(request, reply) {
      let instance = await b.findOne({
        where: {
          id: request.params.bid
        },

        include: [{
          model: a,
          where: {
            id: request.params.aid
          }
        }]
      });

      await instance.update(request.payload);

      reply(instance);
    }
  })
}
