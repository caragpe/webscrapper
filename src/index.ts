import cheerio from "cheerio";
import request from "tinyreq";

interface GamesType {
  year: number;
  location: string;
  url: string;
};

const olympediaUrl = "https://www.olympedia.org/editions";
const tableGameSelector = "table.table.table-striped:first-of-type>tbody";

const MAX_GAME_YEAR = 2020;
const BASE_TEN = 10;

const getGamesUrls = async (): Promise<GamesType[]> => {
  let games: GamesType[] = [];
  const data = await request(olympediaUrl);
  const $ = cheerio.load(data);
  const gamesColumn = $(
    `${tableGameSelector} tr td:nth-child(3) a`
  );
    gamesColumn.each((i, elem) => {
      const gameYear = parseInt($(`${tableGameSelector} tr:nth-child(${i + 1}) td:nth-child(2)`).text(), BASE_TEN);
      const location = $(elem).text();
      const url = olympediaUrl + $(elem).attr('href');
      if (gameYear < MAX_GAME_YEAR) {
        games.push({
          year: gameYear,
          location: location,
          url: url
        })
      }
    });
  return games;
};
(async () => {
  const results = await getGamesUrls();
  console.log(results);
})();
