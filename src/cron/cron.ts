import * as cheerio from 'cheerio';
import * as rp from 'request-promise';
require('dotenv').config();

import { toSqlDate, getNextFewMonths } from './date-time';
import { saveMovieIfUndef } from '../common/database'
import { logInfo } from '../common'
import { delay } from './date-time';


const baseUrl = 'https://www.dvdsreleasedates.com';

const nextFewMonths = getNextFewMonths();
const urls = nextFewMonths.map(month => {
    return `${baseUrl}/releases/${month.year}/${month.monthNumber}/new-dvd-releases-${month.monthName}-${month.year}`;
});

(async () => {

    for (let i = 0; i < urls.length; i++) {
        try {

            // get month releases url data
            const data = await rp(urls[i]);
            await delay();
            const $ = cheerio.load(data);

            const movieUrls = getMovieLinks($);
            for (let j = 0; j < movieUrls.length; j++) {
                const data = await rp(`${baseUrl}${movieUrls[j]}`);
                await delay();
                const $ = cheerio.load(data);

                // movie name
                const name = $('h1').attr('itemprop', 'name');

                $('h2').each(async function() {
                    const release = $(this).text();
                    const [, dvdRelease, , digitalRelease] = release.split(/was set for |is set for | and available on|and iTunes on /g);
                    const formattedMovie = formatMovie({ name, dvdRelease, digitalRelease });

                    logInfo(`saving ${formattedMovie.name} ${formattedMovie.dvdRelease} ${formattedMovie.digitalRelease}`);
                    await saveMovieIfUndef(formattedMovie);
                });
            }

        } catch (error) {
            console.log({ error })
        }
    }
})();


const formatMovie = ({ name, dvdRelease, digitalRelease }) => {
    name = (name.text() || '').trim();

    dvdRelease = (dvdRelease || '').trim().replace(/\./, '');
    if (dvdRelease) dvdRelease = toSqlDate(dvdRelease);
    if (!dvdRelease || /Invalid date/g.test(dvdRelease)) dvdRelease = null;

    digitalRelease = (digitalRelease || '').trim().replace(/\./, '');
    if (digitalRelease) digitalRelease = toSqlDate(digitalRelease);
    if (!digitalRelease || /Invalid date/g.test(digitalRelease)) digitalRelease = null;

    return { name, dvdRelease, digitalRelease };
}

const getMovieLinks = $ => {
    const links = $('.movieimg').parents();

    const movieUrls = [];
    for (let j = 0; j < links.length; j++) {
        const link = links[j].attribs.href;
        if (link) movieUrls.push(link);
    }

    return movieUrls;
}
