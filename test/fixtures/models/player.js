export default (sequelize, DataTypes) => {
  return sequelize.define('Player', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: DataTypes.STRING,
    teamId: DataTypes.INTEGER,
    active: DataTypes.BOOLEAN,
  }, {
    classMethods: {
      associate: (models) => {
        models.Player.belongsTo(models.Team, {
          foreignKey: { name: 'teamId' },
        });
      },
    },
    scopes: {
      returnsOne: {
        where: {
          active: true,
        },
      },
      returnsNone: {
        where: {
          name: 'notaname',
        },
      },
    },
  });
};
