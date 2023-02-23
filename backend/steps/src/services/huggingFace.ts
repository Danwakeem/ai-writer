import https from 'https';
import { backOff } from "exponential-backoff";
import { SSM } from './ssm';
import { logger } from '../lib/logger';
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';

export type HuggingFaceRoot = HuggingFaceResponse[]

export interface HuggingFaceResponse {
  generated_text?: string
  summary_text?: string
}

const lambda = new LambdaClient({});
export const HuggingFace = () => {
  const ssm = SSM();

  const makeHttpsPostRequest = async (url: string, data: any): Promise<string> => {
    const apiKey = await ssm.getLocalParameter(process.env.HUGGING_FACE_KEY);
    return new Promise((resolve, reject) => {
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      };
      const req = https.request(url, options, (res: any) => {
        let body = '';
        res.on('data', (chunk: any) => {
          body += chunk;
        });
        res.on('end', () => {
          resolve(body);
        });
      }).on('error', (error: any) => {
        logger.error('Error', {error});
        reject(error);
      });
      req.write(JSON.stringify(data));
      req.end();
    });
  };

  const getHeadline = async (text: string): Promise<string> => {
    logger.info('Getting headline', { text });

    const { Payload } = await lambda.send(new InvokeCommand({
      FunctionName: `hugging-face-service-${process.env.STAGE}-predict`,
      Payload: Buffer.from(JSON.stringify({
        input: text,
        predictorName: process.env.HEADLINE_PREDICTOR_NAME,
      }), 'utf8'),
    }));

    const json = JSON.parse(Buffer.from(Payload || '{}')?.toString()) as HuggingFaceRoot;
    if (json?.[0]?.generated_text) {
      return json[0].generated_text;
    }
    logger.info('Could not generate headline', { Payload: Payload?.toString() });
    throw new Error('Could not generate headline');
  }

  const getSummary = async (text: string): Promise<string> => {
    logger.info('Getting summary', { text });
    const response = await makeHttpsPostRequest(
      'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
      {
        inputs: text,
      }
    );
    const json = JSON.parse(response) as HuggingFaceRoot;
    if (json?.[0]?.summary_text) {
      return json[0].summary_text;
    }
    logger.info('Could not generate summary', { response });
    throw new Error('Could not generate summary');
  }

  const summarize = async (text: string): Promise<{
    summary: string;
    headline: string;
  }> => {
    const headline = await getHeadline(text);
    const summary = await backOff<string>(
      () => getSummary(text),
      { maxDelay: 120000 },
    );

    return {
      headline,
      summary,
    };
  }

  return {
    summarize
  };
};
