import { describe, it, expect, test } from 'vitest';
import * as FundApi from '../src/utils/fundApi.js';

// 测试配置
const TEST_CONFIG = {
    FCODE: '400030',
    SEARCH_KEY: '纳斯达克',
    PAGE_INDEX: 1,
    PAGE_SIZE: 5
};

const TEST_TIMEOUT = 60_000;

// 全局测试描述
describe('基金接口自动化测试', { timeout: TEST_TIMEOUT }, () => {
    console.log('🚀 开始执行 基金接口自动化测试\n');

    // ====================== 基金搜索接口测试 ======================
    describe('1. 基金搜索相关', () => {
        it('fundSearch - 搜索基金（m=1, key=11）', async () => {
            console.log('------------------------------------');
            console.log('🔍 正在测试：fundSearch 搜索基金');
            const { data, error } = await FundApi.fundSearch(1, '11');

            if (error) {
                console.error('❌ fundSearch 测试失败：', error);
                console.log('------------------------------------');
            } else {
                console.log('✅ fundSearch 测试通过');
                console.log('📊 返回数据：', JSON.stringify(data, null, 2));
                console.log('------------------------------------');
            }

            expect(error).toBeNull();
            expect(data).toBeDefined();
        });

        it('fundSearchInfoByName - 按名称搜索纳斯达克', async () => {
            console.log('------------------------------------');
            console.log('🔍 正在测试：fundSearchInfoByName 按名称搜索');
            const { data, error } = await FundApi.fundSearchInfoByName(
                TEST_CONFIG.SEARCH_KEY,
                2,
                TEST_CONFIG.PAGE_INDEX,
                TEST_CONFIG.PAGE_SIZE
            );

            if (error) {
                console.error('❌ fundSearchInfoByName 测试失败：', error);
                console.log('------------------------------------');
            } else {
                console.log('✅ fundSearchInfoByName 测试通过');
                console.log('📊 搜索结果总数：', data?.totalCount || 0);
                console.log('📊 完整返回数据：', JSON.stringify(data, null, 2));
                console.log('------------------------------------');
            }

            expect(error).toBeNull();
            expect(data).toBeDefined();
            if (data) {
                expect(data).toHaveProperty('totalCount');
            }
        });
    });

    // ====================== 基金列表接口测试 ======================
    describe('2. 基金列表相关', () => {
        it('fundNetList - 按字母获取基金列表', async () => {
            console.log('------------------------------------');
            console.log('📋 正在测试：fundNetList 基金列表');
            const { data, error } = await FundApi.fundNetList(0, 'DWJZ', 'desc', 'a', '', 1, 5);

            if (error) {
                console.error('❌ fundNetList 失败：', error);
                console.log('------------------------------------');
            } else {
                console.log('✅ fundNetList 测试通过');
                console.log('📊 返回数据：', JSON.stringify(data, null, 2));
                console.log('------------------------------------');
            }
            expect(error).toBeNull();
            expect(data).toBeDefined();
        });

        it('fundSuggestList - 获取基金简单列表', async () => {
            console.log('------------------------------------');
            console.log('📋 正在测试：fundSuggestList 推荐基金列表');
            const { data, error } = await FundApi.fundSuggestList();

            if (error) {
                console.error('❌ fundSuggestList 失败：', error);
                console.log('------------------------------------');
            } else {
                console.log('✅ fundSuggestList 测试通过');
                console.log('📊 返回数据：', JSON.stringify(data, null, 2));
                console.log('------------------------------------');
            }
            expect(error).toBeNull();
            expect(data).toBeDefined();
        });
    });

    // ====================== 基金详情接口测试 ======================
    describe('3. 基金详情相关', () => {
        it('fundMNDetailInformation - 获取基金详情', async () => {
            console.log('------------------------------------');
            console.log('📄 正在测试：fundMNDetailInformation 基金详情');
            console.log('🎫 测试基金代码：', TEST_CONFIG.FCODE);
            const { data, error } = await FundApi.fundMNDetailInformation(TEST_CONFIG.FCODE);

            if (error) {
                console.error('❌ 基金详情接口失败：', error);
                console.log('------------------------------------');
            } else {
                console.log('✅ 基金详情接口测试通过');
                console.log('🏷  返回基金代码：', data?.Datas?.FCODE);
                console.log('📊 完整返回数据：', JSON.stringify(data, null, 2));
                console.log('------------------------------------');
            }

            expect(error).toBeNull();
            expect(data).toBeDefined();
            if (data?.Datas) {
                expect(data.Datas).toHaveProperty('FCODE', TEST_CONFIG.FCODE);
            }
        });

        it('fundMNPeriodIncrease - 获取基金涨幅', async () => {
            console.log('------------------------------------');
            console.log('📈 正在测试：fundMNPeriodIncrease 基金涨幅');
            const { data, error } = await FundApi.fundMNPeriodIncrease(TEST_CONFIG.FCODE, '');

            if (error) {
                console.error('❌ 基金涨幅接口失败：', error);
                console.log('------------------------------------');
            } else {
                console.log('✅ 基金涨幅接口测试通过');
                console.log('📊 返回数据：', JSON.stringify(data, null, 2));
                console.log('------------------------------------');
            }
            expect(error).toBeNull();
            expect(data).toBeDefined();
        });

        it('fundMNHisNetList - 获取基金历史净值', async () => {
            console.log('------------------------------------');
            console.log('📅 正在测试：fundMNHisNetList 历史净值');
            const { data, error } = await FundApi.fundMNHisNetList(TEST_CONFIG.FCODE, 1, 5);

            if (error) {
                console.error('❌ 历史净值接口失败：', error);
                console.log('------------------------------------');
            } else {
                console.log('✅ 历史净值接口测试通过');
                console.log('📊 返回数据：', JSON.stringify(data, null, 2));
                console.log('------------------------------------');
            }
            expect(error).toBeNull();
            expect(data).toBeDefined();
        });
    });

    // ====================== 基金主题/排行/公司/经理测试 ======================
    describe('4. 其他核心接口', () => {
        it('fundMNSubjectList - 获取基金主题列表', async () => {
            console.log('------------------------------------');
            console.log('🏛  正在测试：fundMNSubjectList 基金主题');
            const { data, error } = await FundApi.fundMNSubjectList();

            if (error) {
                console.error('❌ 基金主题接口失败：', error);
                console.log('------------------------------------');
            } else {
                console.log('✅ 基金主题接口测试通过');
                console.log('📊 返回数据：', JSON.stringify(data, null, 2));
                console.log('------------------------------------');
            }
            expect(error).toBeNull();
            expect(data).toBeDefined();
        });

        it('fundMNRank - 获取基金排行', async () => {
            console.log('------------------------------------');
            console.log('🏆 正在测试：fundMNRank 基金排行');
            const { data, error } = await FundApi.fundMNRank(0, 'SYL_Z', 'desc', 1, 5);

            if (error) {
                console.error('❌ 基金排行接口失败：', error);
                console.log('------------------------------------');
            } else {
                console.log('✅ 基金排行接口测试通过');
                console.log('📊 返回数据：', JSON.stringify(data, null, 2));
                console.log('------------------------------------');
            }
            expect(error).toBeNull();
            expect(data).toBeDefined();
        });

        it('fundCompanyBaseList - 获取基金公司列表', async () => {
            console.log('------------------------------------');
            console.log('🏢 正在测试：fundCompanyBaseList 基金公司');
            const { data, error } = await FundApi.fundCompanyBaseList();

            if (error) {
                console.error('❌ 基金公司接口失败：', error);
                console.log('------------------------------------');
            } else {
                console.log('✅ 基金公司接口测试通过');
                console.log('📊 返回数据：', JSON.stringify(data, null, 2));
                console.log('------------------------------------');
            }
            expect(error).toBeNull();
            expect(data).toBeDefined();
        });

        it('fundMNMangerList - 获取基金经理列表', async () => {
            console.log('------------------------------------');
            console.log('👨‍💼 正在测试：fundMNMangerList 基金经理');
            const { data, error } = await FundApi.fundMNMangerList(TEST_CONFIG.FCODE);

            if (error) {
                console.error('❌ 基金经理接口失败：', error);
                console.log('------------------------------------');
            } else {
                console.log('✅ 基金经理接口测试通过');
                console.log('📊 返回数据：', JSON.stringify(data, null, 2));
                console.log('------------------------------------');
            }
            expect(error).toBeNull();
            expect(data).toBeDefined();
        });
    });

    // ====================== 股票接口测试 ======================
    test('stockGet - 获取股票详情', async () => {
        console.log('------------------------------------');
        console.log('📊 正在测试：stockGet 股票详情');
        console.log('🪪 测试股票代码：300750 宁德时代');
        const { data, error } = await FundApi.stockGet(0, '300750');

        if (error) {
            console.error('❌ 股票接口失败：', error);
        } else {
            console.log('✅ 股票接口测试通过');
            console.log('📊 返回数据：', JSON.stringify(data, null, 2));
        }
        expect(error).toBeNull();
        expect(data).toBeDefined();
        console.log('------------------------------------\n');
    });
});
