/**
 * Supabase Service - 数据库操作封装
 * 统一的 Supabase 数据库操作接口
 */

import { supabase } from '../supabase.js'

class SupabaseService {
  /**
   * 基金持仓操作
   */
  fundHoldings = {
    // 获取所有持仓
    async list(userId) {
      const { data, error } = await supabase
        .from('fund_holdings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },

    // 获取单个持仓
    async get(id) {
      const { data, error } = await supabase
        .from('fund_holdings')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },

    // 创建持仓
    async create(holding) {
      const { data, error } = await supabase
        .from('fund_holdings')
        .insert(holding)
        .select()
        .single()

      if (error) throw error
      return data
    },

    // 更新持仓
    async update(id, updates) {
      const { data, error } = await supabase
        .from('fund_holdings')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },

    // 删除持仓
    async delete(id) {
      const { error } = await supabase
        .from('fund_holdings')
        .delete()
        .eq('id', id)

      if (error) throw error
    }
  }

  /**
   * 基金交易记录操作
   */
  fundTransactions = {
    // 获取所有交易记录
    async list(userId, filters = {}) {
      let query = supabase
        .from('fund_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('transaction_date', { ascending: false })

      if (filters.fundCode) {
        query = query.eq('fund_code', filters.fundCode)
      }

      if (filters.transactionType) {
        query = query.eq('transaction_type', filters.transactionType)
      }

      const { data, error } = await query

      if (error) throw error
      return data
    },

    // 创建交易记录
    async create(transaction) {
      const { data, error } = await supabase
        .from('fund_transactions')
        .insert(transaction)
        .select()
        .single()

      if (error) throw error
      return data
    },

    // 更新交易记录
    async update(id, updates) {
      const { data, error } = await supabase
        .from('fund_transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },

    // 删除交易记录
    async delete(id) {
      const { error } = await supabase
        .from('fund_transactions')
        .delete()
        .eq('id', id)

      if (error) throw error
    }
  }

  /**
   * 基金关注列表操作
   */
  fundWatchlist = {
    // 获取关注列表
    async list(userId) {
      const { data, error } = await supabase
        .from('fund_watchlist')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },

    // 添加关注
    async add(watchItem) {
      const { data, error } = await supabase
        .from('fund_watchlist')
        .insert(watchItem)
        .select()
        .single()

      if (error) throw error
      return data
    },

    // 删除关注
    async remove(userId, fundCode) {
      const { error } = await supabase
        .from('fund_watchlist')
        .delete()
        .eq('user_id', userId)
        .eq('fund_code', fundCode)

      if (error) throw error
    },

    // 更新提醒设置
    async updateAlert(id, alertSettings) {
      const { data, error } = await supabase
        .from('fund_watchlist')
        .update(alertSettings)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    }
  }

  /**
   * 基金定投计划操作
   */
  fundPlans = {
    // 获取所有计划
    async list(userId) {
      const { data, error } = await supabase
        .from('fund_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },

    // 创建计划
    async create(plan) {
      const { data, error } = await supabase
        .from('fund_plans')
        .insert(plan)
        .select()
        .single()

      if (error) throw error
      return data
    },

    // 更新计划
    async update(id, updates) {
      const { data, error } = await supabase
        .from('fund_plans')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },

    // 删除计划
    async delete(id) {
      const { error } = await supabase
        .from('fund_plans')
        .delete()
        .eq('id', id)

      if (error) throw error
    }
  }

  /**
   * 基金净值历史操作
   */
  fundNavHistory = {
    // 获取净值历史
    async get(fundCode, startDate, endDate) {
      let query = supabase
        .from('fund_nav_history')
        .select('*')
        .eq('fund_code', fundCode)
        .order('nav_date', { ascending: false })

      if (startDate) {
        query = query.gte('nav_date', startDate)
      }

      if (endDate) {
        query = query.lte('nav_date', endDate)
      }

      const { data, error } = await query

      if (error) throw error
      return data
    },

    // 批量插入净值数据
    async batchInsert(navData) {
      const { data, error } = await supabase
        .from('fund_nav_history')
        .upsert(navData, { onConflict: 'fund_code,nav_date' })
        .select()

      if (error) throw error
      return data
    }
  }

  /**
   * 结余分类操作
   */
  balanceCategories = {
    // 获取所有分类
    async list(userId) {
      const { data, error } = await supabase
        .from('balance_categories')
        .select('*')
        .eq('user_id', userId)
        .order('sort_order', { ascending: true })

      if (error) throw error
      return data
    },

    // 创建分类
    async create(category) {
      const { data, error } = await supabase
        .from('balance_categories')
        .insert(category)
        .select()
        .single()

      if (error) throw error
      return data
    },

    // 更新分类
    async update(id, updates) {
      const { data, error } = await supabase
        .from('balance_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },

    // 删除分类
    async delete(id) {
      const { error } = await supabase
        .from('balance_categories')
        .delete()
        .eq('id', id)

      if (error) throw error
    }
  }

  /**
   * 结余子分类操作
   */
  balanceSubcategories = {
    // 获取所有子分类
    async list(userId, categoryId = null) {
      let query = supabase
        .from('balance_subcategories')
        .select('*')
        .eq('user_id', userId)

      if (categoryId) {
        query = query.eq('category_id', categoryId)
      }

      const { data, error } = await query.order('sort_order', { ascending: true })

      if (error) throw error
      return data
    },

    // 创建子分类
    async create(subcategory) {
      const { data, error } = await supabase
        .from('balance_subcategories')
        .insert(subcategory)
        .select()
        .single()

      if (error) throw error
      return data
    },

    // 更新子分类
    async update(id, updates) {
      const { data, error } = await supabase
        .from('balance_subcategories')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },

    // 删除子分类
    async delete(id) {
      const { error } = await supabase
        .from('balance_subcategories')
        .delete()
        .eq('id', id)

      if (error) throw error
    }
  }

  /**
   * 结余条目操作
   */
  balanceItems = {
    // 获取所有条目
    async list(userId, filters = {}) {
      let query = supabase
        .from('balance_items')
        .select('*')
        .eq('user_id', userId)
        .order('record_date', { ascending: false })

      if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId)
      }

      if (filters.subcategoryId) {
        query = query.eq('subcategory_id', filters.subcategoryId)
      }

      const { data, error } = await query

      if (error) throw error
      return data
    },

    // 创建条目
    async create(item) {
      const { data, error } = await supabase
        .from('balance_items')
        .insert(item)
        .select()
        .single()

      if (error) throw error
      return data
    },

    // 更新条目
    async update(id, updates) {
      const { data, error } = await supabase
        .from('balance_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },

    // 删除条目
    async delete(id) {
      const { error } = await supabase
        .from('balance_items')
        .delete()
        .eq('id', id)

      if (error) throw error
    }
  }

  /**
   * 月薪记录操作
   */
  salaryRecords = {
    // 获取所有记录
    async list(userId) {
      const { data, error } = await supabase
        .from('salary_records')
        .select('*')
        .eq('user_id', userId)
        .order('salary_month', { ascending: false })

      if (error) throw error
      return data
    },

    // 创建记录
    async create(record) {
      const { data, error } = await supabase
        .from('salary_records')
        .insert(record)
        .select()
        .single()

      if (error) throw error
      return data
    },

    // 更新记录
    async update(id, updates) {
      const { data, error } = await supabase
        .from('salary_records')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },

    // 删除记录
    async delete(id) {
      const { error } = await supabase
        .from('salary_records')
        .delete()
        .eq('id', id)

      if (error) throw error
    }
  }
}

export default new SupabaseService()
