import { logger } from "../lib/logger";

const http = require('http');

export interface ParamResponse {
  Parameter: Parameter
  ResultMetadata: ResultMetadata
}

export interface Parameter {
  ARN: string
  DataType: string
  LastModifiedDate: string
  Name: string
  Selector: any
  SourceResult: any
  Type: string
  Value: string
  Version: number
}

export interface ResultMetadata {}

export const SSM = () => {
  // Make http request
  const request = (name: string): Promise<ParamResponse> => new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: process.env.PARAMETERS_SECRETS_EXTENSION_HTTP_PORT,
      path: `/systemsmanager/parameters/get?name=${name}&withDecryption=true`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Aws-Parameters-Secrets-Token': process.env.AWS_SESSION_TOKEN,
      },
    };

    const req = http.request(options, (res: any) => {
      res.on('data', (d: Buffer) => {
        try {
          const json = JSON.parse(d.toString());
          resolve(json);
        } catch(error) {
          reject(error);
        }
      });
    });

    req.on('error', (error: any) => {
      reject(error);
    });

    req.end();
  });

  const getLocalParameter = async (name: string): Promise<string> => {
    const res = await request(name);
    return res?.Parameter?.Value;
  }

  return {
    getLocalParameter,
  };
};
