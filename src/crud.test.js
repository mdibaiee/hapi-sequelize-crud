import test from 'ava';
import { list } from './crud.js';
import { stub } from 'sinon';
import uniqueId from 'lodash/uniqueId.js';
import 'sinon-bluebird';

const METHODS = {
  GET: 'GET',
};

test.beforeEach('setup server', (t) => {
  t.context.server = {
    route: stub(),
  };
});

const makeModel = () => {
  const id = uniqueId();
  return {
    findAll: stub(),
    _plural: 'models',
    _singular: 'model',
    toJSON: () => ({ id }),
    id,
  };
};

test.beforeEach('setup model', (t) => {
  t.context.model = makeModel();
});

test.beforeEach('setup models', (t) => {
  t.context.models = [t.context.model, makeModel()];
});

test.beforeEach('setup request stub', (t) => {
  t.context.request = {
    query: {},
    payload: {},
    models: t.context.models,
  };
});

test.beforeEach('setup reply stub', (t) => {
  t.context.reply = stub();
});

test('crud#list without prefix', (t) => {
  const { server, model } = t.context;

  list({ server, model });
  const { path } = server.route.args[0][0];

  t.falsy(
    path.includes('undefined'),
    'correctly sets the path without a prefix defined',
  );

  t.is(
    path,
    `/${model._plural}`,
    'the path sets to the plural model'
  );
});

test('crud#list with prefix', (t) => {
  const { server, model } = t.context;
  const prefix = '/v1';

  list({ server, model, prefix });
  const { path } = server.route.args[0][0];

  t.is(
    path,
    `${prefix}/${model._plural}`,
    'the path sets to the plural model with the prefix'
  );
});

test('crud#list method', (t) => {
  const { server, model } = t.context;

  list({ server, model });
  const { method } = server.route.args[0][0];

  t.is(
    method,
    METHODS.GET,
    `sets the method to ${METHODS.GET}`
  );
});

test('crud#list config', (t) => {
  const { server, model } = t.context;
  const userConfig = {};

  list({ server, model, config: userConfig });
  const { config } = server.route.args[0][0];

  t.is(
    config,
    userConfig,
    'sets the user config'
  );
});

test('crud#list handler', async (t) => {
  const { server, model, request, reply, models } = t.context;

  list({ server, model });
  const { handler } = server.route.args[0][0];
  model.findAll.resolves(models);

  try {
    await handler(request, reply);
  } catch (e) {
    t.ifError(e, 'does not error while handling');
  } finally {
    t.pass('does not error while handling');
  }

  t.truthy(
    reply.calledOnce
    , 'calls reply only once'
  );

  const response = reply.args[0][0];

  t.falsy(response instanceof Error, response);

  t.deepEqual(
    response,
    models.map(({ id }) => ({ id })),
    'responds with the list of models'
  );
});

test('crud#list handler if parseInclude errors', async (t) => {
  const { server, model, request, reply } = t.context;
  // we _want_ the error
  delete request.models;

  list({ server, model });
  const { handler } = server.route.args[0][0];

  await handler(request, reply);

  t.truthy(
    reply.calledOnce
    , 'calls reply only once'
  );

  const response = reply.args[0][0];

  t.truthy(
    response.isBoom,
    'responds with a Boom error'
  );
});

test('crud#list handler with limit', async (t) => {
  const { server, model, request, reply, models } = t.context;
  const { findAll } = model;

  // set the limit
  request.query.limit = 1;

  list({ server, model });
  const { handler } = server.route.args[0][0];
  model.findAll.resolves(models);

  try {
    await handler(request, reply);
  } catch (e) {
    t.ifError(e, 'does not error while handling');
  } finally {
    t.pass('does not error while handling');
  }

  t.truthy(
    reply.calledOnce
    , 'calls reply only once'
  );

  const response = reply.args[0][0];
  const findAllArgs = findAll.args[0][0];

  t.falsy(response instanceof Error, response);

  t.is(
    findAllArgs.limit,
    request.query.limit,
    'queries with the limit'
  );
});

test('crud#list handler with order', async (t) => {
  const { server, model, request, reply, models } = t.context;
  const { findAll } = model;

  // set the limit
  request.query.order = 'key';

  list({ server, model });
  const { handler } = server.route.args[0][0];
  model.findAll.resolves(models);

  try {
    await handler(request, reply);
  } catch (e) {
    t.ifError(e, 'does not error while handling');
  } finally {
    t.pass('does not error while handling');
  }

  t.truthy(
    reply.calledOnce
    , 'calls reply only once'
  );

  const response = reply.args[0][0];
  const findAllArgs = findAll.args[0][0];

  t.falsy(response instanceof Error, response);

  t.deepEqual(
    findAllArgs.order,
    [request.query.order],
    'queries with the order as an array b/c that\'s what sequelize wants'
  );
});
