import https from 'https';
import { logger } from '../lib/logger';
import { SummarizedArticle } from '../lib/types';
import { MarkdownService } from './markdown';
import { SSM } from './ssm';

export const MediumService = () => {
  const ssm = SSM();
  const markdown = MarkdownService();
  const getMediumSecrets = async (): Promise<{
    authorId: string;
    token: string;
  }> => {
    const config = await ssm.getLocalParameter(process.env.MEDIUM_CONFIG);
    return JSON.parse(config);
  }
  
  const publishArticleToMediumAPI = (title: string, content: string) => new Promise(async (resolve, reject) => {
    const { authorId, token } = await getMediumSecrets();
    const options = {
      'method': 'POST',
      'hostname': 'api.medium.com',
      'path': `/v1/users/${authorId}/posts`,
      'headers': {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    };
    
    const req = https.request(options, (res) => {
      let chunks: any[] = [];
    
      res.on("data", (chunk) => {
        chunks.push(chunk);
      });
    
      res.on("end", () => {
        const body = Buffer.concat(chunks);
        logger.info('Medium Response', {body: body.toString()});
        resolve(body.toString());
      });
    
      res.on("error", (error) => {
        logger.error('Publishing error', {error});
        reject(error);
      });
    });
    
    const postData = JSON.stringify({
      title: `🤖 AI Bot ${title}`,
      content,
      contentFormat: 'markdown',
      publishStatus: 'public',
    });
    
    req.write(postData);
    req.end();
  });

  const publishArticles = async (articles: SummarizedArticle[]) => {
    const title = markdown.getTitle();
    const content = markdown.convertToMarkdown(articles);
    await publishArticleToMediumAPI(title, content);
  }

  return {
    publishArticles
  };
};
