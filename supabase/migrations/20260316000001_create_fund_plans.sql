-- 创建 fund_plans 表 (定投计划)
CREATE TABLE IF NOT EXISTS fund_plans (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    fund_code VARCHAR(20) NOT NULL,
    fund_name VARCHAR(100),
    plan_name VARCHAR(100),
    plan_type VARCHAR(20) DEFAULT 'fixed', -- fixed=定额 ratio=定比
    amount DECIMAL(18, 2) NOT NULL,
    frequency VARCHAR(20) NOT NULL, -- daily=每日 weekly=每周 monthly=每月
    start_date DATE NOT NULL,
    end_date DATE,
    next_execute_date DATE,
    status VARCHAR(20) DEFAULT 'active', -- active=进行中 paused=暂停 completed=完成
    total_invested DECIMAL(18, 2) DEFAULT 0,
    total_shares DECIMAL(18, 6) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_fund_plans_user_id ON fund_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_fund_plans_fund_code ON fund_plans(fund_code);
CREATE INDEX IF NOT EXISTS idx_fund_plans_status ON fund_plans(status);

-- 启用 RLS
ALTER TABLE fund_plans ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略
CREATE POLICY "Users can view their own plans"
    ON fund_plans FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plans"
    ON fund_plans FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans"
    ON fund_plans FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plans"
    ON fund_plans FOR DELETE
    USING (auth.uid() = user_id);
