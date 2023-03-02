import { ChatCompletionRequestMessage, ChatCompletionResponseMessage, Configuration, OpenAIApi  } from 'openai';
import { logger } from '../lib/logger';
import { ParsedArticle, SummarizedArticle } from '../lib/types';
import { SSM } from './ssm';

export const OpenAI = () => {
  const ssm = SSM();

  const getOpenAI = async () => {
    const apiKey = await ssm.getLocalParameter(process.env.OPENAI_PARAMETER_NAME || '');
    const configuration = new Configuration({
      apiKey,
    });
    const openai = new OpenAIApi(configuration);
    return openai;
  }
  
  const summarize = async (text: string, messages: ChatCompletionRequestMessage[]): Promise<ChatCompletionResponseMessage | undefined> => {
    const openai = await getOpenAI();
    const { data: response } = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages,
    })

    return response?.choices?.[0]?.message;
  };

  const summarizeAll = async (articles: ParsedArticle[]): Promise<SummarizedArticle[]> => {
    const finalOutput: SummarizedArticle[] = [];
    
    for(const article of articles) {
      const messages: ChatCompletionRequestMessage[] = [
        {
          role: 'system',
          content: `You an AI tasked with summarizing articles for a news website.`
        },
      ];
      messages.push({
        role: 'user',
        content: `Summarize the following text but return the results as a json object with the following properties

        headline - A click bait style description of the text
        summary - A creatively paraphrased summary of the text
        tag - A short phrase consisting of 1 to two words that the article is best categorized by
        
        ${article.text}`,
      });

      const message = await summarize(article.text, messages);

      if (message !== undefined) {
        const { headline, summary, tag } = JSON.parse(message.content);
        finalOutput.push({
          headline,
          summary,
          tag,
          link: article.link,
        });
      }
    }

    return finalOutput;
  };

  return {
    summarizeAll,
  };
};
