// Database entity types
export interface Client {
  id: number;
  name: string;
  meta_account_name?: string;
  description?: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PerformanceRecord {
  id: number;
  client_id: number;
  account_name: string;
  ad_name: string;
  day: Date;
  spend: number;
  impressions: number;
  link_clicks: number;
  purchases: number;
  purchase_value: number;
  frequency: number;
  cpm: number;
  cpc: number;
  ctr: number;
  reach: number;
  video_views: number;
  video_view_rate: number;
  created_at: Date;
}

export interface AnalysisResult {
  id: number;
  client_id: number;
  creative_hash: string;
  creative_description: string;
  effectiveness_score: number;
  effectiveness_justification: string;
  clarity_score: number;
  clarity_justification: string;
  text_to_image_ratio: number;
  text_to_image_ratio_justification: string;
  funnel_stage: 'TOFU' | 'MOFU' | 'BOFU' | 'Error' | 'N/A';
  funnel_stage_justification: string;
  recommendations: any; // JSONB
  advantage_plus_analysis: any; // JSONB
  placement_summaries: any; // JSONB
  overall_conclusion: any; // JSONB
  created_at: Date;
}

export interface ImportBatch {
  id: number;
  client_id: number;
  file_name: string;
  file_type: string;
  records_imported: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
  created_at: Date;
}

export interface MetaApiConfig {
  id: number;
  app_id: string;
  app_secret: string;
  access_token?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UploadedVideo {
  id: number;
  client_id: number;
  file_name: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  duration: number;
  width: number;
  height: number;
  created_at: Date;
}

export interface ProcessedHash {
  id: number;
  hash: string;
  client_id: number;
  file_name: string;
  processed_at: Date;
}

export interface BitacoraReport {
  id: number;
  client_id: number;
  date: Date;
  campaign_name: string;
  ad_set_name: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  conversion_value: number;
  created_at: Date;
}

export interface ApplicationLog {
  id: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  meta?: any; // JSONB
  timestamp: Date;
}

// Request/Response types
export interface CreateClientRequest {
  name: string;
  meta_account_name?: string;
  description?: string;
}

export interface UpdateClientRequest {
  name?: string;
  meta_account_name?: string;
  description?: string;
  active?: boolean;
}

export interface MetaApiConfigRequest {
  app_id: string;
  app_secret: string;
  access_token?: string;
}

export interface AnalyzeCreativeRequest {
  formatGroup: string;
  language: string;
  context: string;
  isVideo: boolean;
  clientId?: number;
}

export interface ImportRequest {
  clientId: number;
  sourceType: 'looker' | 'txt' | 'excel';
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends Omit<ApiResponse, 'data'> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// File upload types
export interface FileUploadResult {
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  path: string;
}

// Gemini AI types
export interface GeminiAnalysisRequest {
  creativeFile: any; // Multer file object
  formatGroup: string;
  language: string;
  context: string;
  isVideo: boolean;
}

export interface GeminiAnalysisResult {
  creativeDescription: string;
  effectivenessScore: number;
  effectivenessJustification: string;
  clarityScore: number;
  clarityJustification: string;
  textToImageRatio: number;
  textToImageRatioJustification: string;
  funnelStage: 'TOFU' | 'MOFU' | 'BOFU' | 'Error' | 'N/A';
  funnelStageJustification: string;
  recommendations: RecommendationItem[];
  advantagePlusAnalysis: AdvantagePlusRecommendation[];
  placementSummaries: PlacementSpecificSummary[];
  overallConclusion: OverallConclusion;
}

export interface RecommendationItem {
  headline: string;
  points: string[];
}

export interface AdvantagePlusRecommendation {
  enhancement: string;
  applicable: 'ACTIVATE' | 'CAUTION';
  justification: string;
}

export interface PlacementSpecificSummary {
  placementId: string;
  summary: string[];
}

export interface OverallConclusion {
  headline: string;
  checklist: ChecklistItem[];
}

export interface ChecklistItem {
  severity: 'CRITICAL' | 'ACTIONABLE' | 'POSITIVE';
  text: string;
}
