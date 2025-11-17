// 本地存储工具类
class StorageUtil {
  constructor() {
    this.prefix = 'finance_app_';
  }

  // 获取存储键名
  getKey(key) {
    return this.prefix + key;
  }

  // 设置数据
  setItem(key, value) {
    try {
      uni.setStorageSync(this.getKey(key), JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('存储数据失败:', error);
      return false;
    }
  }

  // 获取数据
  getItem(key, defaultValue = null) {
    try {
      const value = uni.getStorageSync(this.getKey(key));
      return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
      console.error('获取数据失败:', error);
      return defaultValue;
    }
  }

  // 删除数据
  removeItem(key) {
    try {
      uni.removeStorageSync(this.getKey(key));
      return true;
    } catch (error) {
      console.error('删除数据失败:', error);
      return false;
    }
  }

  // 清空所有数据
  clear() {
    try {
      const storageInfo = uni.getStorageInfoSync();
      storageInfo.keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          uni.removeStorageSync(key);
        }
      });
      return true;
    } catch (error) {
      console.error('清空数据失败:', error);
      return false;
    }
  }
}

// 数据模型定义
export const DataModels = {
  // 资产类型
  AssetTypes: {
    CASH: 'cash',           // 现金
    BANK: 'bank',           // 银行存款
    INVESTMENT: 'investment', // 投资
    REAL_ESTATE: 'real_estate', // 不动产
    VEHICLE: 'vehicle',     // 车辆
    OTHER: 'other'          // 其他
  },

  // 收入类型
  IncomeTypes: {
    SALARY: 'salary',       // 工资
    BONUS: 'bonus',         // 奖金
    INVESTMENT_INCOME: 'investment_income', // 投资收益
    RENTAL: 'rental',       // 租金
    OTHER: 'other'          // 其他
  },

  // 资产记录
  AssetRecord: class {
    constructor(data = {}) {
      this.id = data.id || Date.now().toString();
      this.name = data.name || '';
      this.type = data.type || DataModels.AssetTypes.CASH;
      this.amount = data.amount || 0;
      this.currency = data.currency || 'CNY';
      this.description = data.description || '';
      this.createTime = data.createTime || new Date().toISOString();
      this.updateTime = data.updateTime || new Date().toISOString();
    }
  },

  // 基金持仓记录
  FundRecord: class {
    constructor(data = {}) {
      this.id = data.id || Date.now().toString();
      this.fundCode = data.fundCode || '';
      this.fundName = data.fundName || '';
      this.purchasePrice = data.purchasePrice || 0;
      this.shares = data.shares || 0;
      this.purchaseDate = data.purchaseDate || new Date().toISOString();
      this.currentPrice = data.currentPrice || 0;
      this.createTime = data.createTime || new Date().toISOString();
    }
  },

  // 收入记录
  IncomeRecord: class {
    constructor(data = {}) {
      this.id = data.id || Date.now().toString();
      this.amount = data.amount || 0;
      this.type = data.type || DataModels.IncomeTypes.SALARY;
      this.source = data.source || '';
      this.date = data.date || new Date().toISOString();
      this.description = data.description || '';
      this.createTime = data.createTime || new Date().toISOString();
    }
  },

  // 资产历史记录
  AssetHistory: class {
    constructor(data = {}) {
      this.id = data.id || Date.now().toString();
      this.totalAssets = data.totalAssets || 0;
      this.assetsByType = data.assetsByType || {};
      this.date = data.date || new Date().toISOString();
      this.createTime = data.createTime || new Date().toISOString();
    }
  }
};

// 数据管理类
export class DataManager {
  constructor() {
    this.storage = new StorageUtil();
  }

  // 资产相关操作
  async addAsset(assetData) {
    const assets = this.storage.getItem('assets') || [];
    const newAsset = new DataModels.AssetRecord(assetData);
    assets.push(newAsset);
    
    if (this.storage.setItem('assets', assets)) {
      await this.updateAssetHistory();
      return newAsset;
    }
    return null;
  }

  async updateAsset(assetId, updateData) {
    const assets = this.storage.getItem('assets') || [];
    const index = assets.findIndex(asset => asset.id === assetId);
    
    if (index !== -1) {
      assets[index] = { ...assets[index], ...updateData, updateTime: new Date().toISOString() };
      if (this.storage.setItem('assets', assets)) {
        await this.updateAssetHistory();
        return assets[index];
      }
    }
    return null;
  }

  deleteAsset(assetId) {
    const assets = this.storage.getItem('assets') || [];
    const filteredAssets = assets.filter(asset => asset.id !== assetId);
    return this.storage.setItem('assets', filteredAssets);
  }

  getAssets() {
    return this.storage.getItem('assets') || [];
  }

  // 基金相关操作
  addFund(fundData) {
    const funds = this.storage.getItem('funds') || [];
    const newFund = new DataModels.FundRecord(fundData);
    funds.push(newFund);
    return this.storage.setItem('funds', funds) ? newFund : null;
  }

  updateFund(fundId, updateData) {
    const funds = this.storage.getItem('funds') || [];
    const index = funds.findIndex(fund => fund.id === fundId);
    
    if (index !== -1) {
      funds[index] = { ...funds[index], ...updateData };
      return this.storage.setItem('funds', funds) ? funds[index] : null;
    }
    return null;
  }

  deleteFund(fundId) {
    const funds = this.storage.getItem('funds') || [];
    const filteredFunds = funds.filter(fund => fund.id !== fundId);
    return this.storage.setItem('funds', filteredFunds);
  }

  getFunds() {
    return this.storage.getItem('funds') || [];
  }

  // 收入相关操作
  addIncome(incomeData) {
    const incomes = this.storage.getItem('incomes') || [];
    const newIncome = new DataModels.IncomeRecord(incomeData);
    incomes.push(newIncome);
    return this.storage.setItem('incomes', incomes) ? newIncome : null;
  }

  getIncomes() {
    return this.storage.getItem('incomes') || [];
  }

  // 资产历史记录
  async updateAssetHistory() {
    const assets = this.getAssets();
    const totalAssets = assets.reduce((sum, asset) => sum + asset.amount, 0);
    
    const assetsByType = {};
    Object.values(DataModels.AssetTypes).forEach(type => {
      assetsByType[type] = assets
        .filter(asset => asset.type === type)
        .reduce((sum, asset) => sum + asset.amount, 0);
    });

    const history = this.storage.getItem('asset_history') || [];
    const today = new Date().toISOString().split('T')[0];
    
    // 检查今天是否已有记录
    const todayIndex = history.findIndex(item => 
      item.date.split('T')[0] === today
    );
    
    const newHistory = new DataModels.AssetHistory({
      totalAssets,
      assetsByType,
      date: new Date().toISOString()
    });
    
    if (todayIndex !== -1) {
      history[todayIndex] = newHistory;
    } else {
      history.push(newHistory);
    }
    
    // 只保留最近30天的记录
    const recentHistory = history.slice(-30);
    this.storage.setItem('asset_history', recentHistory);
  }

  getAssetHistory() {
    return this.storage.getItem('asset_history') || [];
  }

  // 统计数据
  getStatistics() {
    const assets = this.getAssets();
    const incomes = this.getIncomes();
    const funds = this.getFunds();
    const history = this.getAssetHistory();

    const totalAssets = assets.reduce((sum, asset) => sum + asset.amount, 0);
    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
    
    const assetsByType = {};
    Object.values(DataModels.AssetTypes).forEach(type => {
      assetsByType[type] = assets
        .filter(asset => asset.type === type)
        .reduce((sum, asset) => sum + asset.amount, 0);
    });

    const incomeByType = {};
    Object.values(DataModels.IncomeTypes).forEach(type => {
      incomeByType[type] = incomes
        .filter(income => income.type === type)
        .reduce((sum, income) => sum + income.amount, 0);
    });

    // 基金收益计算
    let totalFundInvestment = 0;
    let totalFundValue = 0;
    funds.forEach(fund => {
      totalFundInvestment += fund.purchasePrice * fund.shares;
      totalFundValue += fund.currentPrice * fund.shares;
    });
    const fundProfit = totalFundValue - totalFundInvestment;
    const fundProfitRate = totalFundInvestment > 0 ? (fundProfit / totalFundInvestment) * 100 : 0;

    return {
      totalAssets,
      totalIncome,
      assetsByType,
      incomeByType,
      fundStatistics: {
        totalFunds: funds.length,
        totalInvestment: totalFundInvestment,
        currentValue: totalFundValue,
        profit: fundProfit,
        profitRate: fundProfitRate
      },
      assetHistory: history
    };
  }
}

// 导出单例实例
export const dataManager = new DataManager();