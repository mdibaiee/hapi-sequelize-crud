import test from 'ava';
import 'sinon-bluebird';
import setup from '../test/integration-setup.js';

const STATUS_OK = 200;
const STATUS_NOT_FOUND = 404;

setup(test);

test('single result /team?name=Baseball', async (t) => {
  const { server, instances } = t.context;
  const { team1 } = instances;
  const path = `/team?name=${team1.name}`;

  const { result, statusCode } = await server.inject(path);
  t.is(statusCode, STATUS_OK);
  t.is(result.id, team1.id);
  t.is(result.name, team1.name);
});

test('no results /team?name=Baseball&id=2', async (t) => {
  const { server, instances } = t.context;
  const { team1 } = instances;
  // this doesn't exist in our fixtures
  const path = `/team?name=${team1.name}&id=2`;

  const { statusCode } = await server.inject(path);
  t.is(statusCode, STATUS_NOT_FOUND);
});

test('single result from list query /teams?name=Baseball', async (t) => {
  const { server, instances } = t.context;
  const { team1 } = instances;
  const path = `/team?name=${team1.name}`;

  const { result, statusCode } = await server.inject(path);
  t.is(statusCode, STATUS_OK);
  t.is(result.id, team1.id);
  t.is(result.name, team1.name);
});

test('multiple results from list query /players?teamId=1', async (t) => {
  const { server, instances } = t.context;
  const { team1, player1, player2 } = instances;
  const path = `/players?teamId=${team1.id}`;

  const { result, statusCode } = await server.inject(path);
  t.is(statusCode, STATUS_OK);
  const playerIds = result.map(({ id }) => id);
  t.truthy(playerIds.includes(player1.id));
  t.truthy(playerIds.includes(player2.id));
});

