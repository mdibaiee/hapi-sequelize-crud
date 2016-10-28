import test from 'ava';
import 'sinon-bluebird';
import setup from '../test/integration-setup.js';

const STATUS_OK = 200;
const STATUS_NOT_FOUND = 404;
const STATUS_BAD_REQUEST = 400;

setup(test);

test('/players/returnsOne', async (t) => {
  const { server, instances } = t.context;
  const { player1 } = instances;
  const url = '/players/returnsOne';
  const method = 'GET';

  const { result, statusCode } = await server.inject({ url, method });
  t.is(statusCode, STATUS_OK);
  t.is(result.length, 1);
  t.truthy(result[0].id, player1.id);
});

test('/players/returnsNone', async (t) => {
  const { server } = t.context;
  const url = '/players/returnsNone';
  const method = 'GET';

  const { statusCode } = await server.inject({ url, method });
  t.is(statusCode, STATUS_NOT_FOUND);
});

test('invalid scope /players/invalid', async (t) => {
  const { server } = t.context;
  // this doesn't exist in our fixtures
  const url = '/players/invalid';
  const method = 'GET';

  const { statusCode } = await server.inject({ url, method });
  t.is(statusCode, STATUS_BAD_REQUEST);
});
