// AI Image Generation Service using OpenAI DALL-E 3
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ImageGenerationOptions {
  prompt: string;
  style?: 'vivid' | 'natural';
  size?: '1024x1024' | '1024x1792' | '1792x1024';
  quality?: 'standard' | 'hd';
}

export interface GeneratedImage {
  url: string;
  revisedPrompt?: string;
  b64_json?: string;
}

/**
 * Generate an AI image using OpenAI DALL-E 3
 * @param options Image generation options
 * @returns Generated image URL and metadata
 */
export async function generateAIImage(options: ImageGenerationOptions): Promise<GeneratedImage> {
  try {
    const {
      prompt,
      style = 'vivid',
      size = '1024x1024',
      quality = 'standard'
    } = options;

    console.log(`Generating AI image with DALL-E 3: "${prompt.substring(0, 100)}..."`);

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: size,
      quality: quality,
      style: style,
    });

    const imageData = response.data[0];

    return {
      url: imageData.url || '',
      revisedPrompt: imageData.revised_prompt,
    };
  } catch (error) {
    console.error('DALL-E 3 image generation error:', error);
    throw new Error(`Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create an optimized image generation prompt from article content
 * @param articleTitle Article title
 * @param articleContent Article content snippet
 * @param style Desired image style
 * @returns Optimized prompt for image generation
 */
export function createImagePrompt(
  articleTitle: string,
  articleContent: string,
  style: 'realistic' | 'artistic' | 'minimalist' | 'abstract' | 'photographic' | 'illustration' = 'photographic'
): string {
  // Extract key topics from title and content
  const combined = `${articleTitle} ${articleContent}`.toLowerCase();
  
  // Determine subject matter
  let subject = articleTitle;
  let styleModifier = '';
  
  switch (style) {
    case 'realistic':
      styleModifier = 'photorealistic, highly detailed, professional photography';
      break;
    case 'artistic':
      styleModifier = 'artistic interpretation, creative composition, modern art style';
      break;
    case 'minimalist':
      styleModifier = 'minimalist design, clean lines, simple composition, modern aesthetic';
      break;
    case 'abstract':
      styleModifier = 'abstract art, conceptual interpretation, geometric shapes, vibrant colors';
      break;
    case 'photographic':
      styleModifier = 'professional photography, high quality, editorial style, cinematic lighting';
      break;
    case 'illustration':
      styleModifier = 'digital illustration, contemporary style, clean vector art';
      break;
  }

  // Detect industry/topic for better context
  const isBusinessTech = combined.includes('business') || combined.includes('technology') || 
                         combined.includes('company') || combined.includes('startup');
  const isHealth = combined.includes('health') || combined.includes('medical') || combined.includes('wellness');
  const isSports = combined.includes('sport') || combined.includes('game') || combined.includes('team');
  const isScience = combined.includes('science') || combined.includes('research') || combined.includes('study');
  const isPolitics = combined.includes('politic') || combined.includes('government') || combined.includes('election');
  
  let contextModifier = '';
  if (isBusinessTech) contextModifier = 'modern office setting, professional environment';
  if (isHealth) contextModifier = 'clean medical aesthetic, wellness imagery';
  if (isSports) contextModifier = 'dynamic sports action, athletic environment';
  if (isScience) contextModifier = 'laboratory setting, scientific visualization';
  if (isPolitics) contextModifier = 'governmental setting, civic imagery';

  // Build optimized prompt
  const prompt = `${subject}. ${styleModifier}. ${contextModifier}. Ultra HD, 4K, cinematic composition, professional quality.`;
  
  // Ensure prompt is under DALL-E's 4000 character limit
  return prompt.substring(0, 3900);
}

/**
 * Generate an image for a synthesized article
 * @param articleTitle Article title
 * @param articleContent Article content
 * @param style Image style preference
 * @returns Generated image data
 */
export async function generateArticleImage(
  articleTitle: string,
  articleContent: string,
  style: 'realistic' | 'artistic' | 'minimalist' | 'abstract' | 'photographic' | 'illustration' = 'photographic'
): Promise<GeneratedImage> {
  const prompt = createImagePrompt(articleTitle, articleContent, style);
  
  return await generateAIImage({
    prompt,
    style: style === 'realistic' || style === 'photographic' ? 'natural' : 'vivid',
    size: '1792x1024', // Wide format for article headers
    quality: 'hd'
  });
}
