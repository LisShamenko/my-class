const assert = require('assert');

// -------------------------------

const daysHelper = require('./../Routers/Models/daysHelper')();

describe('Days Helper', () => {
    describe('Метод nextDay', () => {
        it('Среда: 2021-04-14. Понедельник-Вторник-Среда:Сегодня-Четверг-Пятница-Суббота-Воскресенье', () => {
            let dh = daysHelper.getDaysHelper([0, 1, 2, 3, 4, 5, 6], new Date('2021-04-14T00:00:00'));
            assert.strictEqual((new Date('2021-04-14T00:00:00')).toString(), dh.curDate.toString());
            assert.strictEqual((new Date('2021-04-15T00:00:00')).toString(), dh.nextDay().toString());
            assert.strictEqual((new Date('2021-04-16T00:00:00')).toString(), dh.nextDay().toString());
            assert.strictEqual((new Date('2021-04-17T00:00:00')).toString(), dh.nextDay().toString());
            assert.strictEqual((new Date('2021-04-18T00:00:00')).toString(), dh.nextDay().toString());
            assert.strictEqual((new Date('2021-04-19T00:00:00')).toString(), dh.nextDay().toString());
            assert.strictEqual((new Date('2021-04-20T00:00:00')).toString(), dh.nextDay().toString());
            assert.strictEqual((new Date('2021-04-21T00:00:00')).toString(), dh.nextDay().toString());
        });
        it('Среда: 2021-04-14. Сегодня-Пятница-Суббота', () => {
            let dh = daysHelper.getDaysHelper([5, 6], new Date('2021-04-14T00:00:00'));
            assert.strictEqual((new Date('2021-04-16T00:00:00')).toString(), dh.curDate.toString());
            assert.strictEqual((new Date('2021-04-17T00:00:00')).toString(), dh.nextDay().toString());
            assert.strictEqual((new Date('2021-04-23T00:00:00')).toString(), dh.nextDay().toString());
            assert.strictEqual((new Date('2021-04-24T00:00:00')).toString(), dh.nextDay().toString());
            assert.strictEqual((new Date('2021-04-30T00:00:00')).toString(), dh.nextDay().toString());
            assert.strictEqual((new Date('2021-05-01T00:00:00')).toString(), dh.nextDay().toString());
        });
        it('Среда: 2021-04-14. Понедельник-Вторник-Сегодня-Пятница', () => {
            let dh = daysHelper.getDaysHelper([1, 2, 5], new Date('2021-04-14T00:00:00'));
            assert.strictEqual((new Date('2021-04-16T00:00:00')).toString(), dh.curDate.toString());
            assert.strictEqual((new Date('2021-04-19T00:00:00')).toString(), dh.nextDay().toString());
            assert.strictEqual((new Date('2021-04-20T00:00:00')).toString(), dh.nextDay().toString());
            assert.strictEqual((new Date('2021-04-23T00:00:00')).toString(), dh.nextDay().toString());
            assert.strictEqual((new Date('2021-04-26T00:00:00')).toString(), dh.nextDay().toString());
            assert.strictEqual((new Date('2021-04-27T00:00:00')).toString(), dh.nextDay().toString());
        });        
    });
});

// -------------------------------

const daysCounter = require('./../Routers/Models/daysCounter')();

describe('Days Counter', () => {
    describe('Счетчик', () => {
        it('Счетчик занятий: 2021-04-14 / дней:10 / занятий:3', () => {
            let dc = daysCounter.getDaysCounter(new Date('2021-04-14T00:00:00'), 10, 3);
            assert.strictEqual(false, dc.nextDay(new Date('2021-04-18T00:00:00')));
            assert.strictEqual(false, dc.nextDay(new Date('2021-04-19T00:00:00')));
            assert.strictEqual(true, dc.nextDay(new Date('2021-04-20T00:00:00')));
            assert.strictEqual(true, dc.nextDay(new Date('2021-04-21T00:00:00')));
            assert.strictEqual(true, dc.nextDay(new Date('2021-04-29T00:00:00')));
        });
        it('Счетчик дней: 2021-04-14 / дней:10 / занятий:10', () => {
            let dc = daysCounter.getDaysCounter(new Date('2021-04-14T00:00:00'), 10, 30);
            assert.strictEqual(false, dc.nextDay(new Date('2021-04-18T00:00:00')));
            assert.strictEqual(false, dc.nextDay(new Date('2021-04-19T00:00:00')));
            assert.strictEqual(false, dc.nextDay(new Date('2021-04-20T00:00:00')));
            assert.strictEqual(false, dc.nextDay(new Date('2021-04-21T00:00:00')));
            assert.strictEqual(true, dc.nextDay(new Date('2021-04-29T00:00:00')));
        });
    });
});