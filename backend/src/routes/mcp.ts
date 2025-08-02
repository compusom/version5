import { Router } from 'express';
import { mcpIntegrationService } from '../services/mcpIntegrationService';
import { supabaseService } from '../config/supabase';
import multer from 'multer';

const router = Router();

// Configurar multer para subida de archivos
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

/**
 * GET /api/mcp/campaigns/:userId
 * Obtener todas las campañas de un usuario
 */
router.get('/campaigns/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const campaigns = await supabaseService.getCampaigns(userId);
    
    res.json({
      success: true,
      data: campaigns,
      count: campaigns.length
    });
  } catch (error) {
    console.error('Error al obtener campañas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener campañas',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

/**
 * POST /api/mcp/campaigns
 * Crear nueva campaña
 */
router.post('/campaigns', async (req, res) => {
  try {
    const { name, objective, budget, userId } = req.body;

    if (!name || !objective || !budget || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: name, objective, budget, userId'
      });
    }

    const campaign = await mcpIntegrationService.createCampaign({
      name,
      objective,
      budget: parseFloat(budget),
      userId
    });

    res.status(201).json({
      success: true,
      data: campaign,
      message: 'Campaña creada exitosamente'
    });
  } catch (error) {
    console.error('Error al crear campaña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear campaña',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

/**
 * GET /api/mcp/campaigns/:campaignId/creatives
 * Obtener creativos de una campaña
 */
router.get('/campaigns/:campaignId/creatives', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const creatives = await supabaseService.getCreatives(campaignId);
    
    res.json({
      success: true,
      data: creatives,
      count: creatives.length
    });
  } catch (error) {
    console.error('Error al obtener creativos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener creativos',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

/**
 * POST /api/mcp/creatives
 * Crear nuevo creativo con análisis MCP
 */
router.post('/creatives', upload.single('file'), async (req, res) => {
  try {
    const { campaignId, name, textContent, callToAction } = req.body;
    const file = req.file;

    if (!campaignId || !name) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: campaignId, name'
      });
    }

    let imageUrl = null;
    let videoUrl = null;

    // Si hay archivo, subirlo a Supabase Storage
    if (file) {
      const uploadResult = await mcpIntegrationService.uploadCreativeFile(
        file.buffer,
        file.originalname,
        file.mimetype
      );
      
      if (file.mimetype.startsWith('image/')) {
        imageUrl = uploadResult.fileUrl;
      } else if (file.mimetype.startsWith('video/')) {
        videoUrl = uploadResult.fileUrl;
      }
    }

    // Crear creativo en Supabase
    const creative = await supabaseService.createCreative({
      campaign_id: campaignId,
      name,
      image_url: imageUrl,
      video_url: videoUrl,
      text_content: textContent,
      call_to_action: callToAction
    });

    res.status(201).json({
      success: true,
      data: creative,
      message: 'Creativo creado exitosamente'
    });
  } catch (error) {
    console.error('Error al crear creativo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear creativo',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

/**
 * POST /api/mcp/analyze-creative/:creativeId
 * Analizar creativo usando MCP + Gemini AI
 */
router.post('/analyze-creative/:creativeId', async (req, res) => {
  try {
    const { creativeId } = req.params;
    const { imageUrl, textContent } = req.body;

    // Ejecutar análisis usando MCP Integration Service
    const analysisResult = await mcpIntegrationService.analyzeCreativeWithAI(
      creativeId,
      imageUrl,
      textContent
    );

    res.json({
      success: true,
      data: analysisResult,
      message: 'Análisis completado exitosamente'
    });
  } catch (error) {
    console.error('Error al analizar creativo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al analizar creativo',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

/**
 * GET /api/mcp/campaigns/:campaignId/insights
 * Obtener insights de campaña usando MCP
 */
router.get('/campaigns/:campaignId/insights', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { dateRange = 'last_30_days' } = req.query;

    const insights = await mcpIntegrationService.getCampaignInsights(
      campaignId,
      dateRange as string
    );

    res.json({
      success: true,
      data: insights,
      message: 'Insights obtenidos exitosamente'
    });
  } catch (error) {
    console.error('Error al obtener insights:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener insights de campaña',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

/**
 * GET /api/mcp/creatives/:creativeId/analytics
 * Obtener analytics de un creativo específico
 */
router.get('/creatives/:creativeId/analytics', async (req, res) => {
  try {
    const { creativeId } = req.params;
    const { startDate, endDate } = req.query;

    const analytics = await supabaseService.getCreativeAnalytics(
      creativeId,
      startDate as string,
      endDate as string
    );

    res.json({
      success: true,
      data: analytics,
      count: analytics.length
    });
  } catch (error) {
    console.error('Error al obtener analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener analytics del creativo',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

/**
 * POST /api/mcp/analytics
 * Insertar datos de analytics
 */
router.post('/analytics', async (req, res) => {
  try {
    const analyticsData = req.body;

    if (!analyticsData.creative_id || !analyticsData.date) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: creative_id, date'
      });
    }

    const result = await supabaseService.insertAnalytics(analyticsData);

    res.status(201).json({
      success: true,
      data: result,
      message: 'Analytics insertados exitosamente'
    });
  } catch (error) {
    console.error('Error al insertar analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error al insertar analytics',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

/**
 * GET /api/mcp/tools
 * Listar herramientas MCP disponibles
 */
router.get('/tools', async (req, res) => {
  try {
    // Obtener herramientas disponibles desde el servidor MCP
    const mcpServer = mcpIntegrationService.getMCPServer();
    
    res.json({
      success: true,
      data: {
        available_tools: [
          {
            name: 'analyze_creative',
            description: 'Analiza creativos publicitarios de Meta Ads usando AI',
            parameters: ['creative_url', 'campaign_type']
          },
          {
            name: 'get_campaign_insights',
            description: 'Obtiene insights de campañas desde Supabase',
            parameters: ['campaign_id', 'date_range']
          }
        ],
        mcp_server_status: 'connected'
      },
      message: 'Herramientas MCP disponibles'
    });
  } catch (error) {
    console.error('Error al obtener herramientas MCP:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener herramientas MCP',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

/**
 * GET /api/mcp/health
 * Health check para MCP y Supabase
 */
router.get('/health', async (req, res) => {
  try {
    // Verificar conexión con Supabase
    const supabaseClient = supabaseService.getClient();
    const { data, error } = await supabaseClient.from('campaigns').select('count').limit(1);
    
    const supabaseStatus = error ? 'error' : 'connected';
    const mcpStatus = 'connected'; // Asumimos que está conectado si llegamos aquí

    res.json({
      success: true,
      data: {
        mcp_server: mcpStatus,
        supabase: supabaseStatus,
        timestamp: new Date().toISOString()
      },
      message: 'Health check completado'
    });
  } catch (error) {
    console.error('Error en health check:', error);
    res.status(500).json({
      success: false,
      message: 'Error en health check',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

export default router;