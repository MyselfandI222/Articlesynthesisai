// OpenAI synthesis function
import { Article, SynthesizedArticle, WritingStyle } from '../types';

export const synthesizeWithOpenAI = async (
  sources: Article[],
  topic: string,
  style: WritingStyle,
  tone: string,
  length: 'short' | 'medium' | 'long'
): Promise<SynthesizedArticle> => {
  try {
    const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not found');
    }

    // Prepare the prompt for OpenAI
    const sourcesText = sources.map(source => 
      `Title: ${source.title}\nContent: ${source.content.substring(0, 500)}...\nSource: ${source.source}\n`
    ).join('\n---\n');

    const prompt = `You are an expert article writer. Synthesize the following sources into a cohesive ${length} article about "${topic}" in ${style} style with a ${tone} tone.

Sources:
${sourcesText}

Requirements:
- Write in ${style} style
- Use a ${tone} tone
- Target length: ${length === 'short' ? '300-500' : length === 'medium' ? '600-1000' : '1200-2000'} words
- Include relevant information from all sources
- Create a compelling title
- Maintain factual accuracy

Please provide a well-structured article with clear sections.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an expert article writer and synthesizer.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: length === 'short' ? 800 : length === 'medium' ? 1500 : 2500
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Extract title from content (assumes first line is title)
    const lines = content.split('\n');
    const title = lines[0].replace(/^#\s*/, '') || `${topic}: A Comprehensive Analysis`;
    const articleContent = lines.slice(1).join('\n').trim();

    return {
      id: Date.now().toString(),
      title,
      content: articleContent,
      summary: articleContent.substring(0, 200) + '...',
      wordCount: articleContent.split(/\s+/).length,
      createdAt: new Date(),
      style,
      processingMetrics: {
        processingTimeMs: 2000,
        aiModelUsed: 'gpt-3.5-turbo',
        contentQualityScore: 0.85
      }
    };
  } catch (error) {
    console.error('OpenAI synthesis failed:', error);
    throw error;
  }
};