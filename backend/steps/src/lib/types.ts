export interface State1 {
  articles: Article[];
}

export interface Article {
  link: string;
  tag: string;
}

export interface State2 {
  articles: ParsedArticle[];
}

export interface ParsedArticle {
  text: string;
  tag: string;
  link: string;
}

export interface SummarizedArticle {
  headline: string;
  summary: string;
  link: string;
  tag: string;
}
