import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { SummarizedArticle } from "../lib/types";
import { format } from 'date-fns';

const getArticleKey = () => `${format(new Date(), 'MM-dd-yyyy')}.mdx`;
const getDate = () => format(new Date(), 'yyyy-MM-dd');

const uniqueArrayValues = (arr: string[]) => {
  return arr.filter((value, index) => arr.indexOf(value) === index);
}

const convertToMDX = (title: string, articles: SummarizedArticle[]) => {
  return `---
title: '${title}'
date: '${getDate()}'
tags: ['${uniqueArrayValues(articles.map(({ tag }) => tag)).join('\', \'')}']
draft: false
summary: '${articles[0].headline}...'
---

${articles.map(({ headline, summary, link }) => `## ${headline}\n${summary}\n\n[Original Article](${link})`).join('\n\n')}
`;
}

export const S3Service = () => {
  const client = new S3Client({});

  const hasArticleForToday = async () => {
    const key = getArticleKey();
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
    const key = getArticleKey();
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: convertToMDX(key.replace('.mdx', ''), articles),
      ACL: 'public-read',
    });
    await client.send(command);
  }

  return {
    hasArticleForToday,
    saveArticles,
  }
};
