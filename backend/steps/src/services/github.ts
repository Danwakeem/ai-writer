import { logger } from "../lib/logger";
import { SSM } from "./ssm";

const https = require('https');

export const GithubService = () => {
  const ssm = SSM();

  const fetchGithubKey = async (): Promise<string> => {
    const key = await ssm.getLocalParameter(process.env.GITHUB_KEY);
    return key
  };

  const makeRequestToGithubApi = async (url: string, data: any): Promise<string> => {
    const key = await fetchGithubKey();
    return new Promise((resolve, reject) => {
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ai-writer',
          Authorization: `token ${key}`,
        },
      };
      const req = https.request(url, options, (res: any) => {
        let body = '';
        res.on('data', (chunk: any) => {
          body += chunk;
        });
        res.on('end', () => {
          logger.info('Github response', {body});
          resolve(body);
        });
      }).on('error', (error: any) => {
        console.log('Error', {error});
        reject(error);
      });
      req.write(JSON.stringify(data));
      req.end();
    });
  }

  const dispatchFrontendRebuild = async () => {
    const url = 'https://api.github.com/repos/Danwakeem/ai-writer/dispatches';
    const data = {
      event_type: 'rebuild',
    };
    const response = await makeRequestToGithubApi(url, data);
    return response;
  };
  
  return {
    dispatchFrontendRebuild,
  };
};
