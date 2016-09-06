import test from 'ava';
import joi from 'joi';
import
  getConfigForMethod, {
  whereMethods,
  includeMethods,
  payloadMethods,
  sequelizeOperators,
} from './get-config-for-method.js';

test.beforeEach((t) => {
  t.context.attributeValidation = {
    myKey: joi.any(),
  };

  t.context.associationValidation = {
    include: ['MyModel'],
  };

  t.context.config = {
    cors: {},
  };
});

test('get-config-for-method validate.query seqeulizeOperators', (t) => {
  whereMethods.forEach((method) => {
    const configForMethod = getConfigForMethod({ method });
    const { query } = configForMethod.validate;
    const configForMethodValidateQueryKeys = Object.keys(query);

    t.truthy(
      query,
      `applies query validation for ${method}`
    );

    Object.keys(sequelizeOperators).forEach((operator) => {
      t.truthy(
        configForMethodValidateQueryKeys.includes(operator),
        `applies sequelize operator "${operator}" in validate.where for ${method}`
      );
    });
  });
});

test('get-config-for-method validate.query attributeValidation', (t) => {
  const { attributeValidation } = t.context;

  whereMethods.forEach((method) => {
    const configForMethod = getConfigForMethod({ method, attributeValidation });
    const { query } = configForMethod.validate;

    Object.keys(attributeValidation).forEach((key) => {
      t.truthy(
        query[key]
        , `applies attributeValidation (${key}) to validate.query`
      );
    });
  });
});

test('get-config-for-method validate.query associationValidation', (t) => {
  const { attributeValidation, associationValidation } = t.context;

  includeMethods.forEach((method) => {
    const configForMethod = getConfigForMethod({
      method,
      attributeValidation,
      associationValidation,
    });
    const { query } = configForMethod.validate;

    Object.keys(attributeValidation).forEach((key) => {
      t.truthy(
        query[key]
        , `applies attributeValidation (${key}) to validate.query when include should be applied`
      );
    });

    Object.keys(associationValidation).forEach((key) => {
      t.truthy(
        query[key]
        , `applies associationValidation (${key}) to validate.query when include should be applied`
      );
    });
  });
});

test('get-config-for-method validate.payload associationValidation', (t) => {
  const { attributeValidation } = t.context;

  payloadMethods.forEach((method) => {
    const configForMethod = getConfigForMethod({ method, attributeValidation });
    const { payload } = configForMethod.validate;

    Object.keys(attributeValidation).forEach((key) => {
      t.truthy(
        payload[key]
        , `applies attributeValidation (${key}) to validate.payload`
      );
    });
  });
});

test('get-config-for-method does not modify initial config on multiple passes', (t) => {
  const { config } = t.context;
  const originalConfig = { ...config };

  whereMethods.forEach((method) => {
    getConfigForMethod({ method, config });
  });

  t.deepEqual(
    config
    , originalConfig
    , 'does not modify the original config object'
  );
});
