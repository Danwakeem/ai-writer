import { ParsedArticle } from '../lib/types';
import { OpenAI } from '../services/openai'
const ai = OpenAI();

export const handler = async (articles: ParsedArticle[]) => {
  return ai.summarizeAll(articles);
}