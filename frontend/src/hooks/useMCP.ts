import { useState, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface MCPAnalysisResult {
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

export interface MCPInsights {
  campaign_id: string;
  creatives_count: number;
  insights: string[];
  performance_summary: {
    total_impressions: number;
    total_clicks: number;
    avg_ctr: number;
    total_cost: number;
    best_creative?: string;
  } | null;
}

export interface MCPTool {
  name: string;
  description: string;
  parameters: string[];
}

export const useMCP = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: any) => {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    setError(message);
    console.error('MCP Error:', err);
  };

  // Función para hacer requests a la API MCP
  const mcpRequest = async (endpoint: string, options: RequestInit = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/mcp${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Error en la respuesta de MCP');
      }

      return data.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener campañas
  const getCampaigns = useCallback(async (userId: string) => {
    return mcpRequest(`/campaigns/${userId}`);
  }, []);

  // Crear campaña
  const createCampaign = useCallback(async (campaignData: {
    name: string;
    objective: string;
    budget: number;
    userId: string;
  }) => {
    return mcpRequest('/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    });
  }, []);

  // Obtener creativos de una campaña
  const getCreatives = useCallback(async (campaignId: string) => {
    return mcpRequest(`/campaigns/${campaignId}/creatives`);
  }, []);

  // Crear creativo
  const createCreative = useCallback(async (formData: FormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/mcp/creatives`, {
        method: 'POST',
        body: formData, // No añadir Content-Type para FormData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Error al crear creativo');
      }

      return data.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Analizar creativo con MCP + AI
  const analyzeCreative = useCallback(async (
    creativeId: string, 
    options: { imageUrl?: string; textContent?: string } = {}
  ): Promise<MCPAnalysisResult> => {
    return mcpRequest(`/analyze-creative/${creativeId}`, {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }, []);

  // Obtener insights de campaña
  const getCampaignInsights = useCallback(async (
    campaignId: string, 
    dateRange: string = 'last_30_days'
  ): Promise<MCPInsights> => {
    return mcpRequest(`/campaigns/${campaignId}/insights?dateRange=${dateRange}`);
  }, []);

  // Obtener analytics de creativo
  const getCreativeAnalytics = useCallback(async (
    creativeId: string, 
    startDate?: string, 
    endDate?: string
  ) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return mcpRequest(`/creatives/${creativeId}/analytics${queryString}`);
  }, []);

  // Insertar datos de analytics
  const insertAnalytics = useCallback(async (analyticsData: any) => {
    return mcpRequest('/analytics', {
      method: 'POST',
      body: JSON.stringify(analyticsData),
    });
  }, []);

  // Obtener herramientas MCP disponibles
  const getMCPTools = useCallback(async (): Promise<{ available_tools: MCPTool[]; mcp_server_status: string }> => {
    return mcpRequest('/tools');
  }, []);

  // Health check de MCP y Supabase
  const healthCheck = useCallback(async () => {
    return mcpRequest('/health');
  }, []);

  // Función auxiliar para limpiar errores
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Función para analizar múltiples creativos en batch
  const batchAnalyzeCreatives = useCallback(async (creativeIds: string[]) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const promises = creativeIds.map(id => analyzeCreative(id));
      const results = await Promise.allSettled(promises);
      
      const successes = results
        .filter((result): result is PromiseFulfilledResult<MCPAnalysisResult> => result.status === 'fulfilled')
        .map(result => result.value);
      
      const errors = results
        .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
        .map(result => result.reason);

      if (errors.length > 0) {
        console.warn('Algunos análisis fallaron:', errors);
      }

      return {
        successes,
        errors,
        total: creativeIds.length,
        successful: successes.length,
        failed: errors.length
      };
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [analyzeCreative]);

  return {
    // Estado
    isLoading,
    error,
    clearError,
    
    // Funciones de campañas
    getCampaigns,
    createCampaign,
    getCampaignInsights,
    
    // Funciones de creativos
    getCreatives,
    createCreative,
    analyzeCreative,
    batchAnalyzeCreatives,
    
    // Funciones de analytics
    getCreativeAnalytics,
    insertAnalytics,
    
    // Funciones de sistema
    getMCPTools,
    healthCheck,
  };
};

export default useMCP;