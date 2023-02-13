import { logger } from "../lib/logger";
import { RSSService } from '../services/rss';
const rss = RSSService();

const getEndPath = (url: string) => {
  const split = url.split('/');
  const end = split[split.length - 1];
  const splitByDash = end.split('-');
  splitByDash.pop();
  return splitByDash.join('-');
}

export const handler = async (event: any) => {
  logger.info('Fetching articles');
  const articleUrls = await rss.getArticleUrls();

  const basePaths: string[] = [];
  return {
    articleUrls: articleUrls
      .reduce((arr: any, url: string) => {
        if (!basePaths.includes(getEndPath(url))) {
          basePaths.push(getEndPath(url));
          arr.push(url);
        }
        return arr;
      }, [])
      // Limiting to only 10 articles for now :)
      .filter((val, i) => i < 10),
  };
}