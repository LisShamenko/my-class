let Sequelize;
let sequelize;
let daysHelper;
let daysCounter;

module.exports = (inSequelize, inSequelizeInstance, inDaysHelper, inDaysCounter) => {
    Sequelize = inSequelize;
    sequelize = inSequelizeInstance;
    daysHelper = inDaysHelper;
    daysCounter = inDaysCounter;

    return {
        getLessonsIDs: getLessonsIDs,
        getLessons: getLessons,
        createLessons: createLessons,
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
async function createLessons(queryObj) {
    return new Promise(async (resolve, reject) => {

        // 
        queryObj.firstDate = new Date(queryObj.firstDate);
        if (queryObj.lessonsCount === undefined) {
            queryObj.lessonsCount = 365;
            if (queryObj.lastDate === undefined) {
                queryObj.lastDate = new Date(queryObj.firstDate);
                queryObj.lastDate.setDate(queryObj.lastDate.getDate() + 365);
            }
        }
        else {
            queryObj.lastDate = new Date(queryObj.firstDate);
            queryObj.lastDate.setDate(queryObj.lastDate.getDate() + 365);
        }

        // 
        let dh = daysHelper.getDaysHelper(queryObj.days, queryObj.firstDate);
        let dc = daysCounter.getDaysCounter(queryObj.firstDate, 365, 300);

        // 
        let results = [];
        let date = dh.curDate;
        for (let i = 0; i < queryObj.lessonsCount; i++) {

            await createLesson(date, queryObj.title, 0, queryObj.teacherIds)
                .then(lesson => {
                    results.push(lesson.dataValues.id);
                })
                .catch(err => reject(err));

            // 
            date = dh.nextDay();
            if (date.getTime() > queryObj.lastDate.getTime() ||
                dc.nextDay(date) === true) {
                break;
            }
        }

        // 
        resolve(results);
    });
}

async function createLesson(date, title, status, teacherIds) {

    let lessonTeachers = [];
    teacherIds.forEach(teacherID => {
        lessonTeachers.push({ teacher_id: teacherID });
    });

    // 
    return sequelize.models.lessons.create(
        {
            date: date,
            title: title,
            status: status,
            LessonTeachers: lessonTeachers
        },
        {
            include: [{
                association: sequelize.models.lessons.associations.LessonTeachers,
                as: 'LessonTeachers'
            }]
        });
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