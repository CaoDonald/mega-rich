# Supabase 配置说明文档

## 1. 项目概述

本项目使用 Supabase 作为后端服务，实现了用户认证、用户信息管理和头像存储等功能。以下是完整的 Supabase 配置指南。

## 2. 数据库配置

### 2.1 创建 profiles 表

需要创建一个 `profiles` 表来存储用户的扩展信息，包括用户名和头像URL。

**SQL 语句**：
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY on delete cascade,
  username VARCHAR(50) not null unique,
  phone varchar(11),
    avatar_url text,              -- 头像公网访问 URL
  avatar_path text,             -- Storage 内部路径（强烈推荐）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

### 2.2 行级安全规则 (RLS)

为 `profiles` 表启用行级安全规则，确保用户只能访问和修改自己的信息。

**SQL 语句**：
```sql
-- 启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "用户可以查看自己的资料" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "用户可以更新自己的资料" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "用户可以插入自己的资料" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);
```

### 2.3 创建触发器（自动创建用户资料）

创建一个触发器，在用户注册时自动在 `profiles` 表中创建对应记录。

**SQL 语句**：
```sql

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_bank_category_id UUID;
  v_fund_category_id UUID;
  v_internet_category_id UUID;
  v_debt_category_id UUID;
BEGIN
  -- 创建用户资料记录
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, NEW.email);

  -- 创建默认一级分类
  INSERT INTO public.balance_categories (user_id, name, description)
  VALUES
    (NEW.id, '银行', '银行存款账户')
  RETURNING id INTO v_bank_category_id;

  INSERT INTO public.balance_categories (user_id, name, description)
  VALUES
    (NEW.id, '基金', '基金投资账户')
  RETURNING id INTO v_fund_category_id;

  INSERT INTO public.balance_categories (user_id, name, description)
  VALUES
    (NEW.id, '互联网', '互联网金融账户')
  RETURNING id INTO v_internet_category_id;

  INSERT INTO public.balance_categories (user_id, name, description)
  VALUES
    (NEW.id, '债务', '各类负债项目')
  RETURNING id INTO v_debt_category_id;

  -- 创建默认二级分类
  INSERT INTO public.balance_subcategories (user_id, category_id, name, description)
  VALUES
    (NEW.id, v_bank_category_id, '招商银行', '招商银行储蓄卡'),
    (NEW.id, v_bank_category_id, '工商银行', '工商银行储蓄卡'),
    (NEW.id, v_fund_category_id, '华安创新', '华安创新混合基金'),
    (NEW.id, v_fund_category_id, '嘉实增长', '嘉实增长混合基金'),
    (NEW.id, v_internet_category_id, '支付宝', '支付宝余额宝'),
    (NEW.id, v_internet_category_id, '微信', '微信零钱通'),
    (NEW.id, v_debt_category_id, '房贷', '住房抵押贷款'),
    (NEW.id, v_debt_category_id, '信用卡', '信用卡欠款');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER

```

## 3. 存储桶配置

### 3.1 创建 avatars 存储桶

创建一个用于存储用户头像的存储桶。

**操作步骤**：
1. 登录 Supabase 控制台
2. 导航到 "Storage" 页面
3. 点击 "New bucket" 按钮
4. 输入桶名称：`avatars`
5. 选择 "Public" 访问级别
6. 点击 "Create bucket" 按钮

### 3.2 存储桶策略

配置存储桶的安全策略，确保用户只能上传、更新和删除自己的头像。

**SQL 语句**：
```sql
-- 允许用户上传自己的头像
CREATE POLICY "用户可以上传自己的头像" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 允许用户更新自己的头像
CREATE POLICY "用户可以更新自己的头像" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 允许用户删除自己的头像
CREATE POLICY "用户可以删除自己的头像" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 允许所有人读取头像
CREATE POLICY "所有人可以读取头像" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'avatars'
  );
```

## 4. 认证配置

### 4.1 启用电子邮件认证

确保在 Supabase 控制台中启用了电子邮件认证。

**操作步骤**：
1. 登录 Supabase 控制台
2. 导航到 "Authentication" 页面
3. 点击 "Providers" 选项卡
4. 启用 "Email" 提供者
5. 配置 "Site URL" 为您的应用地址（如 `http://localhost:5173`）
6. 配置 "Additional Redirect URLs"（如 `http://localhost:5173/login`）

### 4.2 密码策略配置

可以根据需要配置密码复杂度要求。

**操作步骤**：
1. 登录 Supabase 控制台
2. 导航到 "Authentication" 页面
3. 点击 "Settings" 选项卡
4. 在 "Password Policy" 部分配置所需的密码规则

## 5. API 密钥配置

在项目根目录创建 `.env` 文件，并添加以下配置：

```env
# Supabase API 配置
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

* 将 `your-supabase-url` 替换为您的 Supabase 项目 URL
* 将 `your-supabase-anon-key` 替换为您的 Supabase 匿名密钥

## 6. 安全注意事项

1. **API 密钥保护**：确保 `.env` 文件不被提交到版本控制系统
2. **行级安全**：始终为所有表启用行级安全规则
3. **存储桶安全**：配置适当的存储桶访问策略，防止未授权访问
4. **密码策略**：设置强密码要求，提高账户安全性
5. **SSL 配置**：确保生产环境使用 SSL 加密连接

## 7. 常见问题排查

### 7.1 用户注册后 profiles 表没有自动创建记录

**解决方法**：
- 检查触发器是否正确创建
- 确保 `handle_new_user` 函数存在且权限正确
- 查看 Supabase 日志，检查是否有错误信息

### 7.2 头像上传失败

**解决方法**：
- 检查存储桶名称是否为 `avatars`
- 验证存储桶策略是否正确配置
- 确保用户已登录，具有正确的认证令牌
- 检查文件大小是否超过限制（本项目限制为 2MB）

### 7.3 无法更新用户名

**解决方法**：
- 检查 `profiles` 表的 RLS 策略
- 确保用户已登录，并且正在更新自己的记录
- 验证 `username` 字段是否存在且可更新

## 5. 结余功能模块配置

### 5.1 创建数据表

#### 5.1.1 创建一级分类表 (balance_categories)

```sql
CREATE TABLE balance_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建更新时间触发器
CREATE TRIGGER update_balance_categories_updated_at
BEFORE UPDATE ON balance_categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

#### 5.1.2 创建二级分类表 (balance_subcategories)

```sql
CREATE TABLE balance_subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES balance_categories(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建更新时间触发器
CREATE TRIGGER update_balance_subcategories_updated_at
BEFORE UPDATE ON balance_subcategories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

#### 5.1.3 创建资金条目表 (balance_items)

```sql
CREATE TABLE balance_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subcategory_id UUID REFERENCES balance_subcategories(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  yoy_growth_rate NUMERIC(8, 2),  -- Year-over-Year growth rate
  mom_growth_rate NUMERIC(8, 2),  -- Month-over-Month growth rate
  amount_change NUMERIC(12, 2),   -- Change from previous period
  percent_change NUMERIC(8, 2),   -- Percentage change from previous period
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建更新时间触发器
CREATE TRIGGER update_balance_items_updated_at
BEFORE UPDATE ON balance_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

### 5.2 创建同比和环比增长率计算函数

```sql
-- 计算同比增长率函数（优化：精确到月份，支持同一月份多条记录取最新）
CREATE OR REPLACE FUNCTION calculate_year_over_year_growth(p_user_id UUID, p_subcategory_id UUID, p_record_date DATE, p_amount NUMERIC) 
RETURNS NUMERIC AS $$
DECLARE
  prev_year_amount NUMERIC;
  growth_rate NUMERIC;
BEGIN
  -- 获取上一年同期月份的最新数据
  SELECT amount INTO prev_year_amount 
  FROM balance_items 
  WHERE user_id = p_user_id 
    AND subcategory_id = p_subcategory_id 
    AND DATE_TRUNC('month', record_date) = DATE_TRUNC('month', p_record_date - INTERVAL '1 year')
  ORDER BY record_date DESC, created_at DESC
  LIMIT 1;
  
  -- 计算同比增长率
  IF prev_year_amount IS NOT NULL AND prev_year_amount > 0 THEN
    growth_rate := ((p_amount - prev_year_amount) / prev_year_amount) * 100;
  ELSE
    growth_rate := NULL;
  END IF;
  
  RETURN growth_rate;
END;
$$ LANGUAGE plpgsql;

-- 计算环比增长率函数（优化：精确到月份，支持同一月份多条记录取最新）
CREATE OR REPLACE FUNCTION calculate_month_over_month_growth(p_user_id UUID, p_subcategory_id UUID, p_record_date DATE, p_amount NUMERIC) 
RETURNS NUMERIC AS $$
DECLARE
  prev_month_amount NUMERIC;
  growth_rate NUMERIC;
BEGIN
  -- 获取上一月的最新数据
  SELECT amount INTO prev_month_amount 
  FROM balance_items 
  WHERE user_id = p_user_id 
    AND subcategory_id = p_subcategory_id 
    AND DATE_TRUNC('month', record_date) = DATE_TRUNC('month', p_record_date - INTERVAL '1 month')
  ORDER BY record_date DESC, created_at DESC
  LIMIT 1;
  
  -- 计算环比增长率
  IF prev_month_amount IS NOT NULL AND prev_month_amount > 0 THEN
    growth_rate := ((p_amount - prev_month_amount) / prev_month_amount) * 100;
  ELSE
    growth_rate := NULL;
  END IF;
  
  RETURN growth_rate;
END;
$$ LANGUAGE plpgsql;

-- 计算较上次增长（绝对变化值）函数
CREATE OR REPLACE FUNCTION calculate_amount_change(p_user_id UUID, p_subcategory_id UUID, p_record_date DATE, p_amount NUMERIC) 
RETURNS NUMERIC AS $$
DECLARE
  prev_amount NUMERIC;
  change_amount NUMERIC;
BEGIN
  -- 获取同一分类下上一条最新记录
  SELECT amount INTO prev_amount 
  FROM balance_items 
  WHERE user_id = p_user_id 
    AND subcategory_id = p_subcategory_id 
    AND record_date < p_record_date
  ORDER BY record_date DESC, created_at DESC
  LIMIT 1;
  
  -- 计算绝对变化值
  IF prev_amount IS NOT NULL THEN
    change_amount := p_amount - prev_amount;
  ELSE
    change_amount := NULL;
  END IF;
  
  RETURN change_amount;
END;
$$ LANGUAGE plpgsql;

-- 计算较上次增幅（相对变化百分比）函数
CREATE OR REPLACE FUNCTION calculate_percent_change(p_user_id UUID, p_subcategory_id UUID, p_record_date DATE, p_amount NUMERIC) 
RETURNS NUMERIC AS $$
DECLARE
  prev_amount NUMERIC;
  change_percent NUMERIC;
BEGIN
  -- 获取同一分类下上一条最新记录
  SELECT amount INTO prev_amount 
  FROM balance_items 
  WHERE user_id = p_user_id 
    AND subcategory_id = p_subcategory_id 
    AND record_date < p_record_date
  ORDER BY record_date DESC, created_at DESC
  LIMIT 1;
  
  -- 计算相对变化百分比
  IF prev_amount IS NOT NULL AND prev_amount > 0 THEN
    change_percent := ((p_amount - prev_amount) / prev_amount) * 100;
  ELSE
    change_percent := NULL;
  END IF;
  
  RETURN change_percent;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器，在插入或更新资金条目时自动计算增长率
CREATE OR REPLACE FUNCTION update_growth_rates() 
RETURNS TRIGGER AS $$
BEGIN
  -- 计算同比增长率
  NEW.yoy_growth_rate := calculate_year_over_year_growth(NEW.user_id, NEW.subcategory_id, NEW.record_date, NEW.amount);
  
  -- 计算环比增长率
  NEW.mom_growth_rate := calculate_month_over_month_growth(NEW.user_id, NEW.subcategory_id, NEW.record_date, NEW.amount);
  
  -- 计算较上次增长和较上次增幅
  NEW.amount_change := calculate_amount_change(NEW.user_id, NEW.subcategory_id, NEW.record_date, NEW.amount);
  NEW.percent_change := calculate_percent_change(NEW.user_id, NEW.subcategory_id, NEW.record_date, NEW.amount);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_balance_items_growth_rates
BEFORE INSERT OR UPDATE ON balance_items
FOR EACH ROW
EXECUTE FUNCTION update_growth_rates();
```

### 5.3 行级安全规则 (RLS)

```sql
-- 启用 RLS
ALTER TABLE balance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance_items ENABLE ROW LEVEL SECURITY;

-- 一级分类 RLS 策略
CREATE POLICY "用户可以查看自己的一级分类" ON balance_categories
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建自己的一级分类" ON balance_categories
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的一级分类" ON balance_categories
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的一级分类" ON balance_categories
  FOR DELETE
  USING (auth.uid() = user_id);

-- 二级分类 RLS 策略
CREATE POLICY "用户可以查看自己的二级分类" ON balance_subcategories
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建自己的二级分类" ON balance_subcategories
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的二级分类" ON balance_subcategories
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的二级分类" ON balance_subcategories
  FOR DELETE
  USING (auth.uid() = user_id);

-- 资金条目 RLS 策略
CREATE POLICY "用户可以查看自己的资金条目" ON balance_items
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建自己的资金条目" ON balance_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的资金条目" ON balance_items
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的资金条目" ON balance_items
  FOR DELETE
  USING (auth.uid() = user_id);
```

## 6. 月薪功能模块配置

### 6.1 创建月薪记录表 (salary_records)

```sql
CREATE TABLE salary_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('salary', 'bonus')),  -- salary: 月薪, bonus: 年终奖
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  yoy_growth_rate NUMERIC(8, 2),  -- Year-over-Year growth rate
  mom_growth_rate NUMERIC(8, 2),  -- Month-over-Month growth rate
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建更新时间触发器
CREATE TRIGGER update_salary_records_updated_at
BEFORE UPDATE ON salary_records
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

### 6.2 创建月薪增长率计算函数

```sql
-- 计算月薪同比增长率函数（优化：精确到月份，支持同一月份多条记录取最新）
CREATE OR REPLACE FUNCTION calculate_salary_year_over_year_growth(p_user_id UUID, p_record_date DATE, p_amount NUMERIC, p_type VARCHAR) 
RETURNS NUMERIC AS $$
DECLARE
  prev_year_amount NUMERIC;
  growth_rate NUMERIC;
BEGIN
  -- 获取上一年同期月份的最新数据（同一类型）
  SELECT amount INTO prev_year_amount
  FROM salary_records 
  WHERE user_id = p_user_id 
    AND type = p_type
    AND DATE_TRUNC('month', record_date) = DATE_TRUNC('month', p_record_date - INTERVAL '1 year')
  ORDER BY record_date DESC, created_at DESC
  LIMIT 1;
  
  -- 计算同比增长率
  IF prev_year_amount IS NOT NULL AND prev_year_amount > 0 THEN
    growth_rate := ((p_amount - prev_year_amount) / prev_year_amount) * 100;
  ELSE
    growth_rate := NULL;
  END IF;
  
  RETURN growth_rate;
END;
$$ LANGUAGE plpgsql;

-- 计算月薪环比增长率函数（优化：精确到月份，支持同一月份多条记录取最新）
CREATE OR REPLACE FUNCTION calculate_salary_month_over_month_growth(p_user_id UUID, p_record_date DATE, p_amount NUMERIC, p_type VARCHAR) 
RETURNS NUMERIC AS $$
DECLARE
  prev_month_amount NUMERIC;
  growth_rate NUMERIC;
BEGIN
  -- 获取上一月的最新数据（同一类型）
  SELECT amount INTO prev_month_amount
  FROM salary_records 
  WHERE user_id = p_user_id 
    AND type = p_type
    AND DATE_TRUNC('month', record_date) = DATE_TRUNC('month', p_record_date - INTERVAL '1 month')
  ORDER BY record_date DESC, created_at DESC
  LIMIT 1;
  
  -- 计算环比增长率
  IF prev_month_amount IS NOT NULL AND prev_month_amount > 0 THEN
    growth_rate := ((p_amount - prev_month_amount) / prev_month_amount) * 100;
  ELSE
    growth_rate := NULL;
  END IF;
  
  RETURN growth_rate;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器，在插入或更新月薪记录时自动计算增长率
CREATE OR REPLACE FUNCTION update_salary_records_growth_rates() 
RETURNS TRIGGER AS $$
DECLARE
  yoy_rate NUMERIC;
  mom_rate NUMERIC;
BEGIN
  -- 计算同比和环比增长率
  yoy_rate := calculate_salary_year_over_year_growth(NEW.user_id, NEW.record_date, NEW.amount, NEW.type);
  mom_rate := calculate_salary_month_over_month_growth(NEW.user_id, NEW.record_date, NEW.amount, NEW.type);
  
  -- 更新增长率字段
  NEW.yoy_growth_rate := yoy_rate;
  NEW.mom_growth_rate := mom_rate;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_salary_records_growth_rates
BEFORE INSERT OR UPDATE ON salary_records
FOR EACH ROW
EXECUTE FUNCTION update_salary_records_growth_rates();
```

### 6.3 行级安全规则 (RLS)

```sql
-- 启用 RLS
ALTER TABLE salary_records ENABLE ROW LEVEL SECURITY;

-- 月薪记录 RLS 策略
CREATE POLICY "用户可以查看自己的月薪记录" ON salary_records
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建自己的月薪记录" ON salary_records
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的月薪记录" ON salary_records
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的月薪记录" ON salary_records
  FOR DELETE
  USING (auth.uid() = user_id);
```

## 7. 初始数据导入（可选）

### 7.1 导入一级分类示例数据

```sql
-- 为当前用户导入一级分类示例数据
INSERT INTO balance_categories (user_id, name, description, is_asset)
VALUES
  (auth.uid(), '银行', '银行存款账户', true),
  (auth.uid(), '基金', '基金投资账户', true),
  (auth.uid(), '互联网', '互联网金融账户', true),
  (auth.uid(), '债务', '各类负债项目', false);
```

### 7.2 导入二级分类示例数据

```sql
-- 为当前用户导入二级分类示例数据
INSERT INTO balance_subcategories (user_id, category_id, name, description)
SELECT 
  auth.uid(), 
  id, 
  CASE 
    WHEN name = '银行' THEN '招商银行'
    WHEN name = '基金' THEN '华安银行'
    WHEN name = '互联网' THEN '支付宝'
    WHEN name = '债务' THEN '房贷'
  END,
  CASE 
    WHEN name = '银行' THEN '招商银行储蓄卡'
    WHEN name = '基金' THEN '华安创新混合基金'
    WHEN name = '互联网' THEN '支付宝余额宝'
    WHEN name = '债务' THEN '住房抵押贷款'
  END
FROM balance_categories
WHERE user_id = auth.uid();
```

## 8. 维护与更新

- 定期备份数据库
- 监控存储桶使用情况，及时清理不再使用的文件
- 关注 Supabase 更新，及时应用安全补丁

## 9. 结余模块功能增强与优化（更新日期：2025-12-15）

### 9.1 字段命名规范优化
- 将中文命名字段 `同比增长率` 改为英文命名 `yoy_growth_rate`（Year-over-Year growth rate）
- 将中文命名字段 `环比增长率` 改为英文命名 `mom_growth_rate`（Month-over-Month growth rate）

### 9.2 新增数据指标
- `amount_change`：较上次增长的绝对变化值
- `percent_change`：较上次增长的相对变化百分比

### 9.3 增长率计算优化
- 实现精确到月份级别的同比和环比增长率计算
- 支持同一自然月存在多份数据记录时，自动选取该月份内最新的一条数据作为统计依据

### 9.4 新增计算函数
- `calculate_amount_change`：计算较上次增长的绝对变化值
- `calculate_percent_change`：计算较上次增长的相对变化百分比

### 9.5 触发器更新
- 更新 `update_growth_rates` 触发器，支持自动计算新增的 `amount_change` 和 `percent_change` 字段

### 9.6 数据兼容性
- 所有修改均保持与现有系统数据结构兼容
- 新增字段均为可选字段（可为 NULL），确保现有数据不受影响

## 10. 月薪模块功能优化（更新日期：2025-12-15）

### 10.1 字段命名规范优化
- 将中文命名字段 `basic_salary_同比增长率` 改为英文命名 `basic_salary_yoy_growth_rate`（Year-over-Year growth rate for basic salary）
- 将中文命名字段 `basic_salary_环比增长率` 改为英文命名 `basic_salary_mom_growth_rate`（Month-over-Month growth rate for basic salary）
- 将中文命名字段 `bonus_同比增长率` 改为英文命名 `bonus_yoy_growth_rate`（Year-over-Year growth rate for bonus）
- 将中文命名字段 `bonus_环比增长率` 改为英文命名 `bonus_mom_growth_rate`（Month-over-Month growth rate for bonus）

### 10.2 增长率计算优化
- 优化同比增长率计算：精确到月份级别，同一月份多条记录时取最新记录
- 优化环比增长率计算：精确到月份级别，同一月份多条记录时取最新记录
- 更新触发器函数，使用新的英文命名字段
- 更新了以下函数以支持新的计算逻辑：
  - `calculate_salary_year_over_year_growth`：优化月薪同比增长率计算
  - `calculate_salary_month_over_month_growth`：优化月薪环比增长率计算
- 更新了触发器函数 `update_salary_records_growth_rates`，使用新的英文命名字段

## 11. 联系信息

如有其他问题，请联系项目管理员或参考 Supabase 官方文档：
- [Supabase 文档](https://supabase.com/docs)
- [Supabase 社区论坛](https://github.com/supabase/supabase/discussions)
