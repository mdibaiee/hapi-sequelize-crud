import joi from 'joi';
import error from '../error';
import { capitalize } from 'lodash/string';
import { getMethod } from '../utils';

let prefix;

export default (server, a, b, names, options) => {
  prefix = options.prefix;

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

      const fna = getMethod(instancea, names.b, false, 'add') ||
                  getMethod(instancea, names.b, false, 'set');
      const fnb = getMethod(instanceb, names.a, false, 'add') ||
                  getMethod(instanceb, names.a, false, 'set');

      fnb(instancea);
      fna(instanceb);

      reply([instancea, instanceb]);
    }
  })
}
