"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio = require("cheerio");
const rp = require("request-promise");
require('dotenv').config();
const date_time_1 = require("./date-time");
const database_1 = require("../common/database");
const date_time_2 = require("./date-time");
const baseUrl = 'https://www.dvdsreleasedates.com';
const nextFewMonths = date_time_1.getNextFewMonths();
const urls = nextFewMonths.map(month => {
    return `${baseUrl}/releases/${month.year}/${month.monthNumber}/new-dvd-releases-${month.monthName}-${month.year}`;
});
(() => __awaiter(this, void 0, void 0, function* () {
    for (let i = 0; i < urls.length; i++) {
        try {
            const data = yield rp(urls[i]);
            yield date_time_2.delay(200);
            const $ = cheerio.load(data);
            const movieUrls = getMovieLinks($);
            for (let j = 0; j < movieUrls.length; j++) {
                const data = yield rp(`${baseUrl}${movieUrls[j]}`);
                yield date_time_2.delay();
                const $ = cheerio.load(data);
                const name = $('h1').attr('itemprop', 'name');
                $('h2').each(function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const release = $(this).text();
                        const [, dvdRelease, , digitalRelease] = release.split(/was set for |is set for | and available on|and iTunes on /g);
                        const formattedMovie = formatMovie({ name, dvdRelease, digitalRelease });
                        yield database_1.saveMovieOrUpdateMovie(formattedMovie);
                    });
                });
            }
        }
        catch (error) {
            console.log({ error });
        }
    }
}))();
const formatMovie = ({ name, dvdRelease, digitalRelease }) => {
    name = (name.text() || '').trim();
    dvdRelease = (dvdRelease || '').trim().replace(/\./, '');
    if (dvdRelease)
        dvdRelease = date_time_1.toSqlDate(dvdRelease);
    if (!dvdRelease || /Invalid date/g.test(dvdRelease))
        dvdRelease = null;
    digitalRelease = (digitalRelease || '').trim().replace(/\./, '');
    if (digitalRelease)
        digitalRelease = date_time_1.toSqlDate(digitalRelease);
    if (!digitalRelease || /Invalid date/g.test(digitalRelease))
        digitalRelease = null;
    return { name, dvdRelease, digitalRelease };
};
const getMovieLinks = $ => {
    const links = $('.movieimg').parents();
    const movieUrls = [];
    for (let j = 0; j < links.length; j++) {
        const link = links[j].attribs.href;
        if (link)
            movieUrls.push(link);
    }
    return movieUrls;
};
