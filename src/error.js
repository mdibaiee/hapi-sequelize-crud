export default (target, key, descriptor) => {
  let fn = descriptor.value;

  descriptor.value = (request, reply) => {
    try {
      fn(request, reply);
    } catch(e) {
      reply(e);
    }
  }

  return descriptor;
}
