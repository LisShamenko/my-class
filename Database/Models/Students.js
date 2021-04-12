module.exports = (Sequelize, sequelize) => {
    return sequelize.define("students",
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