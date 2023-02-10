import { logger } from "../lib/logger";

export const handler = async (event: any) => {
  // Maybe publish to twitter and medium here
  logger.info('Publishing articles');
  return event;
}