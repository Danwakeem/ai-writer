import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { SummarizedArticle } from "../lib/types";
import { MarkdownService } from "./markdown";


export const S3Service = () => {
  const client = new S3Client({});
  const markdown = MarkdownService();

  const getArticleTitleAndKey = () => {
    const title = markdown.getTitle();
    return {
      key: `${title}.mdx`,
      title,
    };
  }

  const hasArticleForToday = async () => {
    const { key } = getArticleTitleAndKey();
    const command = new HeadObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
    });
    try {
      await client.send(command);
      return true;
    } catch (err) {
      return false;
    }
  }

  // Generate MDX file with article data
  const saveArticles = async (articles: SummarizedArticle[]) => {
    const {key, title} = getArticleTitleAndKey();
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: markdown.convertToMDX(title, articles),
      ACL: 'public-read',
    });
    await client.send(command);
  }

  return {
    hasArticleForToday,
    saveArticles,
  }
};
