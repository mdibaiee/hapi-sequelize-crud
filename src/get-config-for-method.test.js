import test from 'ava';
import joi from 'joi';
import
  getConfigForMethod, {
  whereMethods,
  includeMethods,
  payloadMethods,
  scopeParamsMethods,
  idParamsMethods,
  sequelizeOperators,
} from './get-config-for-method.js';

test.beforeEach((t) => {
  t.context.models = ['MyModel'];

  t.context.scopes = ['aScope'];

  t.context.attributeValidation = {
    myKey: joi.any(),
  };

  t.context.associationValidation = {
    include: joi.array().items(joi.string().valid(t.context.models)),
  };

  t.context.config = {
    cors: {},
  };
});

test('validate.query seqeulizeOperators', (t) => {
  whereMethods.forEach((method) => {
    const configForMethod = getConfigForMethod({ method });
    const { query } = configForMethod.validate;

    t.truthy(
      query,
      `applies query validation for ${method}`
    );

    Object.keys(sequelizeOperators).forEach((operator) => {
      t.ifError(
        query.validate({ [operator]: true }).error
        , `applies sequelize operator "${operator}" in validate.where for ${method}`
      );
    });

    t.truthy(
      query.validate({ notAThing: true }).error
      , 'errors on a non-valid key'
    );
  });
});

test('validate.query attributeValidation', (t) => {
  const { attributeValidation } = t.context;

  whereMethods.forEach((method) => {
    const configForMethod = getConfigForMethod({ method, attributeValidation });
    const { query } = configForMethod.validate;

    Object.keys(attributeValidation).forEach((key) => {
      t.ifError(
        query.validate({ [key]: true }).error
        , `applies attributeValidation (${key}) to validate.query`
      );
    });

    t.truthy(
      query.validate({ notAThing: true }).error
      , 'errors on a non-valid key'
    );
  });
});

test('query attributeValidation w/ config as plain object', (t) => {
  const { attributeValidation } = t.context;
  const config = {
    validate: {
      query: {
        aKey: joi.boolean(),
      },
    },
  };

  whereMethods.forEach((method) => {
    const configForMethod = getConfigForMethod({
      method,
      attributeValidation,
      config,
    });
    const { query } = configForMethod.validate;

    const keys = [
      ...Object.keys(attributeValidation),
      ...Object.keys(config.validate.query),
    ];

    keys.forEach((key) => {
      t.ifError(
        query.validate({ [key]: true }).error
        , `applies ${key} to validate.query`
      );
    });

    t.truthy(
      query.validate({ notAThing: true }).error
      , 'errors on a non-valid key'
    );
  });
});

test('query attributeValidation w/ config as joi object', (t) => {
  const { attributeValidation } = t.context;
  const queryKeys = {
    aKey: joi.boolean(),
  };
  const config = {
    validate: {
      query: joi.object().keys(queryKeys),
    },
  };

  whereMethods.forEach((method) => {
    const configForMethod = getConfigForMethod({
      method,
      attributeValidation,
      config,
    });
    const { query } = configForMethod.validate;

    const keys = [
      ...Object.keys(attributeValidation),
      ...Object.keys(queryKeys),
    ];

    keys.forEach((key) => {
      t.ifError(
        query.validate({ [key]: true }).error
        , `applies ${key} to validate.query`
      );
    });

    t.truthy(
      query.validate({ notAThing: true }).error
      , 'errors on a non-valid key'
    );
  });
});

test('validate.query associationValidation', (t) => {
  const { attributeValidation, associationValidation, models } = t.context;

  includeMethods.forEach((method) => {
    const configForMethod = getConfigForMethod({
      method,
      attributeValidation,
      associationValidation,
    });
    const { query } = configForMethod.validate;

    Object.keys(attributeValidation).forEach((key) => {
      t.ifError(
        query.validate({ [key]: true }).error
        , `applies attributeValidation (${key}) to validate.query when include should be applied`
      );
    });

    Object.keys(associationValidation).forEach((key) => {
      t.ifError(
        query.validate({ [key]: models }).error
        , `applies associationValidation (${key}) to validate.query when include should be applied`
      );
    });

    t.truthy(
      query.validate({ notAThing: true }).error
      , 'errors on a non-valid key'
    );
  });
});

test('query associationValidation w/ config as plain object', (t) => {
  const { associationValidation, models } = t.context;
  const config = {
    validate: {
      query: {
        aKey: joi.boolean(),
      },
    },
  };

  includeMethods.forEach((method) => {
    const configForMethod = getConfigForMethod({
      method,
      associationValidation,
      config,
    });
    const { query } = configForMethod.validate;

    Object.keys(associationValidation).forEach((key) => {
      t.ifError(
        query.validate({ [key]: models }).error
        , `applies ${key} to validate.query`
      );
    });

    Object.keys(config.validate.query).forEach((key) => {
      t.ifError(
        query.validate({ [key]: true }).error
        , `applies ${key} to validate.query`
      );
    });

    t.truthy(
      query.validate({ notAThing: true }).error
      , 'errors on a non-valid key'
    );
  });
});

test('query associationValidation w/ config as joi object', (t) => {
  const { associationValidation, models } = t.context;
  const queryKeys = {
    aKey: joi.boolean(),
  };
  const config = {
    validate: {
      query: joi.object().keys(queryKeys),
    },
  };

  includeMethods.forEach((method) => {
    const configForMethod = getConfigForMethod({
      method,
      associationValidation,
      config,
    });
    const { query } = configForMethod.validate;

    Object.keys(associationValidation).forEach((key) => {
      t.ifError(
        query.validate({ [key]: models }).error
        , `applies ${key} to validate.query`
      );
    });

    Object.keys(queryKeys).forEach((key) => {
      t.ifError(
        query.validate({ [key]: true }).error
        , `applies ${key} to validate.query`
      );
    });

    t.truthy(
      query.validate({ notAThing: true }).error
      , 'errors on a non-valid key'
    );
  });
});

test('validate.payload associationValidation', (t) => {
  const { attributeValidation } = t.context;

  payloadMethods.forEach((method) => {
    const configForMethod = getConfigForMethod({ method, attributeValidation });
    const { payload } = configForMethod.validate;

    Object.keys(attributeValidation).forEach((key) => {
      t.ifError(
        payload.validate({ [key]: true }).error
        , `applies attributeValidation (${key}) to validate.payload`
      );
    });

    t.truthy(
      payload.validate({ notAThing: true }).error
      , 'errors on a non-valid key'
    );
  });
});

test('payload attributeValidation w/ config as plain object', (t) => {
  const { attributeValidation } = t.context;
  const config = {
    validate: {
      payload: {
        aKey: joi.boolean(),
      },
    },
  };

  payloadMethods.forEach((method) => {
    const configForMethod = getConfigForMethod({
      method,
      attributeValidation,
      config,
    });
    const { payload } = configForMethod.validate;

    const keys = [
      ...Object.keys(attributeValidation),
      ...Object.keys(config.validate.payload),
    ];

    keys.forEach((key) => {
      t.ifError(
        payload.validate({ [key]: true }).error
        , `applies ${key} to validate.payload`
      );
    });

    t.truthy(
      payload.validate({ notAThing: true }).error
      , 'errors on a non-valid key'
    );
  });
});

test('payload attributeValidation w/ config as joi object', (t) => {
  const { attributeValidation } = t.context;
  const payloadKeys = {
    aKey: joi.boolean(),
  };
  const config = {
    validate: {
      payload: joi.object().keys(payloadKeys),
    },
  };

  payloadMethods.forEach((method) => {
    const configForMethod = getConfigForMethod({
      method,
      attributeValidation,
      config,
    });
    const { payload } = configForMethod.validate;

    const keys = [
      ...Object.keys(attributeValidation),
      ...Object.keys(payloadKeys),
    ];

    keys.forEach((key) => {
      t.ifError(
        payload.validate({ [key]: true }).error
        , `applies ${key} to validate.payload`
      );
    });

    t.truthy(
      payload.validate({ notAThing: true }).error
      , 'errors on a non-valid key'
    );
  });
});

test('validate.params scopeParamsMethods', (t) => {
  const { scopes } = t.context;

  scopeParamsMethods.forEach((method) => {
    const configForMethod = getConfigForMethod({ method, scopes });
    const { params } = configForMethod.validate;

    scopes.forEach((key) => {
      t.ifError(
        params.validate({ scope: key }).error
        , `applies "scope: ${key}" to validate.params`
      );
    });

    t.truthy(
      params.validate({ scope: 'notAthing' }).error
      , 'errors on a non-valid key'
    );
  });
});

test('params scopeParamsMethods w/ config as plain object', (t) => {
  const { scopes } = t.context;
  const config = {
    validate: {
      params: {
        aKey: joi.boolean(),
      },
    },
  };

  scopeParamsMethods.forEach((method) => {
    const configForMethod = getConfigForMethod({
      method,
      scopes,
      config,
    });
    const { params } = configForMethod.validate;

    scopes.forEach((key) => {
      t.ifError(
        params.validate({ scope: key }).error
        , `applies "scope: ${key}" to validate.params`
      );
    });

    Object.keys(config.validate.params).forEach((key) => {
      t.ifError(
        params.validate({ [key]: true }).error
        , `applies ${key} to validate.params`
      );
    });

    t.truthy(
      params.validate({ notAThing: true }).error
      , 'errors on a non-valid key'
    );
  });
});

test('params scopeParamsMethods w/ config as joi object', (t) => {
  const { scopes } = t.context;
  const paramsKeys = {
    aKey: joi.boolean(),
  };
  const config = {
    validate: {
      params: joi.object().keys(paramsKeys),
    },
  };

  scopeParamsMethods.forEach((method) => {
    const configForMethod = getConfigForMethod({
      method,
      scopes,
      config,
    });
    const { params } = configForMethod.validate;

    scopes.forEach((key) => {
      t.ifError(
        params.validate({ scope: key }).error
        , `applies "scope: ${key}" to validate.params`
      );
    });

    Object.keys(paramsKeys).forEach((key) => {
      t.ifError(
        params.validate({ [key]: true }).error
        , `applies ${key} to validate.params`
      );
    });

    t.truthy(
      params.validate({ notAThing: true }).error
      , 'errors on a non-valid key'
    );
  });
});


test('validate.payload idParamsMethods', (t) => {
  idParamsMethods.forEach((method) => {
    const configForMethod = getConfigForMethod({ method });
    const { params } = configForMethod.validate;

    t.ifError(
      params.validate({ id: 'aThing' }).error
      , 'applies id to validate.params'
    );
  });
});

test('does not modify initial config on multiple passes', (t) => {
  const { config } = t.context;
  const originalConfig = { ...config };

  whereMethods.forEach((method) => {
    getConfigForMethod({ method, ...t.context });
  });

  t.deepEqual(
    config
    , originalConfig
    , 'does not modify the original config object'
  );
});
