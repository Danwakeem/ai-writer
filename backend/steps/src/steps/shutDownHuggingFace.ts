import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";
import { logger } from "../lib/logger";
import { SummarizedArticle } from "../lib/types";

const lambda = new LambdaClient({});
export const handler = async (event: SummarizedArticle[]) => {
  logger.info('Shutting Down HuggingFace');

  // Boot HuggingFace
  await lambda.send(new InvokeCommand({
    FunctionName: `hugging-face-service-${process.env.STAGE}-removePredictor`,
    Payload: Buffer.from(JSON.stringify({
      predictorName: process.env.HEADLINE_PREDICTOR_NAME,
    }), 'utf8'),
  }));

  return event;
}