import { SummarizedArticle } from "../lib/types";
import { GithubService } from "../services/github";
import { MediumService } from "../services/medium";
import { S3Service } from "../services/s3";

export const handler = async (event: SummarizedArticle[]) => {
  const s3 = S3Service();
  const medium = MediumService();
  const github = GithubService();
  await s3.saveArticles(event);
  await medium.publishArticles(event);
  await github.dispatchFrontendRebuild();
  return event;
}