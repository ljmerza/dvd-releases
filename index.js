const cheerio = require('cheerio');
var rp = require('request-promise');

const urls = [
    'https://www.dvdsreleasedates.com/releases/2019/9/new-dvd-releases-september-2019',
    'https://www.dvdsreleasedates.com/releases/2019/10/new-dvd-releases-october-2019',
    'https://www.dvdsreleasedates.com/releases/2019/11/new-dvd-releases-november-2019',
    'https://www.dvdsreleasedates.com/releases/2019/12/new-dvd-releases-december-2019',
];

const baseUrl = 'https://www.dvdsreleasedates.com';

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
