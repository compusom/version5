import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { creativeController } from '../controllers/creativeController';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  }
});

// POST /api/analyze/creative - Analyze creative with AI
router.post('/creative', upload.single('creativeFile'), creativeController.analyzeCreative);

// GET /api/analyze/history/:clientId - Get analysis history
router.get('/history/:clientId', creativeController.getAnalysisHistory);

// GET /api/analyze/:id - Get detailed analysis by ID
router.get('/:id', creativeController.getAnalysisById);

export default router;
