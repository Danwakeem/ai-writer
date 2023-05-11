import { ChatCompletionRequestMessage, ChatCompletionResponseMessage, Configuration, OpenAIApi  } from 'openai';
import { ParsedArticle, SummarizedArticle } from '../lib/types';
import { jsonrepair } from 'jsonrepair';
import { SSM } from './ssm';
import { logger } from './../lib/logger';

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
    }, {
      timeout: 60000, // 1 minute
    });

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
        content: `Summarize the text in between the <text></text> tags. Do not include any explanations, only provide a  RFC8259 compliant JSON response following this format without deviation.
{
  "headline": "A click bait style short description of the text",
  "summary": "A creatively paraphrased summary of the text",
  "tag": "A short phrase consisting of 1 to two words that the article is best categorized by"
}
<text>
${article.text}
</text>
The JSON response:`,
      });

      const message = await summarize(article.text, messages);

      if (message !== undefined) {
        try {
          const content = message.content.match(/{(.|\s)*}/gm);
          if (content === null) throw new Error('OpenAI parsing error');
          const { headline, summary, tag } = JSON.parse(jsonrepair(content[0]));
          finalOutput.push({
            headline,
            summary,
            tag,
            link: article.link,
          });
        } catch(e) {
          const content = message.content.match(/{(.|\s)*}/gm);
          console.log(content?.[0]);
          logger.error('OpenAI parsing error', { error: e, message });
          throw e;
        }
      }
    }

    return finalOutput;
  };

  return {
    summarizeAll,
  };
};
