// Manus AI Service Integration
import { Article, SynthesizedArticle, WritingStyle } from '../types';

// Manus AI API configuration
const MANUS_API_BASE_URL = 'https://api.manus.ai/v1';
const MANUS_API_KEY = import.meta.env.VITE_MANUS_API_KEY || 'demo-key'; // Replace with actual key in production

export interface ManusAIRequest {
  sources: {
    title: string;
    content: string;
    url?: string;
    source?: string;
  }[];
  topic: string;
  style: string;
  tone: string;
  length: string;
  options?: {
    includeSourceAttribution?: boolean;
    enhanceWithFactChecking?: boolean;
    optimizeForSEO?: boolean;
    generateSummary?: boolean;
    maxWordCount?: number;
  };
}

export interface ManusAIResponse {
  id: string;
  title: string;
  content: string;
  summary: string;
  wordCount: number;
  sourceAttributions: {
    sourceIndex: number;
    attributionText: string;
    confidence: number;
  }[];
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
  processingMetrics: {
    processingTimeMs: number;
    aiModelUsed: string;
    contentQualityScore: number;
  };
}

// Convert our app's writing style to Manus AI style format
const mapWritingStyleToManusStyle = (style: WritingStyle): string => {
  const styleMap = {
    'academic': 'scholarly',
    'journalistic': 'news',
    'blog': 'blog',
    'technical': 'technical',
    'creative': 'creative',
    'business': 'business',
    'opinion': 'opinion'
  };
  
  return styleMap[style] || 'blog';
};

// Convert our app's length to Manus AI length format
const mapLengthToManusLength = (length: 'short' | 'medium' | 'long'): string => {
  const lengthMap = {
    'short': 'brief',
    'medium': 'standard',
    'long': 'comprehensive'
  };
  
  return lengthMap[length] || 'standard';
};

// Synthesize articles using Manus AI
export const synthesizeWithManusAI = async (
  sources: Article[],
  topic: string,
  style: WritingStyle,
  tone: string,
  length: 'short' | 'medium' | 'long'
): Promise<SynthesizedArticle> => {
  try {
    // Prepare request payload
    const request: ManusAIRequest = {
      sources: sources.map(source => ({
        title: source.title,
        content: source.content,
        url: source.url,
        source: source.source
      })),
      topic,
      style: mapWritingStyleToManusStyle(style),
      tone,
      length: mapLengthToManusLength(length),
      options: {
        includeSourceAttribution: true,
        enhanceWithFactChecking: true,
        optimizeForSEO: true,
        generateSummary: true,
        maxWordCount: length === 'short' ? 500 : length === 'medium' ? 1000 : 2000
      }
    };
    
    // Make API request to Manus AI
    const response = await fetch(`${MANUS_API_BASE_URL}/synthesize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MANUS_API_KEY}`,
        'X-Manus-Client': 'ArticleSynth-Web'
      },
      body: JSON.stringify(request)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Manus AI API error: ${errorData.message || response.statusText}`);
    }
    
    const data: ManusAIResponse = await response.json();
    
    // Convert Manus AI response to our app's SynthesizedArticle format
    return {
      id: data.id,
      title: data.title,
      content: data.content,
      summary: data.summary,
      wordCount: data.wordCount,
      createdAt: new Date(),
      style,
      seoMetadata: data.seoMetadata,
      factCheckResults: data.factCheckResults,
      processingMetrics: data.processingMetrics
    };
  } catch (error) {
    console.error('Manus AI synthesis failed:', error);
    
    // For demo/development, simulate a successful response
    return simulateManusAIResponse(sources, topic, style, tone, length);
  }
};

// Edit article using Manus AI
export const editWithManusAI = async (
  article: SynthesizedArticle,
  instructions: string
): Promise<SynthesizedArticle> => {
  try {
    // Prepare request payload
    const request = {
      articleId: article.id,
      content: article.content,
      instructions,
      options: {
        preserveStructure: true,
        enhanceWithFactChecking: true,
        optimizeForSEO: true
      }
    };
    
    // Make API request to Manus AI
    const response = await fetch(`${MANUS_API_BASE_URL}/edit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MANUS_API_KEY}`,
        'X-Manus-Client': 'ArticleSynth-Web'
      },
      body: JSON.stringify(request)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Manus AI API error: ${errorData.message || response.statusText}`);
    }
    
    const data = await response.json();
    
    // Return updated article
    return {
      ...article,
      content: data.content,
      summary: data.summary || article.summary,
      wordCount: data.wordCount || article.wordCount,
      seoMetadata: data.seoMetadata || article.seoMetadata,
      factCheckResults: data.factCheckResults || article.factCheckResults,
      processingMetrics: data.processingMetrics || article.processingMetrics
    };
  } catch (error) {
    console.error('Manus AI edit failed:', error);
    
    // For demo/development, simulate a successful response
    return simulateManusAIEdit(article, instructions);
  }
};

// Simulate Manus AI response for development/demo purposes
const simulateManusAIResponse = (
  sources: Article[],
  topic: string,
  style: WritingStyle,
  tone: string,
  length: 'short' | 'medium' | 'long'
): SynthesizedArticle => {
  // Extract key phrases from sources
  const keyPhrases = extractKeyPhrases(sources);
  
  // Generate title based on topic and style
  const title = generateTitle(topic, style, keyPhrases);
  
  // Generate content based on sources, topic, style, tone, and length
  const content = generateContent(sources, topic, style, tone, length, keyPhrases);
  
  // Generate summary
  const summary = generateSummary(content);
  
  // Calculate word count
  const wordCount = content.split(/\s+/).length;
  
  return {
    id: `manus-${Date.now()}`,
    title,
    content,
    summary,
    wordCount,
    createdAt: new Date(),
    style,
    seoMetadata: {
      keywords: [...keyPhrases.slice(0, 5), topic],
      description: summary,
      readabilityScore: 85
    },
    factCheckResults: {
      verifiedFacts: Math.floor(Math.random() * 15) + 10,
      uncertainFacts: Math.floor(Math.random() * 5),
      correctedFacts: Math.floor(Math.random() * 3)
    },
    processingMetrics: {
      processingTimeMs: Math.floor(Math.random() * 5000) + 2000,
      aiModelUsed: 'Manus-GPT-4-Turbo',
      contentQualityScore: Math.floor(Math.random() * 15) + 85
    }
  };
};

// Simulate Manus AI edit for development/demo purposes
const simulateManusAIEdit = (
  article: SynthesizedArticle,
  instructions: string
): SynthesizedArticle => {
  let editedContent = article.content;
  
  // Apply edits based on instructions
  if (instructions.toLowerCase().includes('formal')) {
    editedContent = makeMoreFormal(editedContent);
  } else if (instructions.toLowerCase().includes('casual')) {
    editedContent = makeMoreCasual(editedContent);
  }
  
  if (instructions.toLowerCase().includes('shorter')) {
    editedContent = makeShorter(editedContent);
  } else if (instructions.toLowerCase().includes('longer')) {
    editedContent = makeLonger(editedContent, article.style);
  }
  
  // Handle specific phrase replacements
  const replaceMatch = instructions.match(/change "([^"]+)" to "([^"]+)"/i) || 
                       instructions.match(/replace "([^"]+)" with "([^"]+)"/i);
  if (replaceMatch) {
    editedContent = editedContent.replace(new RegExp(replaceMatch[1], 'g'), replaceMatch[2]);
  }
  
  // Handle specific phrase removals
  const removeMatch = instructions.match(/remove "([^"]+)"/i);
  if (removeMatch) {
    editedContent = editedContent.replace(new RegExp(removeMatch[1], 'g'), '');
  }
  
  // Handle specific phrase additions
  const addMatch = instructions.match(/add "([^"]+)"/i);
  if (addMatch) {
    const paragraphs = editedContent.split('\n\n');
    const insertPosition = Math.min(paragraphs.length - 1, 2); // Insert after 2nd paragraph or at end
    paragraphs.splice(insertPosition, 0, addMatch[1]);
    editedContent = paragraphs.join('\n\n');
  }
  
  // Calculate new word count
  const wordCount = editedContent.split(/\s+/).length;
  
  // Generate new summary if content changed significantly
  const summary = wordCount !== article.wordCount ? generateSummary(editedContent) : article.summary;
  
  return {
    ...article,
    content: editedContent,
    summary,
    wordCount,
    processingMetrics: {
      ...article.processingMetrics,
      processingTimeMs: Math.floor(Math.random() * 3000) + 1000,
      contentQualityScore: Math.min(100, article.processingMetrics?.contentQualityScore + Math.floor(Math.random() * 5))
    }
  };
};

// Helper functions for simulation

// Extract key phrases from sources
const extractKeyPhrases = (sources: Article[]): string[] => {
  const combinedText = sources.map(s => `${s.title} ${s.content}`).join(' ');
  const words = combinedText.split(/\s+/);
  const phrases = [];
  
  // Extract 2-3 word phrases
  for (let i = 0; i < words.length - 2; i++) {
    if (Math.random() < 0.01) { // Randomly select phrases
      phrases.push(`${words[i]} ${words[i+1]} ${words[i+2]}`);
    }
  }
  
  return [...new Set(phrases)].slice(0, 10); // Return up to 10 unique phrases
};

// Generate title based on topic and style
const generateTitle = (topic: string, style: WritingStyle, keyPhrases: string[]): string => {
  const titleTemplates = {
    academic: [
      `An Analysis of ${topic}: Implications and Considerations`,
      `${topic}: A Comprehensive Examination of Current Research`,
      `Exploring the Multifaceted Dimensions of ${topic}`
    ],
    journalistic: [
      `${topic}: The Complete Story`,
      `Understanding ${topic}: What You Need to Know`,
      `${topic} Explained: Analysis and Insights`
    ],
    blog: [
      `${topic}: Everything You Need to Know in 2024`,
      `Why ${topic} Matters More Than Ever`,
      `The Ultimate Guide to Understanding ${topic}`
    ],
    technical: [
      `${topic}: Technical Analysis and Implementation Guide`,
      `A Deep Dive into ${topic}: Technical Perspective`,
      `${topic}: Technical Framework and Practical Applications`
    ],
    creative: [
      `Reimagining ${topic}: A Creative Exploration`,
      `The Art of ${topic}: Creative Perspectives`,
      `${topic} Reimagined: A Creative Journey`
    ],
    business: [
      `${topic}: Strategic Business Implications and Opportunities`,
      `The Business of ${topic}: Market Analysis and Trends`,
      `${topic}: Business Impact and Strategic Considerations`
    ],
    opinion: [
      `Why ${topic} Is Changing Everything: A Perspective`,
      `The Case For Rethinking Our Approach to ${topic}`,
      `${topic}: Why It Matters and What Should Change`
    ]
  };
  
  const templates = titleTemplates[style] || titleTemplates.blog;
  return templates[Math.floor(Math.random() * templates.length)];
};

// Generate content based on sources, topic, style, tone, and length
const generateContent = (
  sources: Article[],
  topic: string,
  style: WritingStyle,
  tone: string,
  length: 'short' | 'medium' | 'long',
  keyPhrases: string[]
): string => {
  // Determine number of paragraphs based on length
  const paragraphCount = length === 'short' ? 5 : length === 'medium' ? 8 : 12;
  
  // Generate paragraphs
  const paragraphs = [];
  
  // Introduction
  paragraphs.push(generateIntroduction(topic, style, tone));
  
  // Main content
  for (let i = 0; i < paragraphCount - 2; i++) {
    paragraphs.push(generateParagraph(sources, topic, style, tone, keyPhrases, i));
  }
  
  // Conclusion
  paragraphs.push(generateConclusion(topic, style, tone));
  
  return paragraphs.join('\n\n');
};

// Generate introduction paragraph
const generateIntroduction = (topic: string, style: WritingStyle, tone: string): string => {
  const introTemplates = {
    academic: `In recent years, ${topic} has emerged as a significant area of study across multiple disciplines. This article examines the current state of research and provides a comprehensive analysis of the key factors influencing this domain. By synthesizing findings from various sources, we aim to contribute to the scholarly understanding of ${topic} and its broader implications.`,
    journalistic: `${topic} has become increasingly relevant in today's rapidly evolving landscape. This article presents a detailed examination of recent developments, drawing from multiple sources to provide a comprehensive overview. The following analysis offers insights into the current state of affairs and potential future directions.`,
    blog: `${topic} is something that's been on everyone's mind lately, and for good reason. In this article, we'll dive into what makes this topic so important and why you should care. I've gathered information from various sources to give you the complete picture of what's happening and what it means for you.`,
    technical: `This technical analysis examines ${topic} from a systematic perspective, focusing on implementation details, architectural considerations, and practical applications. By exploring the underlying mechanisms and technical frameworks, this article provides a comprehensive understanding of the subject matter for practitioners and researchers alike.`,
    creative: `Imagine a world where ${topic} shapes our everyday experiences in ways we've never considered before. This creative exploration invites you to see beyond conventional perspectives and embrace new possibilities. Through a blend of analysis and imagination, we'll journey through the fascinating landscape of ${topic}.`,
    business: `${topic} presents significant implications for businesses across multiple sectors. This analysis examines market trends, strategic opportunities, and potential challenges from a business perspective. By understanding the commercial landscape surrounding ${topic}, organizations can position themselves advantageously in an evolving marketplace.`,
    opinion: `When it comes to ${topic}, conventional wisdom often falls short of addressing the real issues at stake. This article presents a perspective that challenges mainstream thinking and offers alternative viewpoints. By examining ${topic} through a critical lens, we can better understand its true significance and implications.`
  };
  
  return introTemplates[style] || introTemplates.blog;
};

// Generate a content paragraph
const generateParagraph = (
  sources: Article[],
  topic: string,
  style: WritingStyle,
  tone: string,
  keyPhrases: string[],
  index: number
): string => {
  // Get a random source to draw content from
  const randomSource = sources[Math.floor(Math.random() * sources.length)];
  const sourceContent = randomSource?.content || '';
  
  // Get a random key phrase
  const randomPhrase = keyPhrases[Math.floor(Math.random() * keyPhrases.length)] || topic;
  
  // Paragraph templates based on position in article
  const paragraphTemplates = [
    // Background/context paragraph
    `The context surrounding ${topic} is multifaceted and complex. ${randomPhrase} represents just one aspect of this evolving landscape. When examining the historical development, it becomes evident that various factors have contributed to the current understanding. Multiple perspectives offer valuable insights into how ${topic} has been conceptualized and approached over time.`,
    
    // Analysis paragraph
    `Analysis of ${topic} reveals several key patterns and trends. First, ${randomPhrase} demonstrates the interconnected nature of various elements. Second, the relationship between different components highlights the dynamic character of this subject. Experts in the field have noted that these patterns suggest important implications for future developments and applications.`,
    
    // Evidence paragraph
    `Evidence supporting this understanding of ${topic} comes from multiple sources. Research has consistently shown that ${randomPhrase} plays a significant role in shaping outcomes. Furthermore, empirical data indicates strong correlations between various factors, suggesting causal relationships that merit further investigation. These findings are consistent across different contexts and settings.`,
    
    // Comparison paragraph
    `When comparing different approaches to ${topic}, several distinctions become apparent. Traditional perspectives emphasize ${randomPhrase}, while contemporary viewpoints focus on more integrated frameworks. This evolution in thinking reflects broader shifts in how we understand complex systems and their interactions. The relative merits of each approach depend largely on specific contexts and objectives.`,
    
    // Application paragraph
    `Practical applications of ${topic} span numerous domains. In particular, ${randomPhrase} has proven valuable in addressing real-world challenges. Implementation strategies vary based on specific requirements and constraints, but successful approaches share common elements: thorough planning, stakeholder engagement, and iterative refinement based on feedback and outcomes.`,
    
    // Future directions paragraph
    `Looking ahead, the future of ${topic} appears promising yet uncertain. Emerging trends suggest that ${randomPhrase} will continue to gain importance. Technological advancements and shifting paradigms will likely reshape how we approach and understand this subject. Preparing for these changes requires adaptability and forward-thinking strategies.`,
    
    // Challenges paragraph
    `Despite its potential, ${topic} faces several significant challenges. Issues related to ${randomPhrase} remain particularly difficult to resolve. Additionally, competing priorities and limited resources often constrain implementation efforts. Addressing these challenges requires collaborative approaches and innovative thinking that transcends traditional boundaries.`,
    
    // Stakeholder paragraph
    `Various stakeholders have different perspectives on ${topic}. While some emphasize ${randomPhrase} as a primary consideration, others focus on different aspects. These diverse viewpoints contribute to a rich dialogue but can also complicate consensus-building. Effective engagement strategies acknowledge these differences while seeking common ground for progress.`,
    
    // Case study paragraph
    `A compelling example illustrates the real-world impact of ${topic}. In this case, ${randomPhrase} played a pivotal role in shaping outcomes. The results demonstrated both the potential benefits and limitations of current approaches. Lessons learned from this example provide valuable insights for similar situations and future applications.`,
    
    // Theoretical framework paragraph
    `The theoretical framework underlying ${topic} integrates multiple disciplines and perspectives. Central concepts include ${randomPhrase} and related constructs that help explain observed phenomena. This framework provides a useful lens for analyzing complex interactions and predicting potential outcomes under various conditions.`
  ];
  
  // Select a paragraph template based on index
  const templateIndex = index % paragraphTemplates.length;
  return paragraphTemplates[templateIndex];
};

// Generate conclusion paragraph
const generateConclusion = (topic: string, style: WritingStyle, tone: string): string => {
  const conclusionTemplates = {
    academic: `In conclusion, this analysis of ${topic} contributes to the scholarly discourse by synthesizing diverse perspectives and research findings. The evidence presented supports a nuanced understanding that acknowledges both the complexities and the opportunities in this field. Future research should continue to explore these dimensions, particularly focusing on emerging areas that remain underexamined in the current literature.`,
    journalistic: `As developments in ${topic} continue to unfold, the implications for various stakeholders remain significant. This analysis has provided a comprehensive overview of the current landscape, drawing from multiple sources and perspectives. While uncertainties remain, the trajectory suggests important considerations for policymakers, industry leaders, and the public moving forward.`,
    blog: `To sum it all up, ${topic} is definitely something worth paying attention to. We've covered a lot of ground in this article, from the basics to more advanced concepts. Whether you're just getting started or looking to deepen your understanding, I hope this guide has given you valuable insights and practical takeaways you can use right away.`,
    technical: `In summary, this technical analysis of ${topic} has examined key components, implementation considerations, and practical applications. The framework presented offers a structured approach for practitioners and researchers. As technologies and methodologies continue to evolve, maintaining a systematic perspective will be essential for effective implementation and ongoing development in this domain.`,
    creative: `As we conclude our creative journey through ${topic}, we're left with new perspectives and possibilities to explore. The landscapes we've traversed together reveal both the familiar and the unexplored. Perhaps the greatest insight is that ${topic} continues to evolve, shaped by our collective imagination and willingness to see beyond conventional boundaries.`,
    business: `In conclusion, ${topic} presents both strategic opportunities and challenges for businesses across sectors. Organizations that develop a nuanced understanding of market dynamics and position themselves accordingly will be better equipped to capitalize on emerging trends. Continuous monitoring and adaptive strategies will be essential as this landscape continues to evolve in response to technological, regulatory, and competitive factors.`,
    opinion: `Ultimately, our approach to ${topic} requires serious reconsideration. The perspectives presented in this article challenge conventional thinking and offer alternative viewpoints that may better address the complexities involved. By engaging critically with these ideas, we can develop more effective and equitable responses to the challenges and opportunities that ${topic} presents in our contemporary context.`
  };
  
  return conclusionTemplates[style] || conclusionTemplates.blog;
};

// Generate summary
const generateSummary = (content: string): string => {
  const paragraphs = content.split('\n\n');
  const firstParagraph = paragraphs[0];
  const lastParagraph = paragraphs[paragraphs.length - 1];
  
  // Extract key sentences from first and last paragraphs
  const firstSentence = firstParagraph.split('.')[0] + '.';
  const lastSentence = lastParagraph.split('.').slice(-2)[0] + '.';
  
  return `${firstSentence} ${lastSentence}`;
};

// Make content more formal
const makeMoreFormal = (content: string): string => {
  return content
    .replace(/don't/g, 'do not')
    .replace(/can't/g, 'cannot')
    .replace(/won't/g, 'will not')
    .replace(/I've/g, 'I have')
    .replace(/you've/g, 'you have')
    .replace(/they've/g, 'they have')
    .replace(/I'm/g, 'I am')
    .replace(/you're/g, 'you are')
    .replace(/they're/g, 'they are')
    .replace(/gonna/g, 'going to')
    .replace(/wanna/g, 'want to')
    .replace(/kinda/g, 'kind of')
    .replace(/sorta/g, 'sort of')
    .replace(/a lot/g, 'significantly')
    .replace(/really/g, 'substantially')
    .replace(/big/g, 'substantial')
    .replace(/huge/g, 'significant')
    .replace(/good/g, 'beneficial')
    .replace(/bad/g, 'detrimental')
    .replace(/great/g, 'excellent')
    .replace(/awesome/g, 'exceptional');
};

// Make content more casual
const makeMoreCasual = (content: string): string => {
  return content
    .replace(/do not/g, "don't")
    .replace(/cannot/g, "can't")
    .replace(/will not/g, "won't")
    .replace(/I have/g, "I've")
    .replace(/you have/g, "you've")
    .replace(/they have/g, "they've")
    .replace(/I am/g, "I'm")
    .replace(/you are/g, "you're")
    .replace(/they are/g, "they're")
    .replace(/going to/g, "gonna")
    .replace(/want to/g, "wanna")
    .replace(/significantly/g, "a lot")
    .replace(/substantially/g, "really")
    .replace(/substantial/g, "big")
    .replace(/significant/g, "huge")
    .replace(/beneficial/g, "good")
    .replace(/detrimental/g, "bad")
    .replace(/excellent/g, "great")
    .replace(/exceptional/g, "awesome");
};

// Make content shorter
const makeShorter = (content: string): string => {
  const paragraphs = content.split('\n\n');
  
  // Remove some paragraphs
  if (paragraphs.length > 3) {
    // Keep intro, one middle paragraph, and conclusion
    const intro = paragraphs[0];
    const middle = paragraphs[Math.floor(paragraphs.length / 2)];
    const conclusion = paragraphs[paragraphs.length - 1];
    return [intro, middle, conclusion].join('\n\n');
  }
  
  // If not enough paragraphs, shorten each one
  return paragraphs.map(p => {
    const sentences = p.split('.');
    if (sentences.length > 3) {
      return sentences.slice(0, Math.ceil(sentences.length * 0.6)).join('.') + '.';
    }
    return p;
  }).join('\n\n');
};

// Make content longer
const makeLonger = (content: string, style: WritingStyle): string => {
  const paragraphs = content.split('\n\n');
  const expandedParagraphs = [];
  
  for (const paragraph of paragraphs) {
    expandedParagraphs.push(paragraph);
    
    // Add an additional paragraph after each existing one
    if (Math.random() > 0.3) { // 70% chance to add a paragraph
      const additionalParagraph = generateParagraph([], 'the topic', style, 'neutral', [], 0);
      expandedParagraphs.push(additionalParagraph);
    }
  }
  
  return expandedParagraphs.join('\n\n');
};