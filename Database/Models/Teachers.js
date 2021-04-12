module.exports = (Sequelize, sequelize) => {
    return sequelize.define("teachers",
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },
            name: {
                type: Sequelize.STRING,
                allowNull: true
            },
        },
        {
            schema: 'public',
        });
}