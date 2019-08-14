const cheerio = require('cheerio');
const rp = require('request-promise');
const moment = require('moment');


const baseUrl = 'https://www.dvdsreleasedates.com';

const today = moment();
const thisYear = today.year();
const nextYear = today.year() + 1;

const thisMonth = today.month() + 1;
const nextFewMonths = [{
    monthNumber: thisMonth, 
    year: thisYear, 
    monthName: moment(thisMonth, 'MM').format('MMMM').toLowerCase()
}];

for(let i=1;i <= 5; i++){
    let nextMonth = thisMonth + i;

    const monthNumber = nextMonth > 12 ? nextMonth % 12 : nextMonth;
    const year = nextMonth > 12 ? nextYear : thisYear;

    nextFewMonths.push({
        monthNumber, 
        year, 
        monthName: moment(monthNumber, 'MM').format('MMMM').toLowerCase()
    });
}

const urls = nextFewMonths.map(month => {
    return `${baseUrl}/releases/${month.year}/${month.monthNumber}/new-dvd-releases-${month.monthName}-${month.year}`;
});

// console.log({ urls });


(async () => {

    for (let i = 0; i < urls.length; i++) {
        try {
            const data = await rp(urls[i]);
            const $ = cheerio.load(data);
            const links = $('.movieimg').parents();

            let movieUrls = [];
            for(let j=0; j < links.length; j++){
                const link = links[j].attribs.href;
                if (link) movieUrls.push(link);
            }
            
            for (let j = 0; j < movieUrls.length; j++) {
                const data = await rp(`${baseUrl}${movieUrls[j]}`);
                const $ = cheerio.load(data);
                const name = $('h1').attr('itemprop', 'name');
                const futures = $('h2 .future');
                const pasts = $('h2 .past');

                futures.each(function (i, elem) {
                    console.log('futures', name.text(), $(this).text())
                });

                pasts.each(function (i, elem) {
                    console.log('pasts', name.text(), $(this).text())
                });
            }

        } catch (error) {
            console.log({ error })
        }
    }
})();
