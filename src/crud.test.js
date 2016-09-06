import test from 'ava';
import { list } from './crud.js';
import { stub } from 'sinon';
import 'sinon-bluebird';

const METHODS = {
  GET: 'GET',
};

test.beforeEach('setup server', (t) => {
  t.context.server = {
    route: stub(),
  };
});

test.beforeEach('setup model', (t) => {
  t.context.model = {
    findAll: stub(),
    _plural: 'models',
    _singular: 'model',
  };
});

test.beforeEach('setup request stub', (t) => {
  t.context.request = {
    query: {},
    payload: {},
    models: [t.context.model],
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
  const { server, model, request, reply } = t.context;
  const allModels = [{ id: 1 }, { id: 2 }];

  list({ server, model });
  const { handler } = server.route.args[0][0];
  model.findAll.resolves(allModels);

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

  t.is(
    response,
    allModels,
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
