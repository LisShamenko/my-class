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

async function test1(ctx, next) { }

// --------------------------------------------------------

// 
async function getLessons(ctx, next) {
    let reqParams = ctx.request.query;
    let dates = routersHelper.parseStringToDates(reqParams.date);

    // 
    let result = {};
    await lessonsModels.getLessonsIDs(
        {
            startDate: (dates.length > 0) ? dates[0] : undefined,
            endDate: (dates.length > 1) ? dates[1] : undefined,
            status: routersHelper.parseNumberWithDefault(reqParams.status, undefined),
            teacherIds: routersHelper.parseStringToTeachers(reqParams.teacherIds),
            studentsCount: routersHelper.parseNumberWithDefault(reqParams.studentsCount, undefined),
            page: routersHelper.parseNumberWithDefault(reqParams.page, 1),
            lessonsPerPage: routersHelper.parseNumberWithDefault(reqParams.lessonsPerPage, 5),
        })
        .then(lessonsIDs => {
            result.lessonsIDs = [];
            for (let lesson of lessonsIDs) {
                result.lessonsIDs.push({
                    id: lesson.id,
                    count: lesson.dataValues.count
                });
            }
        })
        .catch(err => {
            ctx.throw(400, err);
        });

    // 
    await lessonsModels.getLessons(result.lessonsIDs)
        .then(result => {
            ctx.response.body = JSON.stringify(result);
            ctx.response.type = 'application/json';
        })
        .catch(err => {
            ctx.throw(400, err);
        });
}

// 
async function createLessons(ctx, next) {
    const bodyParams = ctx.request.body;
    const queryObj = {
        teacherIds: bodyParams.teacherIds
    };

    // 
    queryObj.title = bodyParams.title;
    if (!queryObj.title) {
        ctx.throw(400, err);
    }

    // 
    queryObj.days = bodyParams.days;
    if (queryObj.days === undefined || queryObj.days.length === 0) {
        ctx.throw(400, err);
    }

    // 
    queryObj.firstDate = bodyParams.firstDate;
    if (!routersHelper.dateRegExp.test(queryObj.firstDate)) {
        ctx.throw(400, err);
    }

    // 
    queryObj.lessonsCount = bodyParams.lessonsCount;
    queryObj.lastDate = bodyParams.lastDate;
    if ((queryObj.lessonsCount === undefined || queryObj.lessonsCount === 0) &&
        (queryObj.lastDate === undefined || !routersHelper.dateRegExp.test(queryObj.lastDate))) {
        ctx.throw(400, err);
    }

    // 
    await lessonsModels.createLessons(queryObj)
        .then(result => {
            ctx.response.body = JSON.stringify(result);
            ctx.response.type = 'application/json';
        })
        .catch(err => {
            ctx.throw(400, err);
        });
}