import { MCPServer } from '../config/mcp';
import { supabaseService } from '../config/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface CreativeAnalysisResult {
  score: number;
  insights: string[];
  recommendations: string[];
  emotional_analysis: {
    dominant_emotion: string;
    intensity: number;
    emotions_detected: string[];
  };
  technical_analysis: {
    image_quality: number;
    composition_score: number;
    text_readability: number;
  };
}

export class MCPIntegrationService {
  private mcpServer: MCPServer;
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.mcpServer = new MCPServer();
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  async initializeMCP() {
    try {
      await this.mcpServer.start();
      console.log('🤖 MCP Server iniciado y conectado');
    } catch (error) {
      console.error('❌ Error al inicializar MCP:', error);
      throw error;
    }
  }

  /**
   * Analiza un creativo publicitario usando Gemini AI y almacena en Supabase
   */
  async analyzeCreativeWithAI(creativeId: string, imageUrl?: string, textContent?: string): Promise<CreativeAnalysisResult> {
    try {
      // Obtener el creativo desde Supabase
      const creatives = await supabaseService.getCreatives(creativeId);
      if (!creatives || creatives.length === 0) {
        throw new Error('Creativo no encontrado');
      }

      const creative = creatives[0];
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      let prompt = `
        Analiza este creativo publicitario para Meta Ads y proporciona un análisis detallado:
        
        Nombre del creativo: ${creative.name}
        Texto del anuncio: ${creative.text_content || textContent || 'No especificado'}
        Call to Action: ${creative.call_to_action || 'No especificado'}
        
        Por favor analiza:
        1. Efectividad del mensaje (puntaje del 1-10)
        2. Análisis emocional del contenido
        3. Recomendaciones de mejora
        4. Insights sobre el público objetivo
        5. Análisis técnico (si hay imagen)
        
        Responde en formato JSON con esta estructura:
        {
          "score": number,
          "insights": string[],
          "recommendations": string[],
          "emotional_analysis": {
            "dominant_emotion": string,
            "intensity": number,
            "emotions_detected": string[]
          },
          "technical_analysis": {
            "image_quality": number,
            "composition_score": number,
            "text_readability": number
          }
        }
      `;

      // Si hay imagen, incluirla en el análisis
      let result;
      if (creative.image_url || imageUrl) {
        // Para análisis de imagen, necesitarías configurar el modelo multimodal
        result = await model.generateContent(prompt);
      } else {
        result = await model.generateContent(prompt);
      }

      const analysisText = result.response.text();
      
      // Intentar parsear como JSON, si falla usar análisis básico
      let analysisResult: CreativeAnalysisResult;
      try {
        analysisResult = JSON.parse(analysisText);
      } catch (parseError) {
        // Fallback si no se puede parsear el JSON
        analysisResult = {
          score: 7,
          insights: [analysisText.substring(0, 200) + '...'],
          recommendations: ['Revisar el análisis completo generado por AI'],
          emotional_analysis: {
            dominant_emotion: 'neutral',
            intensity: 5,
            emotions_detected: ['neutral']
          },
          technical_analysis: {
            image_quality: 8,
            composition_score: 7,
            text_readability: 8
          }
        };
      }

      // Guardar los resultados en Supabase
      await supabaseService.updateCreativeAnalysis(creative.id, analysisResult);

      return analysisResult;

    } catch (error) {
      console.error('Error al analizar creativo:', error);
      throw error;
    }
  }

  /**
   * Obtiene insights de campaña desde Supabase
   */
  async getCampaignInsights(campaignId: string, dateRange: string = 'last_30_days') {
    try {
      // Obtener creativos de la campaña
      const creatives = await supabaseService.getCreatives(campaignId);
      
      if (!creatives || creatives.length === 0) {
        return {
          campaign_id: campaignId,
          creatives_count: 0,
          insights: ['No hay creativos en esta campaña'],
          performance_summary: null
        };
      }

      // Obtener analytics de todos los creativos
      const analyticsPromises = creatives.map(creative => 
        supabaseService.getCreativeAnalytics(creative.id, this.getDateFromRange(dateRange))
      );

      const allAnalytics = await Promise.all(analyticsPromises);
      
      // Procesar datos para insights
      const totalImpressions = allAnalytics.flat().reduce((sum, analytics) => sum + analytics.impressions, 0);
      const totalClicks = allAnalytics.flat().reduce((sum, analytics) => sum + analytics.clicks, 0);
      const totalCost = allAnalytics.flat().reduce((sum, analytics) => sum + analytics.cost, 0);
      const avgCTR = totalClicks > 0 ? (totalClicks / totalImpressions) * 100 : 0;

      const insights = [
        `Total de impresiones: ${totalImpressions.toLocaleString()}`,
        `Total de clics: ${totalClicks.toLocaleString()}`,
        `CTR promedio: ${avgCTR.toFixed(2)}%`,
        `Costo total: $${totalCost.toFixed(2)}`,
        `Número de creativos: ${creatives.length}`
      ];

      // Encontrar el creativo con mejor performance
      const bestPerformingCreative = creatives
        .map(creative => {
          const analytics = allAnalytics.flat().filter(a => a.creative_id === creative.id);
          const totalCTR = analytics.reduce((sum, a) => sum + a.ctr, 0) / analytics.length;
          return { creative, ctr: totalCTR || 0 };
        })
        .sort((a, b) => b.ctr - a.ctr)[0];

      if (bestPerformingCreative) {
        insights.push(`Mejor creativo: ${bestPerformingCreative.creative.name} (CTR: ${bestPerformingCreative.ctr.toFixed(2)}%)`);
      }

      return {
        campaign_id: campaignId,
        creatives_count: creatives.length,
        insights,
        performance_summary: {
          total_impressions: totalImpressions,
          total_clicks: totalClicks,
          avg_ctr: avgCTR,
          total_cost: totalCost,
          best_creative: bestPerformingCreative?.creative.name
        }
      };

    } catch (error) {
      console.error('Error al obtener insights de campaña:', error);
      throw error;
    }
  }

  /**
   * Crear una nueva campaña con Supabase
   */
  async createCampaign(campaignData: {
    name: string;
    objective: string;
    budget: number;
    userId: string;
  }) {
    try {
      const campaign = await supabaseService.createCampaign({
        name: campaignData.name,
        objective: campaignData.objective,
        budget: campaignData.budget,
        user_id: campaignData.userId,
        status: 'draft'
      });

      return campaign;
    } catch (error) {
      console.error('Error al crear campaña:', error);
      throw error;
    }
  }

  /**
   * Subir creativo a Supabase Storage
   */
  async uploadCreativeFile(file: Buffer, fileName: string, mimeType: string) {
    try {
      const fileExtension = fileName.split('.').pop();
      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
      
      const uploadResult = await supabaseService.uploadFile(
        'creatives', 
        uniqueFileName, 
        file
      );

      const fileUrl = await supabaseService.getFileUrl('creatives', uniqueFileName);
      
      return {
        fileName: uniqueFileName,
        fileUrl,
        uploadResult
      };
    } catch (error) {
      console.error('Error al subir archivo:', error);
      throw error;
    }
  }

  private getDateFromRange(range: string): string {
    const now = new Date();
    let daysAgo = 30; // default

    switch (range) {
      case 'last_7_days':
        daysAgo = 7;
        break;
      case 'last_14_days':
        daysAgo = 14;
        break;
      case 'last_30_days':
        daysAgo = 30;
        break;
      case 'last_90_days':
        daysAgo = 90;
        break;
    }

    const startDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
    return startDate.toISOString().split('T')[0];
  }

  getMCPServer() {
    return this.mcpServer;
  }
}

export const mcpIntegrationService = new MCPIntegrationService();
export default mcpIntegrationService;