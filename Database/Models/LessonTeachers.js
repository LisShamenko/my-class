module.exports = (Sequelize, sequelize) => {
    return sequelize.define("lesson_teachers",
        {
            lesson_id: {
                type: Sequelize.INTEGER,
            },
            teacher_id: {
                type: Sequelize.INTEGER,
            },
        },
        {
            schema: 'public',
        });
}