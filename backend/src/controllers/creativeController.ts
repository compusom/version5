import { Request, Response } from 'express';
import { geminiService } from '../services/geminiService';
import { ApiResponse } from '../types';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import crypto from 'crypto';
import { query } from '../database/connection';

export const creativeController = {
  // Analyze creative using Gemini AI
  analyzeCreative: asyncHandler(async (req: Request, res: Response) => {
    const { formatGroup, language, context, isVideo } = req.body;
    const creativeFile = req.file;

    if (!creativeFile) {
      throw new AppError('Creative file is required', 400);
    }

    if (!formatGroup || !language || !context) {
      throw new AppError('Missing required fields: formatGroup, language, context', 400);
    }

    // Generate hash for the file to avoid duplicate processing
    const fileBuffer = require('fs').readFileSync(creativeFile.path);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    try {
      // Check if this creative has been analyzed before
      const existingAnalysis = await query(
        'SELECT * FROM analysis_results WHERE creative_hash = ? ORDER BY created_at DESC LIMIT 1',
        [hash]
      );

      let analysisResult;

      if (existingAnalysis.rows.length > 0) {
        // Return cached result
        analysisResult = {
          creativeDescription: existingAnalysis.rows[0].creative_description,
          effectivenessScore: existingAnalysis.rows[0].effectiveness_score,
          effectivenessJustification: existingAnalysis.rows[0].effectiveness_justification,
          clarityScore: existingAnalysis.rows[0].clarity_score,
          clarityJustification: existingAnalysis.rows[0].clarity_justification,
          textToImageRatio: existingAnalysis.rows[0].text_to_image_ratio,
          textToImageRatioJustification: existingAnalysis.rows[0].text_to_image_ratio_justification,
          funnelStage: existingAnalysis.rows[0].funnel_stage,
          funnelStageJustification: existingAnalysis.rows[0].funnel_stage_justification,
          recommendations: existingAnalysis.rows[0].recommendations,
          advantagePlusAnalysis: existingAnalysis.rows[0].advantage_plus_analysis,
          placementSummaries: existingAnalysis.rows[0].placement_summaries,
          overallConclusion: existingAnalysis.rows[0].overall_conclusion
        };
      } else {
        // Perform new analysis
        analysisResult = await geminiService.analyzeCreative({
          creativeFile,
          formatGroup,
          language,
          context,
          isVideo: isVideo === 'true'
        });

        // Save analysis result to database
        const clientId = req.body.clientId || null;
        await query(`
          INSERT INTO analysis_results (
            client_id, creative_hash, creative_description, effectiveness_score, 
            effectiveness_justification, clarity_score, clarity_justification,
            text_to_image_ratio, text_to_image_ratio_justification, funnel_stage,
            funnel_stage_justification, recommendations, advantage_plus_analysis,
            placement_summaries, overall_conclusion
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          clientId,
          hash,
          analysisResult.creativeDescription,
          analysisResult.effectivenessScore,
          analysisResult.effectivenessJustification,
          analysisResult.clarityScore,
          analysisResult.clarityJustification,
          analysisResult.textToImageRatio,
          analysisResult.textToImageRatioJustification,
          analysisResult.funnelStage,
          analysisResult.funnelStageJustification,
          JSON.stringify(analysisResult.recommendations),
          JSON.stringify(analysisResult.advantagePlusAnalysis),
          JSON.stringify(analysisResult.placementSummaries),
          JSON.stringify(analysisResult.overallConclusion)
        ]);

        // Log processed hash
        await query(
          'INSERT IGNORE INTO processed_hashes (hash, client_id, file_name) VALUES (?, ?, ?)',
          [hash, clientId, creativeFile.originalname]
        );
      }

      // Clean up uploaded file
      require('fs').unlinkSync(creativeFile.path);

      const response: ApiResponse = {
        success: true,
        data: analysisResult,
        message: existingAnalysis.rows.length > 0 ? 'Analysis retrieved from cache' : 'Analysis completed successfully',
        timestamp: new Date().toISOString()
      };

      res.json(response);

    } catch (error) {
      // Clean up uploaded file in case of error
      if (creativeFile.path) {
        try {
          require('fs').unlinkSync(creativeFile.path);
        } catch (cleanupError) {
          console.error('Error cleaning up file:', cleanupError);
        }
      }
      throw error;
    }
  }),

  // Get analysis history
  getAnalysisHistory: asyncHandler(async (req: Request, res: Response) => {
    const { clientId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = '';
    const queryParams: any[] = [Number(limit), offset];

    if (clientId && clientId !== 'all') {
      whereClause = 'WHERE client_id = ?';
      queryParams.push(clientId);
    }

    const result = await query(`
      SELECT 
        id, client_id, creative_hash, creative_description,
        effectiveness_score, clarity_score, text_to_image_ratio,
        funnel_stage, created_at
      FROM analysis_results 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `, queryParams);

    const countResult = await query(`
      SELECT COUNT(*) FROM analysis_results ${whereClause}
    `, whereClause ? [queryParams[2]] : []);

    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / Number(limit));

    const response = {
      success: true,
      data: result,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages
      },
      timestamp: new Date().toISOString()
    };

    res.json(response);
  }),

  // Get detailed analysis by ID
  getAnalysisById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await query('SELECT * FROM analysis_results WHERE id = ?', [id]);

    if (result.length === 0) {
      throw new AppError('Analysis not found', 404);
    }

    const analysis = result[0];

    const response: ApiResponse = {
      success: true,
      data: {
        id: analysis.id,
        clientId: analysis.client_id,
        creativeHash: analysis.creative_hash,
        creativeDescription: analysis.creative_description,
        effectivenessScore: analysis.effectiveness_score,
        effectivenessJustification: analysis.effectiveness_justification,
        clarityScore: analysis.clarity_score,
        clarityJustification: analysis.clarity_justification,
        textToImageRatio: analysis.text_to_image_ratio,
        textToImageRatioJustification: analysis.text_to_image_ratio_justification,
        funnelStage: analysis.funnel_stage,
        funnelStageJustification: analysis.funnel_stage_justification,
        recommendations: analysis.recommendations,
        advantagePlusAnalysis: analysis.advantage_plus_analysis,
        placementSummaries: analysis.placement_summaries,
        overallConclusion: analysis.overall_conclusion,
        createdAt: analysis.created_at
      },
      timestamp: new Date().toISOString()
    };

    res.json(response);
  })
};
