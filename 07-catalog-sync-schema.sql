-- Add catalog sync configuration tables
CREATE TABLE public.catalog_sync_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES auth.users(id) NOT NULL,
    sync_type TEXT CHECK (sync_type IN ('api', 'csv', 'xml', 'webhook')) NOT NULL,
    source_url TEXT,
    api_key TEXT,
    webhook_secret TEXT,
    mapping_rules JSONB NOT NULL DEFAULT '{}',
    schedule TEXT CHECK (schedule IN ('realtime', 'hourly', 'daily', 'weekly')) DEFAULT 'daily',
    auto_approve BOOLEAN DEFAULT false,
    last_sync TIMESTAMP WITH TIME ZONE,
    next_sync TIMESTAMP WITH TIME ZONE,
    status TEXT CHECK (status IN ('active', 'paused', 'error')) DEFAULT 'active',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sync logs for tracking sync history
CREATE TABLE public.sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_id UUID REFERENCES public.catalog_sync_configs(id) ON DELETE CASCADE NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    status TEXT CHECK (status IN ('running', 'success', 'failed')) NOT NULL,
    products_added INTEGER DEFAULT 0,
    products_updated INTEGER DEFAULT 0,
    products_removed INTEGER DEFAULT 0,
    error_message TEXT,
    sync_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhook events for real-time sync
CREATE TABLE public.webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_id UUID REFERENCES public.catalog_sync_configs(id) ON DELETE CASCADE NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMP WITH TIME ZONE,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_catalog_sync_configs_seller_id ON public.catalog_sync_configs(seller_id);
CREATE INDEX idx_catalog_sync_configs_status ON public.catalog_sync_configs(status);
CREATE INDEX idx_catalog_sync_configs_next_sync ON public.catalog_sync_configs(next_sync);
CREATE INDEX idx_sync_logs_config_id ON public.sync_logs(config_id);
CREATE INDEX idx_webhook_events_config_id ON public.webhook_events(config_id);
CREATE INDEX idx_webhook_events_processed ON public.webhook_events(processed);

-- Enable RLS
ALTER TABLE public.catalog_sync_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Sellers can manage their own sync configs" ON public.catalog_sync_configs
    FOR ALL USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can view their sync logs" ON public.sync_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.catalog_sync_configs
            WHERE id = sync_logs.config_id
            AND seller_id = auth.uid()
        )
    );

CREATE POLICY "Sellers can view their webhook events" ON public.webhook_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.catalog_sync_configs
            WHERE id = webhook_events.config_id
            AND seller_id = auth.uid()
        )
    );

-- Trigger for updated_at
CREATE TRIGGER update_catalog_sync_configs_updated_at BEFORE UPDATE ON public.catalog_sync_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();