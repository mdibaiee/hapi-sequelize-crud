import { wrap } from 'boom';

export default (target, key, descriptor) => {
  const fn = descriptor.value;

  descriptor.value = async (request, reply) => {
    try {
      await fn(request, reply);
    } catch (e) {
      const { code, detail } = e.original;

      // pg error codes https://www.postgresql.org/docs/9.5/static/errcodes-appendix.html
      if (code && (code.startsWith('22') || code.startsWith('23'))) {
        const error = wrap(e, 406);

        // detail tends to be more specific information. So, if we have it, use.
        if (detail) {
          error.message += `: ${detail}`;
          error.reformat();
        }

        reply(error);
      } else {
        reply(wrap(e));
      }
    }
  };

  return descriptor;
};
