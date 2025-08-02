import { Application } from 'express';
import clientRoutes from './clientRoutes';
import creativeRoutes from './creativeRoutes';
import importRoutes from './importRoutes';
import configRoutes from './configRoutes';
import mcpRoutes from './mcp';

export const setupRoutes = (app: Application): void => {
  // API prefix
  const API_PREFIX = '/api';

  // Client routes
  app.use(`${API_PREFIX}/clients`, clientRoutes);

  // Creative analysis routes
  app.use(`${API_PREFIX}/analyze`, creativeRoutes);

  // Import routes
  app.use(`${API_PREFIX}/import`, importRoutes);

  // Configuration routes
  app.use(`${API_PREFIX}/config`, configRoutes);

  // MCP routes (Model Context Protocol + Supabase)
  app.use(`${API_PREFIX}/mcp`, mcpRoutes);

  // Initial data endpoint (for app initialization)
  app.get(`${API_PREFIX}/initial-data`, async (req, res) => {
    try {
      // This endpoint should return initial data needed by the frontend
      const response = {
        success: true,
        data: {
          appInitialized: true,
          version: '1.0.0'
        },
        timestamp: new Date().toISOString()
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching initial data',
        timestamp: new Date().toISOString()
      });
    }
  });
};
