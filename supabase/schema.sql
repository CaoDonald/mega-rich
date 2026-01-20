-- 财富追踪功能数据库表结构
-- 创建时间: 2025-01-20

-- 基金持仓表
CREATE TABLE IF NOT EXISTS fund_holdings (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    fund_code VARCHAR(20) NOT NULL,
    fund_name VARCHAR(100),
    fund_type INTEGER DEFAULT 0,
    shares DECIMAL(18, 6) DEFAULT 0,
    avg_cost DECIMAL(18, 6) DEFAULT 0,
    current_nav DECIMAL(18, 6) DEFAULT 0,
    buy_date DATE,
    total_invest DECIMAL(18, 2) DEFAULT 0,
    total_redeem DECIMAL(18, 2) DEFAULT 0,
    dividend DECIMAL(18, 2) DEFAULT 0,
    profit DECIMAL(18, 2) DEFAULT 0,
    profit_rate DECIMAL(10, 4) DEFAULT 0,
    today_change DECIMAL(10, 4) DEFAULT 0,
    remark TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_fund_holdings_user_id ON fund_holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_fund_holdings_fund_code ON fund_holdings(fund_code);
CREATE INDEX IF NOT EXISTS idx_fund_holdings_created_at ON fund_holdings(created_at DESC);

-- 添加行级安全策略（RLS）
ALTER TABLE fund_holdings ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看自己的持仓
CREATE POLICY "用户只能查看自己的持仓" ON fund_holdings
    FOR SELECT
    USING (auth.uid() = user_id);

-- 创建策略：用户只能插入自己的持仓
CREATE POLICY "用户只能插入自己的持仓" ON fund_holdings
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 创建策略：用户只能更新自己的持仓
CREATE POLICY "用户只能更新自己的持仓" ON fund_holdings
    FOR UPDATE
    USING (auth.uid() = user_id);

-- 创建策略：用户只能删除自己的持仓
CREATE POLICY "用户只能删除自己的持仓" ON fund_holdings
    FOR DELETE
    USING (auth.uid() = user_id);

-- 基金交易记录表
CREATE TABLE IF NOT EXISTS fund_transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    holding_id BIGINT REFERENCES fund_holdings(id) ON DELETE SET NULL,
    fund_code VARCHAR(20) NOT NULL,
    fund_name VARCHAR(100),
    transaction_type VARCHAR(10) NOT NULL,
    shares DECIMAL(18, 6) NOT NULL,
    nav DECIMAL(18, 6) NOT NULL,
    amount DECIMAL(18, 2) NOT NULL,
    fee DECIMAL(18, 2) DEFAULT 0,
    transaction_date DATE NOT NULL,
    remark TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_fund_transactions_user_id ON fund_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_fund_transactions_fund_code ON fund_transactions(fund_code);
CREATE INDEX IF NOT EXISTS idx_fund_transactions_transaction_date ON fund_transactions(transaction_date DESC);

-- 添加行级安全策略
ALTER TABLE fund_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户只能查看自己的交易记录" ON fund_transactions
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "用户只能插入自己的交易记录" ON fund_transactions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的交易记录" ON fund_transactions
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的交易记录" ON fund_transactions
    FOR DELETE
    USING (auth.uid() = user_id);

-- 基金关注表
CREATE TABLE IF NOT EXISTS fund_watchlist (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    fund_code VARCHAR(20) NOT NULL,
    fund_name VARCHAR(100),
    fund_type INTEGER DEFAULT 0,
    alert_enabled BOOLEAN DEFAULT false,
    alert_up DECIMAL(10, 4),
    alert_down DECIMAL(10, 4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, fund_code)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_fund_watchlist_user_id ON fund_watchlist(user_id);

-- 添加行级安全策略
ALTER TABLE fund_watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户只能查看自己的关注列表" ON fund_watchlist
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "用户只能插入自己的关注" ON fund_watchlist
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的关注" ON fund_watchlist
    FOR DELETE
    USING (auth.uid() = user_id);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为fund_holdings表添加更新时间触发器
DROP TRIGGER IF EXISTS update_fund_holdings_updated_at ON fund_holdings;
CREATE TRIGGER update_fund_holdings_updated_at
    BEFORE UPDATE ON fund_holdings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
