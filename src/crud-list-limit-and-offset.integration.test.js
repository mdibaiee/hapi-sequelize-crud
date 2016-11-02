import test from 'ava';
import 'sinon-bluebird';
import setup from '../test/integration-setup.js';

const STATUS_OK = 200;
const STATUS_NOT_FOUND = 404;

setup(test);

test('/players?limit=2', async (t) => {
  const { server } = t.context;
  const limit = 2;
  const url = `/players?limit=${limit}`;
  const method = 'GET';

  const { result, statusCode } = await server.inject({ url, method });
  t.is(statusCode, STATUS_OK);
  t.is(result.length, limit);
});

test('/players?limit=2&offset=1', async (t) => {
  const { server } = t.context;
  const limit = 2;
  const url = `/players?limit=${limit}&offset=1`;
  const method = 'GET';

  const { result, statusCode } = await server.inject({ url, method });
  t.is(statusCode, STATUS_OK);
  t.is(result.length, limit);
});

test('/players?limit=2&offset=2', async (t) => {
  const { server } = t.context;
  const limit = 2;
  const url = `/players?limit=${limit}&offset=2`;
  const method = 'GET';

  const { result, statusCode } = await server.inject({ url, method });
  t.is(statusCode, STATUS_OK);
  t.is(result.length, 1, 'with only 3 players, only get 1 back with an offset of 2');
});

test('/players?limit=2&offset=20', async (t) => {
  const { server } = t.context;
  const limit = 2;
  const url = `/players?limit=${limit}&offset=20`;
  const method = 'GET';

  const { statusCode } = await server.inject({ url, method });
  t.is(statusCode, STATUS_NOT_FOUND, 'with a offset/limit greater than the data, returns a 404');
});

test('scope /players/returnsAll?limit=2', async (t) => {
  const { server } = t.context;
  const limit = 2;
  const url = `/players/returnsAll?limit=${limit}`;
  const method = 'GET';

  const { result, statusCode } = await server.inject({ url, method });
  t.is(statusCode, STATUS_OK);
  t.is(result.length, limit);
});

test('scope /players/returnsAll?limit=2&offset=1', async (t) => {
  const { server } = t.context;
  const limit = 2;
  const url = `/players/returnsAll?limit=${limit}&offset=1`;
  const method = 'GET';

  const { result, statusCode } = await server.inject({ url, method });
  t.is(statusCode, STATUS_OK);
  t.is(result.length, limit);
});

test('scope /players/returnsAll?limit=2&offset=2', async (t) => {
  const { server } = t.context;
  const limit = 2;
  const url = `/players/returnsAll?limit=${limit}&offset=2`;
  const method = 'GET';

  const { result, statusCode } = await server.inject({ url, method });
  t.is(statusCode, STATUS_OK);
  t.is(result.length, 1, 'with only 3 players, only get 1 back with an offset of 2');
});

test('scope /players/returnsAll?limit=2&offset=20', async (t) => {
  const { server } = t.context;
  const limit = 2;
  const url = `/players/returnsAll?limit=${limit}&offset=20`;
  const method = 'GET';

  const { statusCode } = await server.inject({ url, method });
  t.is(statusCode, STATUS_NOT_FOUND, 'with a offset/limit greater than the data, returns a 404');
});
