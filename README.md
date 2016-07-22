hapi-sequelize-crud
===================

Automatically generate a RESTful API for your models and associations

This plugin depends on [`hapi-sequelize`](https://github.com/danecando/hapi-sequelize).

```
npm install -S hapi-sequelize-crud
```

##Configure

```javascript
// First, register hapi-sequelize
await register({
  register: require('hapi-sequelize'),
  options: { ... }
});

// Then, define your associations
let db = server.plugins['hapi-sequelize'].db;
let models = db.sequelize.models;
associations(models); // pretend this function defines our associations

// Now, register hapi-sequelize-crud
await register({
  register: require('hapi-sequelize-crud'),
  options: {
    prefix: '/v1',
    name: 'db', // the same name you used for configuring `hapi-sequelize` (options.name)
    defaultConfig: { ... }, // passed as `config` to all routes created
    models: ['cat', 'dog'] // only the cat and dog models will have routes created
    // or
    models: [
      // possible methods: list, get, scope, create, destroy, destroyAll, destroyScope, update
      // the cat model only has get and list methods enabled
      {model: 'cat', methods: ['get', 'list']},
      // the dog model has all methods enabled
      {model: 'dog'},
      // the cow model also has all methods enabled
      'cow',
      // the bat model as a custom config for the list method, but uses the default config for create.
      // `config` if provided, overrides the default config
      {model: 'bat', methods: ['list'], config: { ... }},
      {model: 'bat', methods: ['create']}
    ]
    models: {
      bat: {
      }
    }
  }
});
```

### Methods
* list: get all rows in a table
* get: get a single row
* scope: reference a [sequelize scope](http://docs.sequelizejs.com/en/latest/api/model/#scopeoptions-model)
* create: create a new row
* destroy: delete a row
* destroyAll: delete all models in the table
* destroyScope: use a [sequelize scope](http://docs.sequelizejs.com/en/latest/api/model/#scopeoptions-model) to find rows, then delete them
* update: update a row


Please note that you should register `hapi-sequelize-crud` after defining your
associations.

##What do I get

Let's say you have a `many-to-many` association like this:

```javascript
Team.belongsToMany(Role, { through: 'TeamRoles' });
Role.belongsToMany(Team, { through: 'TeamRoles' });
```

You get these:

```
# get an array of records
GET /team/{id}/roles
GET /role/{id}/teams
# might also append query parameters to search for
GET /role/{id}/teams?members=5

# you might also use scopes
GET /teams/{scope}/roles/{scope}
GET /team/{id}/roles/{scope}
GET /roles/{scope}/teams/{scope}
GET /roles/{id}/teams/{scope}

# get a single record
GET /team/{id}/role/{id}
GET /role/{id}/team/{id}

# create
POST /team/{id}/role
POST /role/{id}/team

# update
PUT /team/{id}/role/{id}
PUT /role/{id}/team/{id}

# delete
DELETE /team/{id}/roles #search and destroy
DELETE /role/{id}/teams?members=5

DELETE /team/{id}/role/{id}
DELETE /role/{id}/team/{id}

# include
# include nested associations (you can specify an array if includes)
GET /team/{id}/role/{id}?include=SomeRoleAssociation

# you also get routes to associate objects with each other
GET /associate/role/{id}/employee/{id} # associates role {id} with employee {id}

# you can specify a prefix to change the URLs like this:
GET /v1/team/{id}/roles
```
