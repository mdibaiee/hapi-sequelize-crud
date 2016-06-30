if (!global._babelPolyfill) {
  require('babel/polyfill');
}

import crud, { associations } from './crud';
import url from 'url';
import qs from 'qs';

const register = (server, options = {}, next) => {
  options.prefix = options.prefix || '';

	let db = server.plugins['hapi-sequelize'].db;
	let models = db.sequelize.models;

  const onRequest = function (request, reply) {
    const uri = request.raw.req.url;
    const parsed = url.parse(uri, false);
    parsed.query = qs.parse(parsed.query);
    request.setUrl(parsed);

    return reply.continue();
  };

  server.ext({
    type: 'onRequest',
    method: onRequest,
  });

  for (let modelName of Object.keys(models)) {
    let model = models[modelName];
    let { plural, singular } = model.options.name;
    model._plural = plural.toLowerCase();
    model._singular = singular.toLowerCase();

    // Join tables
    if (model.options.name.singular !== model.name) continue;

    crud(server, model, options);

    for (let key of Object.keys(model.associations)) {
      let association = model.associations[key];
      let { source, target } = association;

      let sourceName = source.options.name;

      const names = (rev) => {
        const arr =  [{
            plural: sourceName.plural.toLowerCase(),
            singular: sourceName.singular.toLowerCase(),
            original: sourceName,
          }, {
            plural: association.options.name.plural.toLowerCase(),
            singular: association.options.name.singular.toLowerCase(),
            original: association.options.name,
          }];

        return rev ? { b: arr[0], a: arr[1] } : { a: arr[0], b: arr[1] };
      };

      let targetAssociations = target.associations[sourceName.plural] || target.associations[sourceName.singular];
      let sourceType = association.associationType,
          targetType = (targetAssociations || {}).associationType;

      try {
        if (sourceType === 'BelongsTo' && (targetType === 'BelongsTo' || !targetType)) {
          associations.oneToOne(server, source, target, names(), options);
          associations.oneToOne(server, target, source, names(1), options);
        }

        if (sourceType === 'BelongsTo' && targetType === 'HasMany') {
          associations.oneToOne(server, source, target, names(), options);
          associations.oneToOne(server, target, source, names(1), options);
          associations.oneToMany(server, target, source, names(1), options);
        }

        if (sourceType === 'BelongsToMany' && targetType === 'BelongsToMany') {
          associations.oneToOne(server, source, target, names(), options);
          associations.oneToOne(server, target, source, names(1), options);

          associations.oneToMany(server, source, target, names(), options);
          associations.oneToMany(server, target, source, names(1), options);
        }

        associations.associate(server, source, target, names(), options);
        associations.associate(server, target, source, names(1), options);
      } catch(e) {
        // There might be conflicts in case of models associated with themselves and some other
        // rare cases.
      }
    }
  }

  next();
};

register.attributes = {
  pkg: require('../package.json'),
};

export { register };
