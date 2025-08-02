import { useState, useEffect } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export interface Campaign {
  id: string;
  name: string;
  objective: string;
  status: string;
  budget: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface Creative {
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
}

export interface CreativeAnalytics {
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
}

export const useSupabase = () => {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Faltan las variables de entorno de Supabase');
      }

      const client = createClient(supabaseUrl, supabaseAnonKey);
      setSupabase(client);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al conectar con Supabase');
      setIsLoading(false);
    }
  }, []);

  // Funciones para campañas
  const getCampaigns = async (userId: string): Promise<Campaign[]> => {
    if (!supabase) throw new Error('Supabase no inicializado');

    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  const createCampaign = async (campaign: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>): Promise<Campaign> => {
    if (!supabase) throw new Error('Supabase no inicializado');

    const { data, error } = await supabase
      .from('campaigns')
      .insert(campaign)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  // Funciones para creativos
  const getCreatives = async (campaignId: string): Promise<Creative[]> => {
    if (!supabase) throw new Error('Supabase no inicializado');

    const { data, error } = await supabase
      .from('creatives')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  const createCreative = async (creative: Omit<Creative, 'id' | 'created_at' | 'updated_at'>): Promise<Creative> => {
    if (!supabase) throw new Error('Supabase no inicializado');

    const { data, error } = await supabase
      .from('creatives')
      .insert(creative)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  // Funciones para analytics
  const getCreativeAnalytics = async (creativeId: string, startDate?: string, endDate?: string): Promise<CreativeAnalytics[]> => {
    if (!supabase) throw new Error('Supabase no inicializado');

    let query = supabase
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
    return data || [];
  };

  // Función para subir archivos
  const uploadFile = async (bucket: string, path: string, file: File) => {
    if (!supabase) throw new Error('Supabase no inicializado');

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);

    if (error) throw error;
    return data;
  };

  const getFileUrl = (bucket: string, path: string) => {
    if (!supabase) throw new Error('Supabase no inicializado');

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  };

  // Función para escuchar cambios en tiempo real
  const subscribeToChanges = (table: string, callback: (payload: any) => void) => {
    if (!supabase) throw new Error('Supabase no inicializado');

    return supabase
      .channel(`public:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
      .subscribe();
  };

  return {
    supabase,
    isLoading,
    error,
    // Campaign functions
    getCampaigns,
    createCampaign,
    // Creative functions
    getCreatives,
    createCreative,
    // Analytics functions
    getCreativeAnalytics,
    // File functions
    uploadFile,
    getFileUrl,
    // Real-time functions
    subscribeToChanges
  };
};

export default useSupabase;