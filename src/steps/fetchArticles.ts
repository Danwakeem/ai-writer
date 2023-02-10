import { logger } from "../lib/logger";
import { RSSService } from '../services/rss';
const rss = RSSService();

export const handler = async (event: any) => {
  logger.info('Fetching articles');
  const articleUrls = await rss.getArticleUrls();
  return {
    articleUrls,
  };
}