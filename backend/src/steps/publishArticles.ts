import { DynamoDBService, Article } from "../services/dynamodb";

export const handler = async (event: Article[]) => {
  const dynamo = DynamoDBService();
  await dynamo.saveArticles(event);
  return event;
}