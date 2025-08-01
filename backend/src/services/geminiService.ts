import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/config';
import { GeminiAnalysisRequest, GeminiAnalysisResult } from '../types';
import fs from 'fs';
import path from 'path';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(config.geminiApiKey);

// Convert file to base64
const fileToGenerativePart = async (file: any) => {
  if (!file || !file.path) {
    throw new Error('Invalid file object');
  }

  const fileBuffer = fs.readFileSync(file.path);
  const base64Data = fileBuffer.toString('base64');

  return {
    inlineData: {
      data: base64Data,
      mimeType: file.mimetype,
    },
  };
};

// Guidelines for Meta Ads
const META_ADS_GUIDELINES = `
### Mejoras automáticas de Meta Advantage+ para anuncios estáticos y de video

#### Plantilla de imagen (superposición de texto Advantage+)
La plantilla de imagen es una mejora Advantage+ que superpone texto sobre tu anuncio estático cuando esto puede mejorar su rendimiento. Meta utiliza plantillas de diseño para mostrar en la creatividad frases o mensajes clave que tú hayas proporcionado (por ejemplo, titulares o promociones) directamente encima de la imagen. Esta superposición de texto, con fuente y fondo personalizables, hace que tu mensaje sea más visible dentro del anuncio, sin depender de que el usuario lea el texto fuera de la imagen. En la práctica, cubre una parte del creativo con texto destacado, por lo que conviene evitar colocar elementos importantes de la imagen en la zona donde podría ir la superposición (usualmente zonas superior o inferior). Esta función se entrega en ubicaciones como Feed móvil, Feed de Instagram y Reels de Facebook. (Ejemplo: Meta puede colocar automáticamente un texto tipo "¡Oferta especial esta semana!" sobre tu imagen para captar la atención del público.)

#### Retoques visuales (ajuste de brillo, contraste y formato)
Los retoques visuales permiten que Meta optimice automáticamente la calidad visual de tu imagen. Esta mejora Advantage+ puede ajustar el brillo y contraste de la foto, aplicar ligeros filtros de color, e incluso recortar o reencuadrar el contenido para adaptarlo mejor a distintas ubicaciones o formatos. El objetivo es hacer que el anuncio luzca más limpio, claro y profesional sin alterar el mensaje central. Por ejemplo, si tu imagen original es muy oscura o tiene un encuadre horizontal, Meta podría aclararla y recortarla a cuadrado o vertical para que destaque en el feed. Ten en cuenta que podría recortar bordes de la imagen al cambiar la relación de aspecto, por lo que debes considerar mantener el sujeto principal centrado y con margen de seguridad. En general, esta mejora ayuda a que tus anuncios sean más llamativos visualmente, aumentando la probabilidad de que los usuarios se detengan a mirarlos.

#### Animación de imagen estática (movimiento automático)
La animación de imagen convierte una foto estática en un contenido con movimiento sutil. Meta añadirá movimientos comunes como panorámicas, zoom o rotaciones a tu imagen cuando estime que así puede captar mejor la atención del público. En la práctica, tu creatividad estática se transforma en un breve video o GIF con efecto de movimiento, enfocándose típicamente en el centro de la imagen para aplicar el zoom o paneo. Esto puede hacer más dinámico un anuncio normalmente plano, destacándolo en el feed o en Stories. Sin embargo, toda la imagen se ve afectada: puede que los bordes queden ligeramente fuera de cuadro durante el movimiento o que el efecto distraiga del mensaje principal. Meta solo aplica esta animación cuando cree que beneficiará el rendimiento, pero si la animación no encaja con tu estética, puedes desactivar esta mejora. (Ejemplo: una foto de un producto podría tener un ligero zoom in-out o un desplazamiento de lado a lado para darle vida en el feed.)

#### Ampliación de imagen (expandir para más ubicaciones)
La ampliación de imagen es una mejora potenciada por IA generativa que expande automáticamente tu imagen para adaptarla a más formatos y tamaños de pantalla. Meta genera píxeles adicionales en los bordes de tu foto para cambiar su proporción (por ejemplo, de horizontal a vertical), permitiendo utilizarla en ubicaciones como Stories o Reels sin dejar franjas vacías. En esencia, extiende el fondo de tu imagen de forma coherente: por ejemplo, añade cielo, suelo u otros elementos similares al contenido original para llenar el espacio extra. Esta expansión cubre áreas fuera de tu imagen original, manteniendo el sujeto central visible. Además, Meta puede añadir superposiciones de texto en la zona expandida cuando crea que así mejorará el rendimiento (por ejemplo, un breve mensaje promocional en la parte superior o inferior añadida). Es importante saber que la IA hace su mejor intento, pero los resultados pueden variar en fidelidad; Meta misma advierte que no garantiza la exactitud de las imágenes expandidas. En resumen, esta mejora te ahorra crear versiones específicas para cada formato, aunque debes revisar que los elementos esenciales no queden distorsionados ni que el contenido generado resulte inapropiado.
`;

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  async analyzeCreative(request: GeminiAnalysisRequest): Promise<GeminiAnalysisResult> {
    try {
      const { creativeFile, formatGroup, language, context, isVideo } = request;

      if (!config.geminiApiKey) {
        throw new Error('Gemini API key not configured');
      }

      // Convert file to format expected by Gemini
      const imagePart = await fileToGenerativePart(creativeFile);

      // Create prompt based on language
      const isSpanish = language === 'es';
      const prompt = this.buildPrompt(formatGroup, context, isVideo, isSpanish);

      // Generate content with Gemini
      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      // Parse JSON response
      try {
        const analysisResult = JSON.parse(text);
        return analysisResult;
      } catch (parseError) {
        console.error('Error parsing Gemini response:', parseError);
        throw new Error('Invalid response format from AI analysis');
      }

    } catch (error) {
      console.error('Error in Gemini analysis:', error);
      throw error;
    }
  }

  private buildPrompt(formatGroup: string, context: string, isVideo: boolean, isSpanish: boolean): string {
    const mediaType = isVideo ? 'video' : 'imagen';
    const lang = isSpanish ? 'español' : 'inglés';

    return `
Analiza esta ${mediaType} publicitaria para Meta Ads (Facebook e Instagram) y proporciona un análisis detallado en formato JSON.

Contexto del negocio: ${context}
Grupo de formato: ${formatGroup}
Idioma de respuesta: ${lang}

Considera estas mejoras automáticas de Meta Advantage+:
${META_ADS_GUIDELINES}

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "creativeDescription": "Descripción detallada de lo que se ve en la ${mediaType}",
  "effectivenessScore": 0-10,
  "effectivenessJustification": "Explicación del puntaje de efectividad",
  "clarityScore": 0-10,
  "clarityJustification": "Explicación del puntaje de claridad",
  "textToImageRatio": 0-10,
  "textToImageRatioJustification": "Evaluación del equilibrio texto-imagen",
  "funnelStage": "TOFU|MOFU|BOFU",
  "funnelStageJustification": "Explicación de la etapa del funnel",
  "recommendations": [
    {
      "headline": "Título de la recomendación",
      "points": ["punto 1", "punto 2", "punto 3"]
    }
  ],
  "advantagePlusAnalysis": [
    {
      "enhancement": "Nombre de la mejora",
      "applicable": "ACTIVATE|CAUTION",
      "justification": "Explicación"
    }
  ],
  "placementSummaries": [
    {
      "placementId": "FB_FEED",
      "summary": ["recomendación específica 1", "recomendación específica 2"]
    }
  ],
  "overallConclusion": {
    "headline": "Conclusión principal",
    "checklist": [
      {
        "severity": "CRITICAL|ACTIONABLE|POSITIVE",
        "text": "Punto de acción específico"
      }
    ]
  }
}

NO incluyas explicaciones adicionales, solo el JSON.
`;
  }
}

// Create singleton instance
export const geminiService = new GeminiService();
