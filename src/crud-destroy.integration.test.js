import test from 'ava';
import 'sinon-bluebird';
import setup from '../test/integration-setup.js';

const STATUS_OK = 200;
const STATUS_NOT_FOUND = 404;
const STATUS_BAD_REQUEST = 400;

setup(test);

test('destroy where /player?name=Baseball', async (t) => {
  const { server, instances, sequelize: { models: { Player } } } = t.context;
  const { player1, player2 } = instances;
  const url = `/player?name=${player1.name}`;
  const method = 'DELETE';

  const presentPlayer = await Player.findById(player1.id);
  t.truthy(presentPlayer);

  const { result, statusCode } = await server.inject({ url, method });
  t.is(statusCode, STATUS_OK);
  t.is(result.id, player1.id);

  const deletedPlayer = await Player.findById(player1.id);
  t.falsy(deletedPlayer);
  const stillTherePlayer = await Player.findById(player2.id);
  t.truthy(stillTherePlayer);
});

test('destroyAll where /players?name=Baseball', async (t) => {
  const { server, instances, sequelize: { models: { Player } } } = t.context;
  const { player1, player2 } = instances;
  const url = `/players?name=${player1.name}`;
  const method = 'DELETE';

  const presentPlayer = await Player.findById(player1.id);
  t.truthy(presentPlayer);

  const { result, statusCode } = await server.inject({ url, method });
  t.is(statusCode, STATUS_OK);
  t.is(result.id, player1.id);

  const deletedPlayer = await Player.findById(player1.id);
  t.falsy(deletedPlayer);
  const stillTherePlayer = await Player.findById(player2.id);
  t.truthy(stillTherePlayer);
});

test('destroyAll /players', async (t) => {
  const { server, instances, sequelize: { models: { Player } } } = t.context;
  const { player1, player2 } = instances;
  const url = '/players';
  const method = 'DELETE';

  const presentPlayers = await Player.findAll();
  const playerIds = presentPlayers.map(({ id }) => id);
  t.truthy(playerIds.includes(player1.id));
  t.truthy(playerIds.includes(player2.id));

  const { result, statusCode } = await server.inject({ url, method });
  t.is(statusCode, STATUS_OK);
  const resultPlayerIds = result.map(({ id }) => id);
  t.truthy(resultPlayerIds.includes(player1.id));
  t.truthy(resultPlayerIds.includes(player2.id));

  const deletedPlayers = await Player.findAll();
  t.is(deletedPlayers.length, 0);
});

test('destroy not found /player/10', async (t) => {
  const { server, instances, sequelize: { models: { Player } } } = t.context;
  const { player1, player2 } = instances;
  // this doesn't exist in our fixtures
  const url = '/player/10';
  const method = 'DELETE';

  const presentPlayers = await Player.findAll();
  const playerIds = presentPlayers.map(({ id }) => id);
  t.truthy(playerIds.includes(player1.id));
  t.truthy(playerIds.includes(player2.id));

  const { statusCode } = await server.inject({ url, method });
  t.is(statusCode, STATUS_NOT_FOUND);

  const nonDeletedPlayers = await Player.findAll();
  t.is(nonDeletedPlayers.length, presentPlayers.length);
});

test('destroyAll not found /players?name=no', async (t) => {
  const { server, instances, sequelize: { models: { Player } } } = t.context;
  const { player1, player2 } = instances;
  // this doesn't exist in our fixtures
  const url = '/players?name=no';
  const method = 'DELETE';

  const presentPlayers = await Player.findAll();
  const playerIds = presentPlayers.map(({ id }) => id);
  t.truthy(playerIds.includes(player1.id));
  t.truthy(playerIds.includes(player2.id));

  const { statusCode } = await server.inject({ url, method });
  t.is(statusCode, STATUS_NOT_FOUND);

  const nonDeletedPlayers = await Player.findAll();
  t.is(nonDeletedPlayers.length, presentPlayers.length);
});

test('not found /notamodel', async (t) => {
  const { server } = t.context;
  const url = '/notamodel';
  const method = 'DELETE';

  const { statusCode } = await server.inject({ url, method });
  t.is(statusCode, STATUS_NOT_FOUND);
});

test('destroyScope /players/returnsOne', async (t) => {
  const { server, instances, sequelize: { models: { Player } } } = t.context;
  const { player1, player2 } = instances;
  // this doesn't exist in our fixtures
  const url = '/players/returnsOne';
  const method = 'DELETE';

  const presentPlayers = await Player.findAll();
  const playerIds = presentPlayers.map(({ id }) => id);
  t.truthy(playerIds.includes(player1.id));
  t.truthy(playerIds.includes(player2.id));

  const { result, statusCode } = await server.inject({ url, method });
  t.is(statusCode, STATUS_OK);
  t.is(result.id, player1.id);

  const nonDeletedPlayers = await Player.findAll();
  t.is(nonDeletedPlayers.length, presentPlayers.length - 1);
});

test('destroyScope /players/returnsNone', async (t) => {
  const { server, instances, sequelize: { models: { Player } } } = t.context;
  const { player1, player2 } = instances;
  // this doesn't exist in our fixtures
  const url = '/players/returnsNone';
  const method = 'DELETE';

  const presentPlayers = await Player.findAll();
  const playerIds = presentPlayers.map(({ id }) => id);
  t.truthy(playerIds.includes(player1.id));
  t.truthy(playerIds.includes(player2.id));

  const { statusCode } = await server.inject({ url, method });
  t.is(statusCode, STATUS_NOT_FOUND);

  const nonDeletedPlayers = await Player.findAll();
  const nonDeletedPlayerIds = nonDeletedPlayers.map(({ id }) => id);
  t.truthy(nonDeletedPlayerIds.includes(player1.id));
  t.truthy(nonDeletedPlayerIds.includes(player2.id));
});

test('destroyScope invalid scope /players/invalid', async (t) => {
  const { server, instances, sequelize: { models: { Player } } } = t.context;
  const { player1, player2 } = instances;
  // this doesn't exist in our fixtures
  const url = '/players/invalid';
  const method = 'DELETE';

  const presentPlayers = await Player.findAll();
  const playerIds = presentPlayers.map(({ id }) => id);
  t.truthy(playerIds.includes(player1.id));
  t.truthy(playerIds.includes(player2.id));

  const { statusCode } = await server.inject({ url, method });
  t.is(statusCode, STATUS_BAD_REQUEST);

  const nonDeletedPlayers = await Player.findAll();
  const nonDeletedPlayerIds = nonDeletedPlayers.map(({ id }) => id);
  t.truthy(nonDeletedPlayerIds.includes(player1.id));
  t.truthy(nonDeletedPlayerIds.includes(player2.id));
});
