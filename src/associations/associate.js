import error from '../error';
import { getMethod } from '../utils';

let prefix;
let defaultConfig;

export default (server, a, b, names, options) => {
  prefix = options.prefix;
  defaultConfig = options.defaultConfig;

  server.route({
    method: 'GET',
    path: `${prefix}/associate/${names.a.singular}/{aid}/${names.b.singular}/{bid}`,

    @error
    async handler(request, reply) {
      const instanceb = await b.findOne({
        where: {
          id: request.params.bid,
        },
      });

      const instancea = await a.findOne({
        where: {
          id: request.params.aid,
        },
      });

      const fn = getMethod(instancea, names.b, false, 'add') ||
                 getMethod(instancea, names.b, false, 'set');
      await fn(instanceb);

      reply([instancea, instanceb]);
    },

    config: defaultConfig,
  });
};
