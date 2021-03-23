import cheerio from "cheerio";
import request from "tinyreq";

const olympediaUrl = "https://www.olympedia.org/editions";
const tableGameSelector = "table.table.table-striped:first-of-type>tbody";
const getGamesUrls = async () => {
  const data = await request(olympediaUrl);
  const $ = cheerio.load(data);
  const gamesColumn = $(
    `${tableGameSelector} tr td:nth-child(3) a`
  );
    gamesColumn.each((i, elem) => {
      const gameYear = $(`${tableGameSelector} tr:nth-child(${i + 1}) td:nth-child(2)`).text();
      console.log(i + 1, $(elem).text(), gameYear, '\nurl:', olympediaUrl + $(elem).attr('href'), '\n');
  });
};
(async () => {
  await getGamesUrls();
})();
