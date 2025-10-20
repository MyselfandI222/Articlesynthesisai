import { Article } from '../types';

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
  } catch (error) {
    console.error('Failed to track article view:', error);
    // Silent fail - don't block user experience
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
