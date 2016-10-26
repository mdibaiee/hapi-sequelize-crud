import test from 'ava';
import 'sinon-bluebird';
import setup from '../test/integration-setup.js';

setup(test);

test('belongsTo /team?include=city', async (t) => {
  const { server, instances } = t.context;
  const { team1, city1 } = instances;
  const path = `/team/${team1.id}?include=city`;

  const { result, response } = await server.inject(path);
  t.falsy(response instanceof Error);
  t.is(result.id, team1.id);
  t.is(result.City.id, city1.id);
});

test('belongsTo /team?include=cities', async (t) => {
  const { server, instances } = t.context;
  const { team1, city1 } = instances;
  const path = `/team/${team1.id}?include=cities`;

  const { result, response } = await server.inject(path);
  t.falsy(response instanceof Error);
  t.is(result.id, team1.id);
  t.is(result.City.id, city1.id);
});

test('hasMany /team?include=player', async (t) => {
  const { server, instances } = t.context;
  const { team1, player1, player2 } = instances;
  const path = `/team/${team1.id}?include=player`;

  const { result, response } = await server.inject(path);
  t.falsy(response instanceof Error);
  t.is(result.id, team1.id);

  const playerIds = result.Players.map(({ id }) => id);
  t.truthy(playerIds.includes(player1.id));
  t.truthy(playerIds.includes(player2.id));
});

test('hasMany /team?include=players', async (t) => {
  const { server, instances } = t.context;
  const { team1, player1, player2 } = instances;
  const path = `/team/${team1.id}?include=players`;

  const { result, response } = await server.inject(path);
  t.falsy(response instanceof Error);
  t.is(result.id, team1.id);

  const playerIds = result.Players.map(({ id }) => id);
  t.truthy(playerIds.includes(player1.id));
  t.truthy(playerIds.includes(player2.id));
});

test('multiple includes /team?include=players&include=city', async (t) => {
  const { server, instances } = t.context;
  const { team1, player1, player2, city1 } = instances;
  const path = `/team/${team1.id}?include=players&include=city`;

  const { result, response } = await server.inject(path);
  t.falsy(response instanceof Error);
  t.is(result.id, team1.id);

  const playerIds = result.Players.map(({ id }) => id);
  t.truthy(playerIds.includes(player1.id));
  t.truthy(playerIds.includes(player2.id));
  t.is(result.City.id, city1.id);
});

test('multiple includes /team?include[]=players&include[]=city', async (t) => {
  const { server, instances } = t.context;
  const { team1, player1, player2, city1 } = instances;
  const path = `/team/${team1.id}?include[]=players&include[]=city`;

  const { result, response } = await server.inject(path);
  t.falsy(response instanceof Error);
  t.is(result.id, team1.id);

  const playerIds = result.Players.map(({ id }) => id);
  t.truthy(playerIds.includes(player1.id));
  t.truthy(playerIds.includes(player2.id));
  t.is(result.City.id, city1.id);
});
