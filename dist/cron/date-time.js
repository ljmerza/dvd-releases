"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const MOVIE_RELEASE_FORMAT = 'MMMM, Do, YYYY';
const SQL_FORMAT = 'YYYY-MM-DD';
exports.toSqlDate = date => {
    return moment(date, MOVIE_RELEASE_FORMAT).format(SQL_FORMAT);
};
const today = moment();
exports.thisYear = today.year();
exports.nextYear = today.year() + 1;
exports.thisMonth = today.month() + 1;
exports.getNextFewMonths = () => {
    const nextFewMonths = [{
            monthNumber: exports.thisMonth,
            year: exports.thisYear,
            monthName: moment(exports.thisMonth, 'MM').format('MMMM').toLowerCase(),
        }];
    for (let i = 1; i <= 5; i++) {
        let nextMonth = exports.thisMonth + i;
        const monthNumber = nextMonth > 12 ? nextMonth % 12 : nextMonth;
        const year = nextMonth > 12 ? exports.nextYear : exports.thisYear;
        nextFewMonths.push({
            monthNumber,
            year,
            monthName: moment(monthNumber, 'MM').format('MMMM').toLowerCase()
        });
    }
    return nextFewMonths;
};
function delay(time = 3000) {
    return new Promise(resolve => setTimeout(() => resolve(), time));
}
exports.delay = delay;
