module.exports = (Sequelize, sequelize) => {
    return sequelize.define("lesson_students",
        {
            lesson_id: {
                type: Sequelize.INTEGER,
            },
            student_id: {
                type: Sequelize.INTEGER,
            },
            visit: {
                type: Sequelize.BOOLEAN,
            },
        },
        {
            schema: 'public',
        });
}