import { Router } from 'express';
import multer from 'multer';
import { Request, Response } from 'express';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { query } from '../database/connection';
import { ApiResponse } from '../types';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    // Accept Excel, CSV, and TXT files
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel (.xlsx, .xls), CSV, and TXT files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// POST /api/import/looker - Import Looker data
router.post('/looker', upload.single('file'), asyncHandler(async (req: Request, res: Response) => {
  const file = req.file;
  const { clientId } = req.body;

  if (!file) {
    throw new AppError('File is required', 400);
  }

  if (!clientId) {
    throw new AppError('Client ID is required', 400);
  }

  try {
    // Create import batch record
    const batchResult = await query(
      'INSERT INTO import_batches (client_id, file_name, file_type, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [clientId, file.originalname, 'looker', 'processing']
    );

    const batchId = batchResult.rows[0].id;

    // TODO: Process the Looker file here
    // This would involve parsing the Excel/CSV file and extracting performance data
    // For now, we'll just mark it as completed

    await query(
      'UPDATE import_batches SET status = $1, records_imported = $2 WHERE id = $3',
      ['completed', 0, batchId]
    );

    // Clean up uploaded file
    require('fs').unlinkSync(file.path);

    const response: ApiResponse = {
      success: true,
      data: {
        batchId,
        recordsImported: 0,
        message: 'Looker data import completed'
      },
      timestamp: new Date().toISOString()
    };

    res.json(response);

  } catch (error) {
    // Clean up file in case of error
    if (file.path) {
      try {
        require('fs').unlinkSync(file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
    throw error;
  }
}));

// POST /api/import/txt - Import TXT report data  
router.post('/txt', upload.single('file'), asyncHandler(async (req: Request, res: Response) => {
  const file = req.file;
  const { clientId } = req.body;

  if (!file) {
    throw new AppError('File is required', 400);
  }

  if (!clientId) {
    throw new AppError('Client ID is required', 400);
  }

  try {
    // Create import batch record
    const batchResult = await query(
      'INSERT INTO import_batches (client_id, file_name, file_type, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [clientId, file.originalname, 'txt', 'processing']
    );

    const batchId = batchResult.rows[0].id;

    // TODO: Process the TXT file here
    // This would involve parsing the text file and extracting bitacora report data

    await query(
      'UPDATE import_batches SET status = $1, records_imported = $2 WHERE id = $3',
      ['completed', 0, batchId]
    );

    // Clean up uploaded file
    require('fs').unlinkSync(file.path);

    const response: ApiResponse = {
      success: true,
      data: {
        batchId,
        recordsImported: 0,
        message: 'TXT report import completed'
      },
      timestamp: new Date().toISOString()
    };

    res.json(response);

  } catch (error) {
    // Clean up file in case of error
    if (file.path) {
      try {
        require('fs').unlinkSync(file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
    throw error;
  }
}));

// POST /api/import/excel - Import Excel data
router.post('/excel', upload.single('file'), asyncHandler(async (req: Request, res: Response) => {
  const file = req.file;
  const { clientId } = req.body;

  if (!file) {
    throw new AppError('File is required', 400);
  }

  if (!clientId) {
    throw new AppError('Client ID is required', 400);
  }

  try {
    // Create import batch record
    const batchResult = await query(
      'INSERT INTO import_batches (client_id, file_name, file_type, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [clientId, file.originalname, 'excel', 'processing']
    );

    const batchId = batchResult.rows[0].id;

    // TODO: Process the Excel file here
    // This would involve parsing the Excel file and extracting performance data

    await query(
      'UPDATE import_batches SET status = $1, records_imported = $2 WHERE id = $3',
      ['completed', 0, batchId]
    );

    // Clean up uploaded file
    require('fs').unlinkSync(file.path);

    const response: ApiResponse = {
      success: true,
      data: {
        batchId,
        recordsImported: 0,
        message: 'Excel import completed'
      },
      timestamp: new Date().toISOString()
    };

    res.json(response);

  } catch (error) {
    // Clean up file in case of error
    if (file.path) {
      try {
        require('fs').unlinkSync(file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
    throw error;
  }
}));

// GET /api/import/history/:clientId - Get import history
router.get('/history/:clientId', asyncHandler(async (req: Request, res: Response) => {
  const { clientId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const offset = (Number(page) - 1) * Number(limit);

  let whereClause = '';
  const queryParams: any[] = [Number(limit), offset];

  if (clientId && clientId !== 'all') {
    whereClause = 'WHERE client_id = $3';
    queryParams.push(clientId);
  }

  const result = await query(`
    SELECT * FROM import_batches 
    ${whereClause}
    ORDER BY created_at DESC 
    LIMIT $1 OFFSET $2
  `, queryParams);

  const countResult = await query(`
    SELECT COUNT(*) FROM import_batches ${whereClause}
  `, whereClause ? [queryParams[2]] : []);

  const total = parseInt(countResult.rows[0].count);
  const totalPages = Math.ceil(total / Number(limit));

  const response = {
    success: true,
    data: result.rows,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages
    },
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

export default router;
