import test from 'ava';
import 'sinon-bluebird';
import setup from '../test/integration-setup.js';

const STATUS_OK = 200;
const STATUS_NOT_FOUND = 404;
const STATUS_BAD_REQUEST = 400;

setup(test);

test('where /player/1 {name: "Chard"}', async (t) => {
  const { server, instances } = t.context;
  const { player1 } = instances;
  const url = `/player/${player1.id}`;
  const method = 'PUT';
  const payload = { name: 'Chard' };

  const { result, statusCode } = await server.inject({ url, method, payload });
  t.is(statusCode, STATUS_OK);
  t.is(result.id, player1.id);
  t.is(result.name, payload.name);
});

test('not found /player/10 {name: "Chard"}', async (t) => {
  const { server } = t.context;
  // this doesn't exist in our fixtures
  const url = '/player/10';
  const method = 'PUT';
  const payload = { name: 'Chard' };

  const { statusCode } = await server.inject({ url, method, payload });
  t.is(statusCode, STATUS_NOT_FOUND);
});


test('no payload /player/1', async (t) => {
  const { server, instances } = t.context;
  const { player1 } = instances;
  const url = `/player/${player1.id}`;
  const method = 'PUT';

  const { statusCode } = await server.inject({ url, method });
  t.is(statusCode, STATUS_BAD_REQUEST);
});

test('not found /notamodel {name: "Chard"}', async (t) => {
  const { server } = t.context;
  const url = '/notamodel';
  const method = 'PUT';
  const payload = { name: 'Chard' };

  const { statusCode } = await server.inject({ url, method, payload });
  t.is(statusCode, STATUS_NOT_FOUND);
});
