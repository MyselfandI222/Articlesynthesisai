// OpenAI synthesis function
import { Article, SynthesizedArticle, WritingStyle } from '../types';

// Helper function to analyze topic similarity
const analyzeTopicSimilarity = async (sources: Article[], topic: string): Promise<{
  isCommonTopic: boolean;
  keyThemes: string[];
  perspectives: string[];
  conflictingPoints: string[];
}> => {
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!OPENAI_API_KEY || sources.length < 2) {
    return { isCommonTopic: false, keyThemes: [], perspectives: [], conflictingPoints: [] };
  }

  const sourcesText = sources.map((source, index) => 
    `Source ${index + 1}: ${source.content.substring(0, 300)}...\nFrom: ${source.source}\n`
  ).join('\n---\n');

  const analysisPrompt = `Analyze these sources to determine if they cover the same topic and identify key themes, perspectives, and conflicting points.

Sources:
${sourcesText}

Return a JSON object with:
- isCommonTopic: boolean (true if 2+ sources cover the same main topic)
- keyThemes: array of main themes/subjects covered
- perspectives: array of different viewpoints or approaches
- conflictingPoints: array of contradictory facts or opinions between sources

Focus on factual analysis, not just surface-level similarities.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: 'system', content: 'You are an expert content analyst. Always respond with valid JSON.' },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices[0].message.content;
      try {
        return JSON.parse(content);
      } catch {
        return { isCommonTopic: false, keyThemes: [], perspectives: [], conflictingPoints: [] };
      }
    }
  } catch (error) {
    console.error('Topic analysis failed:', error);
  }
  
  return { isCommonTopic: false, keyThemes: [], perspectives: [], conflictingPoints: [] };
};

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

    // Analyze topic similarity first
    const topicAnalysis = await analyzeTopicSimilarity(sources, topic);

    // Prepare the prompt for OpenAI without referencing article titles
    const sourcesText = sources.map((source, index) => 
      `Source ${index + 1}: ${source.content.substring(0, 800)}...\nFrom: ${source.source}\n`
    ).join('\n---\n');

    let prompt;
    
    if (topicAnalysis.isCommonTopic && sources.length >= 2) {
      // Enhanced comparative synthesis prompt
      prompt = `You are an expert article writer specializing in comparative analysis. Multiple sources cover the same topic "${topic}". Create a comprehensive ${length} article that COMPARES AND CONTRASTS these sources rather than simply combining them.

SYNTHESIS APPROACH:
1. IDENTIFY COMMON GROUND: What facts, findings, or viewpoints do multiple sources agree on?
2. HIGHLIGHT DIFFERENCES: Where do sources disagree, offer different perspectives, or present conflicting information?
3. ANALYZE CONTRADICTIONS: When sources conflict, present both sides fairly and note the disagreement
4. SYNTHESIZE INSIGHTS: Draw connections between different sources' approaches to the same topic
5. PROVIDE BALANCED PERSPECTIVE: Don't favor one source over another - integrate all viewpoints
6. WRITE DETAILED IDEAS: Include specific concepts, findings, data points, and arguments from the sources - don't just summarize, elaborate on the ideas

Key Themes Identified: ${topicAnalysis.keyThemes.join(', ')}
Different Perspectives: ${topicAnalysis.perspectives.join(', ')}
Conflicting Points: ${topicAnalysis.conflictingPoints.join(', ')}

CRITICAL - TITLE RULES (MUST FOLLOW):
- NEVER mention or reference the title "${topic}" anywhere in the article body
- NEVER use phrases like "this article", "in this piece", "the ${topic} article", "as discussed in ${topic}"
- DO NOT start sentences with "The ${topic}..." or "${topic} reveals..."
- Write as if the title doesn't exist - focus on the subject matter directly

CONTENT GUIDELINES:
- Write out DETAILED ideas and specific concepts from the sources - don't just mention them briefly
- Include specific findings, data points, examples, and arguments presented in the sources
- Elaborate on key concepts rather than just listing them
- Use phrases like "according to research", "studies show", "experts indicate", "some reports suggest", "other findings indicate"
- When sources disagree, use phrases like "while some research indicates..., other studies suggest..."
- Create a narrative that weaves together different perspectives on the same topic

Sources:
${sourcesText}

Requirements:
- Write in ${style} style with ${tone} tone
- Target length: ${length === 'short' ? '300-500' : length === 'medium' ? '600-1000' : '1200-2000'} words
- CREATE COMPARATIVE ANALYSIS, not separate paragraphs for each source
- Highlight agreements, disagreements, and different approaches to the same topic
- Maintain factual accuracy while presenting multiple viewpoints
- Structure as a cohesive analysis that compares and contrasts throughout

Please provide a well-structured comparative article with clear sections.`;
    } else {
      // Standard synthesis prompt for different topics
      prompt = `You are an expert article writer. Synthesize the following sources into a cohesive ${length} article about "${topic}" in ${style} style with a ${tone} tone.

CRITICAL - TITLE RULES (MUST FOLLOW):
- NEVER mention or reference the title "${topic}" anywhere in the article body
- NEVER use phrases like "this article", "in this piece", "the ${topic} article", "as discussed in ${topic}"
- DO NOT start sentences with "The ${topic}..." or "${topic} reveals..." or "${topic} explores..."
- Write as if the title doesn't exist - focus on the subject matter directly

CONTENT GUIDELINES:
1. Write out DETAILED ideas and specific concepts from the sources - don't just mention them briefly
2. Include specific findings, data points, examples, and arguments presented in the sources
3. Elaborate on key concepts and explain them thoroughly rather than just listing them
4. Do not reference or mention the names/titles of the source articles in your writing
5. Use phrases like "according to research", "studies show", "experts indicate", or "recent findings suggest"

Sources:
${sourcesText}

Requirements:
- Write in ${style} style
- Use a ${tone} tone
- Target length: ${length === 'short' ? '300-500' : length === 'medium' ? '600-1000' : '1200-2000'} words
- Write DETAILED content - elaborate on ideas, don't just list them
- Include specific findings, data, examples, and arguments from sources
- Create a compelling title (but NEVER reference this title in the article body)
- Maintain factual accuracy

Please provide a well-structured article with detailed content and clear sections.`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
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