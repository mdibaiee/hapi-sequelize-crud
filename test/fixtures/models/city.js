export default (sequelize, DataTypes) => {
  return sequelize.define('City', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: DataTypes.STRING,
  }, {
    classMethods: {
      associate: (models) => {
        models.City.hasMany(models.Team, {
          foreignKey: { name: 'cityId' },
        });
      },
    },
  });
};
