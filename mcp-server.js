#!/usr/bin/env node

/**
 * Meta Ads Creative Assistant - MCP Server
 * 
 * Este es un servidor MCP independiente que puede ser usado directamente
 * por clientes MCP como Claude Desktop, Cursor, etc.
 * 
 * Uso:
 *   node mcp-server.js
 * 
 * Para usar con Claude Desktop, añade esto a tu configuración:
 * {
 *   "mcpServers": {
 *     "meta-ads-assistant": {
 *       "command": "node",
 *       "args": ["/path/to/your/project/mcp-server.js"]
 *     }
 *   }
 * }
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} = require('@modelcontextprotocol/sdk/types.js');

// Configuración del servidor
const SERVER_INFO = {
  name: 'meta-ads-creative-assistant',
  version: '1.0.0',
};

const TOOLS = [
  {
    name: 'analyze_creative',
    description: 'Analiza creativos publicitarios de Meta Ads usando AI',
    inputSchema: {
      type: 'object',
      properties: {
        creative_url: {
          type: 'string',
          description: 'URL del creativo a analizar',
        },
        creative_text: {
          type: 'string',
          description: 'Texto del creativo publicitario',
        },
        campaign_type: {
          type: 'string',
          description: 'Tipo de campaña (awareness, conversion, engagement, etc.)',
          enum: ['awareness', 'conversion', 'engagement', 'traffic', 'leads', 'sales']
        },
        target_audience: {
          type: 'string',
          description: 'Descripción del público objetivo',
        },
      },
      required: ['creative_text'],
    },
  },
  {
    name: 'get_campaign_insights',
    description: 'Obtiene insights y recomendaciones para campañas publicitarias',
    inputSchema: {
      type: 'object',
      properties: {
        campaign_id: {
          type: 'string',
          description: 'ID de la campaña',
        },
        date_range: {
          type: 'string',
          description: 'Rango de fechas para el análisis',
          enum: ['last_7_days', 'last_30_days', 'last_90_days'],
          default: 'last_30_days'
        },
        metrics: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['ctr', 'cpc', 'cpm', 'conversion_rate', 'roas']
          },
          description: 'Métricas específicas a analizar',
        },
      },
      required: ['campaign_id'],
    },
  },
  {
    name: 'generate_creative_variations',
    description: 'Genera variaciones de un creativo publicitario para A/B testing',
    inputSchema: {
      type: 'object',
      properties: {
        original_text: {
          type: 'string',
          description: 'Texto original del creativo',
        },
        variations_count: {
          type: 'number',
          description: 'Número de variaciones a generar',
          minimum: 1,
          maximum: 5,
          default: 3
        },
        focus_area: {
          type: 'string',
          description: 'Área de enfoque para las variaciones',
          enum: ['headline', 'cta', 'emotional_tone', 'value_proposition'],
        },
        target_audience: {
          type: 'string',
          description: 'Características del público objetivo',
        },
      },
      required: ['original_text'],
    },
  },
  {
    name: 'optimize_ad_spend',
    description: 'Proporciona recomendaciones para optimizar el gasto publicitario',
    inputSchema: {
      type: 'object',
      properties: {
        current_budget: {
          type: 'number',
          description: 'Presupuesto actual en USD',
        },
        campaign_objective: {
          type: 'string',
          description: 'Objetivo principal de la campaña',
          enum: ['awareness', 'traffic', 'engagement', 'leads', 'conversions', 'sales']
        },
        target_cpa: {
          type: 'number',
          description: 'Costo por adquisición objetivo en USD',
        },
        historical_performance: {
          type: 'string',
          description: 'Datos de rendimiento histórico (formato JSON string)',
        },
      },
      required: ['current_budget', 'campaign_objective'],
    },
  }
];

class MetaAdsAssistantServer {
  constructor() {
    this.server = new Server(SERVER_INFO, {
      capabilities: {
        tools: {},
      },
    });

    this.setupHandlers();
  }

  setupHandlers() {
    // Handler para listar herramientas
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: TOOLS,
      };
    });

    // Handler para ejecutar herramientas
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'analyze_creative':
            return await this.analyzeCreative(args);
          case 'get_campaign_insights':
            return await this.getCampaignInsights(args);
          case 'generate_creative_variations':
            return await this.generateCreativeVariations(args);
          case 'optimize_ad_spend':
            return await this.optimizeAdSpend(args);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Herramienta ${name} no encontrada`
            );
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Error ejecutando herramienta ${name}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }

  async analyzeCreative(args) {
    const { creative_url, creative_text, campaign_type, target_audience } = args;

    // Simular análisis de creativo (aquí integrarías con Gemini AI o tu API)
    const analysis = {
      overall_score: Math.floor(Math.random() * 3) + 7, // Score 7-10
      emotional_appeal: Math.floor(Math.random() * 3) + 7,
      clarity_score: Math.floor(Math.random() * 3) + 8,
      call_to_action_strength: Math.floor(Math.random() * 3) + 7,
      target_alignment: target_audience ? Math.floor(Math.random() * 3) + 8 : 6,
    };

    const insights = [
      `Texto analizado: "${creative_text.substring(0, 100)}${creative_text.length > 100 ? '...' : ''}"`,
      `Tipo de campaña: ${campaign_type || 'No especificado'}`,
      `Score general: ${analysis.overall_score}/10`,
      `Atractivo emocional: ${analysis.emotional_appeal}/10`,
      `Claridad del mensaje: ${analysis.clarity_score}/10`,
      `Fuerza del CTA: ${analysis.call_to_action_strength}/10`,
    ];

    if (target_audience) {
      insights.push(`Alineación con audiencia: ${analysis.target_alignment}/10`);
    }

    const recommendations = [];
    
    if (analysis.emotional_appeal < 8) {
      recommendations.push('Considera añadir más elementos emocionales al copy');
    }
    if (analysis.call_to_action_strength < 8) {
      recommendations.push('El call-to-action podría ser más específico y urgente');
    }
    if (analysis.clarity_score < 8) {
      recommendations.push('Simplifica el mensaje para mayor claridad');
    }
    if (!creative_text.includes('!') && !creative_text.includes('?')) {
      recommendations.push('Considera usar signos de exclamación para mayor impacto');
    }

    return {
      content: [
        {
          type: 'text',
          text: `## 📊 Análisis de Creativo Publicitario

### Puntuación General: ${analysis.overall_score}/10

### 🎯 Insights:
${insights.map(insight => `• ${insight}`).join('\n')}

### 💡 Recomendaciones:
${recommendations.length > 0 
  ? recommendations.map(rec => `• ${rec}`).join('\n')
  : '• El creativo está bien optimizado, mantén el buen trabajo!'
}

### 📈 Próximos Pasos:
• Considera hacer A/B testing con variaciones
• Monitorea métricas de CTR y engagement
• Ajusta según el rendimiento inicial`,
        },
      ],
    };
  }

  async getCampaignInsights(args) {
    const { campaign_id, date_range, metrics } = args;

    // Simular datos de campaña
    const mockData = {
      campaign_id,
      period: date_range || 'last_30_days',
      impressions: Math.floor(Math.random() * 50000) + 10000,
      clicks: Math.floor(Math.random() * 2000) + 100,
      spend: Math.floor(Math.random() * 1000) + 100,
      conversions: Math.floor(Math.random() * 50) + 5,
    };

    const ctr = ((mockData.clicks / mockData.impressions) * 100).toFixed(2);
    const cpc = (mockData.spend / mockData.clicks).toFixed(2);
    const conversion_rate = ((mockData.conversions / mockData.clicks) * 100).toFixed(2);
    const roas = ((mockData.conversions * 50) / mockData.spend).toFixed(2); // Asumiendo $50 por conversión

    const insights = [
      `Campaña ID: ${campaign_id}`,
      `Período: ${date_range || 'Últimos 30 días'}`,
      `Impresiones: ${mockData.impressions.toLocaleString()}`,
      `Clics: ${mockData.clicks.toLocaleString()}`,
      `CTR: ${ctr}%`,
      `CPC: $${cpc}`,
      `Conversiones: ${mockData.conversions}`,
      `Tasa de conversión: ${conversion_rate}%`,
      `ROAS: ${roas}x`,
    ];

    const recommendations = [];
    
    if (parseFloat(ctr) < 1.0) {
      recommendations.push('CTR bajo: considera mejorar el copy y las imágenes');
    }
    if (parseFloat(cpc) > 2.0) {
      recommendations.push('CPC alto: optimiza la segmentación de audiencia');
    }
    if (parseFloat(conversion_rate) < 2.0) {
      recommendations.push('Baja conversión: revisa la landing page y el funnel');
    }
    if (parseFloat(roas) < 3.0) {
      recommendations.push('ROAS bajo: considera pausar o reoptimizar la campaña');
    }

    return {
      content: [
        {
          type: 'text',
          text: `## 📈 Insights de Campaña

### 📊 Métricas Clave:
${insights.map(insight => `• ${insight}`).join('\n')}

### 🎯 Análisis:
• **Rendimiento CTR:** ${parseFloat(ctr) >= 1.0 ? '✅ Bueno' : '⚠️ Necesita mejora'}
• **Eficiencia CPC:** ${parseFloat(cpc) <= 2.0 ? '✅ Eficiente' : '⚠️ Alto'}
• **Conversiones:** ${parseFloat(conversion_rate) >= 2.0 ? '✅ Buena tasa' : '⚠️ Baja tasa'}
• **ROAS:** ${parseFloat(roas) >= 3.0 ? '✅ Rentable' : '⚠️ Revisar'}

### 💡 Recomendaciones:
${recommendations.length > 0 
  ? recommendations.map(rec => `• ${rec}`).join('\n')
  : '• La campaña está funcionando bien, mantén el curso!'
}`,
        },
      ],
    };
  }

  async generateCreativeVariations(args) {
    const { original_text, variations_count, focus_area, target_audience } = args;
    const count = variations_count || 3;

    const variations = [];
    
    for (let i = 1; i <= count; i++) {
      let variation = original_text;
      
      switch (focus_area) {
        case 'headline':
          variation = this.modifyHeadline(original_text, i);
          break;
        case 'cta':
          variation = this.modifyCTA(original_text, i);
          break;
        case 'emotional_tone':
          variation = this.modifyEmotionalTone(original_text, i);
          break;
        case 'value_proposition':
          variation = this.modifyValueProposition(original_text, i);
          break;
        default:
          variation = this.generalVariation(original_text, i);
      }
      
      variations.push({
        version: `Variación ${i}`,
        text: variation,
        focus: focus_area || 'general',
        suggested_test_split: `${Math.floor(100/count)}%`
      });
    }

    return {
      content: [
        {
          type: 'text',
          text: `## 🔄 Variaciones de Creativo para A/B Testing

### 📝 Texto Original:
"${original_text}"

### 🎯 Enfoque: ${focus_area || 'Optimización general'}
${target_audience ? `### 👥 Audiencia: ${target_audience}` : ''}

### ✨ Variaciones Generadas:

${variations.map((v, index) => 
  `**${v.version}** (${v.suggested_test_split}):
"${v.text}"
*Enfoque: ${v.focus}*`
).join('\n\n')}

### 📊 Recomendaciones para Testing:
• Ejecuta las variaciones simultáneamente
• Asigna tráfico equitativo inicialmente
• Mide CTR, CPC y conversiones
• Espera significancia estadística antes de decidir
• Considera factores estacionales y temporales`,
        },
      ],
    };
  }

  async optimizeAdSpend(args) {
    const { current_budget, campaign_objective, target_cpa, historical_performance } = args;

    // Simular análisis de optimización
    const recommendations = [];
    const budget_allocation = {};

    // Lógica básica de optimización
    if (campaign_objective === 'awareness') {
      budget_allocation.display = '40%';
      budget_allocation.video = '35%';
      budget_allocation.social = '25%';
      recommendations.push('Para awareness, prioriza alcance sobre frecuencia');
      recommendations.push('Usa formatos visuales atractivos');
    } else if (campaign_objective === 'conversions') {
      budget_allocation.search = '50%';
      budget_allocation.retargeting = '30%';
      budget_allocation.lookalike = '20%';
      recommendations.push('Enfócate en audiencias con alta intención de compra');
      recommendations.push('Optimiza para conversiones, no clics');
    }

    const suggested_daily_budget = Math.floor(current_budget / 30);
    const bid_recommendation = target_cpa ? target_cpa * 0.7 : suggested_daily_budget * 0.1;

    return {
      content: [
        {
          type: 'text',
          text: `## 💰 Optimización de Gasto Publicitario

### 📊 Análisis Actual:
• Presupuesto total: $${current_budget.toLocaleString()}
• Objetivo: ${campaign_objective}
• Presupuesto diario sugerido: $${suggested_daily_budget}
${target_cpa ? `• CPA objetivo: $${target_cpa}` : ''}

### 🎯 Distribución Recomendada:
${Object.entries(budget_allocation).map(([channel, percentage]) => 
  `• ${channel.charAt(0).toUpperCase() + channel.slice(1)}: ${percentage}`
).join('\n')}

### 💡 Recomendaciones de Optimización:
${recommendations.map(rec => `• ${rec}`).join('\n')}
• Bid sugerido: $${bid_recommendation.toFixed(2)} ${target_cpa ? '(70% del CPA objetivo)' : ''}
• Implementa bid adjustments por dispositivo y hora
• Usa automated bidding después de obtener datos suficientes

### 📈 Próximos Pasos:
• Monitor daily spend vs. performance
• Ajusta bids basado en cost per result
• Pausa ad sets con bajo rendimiento después de 3-5 días
• Escala los ganadores gradualmente (+20-50% budget)`,
        },
      ],
    };
  }

  // Métodos auxiliares para generar variaciones
  modifyHeadline(text, variation) {
    const headlines = [
      text.replace(/^[^.!?]*/, "🚀 Descubre el Secreto"),
      text.replace(/^[^.!?]*/, "⚡ No Te Pierdas Esta Oportunidad"),
      text.replace(/^[^.!?]*/, "🎯 La Solución Que Buscabas"),
    ];
    return headlines[variation - 1] || text;
  }

  modifyCTA(text, variation) {
    const ctas = [
      " ¡Actúa Ahora!",
      " ¡Empieza Hoy!",
      " ¡Descubre Más!",
    ];
    return text + ctas[variation - 1];
  }

  modifyEmotionalTone(text, variation) {
    const tones = [
      text.replace(/\./g, "! ✨"),
      text.replace(/\b(tu|tus)\b/g, "tu increíble"),
      text.replace(/\b(es|son)\b/g, "resulta ser"),
    ];
    return tones[variation - 1] || text;
  }

  modifyValueProposition(text, variation) {
    const propositions = [
      `💎 OFERTA EXCLUSIVA: ${text}`,
      `🎁 GRATIS por tiempo limitado: ${text}`,
      `⭐ GARANTIZADO o tu dinero de vuelta: ${text}`,
    ];
    return propositions[variation - 1] || text;
  }

  generalVariation(text, variation) {
    const variations = [
      text.replace(/\b\w+/g, (word) => Math.random() > 0.8 ? word.toUpperCase() : word),
      `${text} ¡No esperes más!`,
      text.replace(/\./g, "... 🤔"),
    ];
    return variations[variation - 1] || text;
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    // Mensaje de bienvenida (solo para debugging, no va al cliente)
    console.error('🤖 Meta Ads Creative Assistant MCP Server iniciado');
    console.error('📱 Herramientas disponibles:');
    console.error('   • analyze_creative - Análisis de creativos');
    console.error('   • get_campaign_insights - Insights de campañas');
    console.error('   • generate_creative_variations - Variaciones A/B');
    console.error('   • optimize_ad_spend - Optimización de presupuesto');
  }
}

// Iniciar servidor
if (require.main === module) {
  const server = new MetaAdsAssistantServer();
  server.start().catch(console.error);
}

module.exports = { MetaAdsAssistantServer };