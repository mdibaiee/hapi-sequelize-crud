export default (sequelize, DataTypes) => {
  return sequelize.define('Team', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: DataTypes.STRING,
    cityId: DataTypes.INTEGER,
  }, {
    classMethods: {
      associate: (models) => {
        models.Team.belongsTo(models.City, {
          foreignKey: { name: 'cityId' },
        });
        models.Team.hasMany(models.Player, {
          foreignKey: { name: 'teamId' },
        });
      },
    },
  });
};
