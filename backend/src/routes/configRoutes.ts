import { Router } from 'express';
import { Request, Response } from 'express';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { query } from '../database/connection';
import { ApiResponse, MetaApiConfigRequest } from '../types';

const router = Router();

// GET /api/config/meta-api - Get Meta API configuration
router.get('/meta-api', asyncHandler(async (req: Request, res: Response) => {
  const result = await query('SELECT id, app_id, is_active, created_at FROM meta_api_configs WHERE is_active = true LIMIT 1');
  
  const config = result.rows.length > 0 ? result.rows[0] : null;

  const response: ApiResponse = {
    success: true,
    data: config,
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

// POST /api/config/meta-api - Save Meta API configuration
router.post('/meta-api', asyncHandler(async (req: Request, res: Response) => {
  const { app_id, app_secret, access_token }: MetaApiConfigRequest = req.body;

  if (!app_id || !app_secret) {
    throw new AppError('App ID and App Secret are required', 400);
  }

  // Deactivate existing configurations
  await query('UPDATE meta_api_configs SET is_active = false');

  // Insert new configuration
  const result = await query(
    'INSERT INTO meta_api_configs (app_id, app_secret, access_token, is_active) VALUES ($1, $2, $3, $4) RETURNING id, app_id, is_active, created_at',
    [app_id, app_secret, access_token || null, true]
  );

  const response: ApiResponse = {
    success: true,
    data: result.rows[0],
    message: 'Meta API configuration saved successfully',
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

// DELETE /api/config/meta-api - Delete Meta API configuration
router.delete('/meta-api', asyncHandler(async (req: Request, res: Response) => {
  await query('UPDATE meta_api_configs SET is_active = false');

  const response: ApiResponse = {
    success: true,
    message: 'Meta API configuration disabled',
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

// GET /api/config/app-settings - Get application settings
router.get('/app-settings', asyncHandler(async (req: Request, res: Response) => {
  // Return basic app settings
  const response: ApiResponse = {
    success: true,
    data: {
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      features: {
        metaApiIntegration: true,
        geminiAnalysis: !!process.env.GEMINI_API_KEY,
        fileUploads: true
      }
    },
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

export default router;
