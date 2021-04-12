let koaRouter;
let routersHelper;
let testDB;

module.exports = (inKoaRouter, inRoutersHelper, inTestDB) => {
    koaRouter = inKoaRouter;
    routersHelper = inRoutersHelper;
    testDB = inTestDB;

    return {
        initController: initController,
    };
}

// 
function initController() {
    const actionsRouter = koaRouter();
    actionsRouter
        .get('/', getLessons)
        .post('/lessons', createLessons)
        .get('/test', test1);

    // 
    return {
        router: actionsRouter,
        // refactoring - сюда удобно добавить swagger-декларацию или любую другую информацию об инициализации
        // paths: swaggerDeclaration,
    };
}

// -------------------------------------------------------- TEST

async function test1(ctx, next) {

    console.log("1");

    testDB.Students.findOne({ where: { name: "Ivan" } })
        .then(student => {
            if (!student) return;
            student.getLessons().then(lessons => {
                for (lesson of lessons) {
                    console.log(lesson.title);
                }
            });
        });

    testDB.Students.findOne({ where: { name: "Ivan" } })
        .then(student => {
            if (!student) return;
            testDB.Lessons.findOne({ where: { name: "удалить" } })
                .then(lesson => {
                    if (!lesson) return;
                    student.addCourse(lesson, { through: { visit: true } });
                });
        });

    testDB.Students.create({ name: "Tom" })
        .then(res => {
            console.log(res);
        })
        .catch(err => {
            console.log(err)
        });

    testDB.Lessons.create({ date: Date.now(), title: "удалить", status: 0 })
        .then(res => {
            console.log(res);
        })
        .catch(err => {
            console.log(err)
        });
}

// --------------------------------------------------------

// 
async function getLessons(ctx, next) {
    let reqParams = ctx.request.query;

    // 
    let dates = reqParams.date.split(',');
    if (dates.length === 0 ||
        dates.every(item => routersHelper.dateRegExp.test(item)) !== true) {
        console.log("invalidate");
    }

    // 
    let lessonsPerPage = Number(reqParams.lessonsPerPage);
    let page = Number(reqParams.page);
    let status = Number(reqParams.status);
    let studentsCount = Number(reqParams.studentsCount);
    if (Number.isNaN(lessonsPerPage) || Number.isNaN(page) || Number.isNaN(status) || Number.isNaN(studentsCount)) {
        console.log("invalidate");
    }

    // 
    let teacherIds = reqParams.teacherIds.split(',');
    if (teacherIds.length === 0) {
        console.log("invalidate");
    }

    console.log("1");
    await next();
    console.log("2");
}

// 
async function createLessons(ctx, next) {
    const bodyParams = ctx.request.body;

    // 
    let teacherIds = bodyParams.teacherIds;
    if (teacherIds.length === 0) {
        console.log("invalidate");
    }

    // 
    let title = bodyParams.title;
    if (!title) {
        console.log("invalidate");
    }

    // 
    let days = bodyParams.days;
    let lessonsCount = bodyParams.lessonsCount;
    if (days.length === 0 || lessonsCount === 0) {
        console.log("invalidate");
    }

    // 
    let firstDate = bodyParams.firstDate;
    let lastDate = bodyParams.lastDate;
    if (!routersHelper.dateRegExp.test(firstDate) || !routersHelper.dateRegExp.test(lastDate)) {
        console.log("invalidate");
    }

    console.log("1");
    await next();
    console.log("2");
}