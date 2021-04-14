const assert = require('assert');

// refactoring - раскидать по модулям

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

// -------------------------------

const routersHelper = require('./../Routers/routersHelper')();

describe('Routers Helper', () => {
    describe('Валидация', () => {
        it('Регулярка для дат.', () => {
            assert.strictEqual(true, routersHelper.dateRegExp.test('2021-04-14'));
            assert.strictEqual(false, routersHelper.dateRegExp.test('date'));
        });
        it('Парсинг чисел.', () => {
            assert.strictEqual(0, routersHelper.parseNumberWithDefault('0', 100));
            assert.strictEqual(100, routersHelper.parseNumberWithDefault('', 100));
            assert.strictEqual(100, routersHelper.parseNumberWithDefault('date', 100));
            assert.strictEqual(0, routersHelper.parseNumberWithDefault('0', undefined));
            assert.strictEqual(undefined, routersHelper.parseNumberWithDefault('', undefined));
            assert.strictEqual(undefined, routersHelper.parseNumberWithDefault('date', undefined));
        });
        it('Парсинг строки с датами.', () => {
            assert.deepStrictEqual(['2021-04-14'], routersHelper.parseStringToDates('2021-04-14'));
            assert.deepStrictEqual(['2021-04-14', '2021-04-15'], routersHelper.parseStringToDates('2021-04-14,2021-04-15'));
            assert.deepStrictEqual(['2021-04-14', '2021-04-15'], routersHelper.parseStringToDates('2021-04-14,date,2021-04-15'));
        });
        it('Парсинг строки с идентификаторами.', () => {
            assert.strictEqual(undefined, routersHelper.parseStringToTeachers(undefined));
            assert.deepStrictEqual(undefined, routersHelper.parseStringToTeachers(''));
            assert.deepStrictEqual([1], routersHelper.parseStringToTeachers('1'));
            assert.deepStrictEqual([1, 2], routersHelper.parseStringToTeachers('1,2'));
            assert.deepStrictEqual([1, 2], routersHelper.parseStringToTeachers('1,date,2'));
            assert.deepStrictEqual(undefined, routersHelper.parseStringToTeachers('date,date'));
        });
    });
});






