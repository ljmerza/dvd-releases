import * as moment from 'moment';


const MOVIE_RELEASE_FORMAT = 'MMMM DD, YYYY';
const SQL_FORMAT = 'YYYY-MM-DD';

export const toSqlDate = date => {
    return moment(date, MOVIE_RELEASE_FORMAT).format(SQL_FORMAT);
}


const today = moment();
export const thisYear = today.year();
export const nextYear = today.year() + 1;

export const thisMonth = today.month() + 1;

export const getNextFewMonths = () => {
    const nextFewMonths = [{
        monthNumber: thisMonth,
        year: thisYear,
        monthName: moment(thisMonth, 'MM').format('MMMM').toLowerCase(),
    }];


    // get the next few months in strings
    for (let i = 1; i <= 5; i++) {
        let nextMonth = thisMonth + i;

        const monthNumber = nextMonth > 12 ? nextMonth % 12 : nextMonth;
        const year = nextMonth > 12 ? nextYear : thisYear;

        nextFewMonths.push({
            monthNumber,
            year,
            monthName: moment(monthNumber, 'MM').format('MMMM').toLowerCase()
        });
    }

    return nextFewMonths;
}

export function delay(time = 3000) {
    return new Promise(resolve => setTimeout(() => resolve(), time));
}
