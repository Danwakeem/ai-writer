import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";
import { logger } from "../lib/logger";
import { Article } from "../lib/types";

const lambda = new LambdaClient({});
export const handler = async (event: Article[]): Promise<Article[]> => {
  logger.info('Booting HuggingFace');

  // Boot HuggingFace
  await lambda.send(new InvokeCommand({
    FunctionName: `hugging-face-service-${process.env.STAGE}-createPredictor`,
    Payload: Buffer.from(JSON.stringify({
      predictorName: process.env.HEADLINE_PREDICTOR_NAME,
      hub: {
        HF_MODEL_ID: 'snrspeaks/t5-one-line-summary',
        HF_TASK: 'text2text-generation'
      }
    }), 'utf8'),
  }));

  return event;
}