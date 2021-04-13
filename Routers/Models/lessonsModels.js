let Sequelize;
let sequelize;
let models;

module.exports = (inSequelize, inSequelizeInstance, inModels) => {
    Sequelize = inSequelize;
    sequelize = inSequelizeInstance;
    models = inModels;

    return {
        getLessons: getLessons,
    };
}

// выборка lessons
async function getLessons(queryObj) {

    // refactoring - проверка на типы
    
    // 
    let whereLessons = {};
    if (queryObj.startDate !== undefined) {
        if (queryObj.endDate !== undefined) {
            whereLessons['date'] = {
                [Op.and]: [
                    { [Op.gte]: queryObj.startDate },
                    { [Op.lte]: queryObj.endDate }
                ],
            };
        }
        else {
            whereLessons['date'] = queryObj.startDate;
        }
    }

    // 
    if (queryObj.status !== undefined) {
        whereLessons['status'] = queryObj.status;
    }

    // 
    let whereTeacher = {};
    if (queryObj.teacherIds !== undefined && queryObj.teacherIds.length > 0) {
        whereTeacher = {
            'teacher_id': {
                [Sequelize.Op.in]: queryObj.teacherIds
            }
        };
    }

    // 
    let havingObj = {};
    if (queryObj.studentsCount !== undefined) {
        havingObj = sequelize.where(
            sequelize.fn('COUNT', sequelize.col('Students.lesson_id')),
            '=',
            queryObj.studentsCount);
    }

    // 
    if (queryObj.page === undefined || queryObj.page < 1) {
        queryObj.page = 1;
    }

    // 
    if (queryObj.lessonsPerPage === undefined || queryObj.lessonsPerPage < 0) {
        queryObj.lessonsPerPage = 5;
    }

    // 
    return sequelize.models.lessons.findAll(
        {
            subQuery: false,
            attributes: [
                'id',
                [sequelize.fn('COUNT', sequelize.col('Students.lesson_id')), 'count']
            ],
            include: [
                {
                    model: sequelize.models.lesson_students, // LessonStudents,
                    as: "Students",
                    attributes: [],
                },
                {
                    model: sequelize.models.lesson_teachers, // LessonTeachers,
                    as: "Teachers",
                    attributes: [],
                    where: whereTeacher,
                }
            ],
            where: whereLessons,
            group: [
                'id',
                'Students.lesson_id',
            ],
            having: havingObj,
            order: sequelize.literal('id ASC'),
            offset: (queryObj.page - 1) * queryObj.lessonsPerPage,
            limit: queryObj.lessonsPerPage,
        });
}