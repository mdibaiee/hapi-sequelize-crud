if (!global._babelPolyfill) {
  require('babel-polyfill');
}

import crud, { associations } from './crud';
import url from 'url';
import qs from 'qs';

const register = (server, options = {}, next) => {
  options.prefix = options.prefix || '';
  options.name = options.name || 'db';

  const db = server.plugins['hapi-sequelize'][options.name];
  const models = db.sequelize.models;

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

  for (const modelName of Object.keys(models)) {
    const model = models[modelName];
    const { plural, singular } = model.options.name;
    model._plural = plural.toLowerCase();
    model._singular = singular.toLowerCase();
    model._Plural = plural;
    model._Singular = singular;

    // Join tables
    if (model.options.name.singular !== model.name) continue;


    for (const key of Object.keys(model.associations)) {
      const association = model.associations[key];
      const { source, target } = association;

      const sourceName = source.options.name;

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

      const targetAssociations = target.associations[sourceName.plural]
                               || target.associations[sourceName.singular];
      const sourceType = association.associationType,
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
      } catch (e) {
        // There might be conflicts in case of models associated with themselves and some other
        // rare cases.
      }
    }
  }

  // build the methods for each model now that we've defined all the
  // associations
  Object.keys(models).forEach((modelName) => {
    const model = models[modelName];
    crud(server, model, options);
  });

  next();
};

register.attributes = {
  pkg: require('../package.json'),
};

export { register };
