// Advanced AI Editing System with Natural Language Processing
import { SynthesizedArticle } from '../types';

export interface EditingContext {
  originalContent: string;
  editHistory: EditOperation[];
  qualityMetrics: any;
  userPreferences: EditingPreferences;
}

export interface EditOperation {
  type: 'replace' | 'insert' | 'delete' | 'rephrase' | 'restructure';
  location: string;
  originalText: string;
  newText: string;
  reason: string;
  timestamp: Date;
}

export interface EditingPreferences {
  preferredTone: string;
  targetReadability: number;
  maxSentenceLength: number;
  preferredStyle: string;
}

// Advanced editing engine with context awareness
export class AdvancedEditingEngine {
  private context: EditingContext;
  
  constructor(article: SynthesizedArticle) {
    this.context = {
      originalContent: article.content,
      editHistory: [],
      qualityMetrics: {},
      userPreferences: {
        preferredTone: 'neutral',
        targetReadability: 70,
        maxSentenceLength: 25,
        preferredStyle: article.style
      }
    };
  }
  
  // Process natural language editing instructions
  async processEditingInstruction(instruction: string): Promise<string> {
    const editType = this.classifyEditInstruction(instruction);
    const editPlan = this.createEditPlan(instruction, editType);
    
    return this.executeEditPlan(editPlan);
  }
  
  // Classify the type of editing instruction
  private classifyEditInstruction(instruction: string): string {
    const instructionLower = instruction.toLowerCase();
    
    const patterns = {
      'tone_change': /make (it )?more (formal|casual|professional|friendly|serious|conversational)/i,
      'length_change': /make (it )?(shorter|longer|more concise|more detailed)/i,
      'style_change': /change (the )?style to|write in (a )?more|rewrite as/i,
      'content_addition': /add|include|mention|insert/i,
      'content_removal': /remove|delete|take out|eliminate/i,
      'content_replacement': /change|replace|substitute|swap/i,
      'structure_change': /reorganize|restructure|reorder|break up/i,
      'clarity_improvement': /clarify|explain better|make clearer|simplify/i,
      'factual_enhancement': /add (more )?(statistics|data|facts|examples|evidence)/i,
      'flow_improvement': /improve (the )?flow|better transitions|smoother/i
    };
    
    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(instructionLower)) {
        return type;
      }
    }
    
    return 'general_improvement';
  }
  
  // Create a detailed edit plan
  private createEditPlan(instruction: string, editType: string): any {
    const plan = {
      type: editType,
      instruction,
      operations: [],
      targetSections: this.identifyTargetSections(instruction),
      priority: this.calculatePriority(editType)
    };
    
    switch (editType) {
      case 'tone_change':
        plan.operations = this.planToneChange(instruction);
        break;
      case 'length_change':
        plan.operations = this.planLengthChange(instruction);
        break;
      case 'content_addition':
        plan.operations = this.planContentAddition(instruction);
        break;
      case 'content_removal':
        plan.operations = this.planContentRemoval(instruction);
        break;
      case 'content_replacement':
        plan.operations = this.planContentReplacement(instruction);
        break;
      case 'structure_change':
        plan.operations = this.planStructureChange(instruction);
        break;
      case 'clarity_improvement':
        plan.operations = this.planClarityImprovement(instruction);
        break;
      case 'factual_enhancement':
        plan.operations = this.planFactualEnhancement(instruction);
        break;
      case 'flow_improvement':
        plan.operations = this.planFlowImprovement(instruction);
        break;
      default:
        plan.operations = this.planGeneralImprovement(instruction);
    }
    
    return plan;
  }
  
  // Execute the edit plan
  private async executeEditPlan(plan: any): Promise<string> {
    let editedContent = this.context.originalContent;
    
    for (const operation of plan.operations) {
      editedContent = await this.executeOperation(editedContent, operation);
      
      // Record the operation
      this.context.editHistory.push({
        type: operation.type,
        location: operation.location,
        originalText: operation.originalText,
        newText: operation.newText,
        reason: operation.reason,
        timestamp: new Date()
      });
    }
    
    return editedContent;
  }
  
  // Execute individual editing operations
  private async executeOperation(content: string, operation: any): Promise<string> {
    switch (operation.type) {
      case 'replace':
        return this.executeReplace(content, operation);
      case 'insert':
        return this.executeInsert(content, operation);
      case 'delete':
        return this.executeDelete(content, operation);
      case 'rephrase':
        return this.executeRephrase(content, operation);
      case 'restructure':
        return this.executeRestructure(content, operation);
      default:
        return content;
    }
  }
  
  // Specific operation implementations
  private executeReplace(content: string, operation: any): string {
    if (operation.originalText && operation.newText) {
      return content.replace(
        new RegExp(this.escapeRegExp(operation.originalText), 'gi'),
        operation.newText
      );
    }
    return content;
  }
  
  private executeInsert(content: string, operation: any): string {
    const insertionPoint = this.findInsertionPoint(content, operation.location);
    return content.slice(0, insertionPoint) + operation.newText + content.slice(insertionPoint);
  }
  
  private executeDelete(content: string, operation: any): string {
    return content.replace(
      new RegExp(this.escapeRegExp(operation.originalText), 'gi'),
      ''
    ).replace(/\s+/g, ' ').trim();
  }
  
  private executeRephrase(content: string, operation: any): string {
    // Advanced rephrasing logic
    return this.rephraseText(content, operation.targetText, operation.style);
  }
  
  private executeRestructure(content: string, operation: any): string {
    // Restructure paragraphs or sections
    return this.restructureContent(content, operation.newStructure);
  }
  
  // Planning methods for different edit types
  private planToneChange(instruction: string): any[] {
    const toneMatch = instruction.match(/more (formal|casual|professional|friendly|serious|conversational)/i);
    const targetTone = toneMatch ? toneMatch[1].toLowerCase() : 'neutral';
    
    return [{
      type: 'rephrase',
      location: 'entire_document',
      targetTone,
      reason: `Adjusting tone to be more ${targetTone}`
    }];
  }
  
  private planLengthChange(instruction: string): any[] {
    const isShorten = /shorter|more concise/i.test(instruction);
    const isExpand = /longer|more detailed/i.test(instruction);
    
    if (isShorten) {
      return [{
        type: 'restructure',
        location: 'entire_document',
        action: 'condense',
        reason: 'Making content more concise'
      }];
    } else if (isExpand) {
      return [{
        type: 'insert',
        location: 'strategic_points',
        action: 'expand',
        reason: 'Adding more detail and explanation'
      }];
    }
    
    return [];
  }
  
  private planContentAddition(instruction: string): any[] {
    const addMatch = instruction.match(/add "([^"]+)"/i) || 
                    instruction.match(/include "([^"]+)"/i) ||
                    instruction.match(/mention "([^"]+)"/i);
    
    if (addMatch) {
      return [{
        type: 'insert',
        location: 'appropriate_section',
        newText: addMatch[1],
        reason: 'Adding requested content'
      }];
    }
    
    // Handle general addition requests
    if (/statistics|data/i.test(instruction)) {
      return [{
        type: 'insert',
        location: 'supporting_paragraphs',
        newText: 'relevant statistical data',
        reason: 'Adding statistical support'
      }];
    }
    
    return [];
  }
  
  private planContentRemoval(instruction: string): any[] {
    const removeMatch = instruction.match(/remove "([^"]+)"/i) ||
                       instruction.match(/delete "([^"]+)"/i);
    
    if (removeMatch) {
      return [{
        type: 'delete',
        originalText: removeMatch[1],
        reason: 'Removing specified content'
      }];
    }
    
    return [];
  }
  
  private planContentReplacement(instruction: string): any[] {
    const replaceMatch = instruction.match(/change "([^"]+)" to "([^"]+)"/i) ||
                        instruction.match(/replace "([^"]+)" with "([^"]+)"/i);
    
    if (replaceMatch) {
      return [{
        type: 'replace',
        originalText: replaceMatch[1],
        newText: replaceMatch[2],
        reason: 'Replacing content as requested'
      }];
    }
    
    return [];
  }
  
  private planStructureChange(instruction: string): any[] {
    if (/break up|shorter paragraphs/i.test(instruction)) {
      return [{
        type: 'restructure',
        action: 'break_paragraphs',
        reason: 'Breaking content into shorter paragraphs'
      }];
    }
    
    if (/add headings|section headers/i.test(instruction)) {
      return [{
        type: 'insert',
        action: 'add_headings',
        reason: 'Adding section headings for better organization'
      }];
    }
    
    return [];
  }
  
  private planClarityImprovement(instruction: string): any[] {
    return [{
      type: 'rephrase',
      location: 'complex_sentences',
      action: 'simplify',
      reason: 'Improving clarity and readability'
    }];
  }
  
  private planFactualEnhancement(instruction: string): any[] {
    const operations = [];
    
    if (/statistics/i.test(instruction)) {
      operations.push({
        type: 'insert',
        location: 'supporting_paragraphs',
        newText: 'relevant statistical data',
        reason: 'Adding statistical evidence'
      });
    }
    
    if (/examples/i.test(instruction)) {
      operations.push({
        type: 'insert',
        location: 'explanatory_sections',
        newText: 'concrete examples',
        reason: 'Adding illustrative examples'
      });
    }
    
    return operations;
  }
  
  private planFlowImprovement(instruction: string): any[] {
    return [{
      type: 'insert',
      location: 'paragraph_transitions',
      newText: 'transition phrases',
      reason: 'Improving flow between paragraphs'
    }];
  }
  
  private planGeneralImprovement(instruction: string): any[] {
    return [{
      type: 'rephrase',
      location: 'entire_document',
      action: 'general_improvement',
      reason: 'General content improvement'
    }];
  }
  
  // Helper methods
  private identifyTargetSections(instruction: string): string[] {
    const sections = [];
    
    if (/introduction|opening/i.test(instruction)) sections.push('introduction');
    if (/conclusion|ending/i.test(instruction)) sections.push('conclusion');
    if (/middle|body/i.test(instruction)) sections.push('body');
    if (/entire|whole|all/i.test(instruction)) sections.push('entire_document');
    
    return sections.length > 0 ? sections : ['entire_document'];
  }
  
  private calculatePriority(editType: string): number {
    const priorities = {
      'content_replacement': 10,
      'content_removal': 9,
      'content_addition': 8,
      'tone_change': 7,
      'structure_change': 6,
      'clarity_improvement': 5,
      'flow_improvement': 4,
      'factual_enhancement': 3,
      'length_change': 2,
      'general_improvement': 1
    };
    
    return priorities[editType] || 1;
  }
  
  private findInsertionPoint(content: string, location: string): number {
    switch (location) {
      case 'beginning':
        return 0;
      case 'end':
        return content.length;
      case 'middle':
        return Math.floor(content.length / 2);
      default:
        return Math.floor(content.length / 2);
    }
  }
  
  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  private rephraseText(content: string, targetText: string, style: string): string {
    // Advanced rephrasing implementation
    // This would use NLP techniques in a real implementation
    return content.replace(targetText, this.generateRephrasedVersion(targetText, style));
  }
  
  private generateRephrasedVersion(text: string, style: string): string {
    // Simplified rephrasing - in production this would use advanced NLP
    const synonyms = {
      'important': ['significant', 'crucial', 'vital', 'essential'],
      'shows': ['demonstrates', 'indicates', 'reveals', 'illustrates'],
      'many': ['numerous', 'several', 'various', 'multiple'],
      'good': ['excellent', 'effective', 'beneficial', 'valuable']
    };
    
    let rephrased = text;
    Object.entries(synonyms).forEach(([word, alternatives]) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      if (regex.test(rephrased)) {
        const replacement = alternatives[Math.floor(Math.random() * alternatives.length)];
        rephrased = rephrased.replace(regex, replacement);
      }
    });
    
    return rephrased;
  }
  
  private restructureContent(content: string, newStructure: string): string {
    // Content restructuring implementation
    const paragraphs = content.split('\n\n');
    
    switch (newStructure) {
      case 'break_paragraphs':
        return this.breakLongParagraphs(paragraphs).join('\n\n');
      case 'add_headings':
        return this.addSectionHeadings(paragraphs).join('\n\n');
      default:
        return content;
    }
  }
  
  private breakLongParagraphs(paragraphs: string[]): string[] {
    return paragraphs.flatMap(paragraph => {
      const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim().length > 0);
      if (sentences.length > 4) {
        const midpoint = Math.ceil(sentences.length / 2);
        return [
          sentences.slice(0, midpoint).join('. ') + '.',
          sentences.slice(midpoint).join('. ') + '.'
        ];
      }
      return [paragraph];
    });
  }
  
  private addSectionHeadings(paragraphs: string[]): string[] {
    const headings = ['Introduction', 'Analysis', 'Key Findings', 'Conclusion'];
    const sectionsPerHeading = Math.ceil(paragraphs.length / headings.length);
    
    const result = [];
    for (let i = 0; i < paragraphs.length; i++) {
      if (i % sectionsPerHeading === 0 && i / sectionsPerHeading < headings.length) {
        result.push(`## ${headings[Math.floor(i / sectionsPerHeading)]}`);
      }
      result.push(paragraphs[i]);
    }
    
    return result;
  }
}

// Export the main editing function
export const processAdvancedEditing = async (
  content: string,
  instructions: string,
  article?: SynthesizedArticle
): Promise<string> => {
  const engine = new AdvancedEditingEngine(article || {
    id: '',
    title: '',
    content,
    summary: '',
    wordCount: 0,
    createdAt: new Date(),
    style: 'blog'
  });
  
  return await engine.processEditingInstruction(instructions);
};