import { Scrape } from './../services/scrape';
import { logger } from "../lib/logger";
import { State1, ParsedArticle } from '../lib/types';
const scraper = Scrape();

export const handler = async (event: State1) => {
  const parsedArticle: ParsedArticle[] = (await Promise.allSettled(
      event.articles.map(
        async ({link, tag}) => ({
          link,
          text: await scraper.abcNewsArticleScrape(link)
            .catch((err) => {
              logger.error(`Error scraping url ${link}: ${err}`);
              return null;
            }),
          tag,
        })
      )
    ))
    .map(({ status, value }: any) => status === 'fulfilled' ? value : null)
    .filter(Boolean);

  return parsedArticle;
}