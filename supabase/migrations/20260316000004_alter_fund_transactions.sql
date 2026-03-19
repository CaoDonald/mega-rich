-- 为 fund_transactions 表添加 plan_id 字段
ALTER TABLE fund_transactions
ADD COLUMN IF NOT EXISTS plan_id BIGINT REFERENCES fund_plans(id) ON DELETE SET NULL;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_fund_transactions_plan_id ON fund_transactions(plan_id);

-- 添加注释
COMMENT ON COLUMN fund_transactions.plan_id IS '关联的定投计划ID';
