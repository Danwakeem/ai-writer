import { Configuration, OpenAIApi  } from 'openai';
import { SSM } from './ssm';

export const OpenAI = () => {
  const ssm = SSM();

  const getOpenAI = async () => {
    const apiKey = await ssm.getLocalParameter(process.env.OPENAI_PARAMETER_NAME);
    const configuration = new Configuration({
      apiKey,
    });
    const openai = new OpenAIApi(configuration);
    return openai;
  }
  
  const summarize = async (text: string): Promise<string> => {
    const openai = await getOpenAI();
    const response = await openai.createCompletion({
      model: 'text-curie-001',
      prompt: `Can you create brief summary of this text ${text}`,
      max_tokens: 500,
    });
    return response.data.choices[0].text || '';
  };

  return {
    summarize
  };
};
