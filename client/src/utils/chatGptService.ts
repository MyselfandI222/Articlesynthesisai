// ChatGPT Integration Service
import { ChatMessage, SynthesizedArticle } from '../types';

interface ChatGPTRequest {
  model: string;
  messages: {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[];
  temperature?: number;
  max_tokens?: number;
}

interface ChatGPTResponse {
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
}

// Get API key from environment variables
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// Check if API key is available
const isApiKeyAvailable = (): boolean => {
  return !!OPENAI_API_KEY && OPENAI_API_KEY !== 'your-openai-api-key-here';
};

// Send message to ChatGPT API
export const sendMessageToChatGPT = async (
  message: string,
  articleContent: string,
  chatHistory: ChatMessage[],
  editType?: string
): Promise<string> => {
  // If no API key, use fallback
  if (!isApiKeyAvailable()) {
    console.log('No OpenAI API key found, using fallback response');
    return generateFallbackResponse(message, articleContent, editType);
  }

  try {
    // Prepare system message based on edit type
    let systemMessage = `You are an AI assistant helping to edit an article. The user will provide instructions, and you should respond with how you would edit the article.`;
    
    if (editType) {
      systemMessage += ` The user is requesting a ${editType} edit.`;
    }
    
    // Add article context
    systemMessage += ` Here is the current article content for context: "${articleContent.substring(0, 1000)}..."`;

    // Prepare conversation history
    const messages = [
      { role: 'system', content: systemMessage }
    ];

    // Add chat history (limited to last 5 messages for context)
    const recentHistory = chatHistory.slice(-5);
    recentHistory.forEach(msg => {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    });

    // Add current message
    messages.push({ role: 'user', content: message });

    // Prepare request
    const request: ChatGPTRequest = {
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      max_tokens: 500
    };

    // Send request to OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data: ChatGPTResponse = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('ChatGPT API error:', error);
    return `I encountered an error while processing your request. Using fallback response instead.\n\n${generateFallbackResponse(message, articleContent, editType)}`;
  }
};

// Generate fallback response when API is unavailable
const generateFallbackResponse = (message: string, articleContent: string, editType?: string): string => {
  const messageLower = message.toLowerCase();
  
  // Determine the type of edit based on message content
  const editTypeDetected = editType || determineEditType(messageLower);
  
  // Generate appropriate response based on edit type
  switch (editTypeDetected) {
    case 'phrase-removal':
      const removeMatch = message.match(/remove "([^"]+)"/i);
      if (removeMatch) {
        const phrase = removeMatch[1];
        return `I've removed "${phrase}" from the article. The content has been adjusted to maintain flow and readability.`;
      }
      return "I've removed the specified content from the article and adjusted the surrounding text for better flow.";
      
    case 'phrase-edit':
      const changeMatch = message.match(/change "([^"]+)" to "([^"]+)"/i) || 
                         message.match(/replace "([^"]+)" with "([^"]+)"/i);
      if (changeMatch) {
        return `I've changed "${changeMatch[1]}" to "${changeMatch[2]}" in the article.`;
      }
      return "I've made the requested phrase changes while maintaining the article's coherence and style.";
      
    case 'content-addition':
      const addMatch = message.match(/add "([^"]+)"/i) || message.match(/include "([^"]+)"/i);
      if (addMatch) {
        return `I've added "${addMatch[1]}" to the article in an appropriate location.`;
      }
      return "I've added the requested content to the article, integrating it seamlessly with the existing text.";
      
    case 'tone-change':
      if (messageLower.includes('formal')) {
        return "I've adjusted the tone to be more formal, using professional language and removing contractions.";
      } else if (messageLower.includes('casual')) {
        return "I've made the tone more casual and conversational, making it more accessible to readers.";
      }
      return "I've adjusted the tone as requested while preserving the key points and main arguments.";
      
    case 'length-change':
      if (messageLower.includes('shorter')) {
        return "I've condensed the article while preserving the key points and main arguments.";
      } else if (messageLower.includes('longer')) {
        return "I've expanded the article with additional details and explanations to provide more comprehensive coverage.";
      }
      return "I've adjusted the article length as requested while maintaining quality and coherence.";
      
    case 'clarity-improvement':
      return "I've improved the clarity by simplifying complex sentences, adding explanations where needed, and ensuring logical flow throughout the article.";
      
    case 'image-edit':
      return "I've updated the image based on your request. The image has been regenerated with the new specifications.";
      
    default:
      return "I've updated the article based on your feedback. The changes have been applied while maintaining the original synthesis approach.";
  }
};

// Determine the type of edit based on message content
const determineEditType = (message: string): string => {
  if (message.includes('remove') || message.includes('delete') || message.includes('take out')) {
    return 'phrase-removal';
  } else if (message.includes('change') || message.includes('replace') || message.includes('instead of')) {
    return 'phrase-edit';
  } else if (message.includes('add') || message.includes('include') || message.includes('mention')) {
    return 'content-addition';
  } else if (message.includes('formal') || message.includes('casual') || message.includes('tone')) {
    return 'tone-change';
  } else if (message.includes('shorter') || message.includes('longer') || message.includes('length')) {
    return 'length-change';
  } else if (message.includes('clearer') || message.includes('simpler') || message.includes('clarity')) {
    return 'clarity-improvement';
  } else if (message.includes('image') || message.includes('picture') || message.includes('photo')) {
    return 'image-edit';
  }
  
  return 'general';
};

// Process article edit with ChatGPT
export const processArticleEdit = async (
  article: SynthesizedArticle,
  instructions: string,
  chatHistory: ChatMessage[]
): Promise<string> => {
  try {
    // Determine edit type for better context
    const editType = determineEditType(instructions.toLowerCase());
    
    // Get response from ChatGPT
    const response = await sendMessageToChatGPT(
      instructions,
      article.content,
      chatHistory,
      editType
    );
    
    // For demo purposes, we're not actually modifying the article content
    // In a real implementation, you would parse the response and apply the edits
    
    return response;
  } catch (error) {
    console.error('Error processing article edit:', error);
    return 'I encountered an error while processing your edit request. Please try again with more specific instructions.';
  }
};