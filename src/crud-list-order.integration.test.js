import test from 'ava';
import 'sinon-bluebird';
import setup from '../test/integration-setup.js';

const STATUS_OK = 200;
const STATUS_BAD_QUERY = 502;

setup(test);

test('/players?order=name', async (t) => {
  const { server, instances } = t.context;
  const { player1, player2, player3 } = instances;
  const url = '/players?order=name';
  const method = 'GET';

  const { result, statusCode } = await server.inject({ url, method });
  t.is(statusCode, STATUS_OK);
  // this is the order we'd expect the names to be in
  t.is(result[0].name, player1.name);
  t.is(result[1].name, player2.name);
  t.is(result[2].name, player3.name);
});

test('/players?order=name%20ASC', async (t) => {
  const { server, instances } = t.context;
  const { player1, player2, player3 } = instances;
  const url = '/players?order=name%20ASC';
  const method = 'GET';

  const { result, statusCode } = await server.inject({ url, method });
  t.is(statusCode, STATUS_OK);
  // this is the order we'd expect the names to be in
  t.is(result[0].name, player1.name);
  t.is(result[1].name, player2.name);
  t.is(result[2].name, player3.name);
});

test('/players?order=name%20DESC', async (t) => {
  const { server, instances } = t.context;
  const { player1, player2, player3 } = instances;
  const url = '/players?order=name%20DESC';
  const method = 'GET';

  const { result, statusCode } = await server.inject({ url, method });
  t.is(statusCode, STATUS_OK);
  // this is the order we'd expect the names to be in
  t.is(result[0].name, player3.name);
  t.is(result[1].name, player2.name);
  t.is(result[2].name, player1.name);
});

test('/players?order[]=name', async (t) => {
  const { server, instances } = t.context;
  const { player1, player2, player3 } = instances;
  const url = '/players?order[]=name';
  const method = 'GET';

  const { result, statusCode } = await server.inject({ url, method });
  t.is(statusCode, STATUS_OK);
  // this is the order we'd expect the names to be in
  t.is(result[0].name, player1.name);
  t.is(result[1].name, player2.name);
  t.is(result[2].name, player3.name);
});

test('/players?order[0]=name&order[0]=DESC', async (t) => {
  const { server, instances } = t.context;
  const { player1, player2, player3 } = instances;
  const url = '/players?order[0]=name&order[0]=DESC';
  const method = 'GET';

  const { result, statusCode } = await server.inject({ url, method });
  t.is(statusCode, STATUS_OK);
  // this is the order we'd expect the names to be in
  t.is(result[0].name, player3.name);
  t.is(result[1].name, player2.name);
  t.is(result[2].name, player1.name);
});

// multiple sorts
test('/players?order[0]=active&order[0]=DESC&order[1]=name&order[1]=DESC', async (t) => {
  const { server, instances } = t.context;
  const { player1, player2, player3 } = instances;
  const url = '/players?order[0]=name&order[0]=DESC&order[1]=teamId&order[1]=DESC';
  const method = 'GET';

  const { result, statusCode } = await server.inject({ url, method });
  t.is(statusCode, STATUS_OK);
  // this is the order we'd expect the names to be in
  t.is(result[0].name, player3.name);
  t.is(result[1].name, player2.name);
  t.is(result[2].name, player1.name);
});

// this will fail b/c sequelize doesn't correctly do the join when you pass
// an order. There are many issues for this:
// eslint-disable-next-line
// https://github.com/sequelize/sequelize/issues?utf8=%E2%9C%93&q=is%3Aissue%20is%3Aopen%20order%20join%20
//
// https://github.com/sequelize/sequelize/issues/5353 is a good example
// if this test passes, that's great! Just remove the workaround note in the
// docs
// eslint-disable-next-line
test.failing('sequelize bug /players?order[0]={"model":"Team"}&order[0]=name&order[0]=DESC', async (t) => {
  const { server, instances } = t.context;
  const { player1, player2, player3 } = instances;
  const url = '/players?order[0]={"model":"Team"}&order[0]=name&order[0]=DESC';
  const method = 'GET';

  const { result, statusCode } = await server.inject({ url, method });
  t.is(statusCode, STATUS_OK);
  // this is the order we'd expect the names to be in
  t.is(result[0].name, player3.name);
  t.is(result[1].name, player1.name);
  t.is(result[2].name, player2.name);
});

// b/c the above fails, this is a work-around
test('/players?order[0]={"model":"Team"}&order[0]=name&order[0]=DESC&include=team', async (t) => {
  const { server, instances } = t.context;
  const { player1, player2, player3 } = instances;
  const url = '/players?order[0]={"model":"Team"}&order[0]=name&order[0]=DESC&include=team';
  const method = 'GET';

  const { result, statusCode } = await server.inject({ url, method });
  t.is(statusCode, STATUS_OK);
  // this is the order we'd expect the names to be in
  t.is(result[0].name, player3.name);
  t.is(result[1].name, player1.name);
  t.is(result[2].name, player2.name);
});

test('invalid column /players?order[0]=invalid', async (t) => {
  const { server } = t.context;
  const url = '/players?order[]=invalid';
  const method = 'GET';

  const { statusCode, result } = await server.inject({ url, method });
  t.is(statusCode, STATUS_BAD_QUERY);
  t.truthy(result.message.includes('invalid'));
});
