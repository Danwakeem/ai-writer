import { DynamoDBService } from "../../services/dynamodb";

export const handler = async (event) => {
  const ddb = DynamoDBService();
  const { lastEvaluatedKey } = event.arguments;
  const res = await ddb.getDailySummaries({
    lastEvaluatedKey,
  });

  return res;
};
