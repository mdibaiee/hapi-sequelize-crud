hapi-sequelize-crud [![CircleCI](https://circleci.com/gh/mdibaiee/hapi-sequelize-crud.svg?style=svg)](https://circleci.com/gh/mdibaiee/hapi-sequelize-crud)
===================

Automatically generate a RESTful API for your models and associations

This plugin depends on [`hapi-sequelize`](https://github.com/danecando/hapi-sequelize).

```
npm install -S hapi-sequelize-crud
```

## Configure

Please note that you should register `hapi-sequelize-crud` after defining your
associations.

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

    // You can specify which models must have routes defined for using the
    // `models` property. If you omit this property, all models will have
    // models defined for them. e.g.
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
      {model: 'fly', config: {
        // interact with the request before hapi-sequelize-crud does
        , ext: {
          onPreHandler: (request, reply) => {
            if (request.auth.hasAccessToFly) reply.continue()
            else reply(Boom.unauthorized())
          }
        }
        // change the response data
        response: {
          schema: {id: joi.string()},
          modify: true
        }
      }}
    ]
  }
});
```

### Methods
* **list**: get all rows in a table
* **get**: get a single row
* **scope**: reference a [sequelize scope](http://docs.sequelizejs.com/en/latest/api/model/#scopeoptions-model)
* **create**: create a new row
* **destroy**: delete a row
* **destroyAll**: delete all models in the table
* **destroyScope**: use a [sequelize scope](http://docs.sequelizejs.com/en/latest/api/model/#scopeoptions-model) to find rows, then delete them
* **update**: update a row

## `where` queries
It's easy to restrict your requests using Sequelize's `where` query option. Just pass a query parameter.

```js
// returns only teams that have a `city` property of "windsor"
// GET /team?city=windsor

// results in the Sequelize query:
Team.findOne({ where: { city: 'windsor' }})
```

You can also do more complex queries by setting the value of a key to JSON.

```js
// returns only teams that have a `address.city` property of "windsor"
// GET /team?city={"address": "windsor"}
// or
// GET /team?city[address]=windsor

// results in the Sequelize query:
Team.findOne({ where: { address: { city: 'windsor' }}})
```

## `include` queries
Getting related models is easy, just use a query parameter `include`.

```js
// returns all teams with their related City model
// GET /teams?include=city or
// GET /teams?include={"model": "City"}


// results in a Sequelize query:
Team.findAll({include: City})
```

If you want to get multiple related models, just pass multiple `include` parameters.
```js
// returns all teams with their related City and Uniform models
// GET /teams?include[]=city&include[]=uniform

// results in a Sequelize query:
Team.findAll({include: [City, Uniform]})
```

For models that have a many-to-many relationship, you can also pass the plural version of the association.
```js
// returns all teams with their related City and Uniform models
// GET /teams?include=players

// results in a Sequelize query:
Team.findAll({include: [Player]})
```

Filtering by related models property, you can pass **where** paremeter inside each **include** item(s) object.
```js
// returns all team with their related City where City property name equals Healdsburg
// GET /teams?include={"model": "City", "where": {"name": "Healdsburg"}}

// results in a Sequelize query:
Team.findAll({include: {model: City, where: {name: 'Healdsburg'}}})
```

## `limit` and `offset` queries
Restricting list (`GET`) and scope queries to a restricted count can be done by passing `limit=<number>` and/or `offset=<number>`.

```js
// returns 10 teams starting from the 10th
// GET /teams?limit=10&offset=10

// results in a Sequelize query:
Team.findAll({limit: 10, offset: 10})
```

## `order` queries
You can change the order of the resulting query by passing `order` to the query.

```js
// returns the teams ordered by the name column
// GET /teams?order[]=name

// results in a Sequelize query:
Team.findAll({order: ['name']})
```

```js
// returns the teams ordered by the name column, descending
// GET /teams?order[0]=name&order[0]=DESC
// GET /teams?order=name%20DESC

// results in a Sequelize query:
Team.findAll({order: [['name', 'DESC']]})
```

```js
// returns the teams ordered by the name, then the city columns, descending
// GET /teams?order[0]=name&order[1]=city

// results in a Sequelize query:
Team.findAll({order: [['name'], ['city']]})
```

You can even order by associated models. Though there is a [sequelize bug](https://github.com/sequelize/sequelize/issues?utf8=%E2%9C%93&q=is%3Aissue%20is%3Aopen%20order%20join%20) that might prevent this from working properly. A workaround is to `&include` the model you're ordering by.
```js
// returns the players ordered by the team name
// GET /players?order[0]={"model": "Team"}&order[0]=name

// results in a Sequelize query:
Player.findAll({order: [[{model: Team}, 'name']]})

// if the above returns a Sequelize error: `No such column Team.name`,
// you can work around this by forcing the join into the query:
// GET /players?order[0]={"model": "Team"}&order[0]=name&include=team

// results in a Sequelize query:
Player.findAll({order: [[{model: Team}, 'name']], include: [Team]})
```


## Authorization and other hooks
You can use Hapi's [`ext` option](http://hapijs.com/api#route-options) to interact with the request both before and after this module does. This is useful if you want to enforce authorization, or modify the request before or after this module does. Hapi [has a full list of hooks](http://hapijs.com/api#request-lifecycle) you can use.

## Modify the response format
By default, `hapi-sequelize-crud` routes will respond with the full model. You can modify this using the built-in [hapi settings](http://hapijs.com/tutorials/validation#output).

```js
await register({
  register: require('hapi-sequelize-crud'),
  options: {
    …
    {model: 'fly', config: {
      response: {
        // setting this schema will restrict the response to only the id
        schema: { id: joi.string() },
        // This tells Hapi to restrict the response to the keys specified in `schema`
        modify: true
      }
    }}
  }

})
```

## Full list of methods

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
# might also append `where` query parameters to search for
GET /role/{id}/teams?members=5
GET /role/{id}/teams?city=healdsburg

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
