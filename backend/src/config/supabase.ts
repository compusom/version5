import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

export interface Database {
  public: {
    Tables: {
      campaigns: {
        Row: {
          id: string;
          name: string;
          objective: string;
          status: string;
          budget: number;
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          objective: string;
          status?: string;
          budget: number;
          created_at?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          objective?: string;
          status?: string;
          budget?: number;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
      creatives: {
        Row: {
          id: string;
          campaign_id: string;
          name: string;
          image_url?: string;
          video_url?: string;
          text_content?: string;
          call_to_action?: string;
          analysis_results?: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          name: string;
          image_url?: string;
          video_url?: string;
          text_content?: string;
          call_to_action?: string;
          analysis_results?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          name?: string;
          image_url?: string;
          video_url?: string;
          text_content?: string;
          call_to_action?: string;
          analysis_results?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      creative_analytics: {
        Row: {
          id: string;
          creative_id: string;
          impressions: number;
          clicks: number;
          ctr: number;
          cpc: number;
          conversions: number;
          cost: number;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          creative_id: string;
          impressions: number;
          clicks: number;
          ctr: number;
          cpc: number;
          conversions: number;
          cost: number;
          date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          creative_id?: string;
          impressions?: number;
          clicks?: number;
          ctr?: number;
          cpc?: number;
          conversions?: number;
          cost?: number;
          date?: string;
          created_at?: string;
        };
      };
    };
  };
}

class SupabaseService {
  private supabase: SupabaseClient<Database>;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'Faltan las variables de entorno SUPABASE_URL y SUPABASE_ANON_KEY'
      );
    }

    this.supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }

  // Métodos para Campañas
  async getCampaigns(userId: string) {
    const { data, error } = await this.supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async createCampaign(campaign: Database['public']['Tables']['campaigns']['Insert']) {
    const { data, error } = await this.supabase
      .from('campaigns')
      .insert(campaign)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCampaign(id: string, updates: Database['public']['Tables']['campaigns']['Update']) {
    const { data, error } = await this.supabase
      .from('campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Métodos para Creativos
  async getCreatives(campaignId: string) {
    const { data, error } = await this.supabase
      .from('creatives')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async createCreative(creative: Database['public']['Tables']['creatives']['Insert']) {
    const { data, error } = await this.supabase
      .from('creatives')
      .insert(creative)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCreativeAnalysis(id: string, analysisResults: any) {
    const { data, error } = await this.supabase
      .from('creatives')
      .update({ 
        analysis_results: analysisResults,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Métodos para Analytics
  async getCreativeAnalytics(creativeId: string, startDate?: string, endDate?: string) {
    let query = this.supabase
      .from('creative_analytics')
      .select('*')
      .eq('creative_id', creativeId)
      .order('date', { ascending: false });

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async insertAnalytics(analytics: Database['public']['Tables']['creative_analytics']['Insert']) {
    const { data, error } = await this.supabase
      .from('creative_analytics')
      .insert(analytics)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Método para subir archivos (imágenes/videos)
  async uploadFile(bucket: string, path: string, file: File | Buffer) {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(path, file);

    if (error) throw error;
    return data;
  }

  async getFileUrl(bucket: string, path: string) {
    const { data } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  // Obtener cliente Supabase directo para operaciones avanzadas
  getClient() {
    return this.supabase;
  }
}

export const supabaseService = new SupabaseService();
export default supabaseService;