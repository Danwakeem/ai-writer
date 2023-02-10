import https from 'https';
import { XMLParser} from 'fast-xml-parser';

export interface XMLRoot {
  rss: Rss
}

export interface Rss {
  channel: Channel
}

export interface Channel {
  title: string
  link: string
  description: string
  image: Image
  item: Item[]
}

export interface Image {
  title: string
  url: string
  link: string
}

export interface Item {
  "media:thumbnail": string[]
  "media:keywords": number
  title: string
  link: string
  guid: string
  pubDate: string
  description: string
  category: string
}


export const RSSService = () => {
  const rssFeed = 'https://abcnews.go.com/abcnews/internationalheadlines';

  const makeHttpsRequest = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      https.get(url, (res: any) => {
        let body = '';
        res.on('data', (chunk: any) => {
          body += chunk;
        });
        res.on('end', () => {
          resolve(body);
        });
      }).on('error', (e: any) => {
        reject(e);
      });
    });
  }

  const getArticleUrls = async () => {
    const xml = await makeHttpsRequest(rssFeed);
    const parser = new XMLParser();
    const json = parser.parse(xml) as XMLRoot;

    return json.rss.channel.item.map((item) => item.link);
  };

  return {
    getArticleUrls,
  }
};
