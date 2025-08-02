import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

export class MCPServer {
  private server: Server;
  
  constructor() {
    this.server = new Server(
      {
        name: 'meta-ads-creative-assistant',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );
    
    this.setupHandlers();
  }

  private setupHandlers() {
    // Handler para listar herramientas disponibles
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'analyze_creative',
            description: 'Analiza creativos publicitarios de Meta Ads',
            inputSchema: {
              type: 'object',
              properties: {
                creative_url: {
                  type: 'string',
                  description: 'URL del creativo a analizar',
                },
                campaign_type: {
                  type: 'string',
                  description: 'Tipo de campaña (awareness, conversion, etc.)',
                },
              },
              required: ['creative_url'],
            },
          },
          {
            name: 'get_campaign_insights',
            description: 'Obtiene insights de campañas desde Supabase',
            inputSchema: {
              type: 'object',
              properties: {
                campaign_id: {
                  type: 'string',
                  description: 'ID de la campaña',
                },
                date_range: {
                  type: 'string',
                  description: 'Rango de fechas (last_7_days, last_30_days, etc.)',
                },
              },
              required: ['campaign_id'],
            },
          },
        ],
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
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Tool ${name} not found`
            );
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Error executing tool ${name}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }

  private async analyzeCreative(args: any) {
    // Aquí integrarías con tu lógica existente de análisis de creativos
    // y con Supabase para almacenar/recuperar datos
    const { creative_url, campaign_type } = args;
    
    // Ejemplo de respuesta
    return {
      content: [
        {
          type: 'text',
          text: `Análisis del creativo: ${creative_url}\nTipo de campaña: ${campaign_type || 'No especificado'}\n\nResultados del análisis se almacenarán en Supabase...`,
        },
      ],
    };
  }

  private async getCampaignInsights(args: any) {
    // Aquí integrarías con Supabase para obtener insights
    const { campaign_id, date_range } = args;
    
    return {
      content: [
        {
          type: 'text',
          text: `Insights para campaña: ${campaign_id}\nRango de fechas: ${date_range || 'último mes'}\n\nDatos recuperados desde Supabase...`,
        },
      ],
    };
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log('MCP Server iniciado correctamente');
  }

  getServer() {
    return this.server;
  }
}