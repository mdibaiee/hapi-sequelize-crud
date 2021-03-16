import hapi from 'hapi';
import Sequelize from 'sequelize';
import portfinder from 'portfinder';
import path from 'path';
import Promise from 'bluebird';

const getPort = Promise.promisify(portfinder.getPort);
const modelsPath = path.join(__dirname, 'fixtures', 'models');
const modelsGlob = path.join(modelsPath, '**', '*.js');
const dbName = 'db';

// these are what's in the fixtures dir
const modelNames = [
  { Singluar: 'City', singular: 'city', Plural: 'Cities', plural: 'cities' },
  { Singluar: 'Team', singular: 'team', Plural: 'Teams', plural: 'teams' },
  { Singluar: 'Player', singular: 'player', Plural: 'Players', plural: 'players' },
  { Singluar: 'Master', singular: 'master', Plural: 'Masters', plural: 'masters' },
];


export default (test) => {
  test.beforeEach('get an open port', async(t) => {
    t.context.port = await getPort();
  });

  test.beforeEach('setup server', async(t) => {
    const sequelize = t.context.sequelize = new Sequelize({
      dialect: 'sqlite',
      logging: false,
    });

    const server = t.context.server = new hapi.Server();
    server.connection({
      host: '0.0.0.0',
      port: t.context.port,
    });

    await server.register({
      register: require('hapi-sequelize'),
      options: {
        name: dbName,
        models: [modelsGlob],
        sequelize,
        sync: true,
        forceSync: true,
      },
    });

    await server.register({
        register: require('../src/index.js'),
        options: {
          name: dbName,
        },
      },
    );
  });

  test.beforeEach('create data', async(t) => {
    const { Player, Master, Team, City } = t.context.sequelize.models;
    const city1 = await City.create({ name: 'Healdsburg' });
    const team1 = await Team.create({ name: 'Baseballs', cityId: city1.id });
    const team2 = await Team.create({ name: 'Footballs', cityId: city1.id });
    const master1 = await Master.create({ name: 'Shifu' });
    const master2 = await Master.create({ name: 'Oogway' });
    const player1 = await Player.create({
      name: 'Cat', teamId: team1.id, active: true, coachId: master1.id
    });
    const player2 = await Player.create({
      name: 'Pinot', teamId: team1.id, coachId: master1.id
    });
    const player3 = await Player.create({
      name: 'Syrah', teamId: team2.id, coachId: master2.id
    });
    t.context.instances = {
      city1, team1, team2, player1, player2, player3, master1, master2
    };
  });

  // kill the server so that we can exit and don't leak memory
  test.afterEach('stop the server', (t) => t.context.server.stop());

  return { modelNames };
};
