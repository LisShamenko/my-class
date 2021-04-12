// --- koa

const Koa = require('koa');
const app = new Koa();

// --- koa-body

const koaBody = require('koa-body');
app.use(koaBody());

// --- routers

const koaRouter = require('@koa/router');
const routersHelper = require('./Routers/routersHelper')
    ();

// 
const lessonsController = require('./Routers/Lessons/lessonsController')
    (koaRouter, routersHelper, app);
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
