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
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();
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

## 8. 维护与更新

- 定期备份数据库
- 监控存储桶使用情况，及时清理不再使用的文件
- 关注 Supabase 更新，及时应用安全补丁

## 9. 联系信息

如有其他问题，请联系项目管理员或参考 Supabase 官方文档：
- [Supabase 文档](https://supabase.com/docs)
- [Supabase 社区论坛](https://github.com/supabase/supabase/discussions)
