import test from 'ava';
import 'sinon-bluebird';
import setup from '../test/integration-setup.js';

const STATUS_OK = 200;
const STATUS_NOT_FOUND = 404;
const STATUS_BAD_REQUEST = 400;

setup(test);

test('where /player {name: "Chard"}', async (t) => {
  const { server, sequelize: { models: { Player } } } = t.context;
  const url = '/player';
  const method = 'POST';
  const payload = { name: 'Chard' };

  const notPresentPlayer = await Player.findOne({ where: payload });
  t.falsy(notPresentPlayer);

  const { result, statusCode } = await server.inject({ url, method, payload });
  t.is(statusCode, STATUS_OK);
  t.truthy(result.id);
  t.is(result.name, payload.name);
});

test('not found /notamodel {name: "Chard"}', async (t) => {
  const { server } = t.context;
  const url = '/notamodel';
  const method = 'POST';
  const payload = { name: 'Chard' };

  const { statusCode } = await server.inject({ url, method, payload });
  t.is(statusCode, STATUS_NOT_FOUND);
});


test('no payload /player/1', async (t) => {
  const { server } = t.context;
  const url = '/player';
  const method = 'POST';

  const { statusCode } = await server.inject({ url, method });
  t.is(statusCode, STATUS_BAD_REQUEST);
});
