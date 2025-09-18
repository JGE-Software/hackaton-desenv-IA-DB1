import fs from 'fs';
import path from 'path';

export class PromptLoader {
  private static promptsDir = path.join(process.cwd(), 'prompts');

  public static async loadPrompt(templateName: string): Promise<string> {
    try {
      const filePath = path.join(this.promptsDir, `${templateName}.txt`);
      const promptTemplate = fs.readFileSync(filePath, 'utf-8');
      return promptTemplate;
    } catch (error) {
      console.error(`Erro ao carregar prompt ${templateName}:`, error);
      throw new Error(`Prompt ${templateName} não encontrado`);
    }
  }

  public static processPrompt(
    template: string, 
    variables: Record<string, string | number | boolean>
  ): string {
    let processedPrompt = template;

    // Substituir todas as variáveis do template
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key.toUpperCase()}}}`;
      processedPrompt = processedPrompt.replace(new RegExp(placeholder, 'g'), String(value));
    });

    return processedPrompt;
  }

  public static async loadAndProcessPrompt(
    templateName: string,
    variables: Record<string, string | number | boolean>
  ): Promise<string> {
    const template = await this.loadPrompt(templateName);
    return this.processPrompt(template, variables);
  }
}
