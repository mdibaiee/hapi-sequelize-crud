import joi from 'joi';
import error from '../error';

let prefix;

export default (server, a, b, options) => {
  prefix = options.prefix;

  list(server, a, b);
  destroy(server, a, b);
  update(server, a, b);
}

export const list = (server, a, b) => {
  server.route({
    method: 'GET',
    path: `${prefix}/${a._singular}/{aid}/${b._plural}`,

    @error
    async handler(request, reply) {
      let list = await request.models[b.name].findAll({
        where: {
          ...request.query,
          [a.name + 'Id']: request.params.aid
        }
      });

      reply(list);
    }
  })
}

export const destroy = (server, a, b) => {
  server.route({
    method: 'DELETE',
    path: `${prefix}/${a._singular}/{aid}/${b._plural}`,

    @error
    async handler(request, reply) {
      let list = await request.models[b.name].findAll({
        where: {
          ...request.query,
          [a.name + 'Id']: request.params.aid
        }
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
      let list = await request.models[b.name].findOne({
        where: {
          ...request.query,
          [a.name + 'Id']: request.params.aid
        }
      });

      await* list.map(instance => instance.update(request.payload));

      reply(list);
    }
  })
}
