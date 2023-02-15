import { ParsedArticle } from '../lib/types';
import { HuggingFace } from '../services/huggingFace'
const huggingFace = HuggingFace();

export const handler = async ({ text, tag, link }: ParsedArticle) => {
  const {
    summary,
    headline,
  } = await huggingFace.summarize(text);
  return {
    summary,
    headline,
    tag,
    link,
  };
}