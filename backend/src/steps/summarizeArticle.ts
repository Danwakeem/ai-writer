import { HuggingFace } from '../services/huggingFace'
const huggingFace = HuggingFace();

export const handler = async ({ text }: {text: string}) => {
  const {
    summary,
    headline,
  } = await huggingFace.summarize(text);
  return {
    summary,
    headline,
  };
}