import { SummarizedArticle } from "../lib/types";
import { S3Service } from "../services/s3";

export const handler = async (event: SummarizedArticle[]) => {
  const s3 = S3Service();
  await s3.saveArticles(event);
  return event;
}