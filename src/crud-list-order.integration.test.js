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
  t.is(result[1].name, player1.name);
});

test('invalid column /players?order[0]=invalid', async (t) => {
  const { server } = t.context;
  const url = '/players?order[]=invalid';
  const method = 'GET';

  const { statusCode, result } = await server.inject({ url, method });
  t.is(statusCode, STATUS_BAD_QUERY);
  t.truthy(result.message.includes('invalid'));
});
