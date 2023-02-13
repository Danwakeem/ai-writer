import { Scrape } from './../services/scrape';
import { logger } from "../lib/logger";
import { State1 } from '../lib/types';
const scraper = Scrape();

export const handler = async (event: State1) => {
  const articleTexts = (await Promise.allSettled(
      event.articleUrls.map(
        (url) =>
          scraper.abcNewsArticleScrape(url)
            .catch((err) => {
              logger.error(`Error scraping url ${url}: ${err}`);
              return null;
            })
      )
    ))
    .map(({ status, value }: any) => status === 'fulfilled' ? { text: value } : null)
    .filter(Boolean);

  return articleTexts;
}