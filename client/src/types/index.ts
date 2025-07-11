export interface Article {
  id: string;
  title: string;
  content: string;
  source?: string;
  url?: string;
}

export interface SynthesisRequest {
  sources: Article[];
  topic: string;
  style: WritingStyle;
  tone: string;
  length: 'short' | 'medium' | 'long';
}

export interface SynthesizedArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  wordCount: number;
  createdAt: Date;
  style: WritingStyle;
  seoMetadata?: {
    keywords: string[];
    description: string;
    readabilityScore: number;
  };
  factCheckResults?: {
    verifiedFacts: number;
    uncertainFacts: number;
    correctedFacts: number;
  };
  processingMetrics?: {
    processingTimeMs: number;
    aiModelUsed: string;
    contentQualityScore: number;
  };
}

export type WritingStyle = 
  | 'academic'
  | 'journalistic'
  | 'blog'
  | 'technical'
  | 'creative'
  | 'business'
  | 'opinion';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  editType?: 'general' | 'phrase-edit' | 'phrase-removal' | 'content-addition';
  originalText?: string;
  newText?: string;
  editLocation?: string;
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  source: string;
  publishedAt: string;
  author?: string;
  viewpoint?: 'neutral' | 'supportive' | 'critical' | 'alternative';
}

export interface AIImage {
  id: string;
  url: string;
  prompt: string;
  style: string;
  createdAt: Date;
  isGenerating?: boolean;
}

export interface Category {
  id?: string;
  name: string;
  color?: string;
  description?: string;
  query?: string;
  subcategories: Category[];
}

export interface SearchFilters {
  category?: string;
  subcategory?: string;
  limit?: number;
  dateRange?: string;
}