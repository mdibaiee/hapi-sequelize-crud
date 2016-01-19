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
    prefix: '/v1'
  }
});
```

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

# you can specify a prefix to change the URLs like this:
GET /v1/team/{id}/roles
```
