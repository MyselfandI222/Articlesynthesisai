import { Article } from '../types';
import { queryClient } from '../lib/queryClient';

export async function trackArticleView(article: Article): Promise<void> {
  try {
    await fetch('/api/article/view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        articleId: article.id,
        articleTitle: article.title,
        articleSource: article.source || null,
        articleUrl: article.url || null,
      }),
    });
    
    queryClient.invalidateQueries({ queryKey: ['/api/article/most-viewed'] });
  } catch (error) {
    console.error('Failed to track article view:', error);
  }
}

export async function getMostViewedArticles(limit: number = 10): Promise<Array<{
  articleId: string;
  articleTitle: string;
  articleSource: string | null;
  articleUrl: string | null;
  viewCount: number;
}>> {
  try {
    const response = await fetch(`/api/article/most-viewed?limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch most viewed articles');
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch most viewed articles:', error);
    return [];
  }
}
