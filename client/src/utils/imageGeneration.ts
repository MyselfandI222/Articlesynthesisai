// AI Image Generation Service
import { AIImage, SynthesizedArticle } from '../types';

export interface ImageGenerationOptions {
  style: 'realistic' | 'artistic' | 'minimalist' | 'abstract' | 'photographic' | 'illustration';
  aspectRatio: '16:9' | '4:3' | '1:1' | '3:4';
  mood: 'professional' | 'creative' | 'serious' | 'vibrant' | 'calm' | 'dramatic';
}

export interface ContentAnalysis {
  mainTopics: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  complexity: 'simple' | 'moderate' | 'complex';
  industry: string;
  visualElements: string[];
  colorSuggestions: string[];
  conceptualThemes: string[];
}

// Analyze article content for image generation
export const analyzeArticleContent = (article: SynthesizedArticle): ContentAnalysis => {
  const title = article.title.toLowerCase();
  const content = article.content.toLowerCase();
  const combined = `${title} ${content}`;
  
  // Extract main topics using keyword frequency and importance
  const mainTopics = extractMainTopics(combined);
  
  // Analyze sentiment
  const sentiment = analyzeSentiment(combined);
  
  // Determine complexity
  const complexity = analyzeComplexity(combined);
  
  // Identify industry/domain
  const industry = identifyIndustry(combined);
  
  // Suggest visual elements
  const visualElements = suggestVisualElements(combined, industry);
  
  // Suggest colors based on content
  const colorSuggestions = suggestColors(combined, sentiment, industry);
  
  // Extract conceptual themes
  const conceptualThemes = extractConceptualThemes(combined);
  
  return {
    mainTopics,
    sentiment,
    complexity,
    industry,
    visualElements,
    colorSuggestions,
    conceptualThemes
  };
};

// Extract main topics from content
const extractMainTopics = (text: string): string[] => {
  const words = text.split(/\s+/);
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']);
  
  // Count word frequency
  const wordCount = new Map<string, number>();
  words.forEach(word => {
    const cleaned = word.replace(/[^\w]/g, '').toLowerCase();
    if (cleaned.length > 3 && !stopWords.has(cleaned)) {
      wordCount.set(cleaned, (wordCount.get(cleaned) || 0) + 1);
    }
  });
  
  // Get top topics
  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
};

// Analyze sentiment of the content
const analyzeSentiment = (text: string): 'positive' | 'neutral' | 'negative' => {
  const positiveWords = ['success', 'growth', 'innovation', 'improvement', 'benefit', 'advantage', 'opportunity', 'progress', 'achievement', 'breakthrough', 'excellent', 'outstanding', 'effective', 'efficient', 'valuable', 'promising', 'optimistic', 'positive', 'good', 'great', 'amazing', 'wonderful'];
  const negativeWords = ['problem', 'issue', 'challenge', 'difficulty', 'crisis', 'failure', 'decline', 'risk', 'threat', 'concern', 'negative', 'bad', 'poor', 'terrible', 'awful', 'dangerous', 'harmful', 'critical', 'serious', 'urgent'];
  
  let positiveScore = 0;
  let negativeScore = 0;
  
  positiveWords.forEach(word => {
    if (text.includes(word)) positiveScore++;
  });
  
  negativeWords.forEach(word => {
    if (text.includes(word)) negativeScore++;
  });
  
  if (positiveScore > negativeScore + 1) return 'positive';
  if (negativeScore > positiveScore + 1) return 'negative';
  return 'neutral';
};

// Analyze content complexity
const analyzeComplexity = (text: string): 'simple' | 'moderate' | 'complex' => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length;
  
  const complexWords = text.match(/\b\w{8,}\b/g)?.length || 0;
  const totalWords = text.split(/\s+/).length;
  const complexWordRatio = complexWords / totalWords;
  
  if (avgSentenceLength > 20 || complexWordRatio > 0.2) return 'complex';
  if (avgSentenceLength > 15 || complexWordRatio > 0.1) return 'moderate';
  return 'simple';
};

// Identify industry/domain
const identifyIndustry = (text: string): string => {
  const industries = {
    technology: ['technology', 'software', 'ai', 'artificial intelligence', 'machine learning', 'computer', 'digital', 'tech', 'programming', 'code', 'algorithm', 'data', 'cyber', 'internet', 'web'],
    healthcare: ['health', 'medical', 'medicine', 'doctor', 'patient', 'treatment', 'therapy', 'hospital', 'clinical', 'pharmaceutical', 'wellness', 'disease', 'diagnosis'],
    business: ['business', 'company', 'corporate', 'market', 'finance', 'financial', 'investment', 'revenue', 'profit', 'strategy', 'management', 'enterprise', 'commercial'],
    education: ['education', 'learning', 'student', 'teacher', 'school', 'university', 'academic', 'research', 'study', 'knowledge', 'curriculum', 'training'],
    environment: ['environment', 'climate', 'sustainability', 'green', 'renewable', 'energy', 'carbon', 'pollution', 'conservation', 'ecosystem', 'nature'],
    sports: ['sport', 'game', 'team', 'player', 'competition', 'tournament', 'athletic', 'fitness', 'training', 'performance', 'championship'],
    science: ['science', 'research', 'experiment', 'laboratory', 'discovery', 'theory', 'hypothesis', 'analysis', 'scientific', 'innovation'],
    politics: ['politics', 'government', 'policy', 'election', 'democracy', 'political', 'legislation', 'congress', 'senate', 'vote'],
    entertainment: ['entertainment', 'movie', 'film', 'music', 'celebrity', 'show', 'performance', 'artist', 'culture', 'media']
  };
  
  let maxScore = 0;
  let detectedIndustry = 'general';
  
  Object.entries(industries).forEach(([industry, keywords]) => {
    const score = keywords.reduce((count, keyword) => {
      return count + (text.split(keyword).length - 1);
    }, 0);
    
    if (score > maxScore) {
      maxScore = score;
      detectedIndustry = industry;
    }
  });
  
  return detectedIndustry;
};

// Suggest visual elements based on content
const suggestVisualElements = (text: string, industry: string): string[] => {
  const baseElements = {
    technology: ['circuit patterns', 'digital networks', 'glowing screens', 'data visualization', 'futuristic interfaces', 'geometric patterns'],
    healthcare: ['medical equipment', 'clean environments', 'healing imagery', 'human silhouettes', 'cross symbols', 'wellness concepts'],
    business: ['office buildings', 'growth charts', 'handshakes', 'meeting rooms', 'financial graphs', 'professional settings'],
    education: ['books', 'graduation caps', 'classroom settings', 'learning materials', 'knowledge symbols', 'academic environments'],
    environment: ['nature landscapes', 'renewable energy', 'green technology', 'earth imagery', 'sustainable concepts', 'natural elements'],
    sports: ['athletic equipment', 'stadiums', 'movement dynamics', 'team concepts', 'competition imagery', 'performance metrics'],
    science: ['laboratory equipment', 'molecular structures', 'research tools', 'discovery concepts', 'scientific instruments', 'innovation symbols'],
    politics: ['government buildings', 'voting symbols', 'democratic concepts', 'policy documents', 'civic imagery', 'institutional settings'],
    entertainment: ['stage lighting', 'performance venues', 'artistic elements', 'cultural symbols', 'media equipment', 'creative spaces'],
    general: ['abstract concepts', 'modern design', 'geometric shapes', 'flowing lines', 'contemporary elements', 'professional imagery']
  };
  
  const elements = baseElements[industry] || baseElements.general;
  
  // Add content-specific elements
  const contentElements = [];
  if (text.includes('innovation') || text.includes('future')) contentElements.push('forward-looking imagery');
  if (text.includes('collaboration') || text.includes('team')) contentElements.push('collaborative elements');
  if (text.includes('growth') || text.includes('progress')) contentElements.push('upward trending visuals');
  if (text.includes('global') || text.includes('worldwide')) contentElements.push('world connectivity');
  if (text.includes('security') || text.includes('protection')) contentElements.push('shield and security symbols');
  
  return [...elements.slice(0, 4), ...contentElements].slice(0, 6);
};

// Suggest colors based on content analysis
const suggestColors = (text: string, sentiment: string, industry: string): string[] => {
  const industryColors = {
    technology: ['#0066cc', '#00ccff', '#6600cc', '#cc00ff'],
    healthcare: ['#00cc66', '#66cc00', '#0099cc', '#cc6600'],
    business: ['#003366', '#336600', '#663300', '#006633'],
    education: ['#cc6600', '#6600cc', '#0066cc', '#cc0066'],
    environment: ['#009900', '#66cc00', '#00cc99', '#99cc00'],
    sports: ['#cc0000', '#ff6600', '#0066ff', '#cc6600'],
    science: ['#0099cc', '#6600cc', '#cc0099', '#0066cc'],
    politics: ['#003366', '#660033', '#336600', '#663300'],
    entertainment: ['#cc0066', '#6600cc', '#cc6600', '#0066cc'],
    general: ['#336699', '#669933', '#996633', '#663399']
  };
  
  const sentimentColors = {
    positive: ['#00cc66', '#66cc00', '#00ccff', '#ffcc00'],
    negative: ['#cc3300', '#cc6600', '#996633', '#663333'],
    neutral: ['#336699', '#669966', '#996699', '#666699']
  };
  
  const baseColors = industryColors[industry] || industryColors.general;
  const moodColors = sentimentColors[sentiment];
  
  return [...baseColors.slice(0, 2), ...moodColors.slice(0, 2)];
};

// Extract conceptual themes
const extractConceptualThemes = (text: string): string[] => {
  const themes = [];
  
  if (text.includes('innovation') || text.includes('breakthrough') || text.includes('revolutionary')) {
    themes.push('innovation and progress');
  }
  if (text.includes('collaboration') || text.includes('partnership') || text.includes('teamwork')) {
    themes.push('collaboration and unity');
  }
  if (text.includes('growth') || text.includes('expansion') || text.includes('development')) {
    themes.push('growth and development');
  }
  if (text.includes('security') || text.includes('protection') || text.includes('safety')) {
    themes.push('security and protection');
  }
  if (text.includes('efficiency') || text.includes('optimization') || text.includes('performance')) {
    themes.push('efficiency and optimization');
  }
  if (text.includes('sustainability') || text.includes('environmental') || text.includes('green')) {
    themes.push('sustainability and environment');
  }
  if (text.includes('global') || text.includes('international') || text.includes('worldwide')) {
    themes.push('global connectivity');
  }
  if (text.includes('future') || text.includes('tomorrow') || text.includes('next generation')) {
    themes.push('future vision');
  }
  
  return themes.slice(0, 4);
};

// Enhanced image prompt generation with content analysis
export const generateImagePrompt = (
  article: SynthesizedArticle, 
  options: ImageGenerationOptions,
  customInstructions?: string
): string => {
  const { style, mood } = options;
  
  // Analyze article content
  const analysis = analyzeArticleContent(article);
  
  // Build prompt components
  let subject = '';
  let context = '';
  let visualStyle = '';
  let atmosphere = '';
  
  // Generate subject based on industry and main topics
  if (analysis.industry === 'technology') {
    subject = `futuristic technology concept featuring ${analysis.mainTopics.slice(0, 2).join(' and ')}`;
    context = 'modern digital environment with sleek interfaces and data visualization';
  } else if (analysis.industry === 'healthcare') {
    subject = `medical innovation concept representing ${analysis.mainTopics.slice(0, 2).join(' and ')}`;
    context = 'clean healthcare environment with modern medical technology';
  } else if (analysis.industry === 'business') {
    subject = `professional business concept illustrating ${analysis.mainTopics.slice(0, 2).join(' and ')}`;
    context = 'sophisticated corporate setting with growth and success imagery';
  } else if (analysis.industry === 'education') {
    subject = `educational concept showcasing ${analysis.mainTopics.slice(0, 2).join(' and ')}`;
    context = 'inspiring learning environment with knowledge and growth symbols';
  } else if (analysis.industry === 'environment') {
    subject = `environmental concept highlighting ${analysis.mainTopics.slice(0, 2).join(' and ')}`;
    context = 'natural landscape with sustainable technology and green innovation';
  } else if (analysis.industry === 'sports') {
    subject = `athletic concept representing ${analysis.mainTopics.slice(0, 2).join(' and ')}`;
    context = 'dynamic sports environment with energy and competitive spirit';
  } else if (analysis.industry === 'science') {
    subject = `scientific concept exploring ${analysis.mainTopics.slice(0, 2).join(' and ')}`;
    context = 'advanced laboratory setting with research equipment and discovery imagery';
  } else {
    subject = `conceptual visualization of ${analysis.mainTopics.slice(0, 2).join(' and ')}`;
    context = 'modern professional environment with clean design elements';
  }
  
  // Add visual elements from analysis
  if (analysis.visualElements.length > 0) {
    context += `, incorporating ${analysis.visualElements.slice(0, 2).join(' and ')}`;
  }
  
  // Add conceptual themes
  if (analysis.conceptualThemes.length > 0) {
    subject += ` emphasizing ${analysis.conceptualThemes[0]}`;
  }
  
  // Style modifiers
  const styleModifiers = {
    realistic: 'photorealistic, high detail, professional photography, sharp focus',
    artistic: 'artistic interpretation, painterly style, creative expression, artistic flair',
    minimalist: 'clean minimalist design, simple composition, negative space, elegant simplicity',
    abstract: 'abstract representation, geometric forms, conceptual art, symbolic imagery',
    photographic: 'professional photography, studio lighting, commercial quality, crisp details',
    illustration: 'digital illustration, vector art style, graphic design, polished artwork'
  };
  
  // Mood modifiers enhanced with sentiment
  const baseMoodModifiers = {
    professional: 'professional, clean, corporate aesthetic, business-like presentation',
    creative: 'creative, innovative, inspiring atmosphere, imaginative design',
    serious: 'serious, authoritative, formal presentation, dignified approach',
    vibrant: 'vibrant colors, energetic, dynamic composition, lively atmosphere',
    calm: 'calm, peaceful, serene atmosphere, tranquil mood',
    dramatic: 'dramatic lighting, bold contrast, impactful composition, striking visuals'
  };
  
  // Adjust mood based on sentiment
  let moodModifier = baseMoodModifiers[mood];
  if (analysis.sentiment === 'positive') {
    moodModifier += ', optimistic and uplifting';
  } else if (analysis.sentiment === 'negative') {
    moodModifier += ', thoughtful and contemplative';
  }
  
  // Color guidance
  const colorGuidance = analysis.colorSuggestions.length > 0 
    ? `, color palette featuring ${analysis.colorSuggestions.slice(0, 2).join(' and ')}`
    : '';
  
  // Complexity adjustment
  const complexityModifier = analysis.complexity === 'complex' 
    ? ', sophisticated and detailed composition'
    : analysis.complexity === 'simple'
    ? ', clear and straightforward presentation'
    : ', balanced and well-structured design';
  
  // Build final prompt
  let finalPrompt = `${subject} in ${context}, ${styleModifiers[style]}, ${moodModifier}${colorGuidance}${complexityModifier}, high quality, professional composition`;
  
  // Add custom instructions if provided
  if (customInstructions && customInstructions.trim()) {
    finalPrompt += `, ${customInstructions.trim()}`;
  }
  
  // Ensure prompt isn't too long
  if (finalPrompt.length > 500) {
    finalPrompt = finalPrompt.substring(0, 497) + '...';
  }
  
  return finalPrompt;
};

// Universal image generation with multiple fallback systems
export const generateAIImage = async (
  prompt: string, 
  options: ImageGenerationOptions
): Promise<AIImage> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Generate a unique ID
  const id = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const { aspectRatio } = options;
  
  // Convert aspect ratio to dimensions
  const dimensions = {
    '16:9': { width: 800, height: 450 },
    '4:3': { width: 800, height: 600 },
    '1:1': { width: 600, height: 600 },
    '3:4': { width: 600, height: 800 }
  };
  
  const { width, height } = dimensions[aspectRatio];
  
  // Multiple fallback system for universal compatibility
  let imageUrl = '';
  
  try {
    // Method 1: Try Picsum Photos with themed seeds (most reliable)
    const seed = generateContentBasedSeed(prompt, options);
    imageUrl = `https://picsum.photos/seed/${seed}/${width}/${height}`;
    
    // Verify the image loads
    await verifyImageUrl(imageUrl);
    console.log('✅ Picsum image loaded successfully');
  } catch (error) {
    console.log('⚠️ Picsum failed, trying Lorem Picsum...');
    
    try {
      // Method 2: Try Lorem Picsum with different approach
      const altSeed = generateAlternateSeed(prompt);
      imageUrl = `https://loremflickr.com/${width}/${height}/abstract,modern,design?random=${altSeed}`;
      await verifyImageUrl(imageUrl);
      console.log('✅ Lorem Flickr image loaded successfully');
    } catch (error2) {
      console.log('⚠️ Lorem Flickr failed, trying Placeholder.com...');
      
      try {
        // Method 3: Try Placeholder.com
        const bgColor = getColorFromOptions(options).replace('#', '');
        const textColor = getContrastColor(bgColor);
        imageUrl = `https://via.placeholder.com/${width}x${height}/${bgColor}/${textColor}?text=AI+Generated+Image`;
        await verifyImageUrl(imageUrl);
        console.log('✅ Placeholder.com image loaded successfully');
      } catch (error3) {
        console.log('⚠️ All external services failed, generating canvas image...');
        
        // Method 4: Generate beautiful canvas image (always works)
        imageUrl = generateUniversalCanvasImage(prompt, options, width, height);
        console.log('✅ Canvas image generated successfully');
      }
    }
  }
  
  return {
    id,
    url: imageUrl,
    prompt,
    style: options.style,
    createdAt: new Date(),
    isGenerating: false
  };
};

// Verify that an image URL actually loads
const verifyImageUrl = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    const timeout = setTimeout(() => {
      reject(new Error('Image load timeout'));
    }, 5000);
    
    img.onload = () => {
      clearTimeout(timeout);
      resolve();
    };
    
    img.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('Image failed to load'));
    };
    
    img.src = url;
  });
};

// Generate content-based seed for consistent themed images
const generateContentBasedSeed = (prompt: string, options: ImageGenerationOptions): string => {
  const { style, mood } = options;
  
  // Extract key concepts for seed generation
  const words = prompt.toLowerCase().split(/\s+/);
  const relevantWords = words.filter(word => 
    word.length > 3 && 
    !['with', 'and', 'the', 'for', 'this', 'that', 'from', 'they', 'have', 'been', 'will', 'would', 'could', 'should'].includes(word)
  );
  
  // Create seed from content + style + mood
  const seedString = `${relevantWords.slice(0, 3).join('')}${style}${mood}`;
  
  // Generate hash
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    const char = seedString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(36);
};

// Generate alternate seed for fallback services
const generateAlternateSeed = (prompt: string): string => {
  const timestamp = Date.now();
  const promptHash = prompt.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return Math.abs(promptHash + timestamp).toString(36);
};

// Get color from options for placeholder services
const getColorFromOptions = (options: ImageGenerationOptions): string => {
  const colorMap = {
    professional: '#1e40af',
    creative: '#7c3aed',
    serious: '#374151',
    vibrant: '#dc2626',
    calm: '#059669',
    dramatic: '#ea580c'
  };
  
  return colorMap[options.mood] || '#1e40af';
};

// Get contrasting text color
const getContrastColor = (hexColor: string): string => {
  // Convert hex to RGB
  const r = parseInt(hexColor.substr(0, 2), 16);
  const g = parseInt(hexColor.substr(2, 2), 16);
  const b = parseInt(hexColor.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '000000' : 'ffffff';
};

// Generate beautiful canvas image that works on every computer
const generateUniversalCanvasImage = (
  prompt: string, 
  options: ImageGenerationOptions, 
  width: number, 
  height: number
): string => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    return createUniversalSVGImage(prompt, options, width, height);
  }
  
  // Enhanced canvas generation with beautiful designs
  const { style, mood } = options;
  
  // Color schemes based on mood and style
  const colorSchemes = {
    professional: {
      primary: '#1e3a8a',
      secondary: '#3b82f6',
      accent: '#93c5fd',
      text: '#ffffff'
    },
    creative: {
      primary: '#6b21a8',
      secondary: '#a855f7',
      accent: '#d8b4fe',
      text: '#ffffff'
    },
    serious: {
      primary: '#1f2937',
      secondary: '#6b7280',
      accent: '#d1d5db',
      text: '#ffffff'
    },
    vibrant: {
      primary: '#dc2626',
      secondary: '#f59e0b',
      accent: '#fbbf24',
      text: '#ffffff'
    },
    calm: {
      primary: '#047857',
      secondary: '#10b981',
      accent: '#6ee7b7',
      text: '#ffffff'
    },
    dramatic: {
      primary: '#7c2d12',
      secondary: '#ea580c',
      accent: '#fb923c',
      text: '#ffffff'
    }
  };
  
  const colors = colorSchemes[mood] || colorSchemes.professional;
  
  // Create sophisticated gradient background
  const gradient = ctx.createRadialGradient(
    width * 0.3, height * 0.3, 0,
    width * 0.7, height * 0.7, Math.max(width, height)
  );
  gradient.addColorStop(0, colors.primary);
  gradient.addColorStop(0.6, colors.secondary);
  gradient.addColorStop(1, colors.accent);
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Add style-specific visual elements
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = colors.text;
  
  if (style === 'minimalist') {
    // Clean geometric lines
    ctx.fillRect(width * 0.1, height * 0.3, width * 0.8, height * 0.02);
    ctx.fillRect(width * 0.1, height * 0.5, width * 0.6, height * 0.02);
    ctx.fillRect(width * 0.1, height * 0.7, width * 0.7, height * 0.02);
    
    // Subtle rectangles
    ctx.globalAlpha = 0.1;
    ctx.fillRect(width * 0.7, height * 0.2, width * 0.2, height * 0.6);
  } else if (style === 'abstract') {
    // Abstract geometric shapes
    ctx.beginPath();
    ctx.arc(width * 0.2, height * 0.3, width * 0.08, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(width * 0.8, height * 0.7, width * 0.12, 0, Math.PI * 2);
    ctx.fill();
    
    // Triangular shapes
    ctx.beginPath();
    ctx.moveTo(width * 0.5, height * 0.2);
    ctx.lineTo(width * 0.7, height * 0.6);
    ctx.lineTo(width * 0.3, height * 0.6);
    ctx.closePath();
    ctx.fill();
  } else if (style === 'artistic') {
    // Flowing artistic curves
    ctx.strokeStyle = colors.text;
    ctx.lineWidth = width * 0.01;
    ctx.globalAlpha = 0.4;
    
    // Multiple flowing curves
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(width * (0.1 + i * 0.1), height * 0.8);
      ctx.quadraticCurveTo(
        width * (0.3 + i * 0.2), 
        height * (0.1 + i * 0.1), 
        width * (0.7 + i * 0.1), 
        height * (0.6 - i * 0.1)
      );
      ctx.stroke();
    }
  } else if (style === 'photographic') {
    // Professional grid pattern
    ctx.globalAlpha = 0.15;
    const gridSize = Math.min(width, height) / 20;
    
    for (let x = 0; x < width; x += gridSize) {
      ctx.fillRect(x, 0, 1, height);
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.fillRect(0, y, width, 1);
    }
    
    // Central focus rectangle
    ctx.globalAlpha = 0.2;
    ctx.fillRect(width * 0.3, height * 0.3, width * 0.4, height * 0.4);
  } else if (style === 'illustration') {
    // Vector-style elements
    ctx.globalAlpha = 0.25;
    
    // Hexagonal pattern
    const hexSize = Math.min(width, height) / 15;
    for (let i = 0; i < 5; i++) {
      const x = width * (0.2 + i * 0.15);
      const y = height * (0.3 + (i % 2) * 0.2);
      
      ctx.beginPath();
      for (let j = 0; j < 6; j++) {
        const angle = (j * Math.PI) / 3;
        const px = x + hexSize * Math.cos(angle);
        const py = y + hexSize * Math.sin(angle);
        if (j === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    }
  } else {
    // Default realistic style - professional bars
    ctx.globalAlpha = 0.3;
    const barHeights = [0.4, 0.7, 0.5, 0.8, 0.6];
    const barWidth = width * 0.12;
    
    barHeights.forEach((heightRatio, i) => {
      const x = width * (0.15 + i * 0.15);
      const barHeight = height * heightRatio * 0.5;
      const y = height * 0.7 - barHeight;
      
      ctx.fillRect(x, y, barWidth, barHeight);
    });
  }
  
  // Add sophisticated title text
  ctx.globalAlpha = 1;
  ctx.fillStyle = colors.text;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Create meaningful title from prompt
  const words = prompt.split(' ');
  let displayText = '';
  
  if (words.length >= 3) {
    displayText = words.slice(0, 3).join(' ');
  } else if (words.length >= 2) {
    displayText = words.slice(0, 2).join(' ');
  } else {
    displayText = words[0] || 'AI Generated';
  }
  
  // Capitalize and clean text
  displayText = displayText
    .replace(/[^\w\s]/g, '')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  // Responsive font sizing
  const fontSize = Math.max(16, Math.min(width / 15, height / 10));
  ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
  
  // Add text shadow for better readability
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  
  // Main title
  ctx.fillText(displayText, width / 2, height / 2);
  
  // Subtitle
  ctx.font = `${fontSize * 0.6}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
  ctx.globalAlpha = 0.8;
  ctx.fillText('AI Generated Content', width / 2, height / 2 + fontSize * 1.5);
  
  // Convert to high-quality data URL
  return canvas.toDataURL('image/png', 1.0);
};

// Create SVG image as ultimate fallback
const createUniversalSVGImage = (
  prompt: string, 
  options: ImageGenerationOptions, 
  width: number, 
  height: number
): string => {
  const { mood } = options;
  
  const colorSchemes = {
    professional: { primary: '#1e3a8a', secondary: '#3b82f6', text: '#ffffff' },
    creative: { primary: '#6b21a8', secondary: '#a855f7', text: '#ffffff' },
    serious: { primary: '#1f2937', secondary: '#6b7280', text: '#ffffff' },
    vibrant: { primary: '#dc2626', secondary: '#f59e0b', text: '#ffffff' },
    calm: { primary: '#047857', secondary: '#10b981', text: '#ffffff' },
    dramatic: { primary: '#7c2d12', secondary: '#ea580c', text: '#ffffff' }
  };
  
  const colors = colorSchemes[mood] || colorSchemes.professional;
  
  // Create meaningful title
  const words = prompt.split(' ');
  const displayText = words.slice(0, 2).join(' ').replace(/[^\w\s]/g, '') || 'AI Generated';
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.3)"/>
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <rect x="10%" y="30%" width="80%" height="2%" fill="${colors.text}" opacity="0.3"/>
      <rect x="10%" y="50%" width="60%" height="2%" fill="${colors.text}" opacity="0.3"/>
      <rect x="10%" y="70%" width="70%" height="2%" fill="${colors.text}" opacity="0.3"/>
      <text x="50%" y="50%" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
            font-size="${Math.max(20, width / 20)}" font-weight="bold" fill="${colors.text}" 
            text-anchor="middle" dy=".3em" filter="url(#shadow)">${displayText}</text>
      <text x="50%" y="65%" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
            font-size="${Math.max(12, width / 35)}" fill="${colors.text}" opacity="0.8"
            text-anchor="middle" dy=".3em">AI Generated Content</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Edit image based on user instructions
export const editAIImage = async (
  image: AIImage, 
  editInstructions: string,
  options: ImageGenerationOptions
): Promise<AIImage> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2500));
  
  // Create modified prompt based on edit instructions
  const modifiedPrompt = `${image.prompt}, ${editInstructions}`;
  
  // Generate new image with modified prompt
  return generateAIImage(modifiedPrompt, options);
};

// Get suggested image styles based on article content
export const getSuggestedImageStyles = (article: SynthesizedArticle): ImageGenerationOptions[] => {
  const analysis = analyzeArticleContent(article);
  const suggestions: ImageGenerationOptions[] = [];
  
  // Industry-based suggestions
  if (analysis.industry === 'technology') {
    suggestions.push({
      style: 'minimalist',
      aspectRatio: '16:9',
      mood: 'professional'
    });
    suggestions.push({
      style: 'abstract',
      aspectRatio: '4:3',
      mood: 'creative'
    });
  } else if (analysis.industry === 'healthcare') {
    suggestions.push({
      style: 'realistic',
      aspectRatio: '16:9',
      mood: 'calm'
    });
    suggestions.push({
      style: 'minimalist',
      aspectRatio: '4:3',
      mood: 'professional'
    });
  } else if (analysis.industry === 'business') {
    suggestions.push({
      style: 'photographic',
      aspectRatio: '16:9',
      mood: 'professional'
    });
    suggestions.push({
      style: 'realistic',
      aspectRatio: '4:3',
      mood: 'serious'
    });
  } else if (analysis.industry === 'education') {
    suggestions.push({
      style: 'illustration',
      aspectRatio: '4:3',
      mood: 'creative'
    });
    suggestions.push({
      style: 'artistic',
      aspectRatio: '16:9',
      mood: 'vibrant'
    });
  } else if (analysis.industry === 'environment') {
    suggestions.push({
      style: 'realistic',
      aspectRatio: '16:9',
      mood: 'calm'
    });
    suggestions.push({
      style: 'photographic',
      aspectRatio: '4:3',
      mood: 'vibrant'
    });
  } else {
    // Default suggestions
    suggestions.push({
      style: 'realistic',
      aspectRatio: '16:9',
      mood: analysis.sentiment === 'positive' ? 'vibrant' : 'professional'
    });
    suggestions.push({
      style: 'illustration',
      aspectRatio: '4:3',
      mood: 'creative'
    });
  }
  
  // Add a third suggestion based on complexity
  if (analysis.complexity === 'complex') {
    suggestions.push({
      style: 'abstract',
      aspectRatio: '1:1',
      mood: 'dramatic'
    });
  } else {
    suggestions.push({
      style: 'minimalist',
      aspectRatio: '1:1',
      mood: 'calm'
    });
  }
  
  return suggestions.slice(0, 3);
};

// Predefined image style options
export const imageStyleOptions = [
  { value: 'realistic', label: 'Realistic', description: 'Photorealistic images with high detail' },
  { value: 'artistic', label: 'Artistic', description: 'Painterly and creative interpretations' },
  { value: 'minimalist', label: 'Minimalist', description: 'Clean, simple designs with negative space' },
  { value: 'abstract', label: 'Abstract', description: 'Conceptual and geometric representations' },
  { value: 'photographic', label: 'Photographic', description: 'Professional photography style' },
  { value: 'illustration', label: 'Illustration', description: 'Digital art and graphic design style' }
] as const;

export const aspectRatioOptions = [
  { value: '16:9', label: 'Landscape (16:9)', description: 'Wide format, great for headers' },
  { value: '4:3', label: 'Standard (4:3)', description: 'Classic format, versatile use' },
  { value: '1:1', label: 'Square (1:1)', description: 'Perfect for social media' },
  { value: '3:4', label: 'Portrait (3:4)', description: 'Tall format, good for mobile' }
] as const;

export const moodOptions = [
  { value: 'professional', label: 'Professional', description: 'Clean, corporate aesthetic' },
  { value: 'creative', label: 'Creative', description: 'Innovative and inspiring' },
  { value: 'serious', label: 'Serious', description: 'Formal and authoritative' },
  { value: 'vibrant', label: 'Vibrant', description: 'Energetic with bold colors' },
  { value: 'calm', label: 'Calm', description: 'Peaceful and serene' },
  { value: 'dramatic', label: 'Dramatic', description: 'Bold and impactful' }
] as const;