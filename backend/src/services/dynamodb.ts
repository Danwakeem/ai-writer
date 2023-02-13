import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, BatchWriteCommand, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
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

  const groupExists = async (pk: string) => {
    const result = await ddb.send(new GetCommand({
      TableName,
      Key: {
        pk,
        sk: pk,
      },
    }));
    return !!result.Item;
  };

  const getPK = () => `GROUP#${format(new Date(), "MM-dd-yyyy")}`;

  const saveArticles = async (articles: Article[]) => {
    const headlines = articles.map((article) => article.headline);
    const pk = getPK();

    const group = {
      pk,
      sk: pk,
      title: pk.split('#')[1],
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
      pk,
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
  };

  const getDailySummaries = async ({
    lastEvaluatedKey,
  }: {
    lastEvaluatedKey?: { pk: string; sk: string };
  }) => {
    const { Items: summaries, LastEvaluatedKey } = await ddb.send(new QueryCommand({
      TableName,
      IndexName: 'docType-index',
      KeyConditionExpression: "docType = :docType",
      ExpressionAttributeValues: {
        ":docType": "group",
      },
      Limit: 10,
      ExclusiveStartKey: lastEvaluatedKey,
    }));

    return {
      lastEvaluatedKey: LastEvaluatedKey,
      summaries,
    };
  }

  const getArticles = async ({
    pk,
  }) => {
    const { Items } = await ddb.send(new QueryCommand({
      TableName,
      KeyConditionExpression: "pk = :pk and begins_with(sk, :sk)",
      ExpressionAttributeValues: {
        ":pk": pk,
        ":sk": 'ARTICLE#',
      },
    }));

    return Items;
  }

  return {
    saveArticles,
    groupExists,
    getPK,
    getDailySummaries,
    getArticles,
  };
};
