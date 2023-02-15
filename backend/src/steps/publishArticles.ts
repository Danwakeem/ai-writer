import { SummarizedArticle } from "../lib/types";
import { MediumService } from "../services/medium";
import { S3Service } from "../services/s3";

export const handler = async (event: SummarizedArticle[]) => {
  const s3 = S3Service();
  const medium = MediumService();
  await s3.saveArticles(event);
  await medium.publishArticles(event);
  return event;
}