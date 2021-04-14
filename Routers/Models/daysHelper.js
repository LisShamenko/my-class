module.exports = () => {
    return {
        getDaysHelper: getDaysHelper,
    };
}

function getDaysHelper(days, date) {

    let daysHelper = {

        init: function (days, date) {
            this.days = days;
            this.days.sort((a, b) => a - b).map(item => item >= 0 && item < 7);
            this.curDay = date.getDay();

            let ind = this.findDay(this.curDay);
            if (ind >= 0) {
                this.curInd = ind;
                this.curDate = date;
            }
            else {
                let offset = 0;
                let nextInd = this.findNextInd(this.curDay);
                let nextDay = this.days[nextInd];
                if (this.curDay < nextDay) {
                    offset = nextDay - this.curDay;
                }
                else {
                    offset = (7 - this.curDay) + nextDay;
                }
                date.setDate(date.getDate() + offset);
                this.curInd = nextInd;
                this.curDay = nextDay;
                this.curDate = date;
            }
        },

        findDay: function (day) {
            for (let i = 0; i < this.days.length; i++) {
                if (day === this.days[i]) {
                    return i;
                }
            }
            return -1;
        },

        findNextInd: function (day) {
            for (let i = 0; i < this.days.length; i++) {
                if (day < this.days[i]) {
                    return i;
                }
            }
            return 0;
        },

        nextDay: function () {
            let offset = 0;
            if (this.curInd >= days.length - 1) {
                offset = (7 - this.days[this.curInd]) + this.days[0];
                this.curInd = 0;
                this.curDay = this.days[this.curInd];
            }
            else {
                offset = this.days[this.curInd + 1] - this.days[this.curInd];
                this.curInd += 1;
                this.curDay = this.days[this.curInd];
            }
            this.curDate.setDate(this.curDate.getDate() + offset);
            return this.curDate;
        }
    }

    daysHelper.init(days, date);
    return daysHelper;
}
