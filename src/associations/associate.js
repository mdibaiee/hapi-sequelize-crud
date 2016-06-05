import joi from 'joi';
import error from '../error';
import { capitalize } from 'lodash/string';
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
      let instanceb = await b.findOne({
        where: {
          id: request.params.bid
        }
      });

      let instancea = await a.findOne({
        where: {
          id: request.params.aid
        }
      });

      const fn = getMethod(instancea, names.b, false, 'add') ||
                 getMethod(instancea, names.b, false, 'set');
      await fn(instanceb);

      reply([instancea, instanceb]);
    },

    config: defaultConfig
  })
}
