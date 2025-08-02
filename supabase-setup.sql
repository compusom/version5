-- Meta Ads Creative Assistant - Supabase Database Setup
-- Ejecutar este script en tu panel de Supabase (SQL Editor)

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios (usa auth.users de Supabase)
-- No necesitamos crear tabla de usuarios, Supabase Auth la maneja

-- Tabla de campañas
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    objective VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
    budget DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Tabla de creativos
CREATE TABLE IF NOT EXISTS public.creatives (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    image_url TEXT,
    video_url TEXT,
    text_content TEXT,
    call_to_action VARCHAR(100),
    analysis_results JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de analytics de creativos
CREATE TABLE IF NOT EXISTS public.creative_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    creative_id UUID REFERENCES public.creatives(id) ON DELETE CASCADE NOT NULL,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    ctr DECIMAL(5,2) DEFAULT 0,
    cpc DECIMAL(8,2) DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    cost DECIMAL(10,2) DEFAULT 0,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de análisis MCP (para almacenar resultados de MCP)
CREATE TABLE IF NOT EXISTS public.mcp_analyses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    creative_id UUID REFERENCES public.creatives(id) ON DELETE CASCADE NOT NULL,
    analysis_type VARCHAR(50) NOT NULL,
    mcp_tool_name VARCHAR(100) NOT NULL,
    input_parameters JSONB,
    output_results JSONB,
    execution_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_creatives_campaign_id ON public.creatives(campaign_id);
CREATE INDEX IF NOT EXISTS idx_creative_analytics_creative_id ON public.creative_analytics(creative_id);
CREATE INDEX IF NOT EXISTS idx_creative_analytics_date ON public.creative_analytics(date);
CREATE INDEX IF NOT EXISTS idx_mcp_analyses_creative_id ON public.mcp_analyses(creative_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_creatives_updated_at BEFORE UPDATE ON public.creatives 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Configurar Row Level Security (RLS)
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creative_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcp_analyses ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para campaigns
CREATE POLICY "Users can view own campaigns" ON public.campaigns
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own campaigns" ON public.campaigns
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaigns" ON public.campaigns
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaigns" ON public.campaigns
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas de seguridad para creatives
CREATE POLICY "Users can view creatives from own campaigns" ON public.creatives
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.campaigns 
            WHERE campaigns.id = creatives.campaign_id 
            AND campaigns.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert creatives to own campaigns" ON public.creatives
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.campaigns 
            WHERE campaigns.id = creatives.campaign_id 
            AND campaigns.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update creatives from own campaigns" ON public.creatives
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.campaigns 
            WHERE campaigns.id = creatives.campaign_id 
            AND campaigns.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete creatives from own campaigns" ON public.creatives
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.campaigns 
            WHERE campaigns.id = creatives.campaign_id 
            AND campaigns.user_id = auth.uid()
        )
    );

-- Políticas similares para creative_analytics
CREATE POLICY "Users can view analytics from own creatives" ON public.creative_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.creatives 
            JOIN public.campaigns ON campaigns.id = creatives.campaign_id
            WHERE creatives.id = creative_analytics.creative_id 
            AND campaigns.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert analytics for own creatives" ON public.creative_analytics
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.creatives 
            JOIN public.campaigns ON campaigns.id = creatives.campaign_id
            WHERE creatives.id = creative_analytics.creative_id 
            AND campaigns.user_id = auth.uid()
        )
    );

-- Políticas para mcp_analyses
CREATE POLICY "Users can view MCP analyses from own creatives" ON public.mcp_analyses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.creatives 
            JOIN public.campaigns ON campaigns.id = creatives.campaign_id
            WHERE creatives.id = mcp_analyses.creative_id 
            AND campaigns.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert MCP analyses for own creatives" ON public.mcp_analyses
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.creatives 
            JOIN public.campaigns ON campaigns.id = creatives.campaign_id
            WHERE creatives.id = mcp_analyses.creative_id 
            AND campaigns.user_id = auth.uid()
        )
    );

-- Crear buckets de storage para archivos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('creatives', 'creatives', true)
ON CONFLICT (id) DO NOTHING;

-- Política de storage para el bucket de creatives
CREATE POLICY "Users can upload creative files" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'creatives');

CREATE POLICY "Users can view creative files" ON storage.objects
    FOR SELECT USING (bucket_id = 'creatives');

CREATE POLICY "Users can update creative files" ON storage.objects
    FOR UPDATE USING (bucket_id = 'creatives');

CREATE POLICY "Users can delete creative files" ON storage.objects
    FOR DELETE USING (bucket_id = 'creatives');

-- Función helper para obtener estadísticas de campaña
CREATE OR REPLACE FUNCTION get_campaign_stats(campaign_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_creatives', COUNT(c.id),
        'total_impressions', COALESCE(SUM(ca.impressions), 0),
        'total_clicks', COALESCE(SUM(ca.clicks), 0),
        'avg_ctr', COALESCE(AVG(ca.ctr), 0),
        'total_cost', COALESCE(SUM(ca.cost), 0)
    ) INTO result
    FROM public.creatives c
    LEFT JOIN public.creative_analytics ca ON c.id = ca.creative_id
    WHERE c.campaign_id = campaign_uuid;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insertar datos de ejemplo (opcional)
-- INSERT INTO public.campaigns (name, objective, budget, user_id) 
-- VALUES ('Campaña de Ejemplo', 'awareness', 1000.00, auth.uid());

COMMENT ON TABLE public.campaigns IS 'Tabla de campañas publicitarias';
COMMENT ON TABLE public.creatives IS 'Tabla de creativos publicitarios';
COMMENT ON TABLE public.creative_analytics IS 'Tabla de métricas y analytics de creativos';
COMMENT ON TABLE public.mcp_analyses IS 'Tabla de análisis realizados via MCP';