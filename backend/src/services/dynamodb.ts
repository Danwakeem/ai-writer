import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import { addDays, format } from 'date-fns';
import { v4 as uuid } from 'uuid';

export interface Article {
  headline: string;
  summary: string;
}

export const DynamoDBService = () => {
  const client = new DynamoDB({});
  const ddb = DynamoDBDocumentClient.from(client);
  const TableName = process.env.DYNAMO_TABLE || "";

  const saveArticles = async (articles: Article[]) => {
    const headlines = articles.map((article) => article.headline);
    const today = format(new Date(), "MM-dd-yyyy");

    const group = {
      pk: `GROUP#${today}`,
      sk: `GROUP#${today}`,
      title: today,
      headlines: headlines,
      docType: 'group',
      // Expire in 20 days
      ttl: Math.floor(addDays(new Date(), 20).getTime() / 1000),
    };

    await ddb.send(new PutCommand({
      TableName,
      Item: group,
    }));

    const items = articles.map((article) => ({
      pk: `GROUP#${today}`,
      sk: `ARTICLE#${uuid()}`,
      title: article.headline,
      summary: article.summary,
      docType: 'article',
      ttl: Math.floor(addDays(new Date(), 20).getTime() / 1000),
    }));

    await ddb.send(new BatchWriteCommand({
      RequestItems: {
        [TableName]: items.map((Item) => ({
          PutRequest: {
            Item,
          },
        })),
      },
    }));
  }

  return {
    saveArticles,
  };
};
