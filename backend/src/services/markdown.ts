import { format } from 'date-fns';
import { SummarizedArticle } from "../lib/types";


export const MarkdownService = () => {
  const getDate = () => format(new Date(), 'yyyy-MM-dd');
  const getTitle = () => format(new Date(), 'MM-dd-yyyy')
  
  const uniqueArrayValues = (arr: string[]) => {
    return arr.filter((value, index) => arr.indexOf(value) === index);
  }

  const convertToMDX = (title: string, articles: SummarizedArticle[]) => {
    return `---
title: '${title}'
date: '${getDate()}'
tags: ['${uniqueArrayValues(articles.map(({ tag }) => tag)).join('\', \'')}']
draft: false
summary: '${articles[0].headline.replaceAll(`'`, `\'`)}...'
---

${articles.map(({ headline, summary, link }) => `## ${headline}\n${summary}\n\n[Original Article](${link})`).join('\n\n')}
`;
  }

  const convertToMarkdown = (articles: SummarizedArticle[]) =>
    articles.map(({ headline, summary, link }) => `# ${headline}\n${summary}\n\n[Original Article](${link})`).join('\n\n')

  return {
    convertToMDX,
    getTitle,
    convertToMarkdown,
  };
};
