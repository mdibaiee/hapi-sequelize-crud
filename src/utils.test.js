import test from 'ava';
import { parseLimitAndOffset, parseOrder, parseWhere } from './utils.js';

test.beforeEach((t) => {
  t.context.request = { query: {} };
});

test('parseLimitAndOffset is a function', (t) => {
  t.is(typeof parseLimitAndOffset, 'function');
});

test('parseLimitAndOffset returns limit and offset', (t) => {
  const { request } = t.context;
  request.query.limit = 1;
  request.query.offset = 2;
  request.query.thing = 'hi';

  t.is(
    parseLimitAndOffset(request).limit
    , request.query.limit
  );

  t.is(
    parseLimitAndOffset(request).offset
    , request.query.offset
  );
});

test('parseLimitAndOffset returns limit and offset as numbers', (t) => {
  const { request } = t.context;
  const limit = 1;
  const offset = 2;
  request.query.limit = `${limit}`;
  request.query.offset = `${offset}`;
  request.query.thing = 'hi';

  t.is(
    parseLimitAndOffset(request).limit
    , limit
  );

  t.is(
    parseLimitAndOffset(request).offset
    , offset
  );
});

test('parseOrder is a function', (t) => {
  t.is(typeof parseOrder, 'function');
});

test('parseOrder returns order when a string', (t) => {
  const { request } = t.context;
  const order = 'thing';
  request.query.order = order;
  request.query.thing = 'hi';

  t.deepEqual(
    parseOrder(request)
    , [order]
  );
});

test('parseOrder returns order when json', (t) => {
  const { request } = t.context;
  const order = [{ model: 'User' }, 'DESC'];
  request.query.order = [JSON.stringify({ model: 'User' }), 'DESC'];
  request.query.thing = 'hi';

  t.deepEqual(
    parseOrder(request)
    , order
  );
});

test('parseOrder returns null when not defined', (t) => {
  const { request } = t.context;
  request.query.thing = 'hi';

  t.is(
    parseOrder(request)
    , null
  );
});


test('parseWhere is a function', (t) => {
  t.is(typeof parseWhere, 'function');
});

test('parseWhere returns the non-sequelize keys', (t) => {
  const { request } = t.context;
  request.query.order = 'thing';
  request.query.include = 'User';
  request.query.limit = 2;
  request.query.thing = 'hi';

  t.deepEqual(
    parseWhere(request)
    , { thing: 'hi' }
  );
});

test('parseWhere returns json converted keys', (t) => {
  const { request } = t.context;
  request.query.order = 'hi';
  request.query.thing = '{"id": {"$in": [2, 3]}}';

  t.deepEqual(
    parseWhere(request)
    , { thing: { id: { $in: [2, 3] } } }
  );
});
