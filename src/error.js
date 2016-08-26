import Boom from 'boom';

export default (target, key, descriptor) => {
  const fn = descriptor.value;

  descriptor.value = async (request, reply) => {
    try {
      await fn(request, reply);
    } catch (e) {
      if (e.original) {
        const { code, detail } = e.original;

        // pg error codes https://www.postgresql.org/docs/9.5/static/errcodes-appendix.html
        if (code && (code.startsWith('22') || code.startsWith('23'))) {
          const error = Boom.wrap(e, 406);

          // detail tends to be more specific information. So, if we have it, use.
          if (detail) {
            error.message += `: ${detail}`;
            error.reformat();
          }

          reply(error);
        }
      } else if (!e.isBoom) {
        const { message } = e;
        let err;

        if (e.name === 'SequelizeValidationError')
          err = Boom.badData(message);
        else if (e.name === 'SequelizeConnectionTimedOutError')
          err = Boom.gatewayTimeout(message);
        else if (e.name === 'SequelizeHostNotReachableError')
          err = Boom.serverUnavailable(message);
        else if (e.name === 'SequelizeUniqueConstraintError')
          err = Boom.conflict(message);
        else if (e.name === 'SequelizeForeignKeyConstraintError')
          err = Boom.expectationFailed(message);
        else if (e.name === 'SequelizeExclusionConstraintError')
          err = Boom.expectationFailed(message);
        else if (e.name === 'SequelizeConnectionError')
          err = Boom.badGateway(message);
        else err = Boom.badImplementation(message);

        reply(err);
      } else {
        reply(e);
      }
    }
  };

  return descriptor;
};
