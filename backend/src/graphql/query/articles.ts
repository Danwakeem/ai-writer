import { DynamoDBService } from "../../services/dynamodb";

export const handler = async (event) => {
  const ddb = DynamoDBService();
  const { pk } = event.arguments;
  const res = await ddb.getArticles({
    pk,
  });

  return res;
};
