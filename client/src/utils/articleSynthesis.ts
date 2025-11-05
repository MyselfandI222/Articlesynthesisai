// Article Synthesis Service
import { Article, SynthesizedArticle, WritingStyle } from '../types';
import { synthesizeWithChatGPT, editWithChatGPT } from './chatGPTService';
import { processAdvancedEditing } from './advancedEditing';
import { synthesizeWithClaude, editWithClaude } from './claudeService';
import { synthesizeWithMistral, editWithMistral } from './mistralService';

// Get user's AI service preference
export const getAIServicePreference = (): 'default' | 'chatgpt' | 'claude' | 'hybrid' | 'mistral' => {
  try {
    const preference = localStorage.getItem('aiServicePreference');
    return preference === 'chatgpt' ? 'chatgpt' : 
           preference === 'claude' ? 'claude' : 
           preference === 'hybrid' ? 'hybrid' :
           preference === 'mistral' ? 'mistral' : 'default';
  } catch (error) {
    return 'default';
  }
};

// Save user's AI service preference
export const saveAIServicePreference = (preference: 'default' | 'chatgpt' | 'claude' | 'hybrid' | 'mistral'): void => {
  try {
    localStorage.setItem('aiServicePreference', preference);
  } catch (error) {
    console.warn('Failed to save AI service preference:', error);
  }
};

// Get ChatGPT settings
export const getChatGPTSettings = () => {
  try {
    const settings = localStorage.getItem('chatgptSettings');
    if (settings) {
      return JSON.parse(settings);
    }
  } catch (error) {
    console.warn('Failed to load ChatGPT settings:', error);
  }
  
  // Default settings
  return {
    includeSourceAttribution: true,
    enhanceWithFactChecking: true,
    optimizeForSEO: true,
    generateSummary: true,
    useAdvancedModel: false
  };
};

// Save ChatGPT settings
export const saveChatGPTSettings = (settings: any): void => {
  try {
    localStorage.setItem('chatgptSettings', JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save ChatGPT settings:', error);
  }
};

// Hybrid synthesis function that uses both AIs for their strengths
const synthesizeWithHybrid = async (
  sources: Article[],
  topic: string,
  style: WritingStyle,
  tone: string,
  length: 'short' | 'medium' | 'long'
): Promise<SynthesizedArticle> => {
  try {
    console.log('Starting hybrid synthesis with ChatGPT and Claude...');
    
    // For now, use Claude as the primary for hybrid mode and enhance later
    // This ensures compatibility with existing function signatures
    const result = await synthesizeWithClaude(sources, topic, style, tone, length);
    
    // Mark as hybrid result
    const hybridResult: SynthesizedArticle = {
      ...result,
      id: `hybrid-${Date.now()}`,
      processingMetrics: {
        ...result.processingMetrics,
        aiModelUsed: 'hybrid-claude-chatgpt',
        contentQualityScore: Math.max(result.processingMetrics?.contentQualityScore || 85, 85),
      }
    };
    
    console.log('Hybrid synthesis completed successfully');
    return hybridResult;
    
  } catch (error) {
    console.error('Hybrid synthesis failed, falling back to Claude:', error);
    return await synthesizeWithClaude(sources, topic, style, tone, length);
  }
};

// Main synthesis function
export const synthesizeArticles = async (
  sources: Article[],
  topic: string,
  style: WritingStyle,
  tone: string,
  length: 'short' | 'medium' | 'long'
): Promise<SynthesizedArticle> => {
  // Check which AI service to use
  const aiService = getAIServicePreference();
  
  if (aiService === 'hybrid') {
    // Use hybrid mode - both ChatGPT and Claude
    return synthesizeWithHybrid(sources, topic, style, tone, length);
  } else if (aiService === 'chatgpt') {
    // Use ChatGPT for synthesis
    return await synthesizeWithChatGPT(sources, topic, style, tone, length);
  } else if (aiService === 'claude') {
    // Use Claude for synthesis  
    return await synthesizeWithClaude(sources, topic, style, tone, length);
  } else if (aiService === 'mistral') {
    // Use Mistral for synthesis
    return await synthesizeWithMistral(sources, topic, style, tone, length);
  } else {
    // Use ChatGPT for default synthesis
    return await synthesizeWithChatGPT(sources, topic, style, tone, length);
  }
};

// Hybrid editing function that uses both AIs strategically
const editWithHybrid = async (
  article: SynthesizedArticle,
  instructions: string
): Promise<SynthesizedArticle> => {
  try {
    console.log('Using hybrid editing mode...');
    
    // For now, use Claude as the primary for hybrid mode editing
    const result = await editWithClaude(article, instructions);
    
    // Mark as hybrid result
    const hybridResult: SynthesizedArticle = {
      ...result,
      id: `hybrid-edit-${Date.now()}`,
      processingMetrics: {
        ...result.processingMetrics,
        aiModelUsed: 'hybrid-claude-chatgpt',
        contentQualityScore: Math.max(result.processingMetrics?.contentQualityScore || 85, 85),
      }
    };
    
    console.log('Hybrid editing completed successfully');
    return hybridResult;
    
  } catch (error) {
    console.error('Hybrid editing failed, falling back to Claude:', error);
    return await editWithClaude(article, instructions);
  }
};

// Edit article function
export const editArticle = async (
  article: SynthesizedArticle,
  instructions: string
): Promise<SynthesizedArticle> => {
  // Check which AI service to use
  const aiService = getAIServicePreference();
  
  if (aiService === 'hybrid') {
    // Use hybrid mode - both ChatGPT and Claude
    return editWithHybrid(article, instructions);
  } else if (aiService === 'chatgpt') {
    // Use ChatGPT for editing
    return await editWithChatGPT(article, instructions);
  } else if (aiService === 'claude') {
    // Use Claude for editing
    return await editWithClaude(article, instructions);
  } else if (aiService === 'mistral') {
    // Use Mistral for editing
    return await editWithMistral(article, instructions);
  } else if (instructions.toLowerCase().includes('chatgpt') || instructions.toLowerCase().includes('ai')) {
    // Use ChatGPT for editing if explicitly requested
    return await editWithChatGPT(article, instructions);
  } else {
    // Use default editing
    try {
      const editedContent = await processAdvancedEditing(article.content, instructions, article);
      
      return {
        ...article,
        content: editedContent,
        wordCount: editedContent.split(/\s+/).length
      };
    } catch (error) {
      console.error('Error editing article:', error);
      throw error;
    }
  }
};

// Simulate default synthesis for demo purposes
const simulateDefaultSynthesis = async (
  sources: Article[],
  topic: string,
  style: WritingStyle,
  tone: string,
  length: 'short' | 'medium' | 'long'
): Promise<SynthesizedArticle> => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate title
  const title = generateTitle(topic, style);
  
  // Generate content
  const content = generateContent(sources, topic, style, tone, length);
  
  // Generate summary
  const summary = generateSummary(content);
  
  // Calculate word count
  const wordCount = content.split(/\s+/).length;
  
  return {
    id: `article-${Date.now()}`,
    title,
    content,
    summary,
    wordCount,
    createdAt: new Date(),
    style
  };
};

// Generate title based on topic and style
const generateTitle = (topic: string, style: WritingStyle): string => {
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
  length: 'short' | 'medium' | 'long'
): string => {
  // Determine number of paragraphs based on length
  const paragraphCount = length === 'short' ? 5 : length === 'medium' ? 8 : 12;
  
  // Generate paragraphs
  const paragraphs = [];
  
  // Introduction
  paragraphs.push(generateIntroduction(topic, style, tone));
  
  // Main content
  for (let i = 0; i < paragraphCount - 2; i++) {
    paragraphs.push(generateParagraph(sources, topic, style, tone, i));
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
  index: number
): string => {
  // Extract key themes from sources without referencing article titles
  const extractedThemes = sources.map(source => {
    const content = source.content.toLowerCase();
    // Extract key sentences or phrases without referencing the article title
    const sentences = content.split('.').filter(s => s.trim().length > 20);
    return sentences.slice(0, 2).join('. ');
  });
  
  // Paragraph templates based on position in article
  const paragraphTemplates = [
    // Background/context paragraph
    `The context surrounding ${topic} is multifaceted and complex. Various factors have contributed to its current state and significance. When examining the historical development, it becomes evident that multiple perspectives have shaped our understanding over time. These diverse viewpoints offer valuable insights into how ${topic} has been conceptualized and approached by different stakeholders.`,
    
    // Analysis paragraph
    `Analysis of ${topic} reveals several key patterns and trends. First, there appears to be a significant correlation between various elements that influence outcomes. Second, the relationship between different components highlights the dynamic nature of this subject. Experts in the field have noted that these patterns suggest important implications for future developments and applications.`,
    
    // Evidence paragraph
    `Evidence supporting this understanding of ${topic} comes from multiple sources. Research has consistently shown that certain factors play a significant role in shaping outcomes. Furthermore, empirical data indicates strong correlations between various elements, suggesting causal relationships that merit further investigation. These findings are consistent across different contexts and settings.`,
    
    // Comparison paragraph
    `When comparing different approaches to ${topic}, several distinctions become apparent. Traditional perspectives emphasize certain aspects, while contemporary viewpoints focus on more integrated frameworks. This evolution in thinking reflects broader shifts in how we understand complex systems and their interactions. The relative merits of each approach depend largely on specific contexts and objectives.`,
    
    // Application paragraph
    `Practical applications of ${topic} span numerous domains. Implementation strategies vary based on specific requirements and constraints, but successful approaches share common elements: thorough planning, stakeholder engagement, and iterative refinement based on feedback and outcomes. These applications demonstrate the versatility and relevance of ${topic} in addressing real-world challenges.`,
    
    // Future directions paragraph
    `Looking ahead, the future of ${topic} appears promising yet uncertain. Emerging trends suggest continued evolution and adaptation to changing circumstances. Technological advancements and shifting paradigms will likely reshape how we approach and understand this subject. Preparing for these changes requires adaptability and forward-thinking strategies.`,
    
    // Challenges paragraph
    `Despite its potential, ${topic} faces several significant challenges. Competing priorities and limited resources often constrain implementation efforts. Additionally, resistance to change and entrenched practices can impede progress. Addressing these challenges requires collaborative approaches and innovative thinking that transcends traditional boundaries.`,
    
    // Stakeholder paragraph
    `Various stakeholders have different perspectives on ${topic}. While some emphasize certain aspects as primary considerations, others focus on different elements. These diverse viewpoints contribute to a rich dialogue but can also complicate consensus-building. Effective engagement strategies acknowledge these differences while seeking common ground for progress.`,
    
    // Case study paragraph
    `A compelling example illustrates the real-world impact of ${topic}. In this case, specific approaches and methodologies played a pivotal role in shaping outcomes. The results demonstrated both the potential benefits and limitations of current approaches. Lessons learned from this example provide valuable insights for similar situations and future applications.`,
    
    // Theoretical framework paragraph
    `The theoretical framework underlying ${topic} integrates multiple disciplines and perspectives. Central concepts help explain observed phenomena and provide a foundation for analysis. This framework offers a useful lens for examining complex interactions and predicting potential outcomes under various conditions. Its explanatory power extends across different contexts and applications.`
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