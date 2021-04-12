// --- koa

const Koa = require('koa');
const app = new Koa();

// --- koa-body

const koaBody = require('koa-body');
app.use(koaBody());

// --- sequelize

//  PostgreSQL TIMESTAMP WITHOUT TIME ZONE
const pg = require('pg');
pg.types.setTypeParser(1114, function (stringValue) {
    return new Date(stringValue + "+0000");
});

// 
const Sequelize = require("sequelize");
const sequelize = new Sequelize("myClassDB", "postgres", "postgres", {
    dialect: "postgres",
    host: "localhost",
    port: 5432,
    define: {
        timestamps: false
    }
});

// подключение моделей
const Lessons = require("./Database/Models/Lessons")(Sequelize, sequelize);
const Students = require("./Database/Models/Students")(Sequelize, sequelize);
const Teachers = require("./Database/Models/Teachers")(Sequelize, sequelize);

// создание связей
const LessonStudents = require("./Database/Models/LessonStudents")(Sequelize, sequelize);
Lessons.belongsToMany(Students, { through: LessonStudents, foreignKey: 'student_id' });
Students.belongsToMany(Lessons, { through: LessonStudents, foreignKey: 'lesson_id' });

const LessonTeachers = require("./Database/Models/LessonTeachers")(Sequelize, sequelize);
Lessons.belongsToMany(Teachers, { through: LessonTeachers });
Teachers.belongsToMany(Lessons, { through: LessonTeachers });


// test
let testDB = {
    Lessons: Lessons,
    LessonStudents: LessonStudents,
    LessonTeachers: LessonTeachers,
    Students: Students,
    Teachers: Teachers,
};

// refactoring - сделать ожидание при запуске, не запускать приложение пока не запустится sequelize
sequelize.sync()
    .then((result) => {
        console.log(result);
    })
    .catch((err) => {
        console.log(err);
    });

// --- routers

const koaRouter = require('@koa/router');
const routersHelper = require('./Routers/routersHelper')
    ();

// 
const lessonsController = require('./Routers/Lessons/lessonsController')
    (koaRouter, routersHelper, testDB);
let lessonsControllerResult = lessonsController.initController();
app.use(lessonsControllerResult.router.routes());

/* 

// router
const koaRouter = require('@koa/router');
const router = koaRouter();
router.get('/', getLessons).post('/lessons', createLessons);
app.use(router.routes());

// 
async function getLessons(ctx, next) {
    console.log("1");
    await next();
    console.log("2");
}

// 
async function createLessons(ctx, next) {
    console.log("1");
    await next();
    console.log("2");
}

// logger
app.use(async (ctx, next) => {
    await next();
    const rt = ctx.response.get('X-Response-Time');
    console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

// x-response-time
app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
});

// response
app.use(async ctx => {
    ctx.body = 'Hello World';
});

*/

// 
let PORT = 3000;
app.listen(PORT);
console.log(`http://localhost:${PORT}/`);
