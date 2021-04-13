let Sequelize;
let sequelize;

module.exports = (inSequelize, inSequelizeInstance) => {
    Sequelize = inSequelize;
    sequelize = inSequelizeInstance;

    return {
        getLessonsIDs: getLessonsIDs,
        getLessons: getLessons,
    };
}

// выборка lessons идентификаторов
async function getLessonsIDs(queryObj) {

    // refactoring - проверка на типы

    // 
    let whereLessons = {};
    if (queryObj.startDate !== undefined) {
        if (queryObj.endDate !== undefined) {
            whereLessons['date'] = {
                [Sequelize.Op.and]: [
                    { [Sequelize.Op.gte]: queryObj.startDate },
                    { [Sequelize.Op.lte]: queryObj.endDate }
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
            sequelize.fn('COUNT', sequelize.col('LessonStudents.lesson_id')),
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
                [sequelize.fn('COUNT', sequelize.col('LessonStudents.lesson_id')), 'count']
            ],
            include: [
                {
                    model: sequelize.models.lesson_students,
                    as: "LessonStudents",
                    attributes: [],
                    //where: { 'visit': { [Sequelize.Op.eq]: true } }
                },
                {
                    model: sequelize.models.lesson_teachers,
                    as: "LessonTeachers",
                    attributes: [],
                    where: whereTeacher,
                }
            ],
            where: whereLessons,
            group: [
                'id',
                'LessonStudents.lesson_id',
            ],
            having: havingObj,
            order: sequelize.literal('id ASC'),
            offset: (queryObj.page - 1) * queryObj.lessonsPerPage,
            limit: queryObj.lessonsPerPage,
        });
}

// выборка данных по идентификаторам
async function getLessons(lessonsIDs) {
    return new Promise(async (resolve, reject) => {

        let IDs = lessonsIDs.map(item => item.id);
        let result = {};

        // 
        await getLessonsHierarchy(IDs)
            .then(lessons => result.lessons = lessons)
            .catch(err => reject(err));

        // 
        let retRes = [];
        for (const lesson of result.lessons) {

            let retLesson = {
                id: lesson.dataValues.id,
                status: lesson.dataValues.status,
                date: lesson.dataValues.date,
                title: lesson.dataValues.title,
                students: [],
                teachers: [],
            };

            for (const student of lesson.dataValues.students) {
                retLesson.students.push({
                    id: student.dataValues.id,
                    name: student.dataValues.name,
                    visit: student.dataValues.lesson_students.visit,
                });
            }

            for (const teacher of lesson.dataValues.teachers) {
                retLesson.teachers.push({
                    id: teacher.dataValues.id,
                    name: teacher.dataValues.name,
                });
            }

            retRes.push(retLesson);
        }
        resolve(retRes);
    });
}
async function getLessonsHierarchy(IDs) {
    return sequelize.models.lessons.findAll(
        {
            //subQuery: false,
            attributes: ['id', 'date', 'title', 'status'],
            include: [
                {
                    model: sequelize.models.students,
                    attributes: ['id', 'name'], // [sequelize.literal("true"), 'visit']
                    include: [
                        {
                            model: sequelize.models.lesson_students,
                            as: "LessonStudents",
                            attributes: [],
                            //where: { 'lesson_id': { [Sequelize.Op.in]: IDs }, }
                            //where: {
                            //    [Sequelize.Op.and]: [
                            //        { 'lesson_id': { [Sequelize.Op.in]: IDs } },
                            //        { 'visit': { [Sequelize.Op.eq]: true } }
                            //    ]
                            //}
                        },
                    ],
                },
                {
                    model: sequelize.models.teachers,
                    attributes: ['id', 'name'],
                    include: [
                        {
                            model: sequelize.models.lesson_teachers,
                            as: "LessonTeachers",
                            attributes: [],
                            //where: { 'lesson_id': { [Sequelize.Op.in]: IDs } }
                        },
                    ],
                }
            ],
            where: {
                'id': { [Sequelize.Op.in]: IDs }
            },
            order: sequelize.literal('id ASC'),
        })
}

// 
async function getLessonsDirect(lessonsIDs) {
    return new Promise(async (resolve, reject) => {

        let ids = lessonsIDs.map(item => item.id);
        let result = {};

        // 
        await getLessonsByIDs(ids)
            .then(lessons => result.lessons = lessons)
            .catch(err => reject(err));

        // 
        await getStudentsByIDs(ids)
            .then(students => result.students = students)
            .catch(err => reject(err));

        // 
        await getTeachersByIDs(ids)
            .then(teachers => result.teachers = teachers)
            .catch(err => reject(err));

        // 
        let retRes = [];
        for (let lesson of result.lessons) {
            let newObj = {};
            newObj.id = lesson.id;
            newObj.date = lesson.date;
            newObj.title = lesson.title;
            newObj.status = lesson.status;
            retRes.push(newObj);
        }

        // 
        resolve(retRes);
    });
}

async function getLessonsByIDs(IDs) {
    return sequelize.models.lessons.findAll(
        {
            subQuery: false,
            attributes: ['id', 'date', 'title', 'status'],
            where: {
                'id': { [Sequelize.Op.in]: IDs }
            },
            order: sequelize.literal('id ASC'),
        });
}

async function getStudentsByIDs(IDs) {
    return sequelize.models.students.findAll(
        {
            subQuery: false,
            attributes: ['id', 'name', 'LessonStudents.visit'],
            include: [
                {
                    model: sequelize.models.lesson_students,
                    as: "LessonStudents",
                    attributes: ['visit'],
                    where: {
                        [Sequelize.Op.and]: [
                            { 'lesson_id': { [Sequelize.Op.in]: IDs } },
                            { 'visit': { [Sequelize.Op.eq]: true } }
                        ]
                    }
                },
            ],
            order: sequelize.literal('id ASC'),
        });
}

async function getTeachersByIDs(IDs) {
    return sequelize.models.teachers.findAll(
        {
            attributes: ['id', 'name'],
            include: [
                {
                    model: sequelize.models.lesson_teachers,
                    as: "LessonTeachers",
                    attributes: [],
                    where: { 'lesson_id': { [Sequelize.Op.in]: IDs } }
                },
            ],
            order: sequelize.literal('id ASC'),
        });
}