import https from 'https';
import { load } from 'cheerio';

export const Scrape = () => {
  const getDataFromUrl = (url): Promise<string> => {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve(data);
        });
      }).on('error', (err) => {
        reject(err);
      });
    });
  }

  const abcNewsArticleScrape = async (link) => {
    const html = await getDataFromUrl(link);
    const $ = load(html);
  
    const getAllTextFromChildParagraphTags = (parentElement) => {
      const childParagraphTags = parentElement.find('p');
      const textFromChildParagraphTags: string[] = [];
      for (let i = 0; i < childParagraphTags.length; i++) {
        textFromChildParagraphTags.push(childParagraphTags?.[i]?.children?.[0]?.data);
      }
      return textFromChildParagraphTags;
    };
    const parentElement = $('article[data-testid="prism-article-body"]');
    return getAllTextFromChildParagraphTags(parentElement).join('\n')
  }

  return {
    abcNewsArticleScrape,
  };
};
