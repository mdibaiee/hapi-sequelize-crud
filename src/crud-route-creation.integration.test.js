import test from 'ava';
import 'sinon-bluebird';
import setup from '../test/integration-setup.js';

const { modelNames } = setup(test);

const confirmRoute = (t, { path, method }) => {
  const { server } = t.context;
  // there's only one connection, so just get the first table
  const routes = server.table()[0].table;

  t.truthy(routes.find((route) => {
    return route.path = path
      && route.method === method;
  }));
};

modelNames.forEach(({ singular, plural }) => {
  test('get', confirmRoute, { path: `/${singular}/{id}`, method: 'get' });
  test('list', confirmRoute, { path: `/${plural}/{id}`, method: 'get' });
  test('scope', confirmRoute, { path: `/${plural}/{scope}`, method: 'get' });
  test('create', confirmRoute, { path: `/${singular}`, method: 'post' });
  test('destroy', confirmRoute, { path: `/${plural}`, method: 'delete' });
  test('destroyScope', confirmRoute, { path: `/${plural}/{scope}`, method: 'delete' });
  test('update', confirmRoute, { path: `/${singular}/{id}`, method: 'put' });
});
