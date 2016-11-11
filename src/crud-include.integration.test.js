import test from 'ava';
import 'sinon-bluebird';
import setup from '../test/integration-setup.js';

const STATUS_OK = 200;

setup(test);

test('belongsTo /team?include=city', async(t) => {
  const { server, instances } = t.context;
  const { team1, city1 } = instances;
  const path = `/team/${team1.id}?include=city`;

  const { result, statusCode } = await server.inject(path);
  t.is(statusCode, STATUS_OK);
  t.is(result.id, team1.id);
  t.is(result.City.id, city1.id);
});

test('belongsTo /team?include=cities', async(t) => {
  const { server, instances } = t.context;
  const { team1, city1 } = instances;
  const path = `/team/${team1.id}?include=cities`;

  const { result, statusCode } = await server.inject(path);
  t.is(statusCode, STATUS_OK);
  t.is(result.id, team1.id);
  t.is(result.City.id, city1.id);
});

test('hasMany /team?include=player', async(t) => {
  const { server, instances } = t.context;
  const { team1, player1, player2 } = instances;
  const path = `/team/${team1.id}?include=player`;

  const { result, statusCode } = await server.inject(path);
  t.is(statusCode, STATUS_OK);
  t.is(result.id, team1.id);

  const playerIds = result.Players.map(({ id }) => id);
  t.truthy(playerIds.includes(player1.id));
  t.truthy(playerIds.includes(player2.id));
});

test('hasMany /team?include=players', async(t) => {
  const { server, instances } = t.context;
  const { team1, player1, player2 } = instances;
  const path = `/team/${team1.id}?include=players`;

  const { result, statusCode } = await server.inject(path);
  t.is(statusCode, STATUS_OK);
  t.is(result.id, team1.id);

  const playerIds = result.Players.map(({ id }) => id);
  t.truthy(playerIds.includes(player1.id));
  t.truthy(playerIds.includes(player2.id));
});

test('belongsTo with alias /player?include={"model": "Master", "as": "Coach"}', async(t) => {
  const { server, instances } = t.context;
  const { team1, master1 } = instances;
  const path = `/player/${team1.id}?include={"model": "Master", "as": "Coach"}`;

  const { result, statusCode } = await server.inject(path);
  t.is(statusCode, STATUS_OK);
  t.is(result.id, team1.id);
  t.is(result.Coach.id, master1.id);
});

test('multiple includes /team?include=players&include=city', async(t) => {
  const { server, instances } = t.context;
  const { team1, player1, player2, city1 } = instances;
  const path = `/team/${team1.id}?include=players&include=city`;

  const { result, statusCode } = await server.inject(path);
  t.is(statusCode, STATUS_OK);
  t.is(result.id, team1.id);

  const playerIds = result.Players.map(({ id }) => id);
  t.truthy(playerIds.includes(player1.id));
  t.truthy(playerIds.includes(player2.id));
  t.is(result.City.id, city1.id);
});

test('multiple includes /team?include[]=players&include[]=city', async(t) => {
  const { server, instances } = t.context;
  const { team1, player1, player2, city1 } = instances;
  const path = `/team/${team1.id}?include[]=players&include[]=city`;

  const { result, statusCode } = await server.inject(path);
  t.is(statusCode, STATUS_OK);
  t.is(result.id, team1.id);

  const playerIds = result.Players.map(({ id }) => id);
  t.truthy(playerIds.includes(player1.id));
  t.truthy(playerIds.includes(player2.id));
  t.is(result.City.id, city1.id);
});

test('multiple includes /team?include[]=players&include[]={"model": "City"}', async(t) => {
  const { server, instances } = t.context;
  const { team1, player1, player2, city1 } = instances;
  const path = `/team/${team1.id}?include[]=players&include[]={"model": "City"}`;

  const { result, statusCode } = await server.inject(path);
  t.is(statusCode, STATUS_OK);
  t.is(result.id, team1.id);

  const playerIds = result.Players.map(({ id }) => id);
  t.truthy(playerIds.includes(player1.id));
  t.truthy(playerIds.includes(player2.id));
  t.is(result.City.id, city1.id);
});

test('include filter /teams?include[]={"model": "City", "where": {"name": "Healdsburg"}}'
  , async(t) => {
    const { server } = t.context;
    const url = '/teams?include[]={"model": "City", "where": {"name": "Healdsburg"}}';
    const method = 'GET';

    const { statusCode } = await server.inject({ url, method });
    t.is(statusCode, STATUS_OK);
  });

test('nested include filter ' +
  '/citiy?include[]=' +
  '{"model": "Team", "include": {"model": "City", "where": {"name": "Healdsburg"}}}'
  , async(t) => {
  const { instances, server } = t.context;
  const { city1, team1, team2 } = instances;
  const url = '/city?include[]=' +
      '{"model": "Team", "include": {"model": "City", "where": {"name": "Healdsburg"}}}';
  const method = 'GET';

  const { result, statusCode } = await server.inject({ url, method });
  t.is(statusCode, STATUS_OK);
  t.is(result.id, city1.id);

  const teamIds = result.Teams.map(({ id }) => id);
  t.truthy(teamIds.includes(team1.id));
  t.truthy(teamIds.includes(team2.id));
});

test('complex include ' +
  '/cities?include[]={"model":"Team", ' +
  '"include":{ "model":"Player", "where":{"name": "Pinot"}, ' +
  '"include":{ "model":"Master", "as":"Coach", "where":{"name": "Shifu"}}}}'
  , async(t) => {
  const { instances, server } = t.context;
  const { city1, master1, player2, team1 } = instances;
  const method = 'GET';
  const url = '/cities?include[]={"model":"Team", ' +
      '"include":{ "model":"Player", "where":{"name": "Pinot"}, ' +
      '"include":{ "model":"Master", "as":"Coach", "where":{"name": "Shifu"}}}}';

  const { result, statusCode } = await server.inject({ url, method });
  t.is(statusCode, STATUS_OK);
  t.is(result[0].id, city1.id);
  t.is(result[0].Teams[0].id, team1.id);
  t.is(result[0].Teams[0].Players[0].id, player2.id);
  t.is(result[0].Teams[0].Players[0].Coach.id, master1.id);
});
