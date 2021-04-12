module.exports = (Sequelize, sequelize) => {
    return sequelize.define("lessons",
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },
            date: {
                type: Sequelize.DATEONLY,
                allowNull: false
            },
            title: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            status: {
                type: Sequelize.INTEGER
            }
        },
        {
            schema: 'public',
        });
}