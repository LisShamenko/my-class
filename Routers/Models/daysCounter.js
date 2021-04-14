module.exports = () => {
    return {
        getDaysCounter: getDaysCounter,
    };
}

function getDaysCounter(date, daysCount, maxCount) {

    let daysCounter = {

        init: function (startDate, daysCount, maxCount) {
            this.startDate = startDate;
            this.endDate = new Date(startDate);
            this.endDate.setDate(this.endDate.getDate() + daysCount);
            this.maxCount = maxCount;
            this.counter = 0;
        },

        nextDay: function (day) {
            this.counter += 1;
            if (this.counter >= this.maxCount ||
                day.getTime() > this.endDate.getTime()) {
                return true;
            }
            return false;
        }
    }

    daysCounter.init(date, daysCount, maxCount);
    return daysCounter;
}