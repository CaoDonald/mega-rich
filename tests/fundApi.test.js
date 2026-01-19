import { describe, it, expect, test } from 'vitest';
import * as FundApi from '../src/utils/fundApi.js'; // 导入你的基金接口模块

// 测试配置
const TEST_CONFIG = {
    FCODE: '400030',       // 测试用基金代码
    SEARCH_KEY: '纳斯达克', // 测试关键字
    PAGE_INDEX: 1,
    PAGE_SIZE: 5
};

// 全局测试描述
describe('基金接口自动化测试', () => {
    // ====================== 基金搜索接口测试 ======================
    describe('1. 基金搜索相关', () => {
        it('fundSearch - 搜索基金（m=1, key=11）', async () => {
            const { data, error } = await FundApi.fundSearch(1, '11');
            expect(error).toBeNull(); // 断言无错误
            expect(data).toBeDefined(); // 断言返回数据存在
        });

        it('fundSearchInfoByName - 按名称搜索纳斯达克', async () => {
            const { data, error } = await FundApi.fundSearchInfoByName(
                TEST_CONFIG.SEARCH_KEY,
                2,
                TEST_CONFIG.PAGE_INDEX,
                TEST_CONFIG.PAGE_SIZE
            );
            expect(error).toBeNull();
            expect(data).toBeDefined();
            if (data) {
                expect(data).toHaveProperty('totalCount'); // 断言返回包含总数字段
            }
        });
    });

    // ====================== 基金列表接口测试 ======================
    describe('2. 基金列表相关', () => {
        it('fundNetList - 按字母获取基金列表', async () => {
            const { data, error } = await FundApi.fundNetList(0, 'DWJZ', 'desc', 'a', '', 1, 5);
            expect(error).toBeNull();
            expect(data).toBeDefined();
        });

        it('fundSuggestList - 获取基金简单列表', async () => {
            const { data, error } = await FundApi.fundSuggestList();
            expect(error).toBeNull();
            expect(data).toBeDefined();
        });
    });

    // ====================== 基金详情接口测试 ======================
    describe('3. 基金详情相关', () => {
        it('fundMNDetailInformation - 获取基金详情', async () => {
            const { data, error } = await FundApi.fundMNDetailInformation(TEST_CONFIG.FCODE);
            expect(error).toBeNull();
            expect(data).toBeDefined();
            if (data?.Datas) {
                expect(data.Datas).toHaveProperty('FCODE', TEST_CONFIG.FCODE); // 断言返回正确的基金代码
            }
        });

        it('fundMNPeriodIncrease - 获取基金涨幅', async () => {
            const { data, error } = await FundApi.fundMNPeriodIncrease(TEST_CONFIG.FCODE, '');
            expect(error).toBeNull();
            expect(data).toBeDefined();
        });

        it('fundMNHisNetList - 获取基金历史净值', async () => {
            const { data, error } = await FundApi.fundMNHisNetList(TEST_CONFIG.FCODE, 1, 5);
            expect(error).toBeNull();
            expect(data).toBeDefined();
        });
    });

    // ====================== 基金主题/排行/公司/经理测试 ======================
    describe('4. 其他核心接口', () => {
        it('fundMNSubjectList - 获取基金主题列表', async () => {
            const { data, error } = await FundApi.fundMNSubjectList();
            expect(error).toBeNull();
            expect(data).toBeDefined();
        });

        it('fundMNRank - 获取基金排行', async () => {
            const { data, error } = await FundApi.fundMNRank(0, 'SYL_Z', 'desc', 1, 5);
            expect(error).toBeNull();
            expect(data).toBeDefined();
        });

        it('fundCompanyBaseList - 获取基金公司列表', async () => {
            const { data, error } = await FundApi.fundCompanyBaseList();
            expect(error).toBeNull();
            expect(data).toBeDefined();
        });

        it('fundMNMangerList - 获取基金经理列表', async () => {
            const { data, error } = await FundApi.fundMNMangerList(TEST_CONFIG.FCODE);
            expect(error).toBeNull();
            expect(data).toBeDefined();
        });
    });

    // ====================== 股票接口测试 ======================
    test('stockGet - 获取股票详情', async () => {
        const { data, error } = await FundApi.stockGet(0, '300750'); // 宁德时代
        expect(error).toBeNull();
        expect(data).toBeDefined();
    });
});