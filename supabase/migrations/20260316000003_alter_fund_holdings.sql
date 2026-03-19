-- 为 fund_holdings 表添加新字段
ALTER TABLE fund_holdings
ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS auto_sync BOOLEAN DEFAULT true;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_fund_holdings_last_sync_at ON fund_holdings(last_sync_at);

-- 添加注释
COMMENT ON COLUMN fund_holdings.last_sync_at IS '最后同步净值的时间';
COMMENT ON COLUMN fund_holdings.auto_sync IS '是否自动同步净值';
