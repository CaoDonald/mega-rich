-- 创建 fund_nav_history 表 (净值历史缓存)
CREATE TABLE IF NOT EXISTS fund_nav_history (
    id BIGSERIAL PRIMARY KEY,
    fund_code VARCHAR(20) NOT NULL,
    nav_date DATE NOT NULL,
    nav DECIMAL(18, 6) NOT NULL,
    acc_nav DECIMAL(18, 6),
    daily_growth DECIMAL(10, 4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(fund_code, nav_date)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_fund_nav_history_fund_code ON fund_nav_history(fund_code);
CREATE INDEX IF NOT EXISTS idx_fund_nav_history_nav_date ON fund_nav_history(nav_date);
CREATE INDEX IF NOT EXISTS idx_fund_nav_history_fund_code_date ON fund_nav_history(fund_code, nav_date);

-- 注意: fund_nav_history 表不需要 RLS，因为它是公共数据缓存
-- 所有用户都可以读取，但只有系统可以写入
ALTER TABLE fund_nav_history ENABLE ROW LEVEL SECURITY;

-- 允许所有认证用户读取
CREATE POLICY "Authenticated users can view nav history"
    ON fund_nav_history FOR SELECT
    TO authenticated
    USING (true);

-- 只允许服务角色写入
CREATE POLICY "Service role can insert nav history"
    ON fund_nav_history FOR INSERT
    TO service_role
    WITH CHECK (true);

CREATE POLICY "Service role can update nav history"
    ON fund_nav_history FOR UPDATE
    TO service_role
    USING (true);
