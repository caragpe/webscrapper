import cheerio from "cheerio";
import request from "tinyreq";
const olympediaUrl = "https://www.olympedia.org/editions";
const getGamesUrls = async () => {
  const data = await request(olympediaUrl);
  const $ = cheerio.load(data);
  const tableRows = $(
    "table.table.table-striped:first-of-type>tbody tr td:nth-child(3) a"
  );
  tableRows.each((i, elem) => {
    console.log(i, $(elem).text());
  });
};
(async () => {
  await getGamesUrls();
})();
