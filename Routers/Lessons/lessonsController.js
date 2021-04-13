let koaRouter;
let routersHelper;
let lessonsModels;

module.exports = (inKoaRouter, inRoutersHelper, inLessonsModels) => {
    koaRouter = inKoaRouter;
    routersHelper = inRoutersHelper;
    lessonsModels = inLessonsModels;

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



}

// --------------------------------------------------------

// 
async function getLessons(ctx, next) {
    let reqParams = ctx.request.query;

    // 
    let dates = reqParams.date.split(',');
    for (let i = 0; i < dates.length; ) {
        const date = dates[i];
        if (routersHelper.dateRegExp.test(date) !== true) {
            dates.splice(i, 1);
        }
        else {
            i++;
        }
    }

    // 
    let teacherIds;
    if (reqParams.teacherIds !== undefined) {
        teacherIds = reqParams.teacherIds.split(',');
        if (teacherIds.length === 0) {
            teacherIds = undefined;
        }
    }

    // 
    await lessonsModels.getLessons(
        {
            startDate: (dates.length > 0) ? dates[0] : undefined,
            endDate: (dates.length > 1) ? dates[1] : undefined,
            status: routersHelper.parseNumberWithDefault(reqParams.status, undefined),
            teacherIds: teacherIds,
            studentsCount: routersHelper.parseNumberWithDefault(reqParams.studentsCount, undefined),
            page: routersHelper.parseNumberWithDefault(reqParams.page, 1),
            lessonsPerPage: routersHelper.parseNumberWithDefault(reqParams.lessonsPerPage, 5),
        })
        .then(lessons => {
            for (lesson of lessons) {
                console.log(`ID=${lesson.id} --- COUNT=${lesson.dataValues.count}`);
            }
            ctx.body = lessons;
            next();
        });
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