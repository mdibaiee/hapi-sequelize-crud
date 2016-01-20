import joi from 'joi';
import error from '../error';
import { capitalize } from 'lodash/string';

let prefix;

export default (server, a, b, options) => {
  prefix = options.prefix;

  console.log(`${prefix}/associate/${a._singular}/{aid}/${b._singular}/{bid}`);
  server.route({
    method: 'GET',
    path: `${prefix}/associate/${a._singular}/{aid}/${b._singular}/{bid}`,

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

      let fna = (instancea['add' + b.name] || instancea['set' + b.name]).bind(instancea);
      let fnb = (instanceb['add' + a.name] || instanceb['set' + a.name]).bind(instanceb);
      await fna(instanceb);
      await fnb(instancea);

      reply(instancea);
    }
  })
}
