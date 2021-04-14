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
Lessons.belongsToMany(Students, { through: LessonStudents, foreignKey: 'lesson_id' });
Students.belongsToMany(Lessons, { through: LessonStudents, foreignKey: 'student_id' });

const LessonTeachers = require("./Database/Models/LessonTeachers")(Sequelize, sequelize);
Lessons.belongsToMany(Teachers, { through: LessonTeachers, foreignKey: 'lesson_id' });
Teachers.belongsToMany(Lessons, { through: LessonTeachers, foreignKey: 'teacher_id' });

Lessons.hasMany(LessonStudents, { as: 'LessonStudents', foreignKey: 'lesson_id' });
Lessons.hasMany(LessonTeachers, { as: 'LessonTeachers', foreignKey: 'lesson_id' });

Students.hasMany(LessonStudents, { as: 'LessonStudents', foreignKey: 'student_id' });
Teachers.hasMany(LessonTeachers, { as: 'LessonTeachers', foreignKey: 'teacher_id' });


// refactoring - сделать ожидание при запуске, не запускать приложение пока не запустится sequelize
sequelize.sync()
    .then((result) => {
        console.log(result);
    })
    .catch((err) => {
        console.log(err);
    });

// --- buisness-models

const daysHelper = require('./Routers/Models/daysHelper')();
const daysCounter = require('./Routers/Models/daysCounter')();
const lessonsModels = require('./Routers/Models/lessonsModels')
    (Sequelize, sequelize, daysHelper, daysCounter);

// --- routers

const koaRouter = require('@koa/router');
const routersHelper = require('./Routers/routersHelper')
    ();

// 
const lessonsController = require('./Routers/Lessons/lessonsController')
    (koaRouter, routersHelper, lessonsModels);
let lessonsControllerResult = lessonsController.initController();
app.use(lessonsControllerResult.router.routes());

// 
let PORT = 3000;
app.listen(PORT);
console.log(`http://localhost:${PORT}/`);
