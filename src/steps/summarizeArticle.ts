import { OpenAI } from '../services/openai'
const openai = OpenAI();

export const handler = async ({ text }: {text: string}) => {
  const summary = await openai.summarize(text);
  return {
    summary
  };
}