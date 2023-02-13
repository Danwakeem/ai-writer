import { logger } from "../lib/logger";
import { RSSService } from '../services/rss';
import { DynamoDBService } from '../services/dynamodb';
const rss = RSSService();
const ddb = DynamoDBService();

const getEndPath = (url: string) => {
  const split = url.split('/');
  const end = split[split.length - 1];
  const splitByDash = end.split('-');
  splitByDash.pop();
  return splitByDash.join('-');
}

export const handler = async (event: any) => {
  logger.info('Fetching articles');

  const groupExists = await ddb.groupExists(ddb.getPK());
  if (groupExists) {
    return {
      skip: 'true',
      articleUrls: [],
    }
  }

  const articleUrls = await rss.getArticleUrls();

  const basePaths: string[] = [];
  return {
    skip: 'false',
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