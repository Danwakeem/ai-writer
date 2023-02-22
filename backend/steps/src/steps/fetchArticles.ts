import { logger } from "../lib/logger";
import { RSSService } from '../services/rss';
import { S3Service } from "../services/s3";
const s3 = S3Service();
const rss = RSSService();

export const handler = async () => {
  logger.info('Fetching articles');

  const articleExists = await s3.hasArticleForToday();
  if (articleExists) {
    return {
      skip: 'true',
      articleUrls: [],
    }
  }

  const articleData = await rss.getArticleUrls();

  return {
    skip: 'false',
    articles: articleData
      // Limiting to only 10 articles for now :)
      .filter((val, i) => i < 10),
  };
}