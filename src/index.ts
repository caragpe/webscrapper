import cheerio from "cheerio";
import request from "tinyreq";
import cheerioModule from "cheerio";

interface GamesType {
  year: number;
  location: string;
  url: string;
}

interface MedalsByGame {
  year: number;
  location: string;
  medals: MedalsByCountryByGameType[];
}
interface MedalsByCountryByGameType {
  country: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
}

const olympediaUrl = "https://www.olympedia.org";
const tableGameSelector = "table.table.table-striped:first-of-type>tbody";

const MAX_GAME_YEAR = 2020;
const BASE_TEN = 10;

const getGamesUrls = async (): Promise<GamesType[]> => {
  let games: GamesType[] = [];
  const data = await request(`${olympediaUrl}/editions`);
  const $ = cheerio.load(data);
  const gamesColumn = $(`${tableGameSelector} tr td:nth-child(3) a`);
  gamesColumn.each((i, elem) => {
    const gameYear = parseInt(
      $(`${tableGameSelector} tr:nth-child(${i + 1}) td:nth-child(2)`).text(),
      BASE_TEN
    );
    const location = $(elem).text();
    const url = olympediaUrl + $(elem).attr("href");
    if (gameYear < MAX_GAME_YEAR) {
      games.push({
        year: gameYear,
        location: location,
        url: url,
      });
    }
  });
  return games;
};

const getMedalsByCountry = async (game: GamesType): Promise<MedalsByGame> => {
  const { url, year, location } = game;
  let currentGame: MedalsByGame = {
    year: year,
    location: location,
    medals: [],
  };
  const data = await request(url);
  const $ = cheerio.load(data);
  const tables = $("h2 + table");
  let isStillSearching = true;
  tables.each((_, table) => {
    const headerRow = $(table).find("thead tr th");
    if (isStillSearching && $(headerRow[0]).text() === "NOC") {
      isStillSearching = true;
      const countries = $(table).find("tbody tr");
      countries.each((_, country) => {
        const countryColumns = $(country).find("td");
        const countryMedals: MedalsByCountryByGameType = { 
          country: $(countryColumns[0]).text(),
          gold: parseInt($(countryColumns[2]).text(), BASE_TEN),
          silver: parseInt($(countryColumns[3]).text(), BASE_TEN),
          bronze: parseInt($(countryColumns[4]).text(), BASE_TEN),
          total: parseInt($(countryColumns[5]).text(), BASE_TEN),
        };
        currentGame.medals.push(countryMedals);
      });
    }
  });
  return currentGame;
};

(async () => {
  await getGamesUrls().then(async (results) => {
    results.map(async (game: GamesType) => {
      const medalsByCountry = await getMedalsByCountry(game);
      console.log(medalsByCountry);
    });
  });
})();
