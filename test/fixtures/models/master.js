export default (sequelize, DataTypes) => {
  return sequelize.define('Master', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: DataTypes.STRING,
  }, {
    classMethods: {
      associate: (models) => {
        models.Master.hasMany(models.Player, {
          foreignKey: 'coachId'
        });
      },
    },
  });
};
