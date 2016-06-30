export default (target, key, descriptor) => {
  let fn = descriptor.value;

  descriptor.value = async (request, reply) => {
    try {
      await fn(request, reply);
    } catch(e) {
      console.error(e);
      reply(e);
    }
  };

  return descriptor;
};
