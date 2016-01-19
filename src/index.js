import crud, { associations } from './crud';

const register = (server, options = {}, next) => {
  options.prefix = options.prefix || '';

	let db = server.plugins['hapi-sequelize'].db;
	let models = db.sequelize.models;

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
      let { associationType, source, target } = association;

      let sourceName = source.options.name;
      let targetName = target.options.name;

      target._plural = targetName.plural.toLowerCase();
      target._singular = targetName.singular.toLowerCase();

      let targetAssociations = target.associations[sourceName.plural] || target.associations[sourceName.singular];
      let sourceType = association.associationType,
          targetType = (targetAssociations || {}).associationType;

      try {
        if (sourceType === 'BelongsTo' && (targetType === 'BelongsTo' || !targetType)) {
          associations.oneToOne(server, source, target, options);
          associations.oneToOne(server, target, source, options);
        }

        if (sourceType === 'BelongsTo' && targetType === 'HasMany') {
          associations.oneToOne(server, source, target, options);
          associations.oneToOne(server, target, source, options);
          associations.oneToMany(server, target, source, options);
        }

        if (sourceType === 'BelongsToMany' && targetType === 'BelongsToMany') {
          associations.oneToOne(server, source, target, options);
          associations.oneToOne(server, target, source, options);

          associations.oneToMany(server, source, target, options);
          associations.oneToMany(server, target, source, options);
        }
      } catch(e) {
        // There might be conflicts in case of models associated with themselves and some other
        // rare cases.
      }
    }
  }

  next();
}

register.attributes = {
  pkg: require('../package.json')
}

export { register };
