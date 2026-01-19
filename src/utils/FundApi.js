import { supabase } from "../supabase.js";

/**
 * 通用调用 Supabase 边缘函数的方法
 * @param {Object} body - 接口请求参数
 * @returns {Promise<Object>} 包含 data 和 error 的结果
 */
async function callFundApi(body) {
    try {
        const { data, error } = await supabase.functions.invoke('fund-api', { body });
        if (error) {
            console.error('基金接口调用失败:', error);
        }
        return { data, error };
    } catch (err) {
        console.error('基金接口错误:', err);
        return { data: null, error: err };
    }
}

// ====================== 基金搜索相关 ======================
/**
 * 基金多维度搜索（按类型搜基金/经理/公司）
 * @param {number} m - 搜索类别：1=基金 3=按字母搜基金 7=基金经理 8=基金公司
 * @param {string} key - 关键字（m=3时仅a-z有效）
 * @returns {Promise<Object>}
 */
export async function fundSearch(m, key) {
    return callFundApi({ action_name: "fundSearch", m, key });
}

/**
 * 按基金名称搜索
 * @param {string} key - 搜索关键字
 * @param {number} [orderType=2] - 排序类型：1=按热度 2=默认
 * @param {number} [pageindex=1] - 页码
 * @param {number} [pagesize=20] - 每页条数
 * @returns {Promise<Object>}
 */
export async function fundSearchInfoByName(key, orderType = 2, pageindex = 1, pagesize = 20) {
    return callFundApi({
        action_name: "fundSearchInfoByName",
        key,
        orderType,
        pageindex,
        pagesize
    });
}

// ====================== 基金列表相关 ======================
/**
 * 按字母获取基金列表
 * @param {number} [fundtype=0] - 基金类型：0=全部 25=股票 27=混合 35=货币 6=QDII 4=LOF 2949=理财
 * @param {string} [SortColumn='DWJZ'] - 排序列：RDZF=日涨幅 DWJZ=最新净值
 * @param {string} [Sort='desc'] - 排序方式：desc=降序 asc=升序
 * @param {string} [Letter=''] - 字母（a-z，空=全部）
 * @param {string} [companyid=''] - 基金公司ID
 * @param {number} [pageIndex=1] - 页码
 * @param {number} [pagesize=20] - 每页条数
 * @returns {Promise<Object>}
 */
export async function fundNetList(
    fundtype = 0,
    SortColumn = 'DWJZ',
    Sort = 'desc',
    Letter = '',
    companyid = '',
    pageIndex = 1,
    pagesize = 20
) {
    return callFundApi({
        action_name: "fundNetList",
        fundtype,
        SortColumn,
        Sort,
        Letter,
        companyid,
        pageIndex,
        pagesize
    });
}

/**
 * 按类型获取基金列表
 * @param {number} [fundtype=0] - 基金类型（同fundNetList）
 * @param {string} [SortColumn='HLDWJZ'] - 排序列：HLDWJZ=最新净值 LJJZ=七日年化
 * @param {string} [Sort='desc'] - 排序方式
 * @param {string} [Letter=''] - 字母
 * @param {string} [companyid=''] - 基金公司ID
 * @param {number} [pageIndex=1] - 页码
 * @param {number} [pagesize=20] - 每页条数
 * @returns {Promise<Object>}
 */
export async function fundMNNetNewList(
    fundtype = 0,
    SortColumn = 'HLDWJZ',
    Sort = 'desc',
    Letter = '',
    companyid = '',
    pageIndex = 1,
    pagesize = 20
) {
    return callFundApi({
        action_name: "fundMNNetNewList",
        fundtype,
        SortColumn,
        Sort,
        Letter,
        companyid,
        pageIndex,
        pagesize
    });
}

/**
 * 获取基金简单列表（所有）
 * @returns {Promise<Object>}
 */
export async function fundSuggestList() {
    return callFundApi({ action_name: "fundSuggestList" });
}

// ====================== 基金主题相关 ======================
/**
 * 获取基金主题列表
 * @returns {Promise<Object>}
 */
export async function fundMNSubjectList() {
    return callFundApi({ action_name: "fundMNSubjectList" });
}

/**
 * 获取热门主题
 * @param {string} [RankItems='ZDF'] - 时间维度：ZDF=涨幅(实时) SYL_W=近1周 SYL_M=近1月
 * @param {string} [RankVectors='desc'] - 排序：desc=降序 asc=升序
 * @param {number} [category=2] - 类别：0=行业 1=概念 2=全部
 * @returns {Promise<Object>}
 */
export async function fundThemeList(RankItems = 'ZDF', RankVectors = 'desc', category = 2) {
    return callFundApi({
        action_name: "fundThemeList",
        RankItems,
        RankVectors,
        category
    });
}

/**
 * 获取主题焦点
 * @param {string} [code=''] - 焦点所属code（可选）
 * @returns {Promise<Object>}
 */
export async function fundThemeFocusList(code = '') {
    return callFundApi({ action_name: "fundThemeFocusList", code });
}

// ====================== 基金排行相关 ======================
/**
 * 获取基金排行
 * @param {number} [FundType=0] - 基金类型：0=全部 25=股票 27=混合 26=指数 31=债券 35=货币 6=QDII 3=ETF
 * @param {string} [SortColumn='SYL_Z'] - 排序字段：SYL_Z=近1周 SYL_Y=近1月 SYL_3Y=近3月 HLDWJZ=净值
 * @param {string} [Sort='desc'] - 排序方式
 * @param {number} [pageIndex=1] - 页码
 * @param {number} [pageSize=30] - 每页条数（最大30）
 * @param {string} [CompanyId=''] - 基金公司ID
 * @param {Object} [filters={}] - 筛选条件
 * @returns {Promise<Object>}
 */
export async function fundMNRank(
    FundType = 0,
    SortColumn = 'SYL_Z',
    Sort = 'desc',
    pageIndex = 1,
    pageSize = 30,
    CompanyId = '',
    filters = {}
) {
    const defaultFilters = {
        CLTYPE: '0', // 筛选方案：0=全部 022=金牛奖 006=五星评级
        ISABNORMAL: false, // 是否去除异常涨幅
        BUY: true, // 开放状态：true=可购 false=全部
        DISCOUNT: '', // 申购费率：0=0费率 1=1折
        LevelOne: '', // 股票型类型：N050=股票型 050=股票指数
        ENDNAV: '', // 基金规模：1=≤2亿 2=2-10亿 3=10-50亿 4=50-100亿 5=＞100亿
        RLEVEL_SZ: '', // 评级：5=五星 4=四星
        ESTABDATE: '', // 成立年限：1=≤1年 2=1-2年 3=2-3年 4=3-4年 5=4-5年 6=＞5年
        TOPICAL: '', // 基金主题
        RISKLEVEL: '', // 风险类型：1=低 2=中低 3=中 4=中高 5=高
        DataConstraintType: 0,
        LevelTwo: ''
    };

    return callFundApi({
        action_name: "fundMNRank",
        FundType,
        SortColumn,
        Sort,
        pageIndex,
        pageSize,
        CompanyId,
        ...defaultFilters,
        ...filters
    });
}

/**
 * 获取香港基金排行
 * @param {number} [FundType=0] - 基金类型：0=全部
 * @param {string} [SortColumn='NAV'] - 排序字段：NAV=净值 JZCUNIT=币种 NAVCHGRT=日涨幅
 * @param {string} [Sort='desc'] - 排序方式
 * @param {number} [pageIndex=1] - 页码
 * @param {number} [pageSize=20] - 每页条数
 * @param {string} [CompanyId=''] - 基金公司ID
 * @param {Object} [filters={}] - 筛选条件（同fundMNRank）
 * @returns {Promise<Object>}
 */
export async function fundMNHKRank(
    FundType = 0,
    SortColumn = 'NAV',
    Sort = 'desc',
    pageIndex = 1,
    pageSize = 20,
    CompanyId = '',
    filters = {}
) {
    return callFundApi({
        action_name: "fundMNHKRank",
        FundType,
        SortColumn,
        Sort,
        pageIndex,
        pageSize,
        CompanyId,
        ...filters
    });
}

// ====================== 基金详情相关 ======================
/**
 * 获取基金简介
 * @param {string} FCODE - 基金代码
 * @returns {Promise<Object>}
 */
export async function fundMNStopWatch(FCODE) {
    return callFundApi({ action_name: "fundMNStopWatch", FCODE });
}

/**
 * 获取基金详情
 * @param {string} FCODE - 基金代码
 * @returns {Promise<Object>}
 */
export async function fundMNDetailInformation(FCODE) {
    return callFundApi({ action_name: "fundMNDetailInformation", FCODE });
}

/**
 * 获取基金评级
 * @param {string} FCODE - 基金代码
 * @param {number} [pageIndex=1] - 页码
 * @param {number} [pageSize=20] - 每页条数
 * @returns {Promise<Object>}
 */
export async function fundGradeDetail(FCODE, pageIndex = 1, pageSize = 20) {
    return callFundApi({ action_name: "fundGradeDetail", FCODE, pageIndex, pageSize });
}

/**
 * 获取基金涨幅
 * @param {string} FCODE - 基金代码
 * @param {string} [RANGE=''] - 范围：n=年度 3n=3年 y=月度 3y=3个月 空=阶段涨幅
 * @returns {Promise<Object>}
 */
export async function fundMNPeriodIncrease(FCODE, RANGE = '') {
    return callFundApi({ action_name: "fundMNPeriodIncrease", FCODE, RANGE });
}

/**
 * 获取基金同类排名走势
 * @param {string} FCODE - 基金代码
 * @param {string} [RANGE=''] - 范围：n=年度 3n=3年 y=月度 3y=3个月 空=所有
 * @returns {Promise<Object>}
 */
export async function fundRankDiagram(FCODE, RANGE = '') {
    return callFundApi({ action_name: "fundRankDiagram", FCODE, RANGE });
}

/**
 * 获取基金累计收益
 * @param {string} FCODE - 基金代码
 * @param {string} [RANGE=''] - 范围：n=年度 3n=3年 y=月度 3y=3个月 jn=今年来 ln=成立以来
 * @param {string} [INDEXCODE='000300'] - 对比指数：000001=上证指数 000300=沪深300
 * @returns {Promise<Object>}
 */
export async function fundVPageAcc(FCODE, RANGE = '', INDEXCODE = '000300') {
    return callFundApi({ action_name: "fundVPageAcc", FCODE, RANGE, INDEXCODE });
}

/**
 * 获取基金净值
 * @param {string} FCODE - 基金代码
 * @param {string} [RANGE=''] - 范围（同fundVPageAcc）
 * @param {number} [POINTCOUNT=500] - 点计数（固定传500）
 * @returns {Promise<Object>}
 */
export async function fundVPageDiagram(FCODE, RANGE = '', POINTCOUNT = 500) {
    return callFundApi({ action_name: "fundVPageDiagram", FCODE, RANGE, POINTCOUNT });
}

/**
 * 获取基金净值估算（实时）
 * @param {string} FCODE - 基金代码
 * @returns {Promise<Object>}
 */
export async function fundVarietieValuationDetail(FCODE) {
    return callFundApi({ action_name: "fundVarietieValuationDetail", FCODE });
}

/**
 * 获取基金历史净值
 * @param {string} FCODE - 基金代码
 * @param {number} [pageIndex=1] - 页码
 * @param {number} [pagesize=20] - 每页条数
 * @returns {Promise<Object>}
 */
export async function fundMNHisNetList(FCODE, pageIndex = 1, pagesize = 20) {
    return callFundApi({ action_name: "fundMNHisNetList", FCODE, pageIndex, pagesize });
}

// ====================== 基金经理相关 ======================
/**
 * 获取基金的基金经理列表
 * @param {string} FCODE - 基金代码
 * @returns {Promise<Object>}
 */
export async function fundMNMangerList(FCODE) {
    return callFundApi({ action_name: "fundMNMangerList", FCODE });
}

/**
 * 获取基金经理信息
 * @param {string} MGRID - 基金经理ID
 * @returns {Promise<Object>}
 */
export async function fundMSNMangerInfo(MGRID) {
    return callFundApi({ action_name: "fundMSNMangerInfo", MGRID });
}

/**
 * 获取基金经理业绩走势
 * @param {string} MGRID - 基金经理ID
 * @param {string} [RANGE=''] - 范围：n=年 3n=3年 y=月 3y=3个月 ln=任职起
 * @returns {Promise<Object>}
 */
export async function fundMSNMangerAcc(MGRID, RANGE = '') {
    return callFundApi({ action_name: "fundMSNMangerAcc", MGRID, RANGE });
}

/**
 * 获取基金经理业绩排行
 * @param {string} MGRID - 基金经理ID
 * @returns {Promise<Object>}
 */
export async function fundMSNMangerPerRank(MGRID) {
    return callFundApi({ action_name: "fundMSNMangerPerRank", MGRID });
}

/**
 * 获取基金经理业绩评价
 * @param {string} MGRID - 基金经理ID
 * @returns {Promise<Object>}
 */
export async function fundMSNMangerPerEval(MGRID) {
    return callFundApi({ action_name: "fundMSNMangerPerEval", MGRID });
}

/**
 * 获取基金经理风格
 * @param {string} MGRID - 基金经理ID
 * @returns {Promise<Object>}
 */
export async function fundMSNMangerPosMark(MGRID) {
    return callFundApi({ action_name: "fundMSNMangerPosMark", MGRID });
}

/**
 * 获取基金经理持仓特点
 * @param {string} MGRID - 基金经理ID
 * @returns {Promise<Object>}
 */
export async function fundMSNMangerPosChar(MGRID) {
    return callFundApi({ action_name: "fundMSNMangerPosChar", MGRID });
}

/**
 * 获取基金经理持仓历史管理资金
 * @param {string} MGRID - 基金经理ID
 * @returns {Promise<Object>}
 */
export async function fundMSNMangerProContr(MGRID) {
    return callFundApi({ action_name: "fundMSNMangerProContr", MGRID });
}

// ====================== 基金公司相关 ======================
/**
 * 获取所有基金公司列表
 * @returns {Promise<Object>}
 */
export async function fundCompanyBaseList() {
    return callFundApi({ action_name: "fundCompanyBaseList" });
}

/**
 * 获取基金公司基础信息（旗下基金和主题）
 * @param {string} cc - 基金公司ID
 * @returns {Promise<Object>}
 */
export async function companyApi2FundCompanyBaseInfo(cc) {
    return callFundApi({ action_name: "companyApi2", cc, action: 'fundcompanybaseinfo' });
}

/**
 * 获取基金公司旗下基金列表
 * @param {string} cc - 基金公司ID
 * @param {string} [fundtype='all'] - 类型：all=全部 1=股票 2=混合 3=债券 4=理财 5=货币 7=QDII 8=指数
 * @param {number} [pi=1] - 页码
 * @param {number} [ps=20] - 每页条数
 * @param {string} [sd='desc'] - 排序方式
 * @param {string} [sf='SYL_Z'] - 排序列：SYL_Z=周 SYL_Y=月 SYL_1N=近1年
 * @returns {Promise<Object>}
 */
export async function companyApi2FundList(cc, fundtype = 'all', pi = 1, ps = 20, sd = 'desc', sf = 'SYL_Z') {
    return callFundApi({
        action_name: "companyApi2",
        cc,
        action: 'fundlist',
        fundtype,
        pi,
        ps,
        sd,
        sf
    });
}

/**
 * 获取基金公司旗下基金分类
 * @param {string} cc - 基金公司ID
 * @param {number} [ftype=25] - 类型：25=股票 27=混合 31=债券 35=货币 37=QDII 11=指数
 * @returns {Promise<Object>}
 */
export async function companyApi2CategoryOfFund(cc, ftype = 25) {
    return callFundApi({ action_name: "companyApi2", cc, action: 'categoryoffund', ftype });
}

/**
 * 获取基金公司基本情况
 * @param {string} cc - 基金公司ID
 * @returns {Promise<Object>}
 */
export async function companyApi2CompanyArchives(cc) {
    return callFundApi({ action_name: "companyApi2", cc, action: 'companyarchives' });
}

/**
 * 获取基金公司规模变动
 * @param {string} cc - 基金公司ID
 * @param {number} [pi=1] - 页码
 * @param {number} [ps=20] - 每页条数
 * @param {string} [sd='desc'] - 排序方式
 * @param {string} [sf='FSRQ'] - 排序列
 * @returns {Promise<Object>}
 */
export async function companyApi2CompanyGmbd(cc, pi = 1, ps = 20, sd = 'desc', sf = 'FSRQ') {
    return callFundApi({
        action_name: "companyApi2",
        cc,
        action: 'companygmbd',
        pi,
        ps,
        sd,
        sf
    });
}

// ====================== 大数据相关 ======================
/**
 * 获取大数据榜单
 * @param {number} [ClCategory=0] - 类型：0=全部榜单 1=独家数据 2=策略精选 3=主题热榜
 * @returns {Promise<Object>}
 */
export async function bigDataList(ClCategory = 0) {
    return callFundApi({ action_name: "bigDataList", ClCategory });
}

/**
 * 获取大数据榜单数据详情
 * @param {string} cltype - 榜单ID（从bigDataList获取）
 * @returns {Promise<Object>}
 */
export async function bigDataDetail(cltype) {
    return callFundApi({ action_name: "bigDataDetail", cltype });
}

// ====================== 股票相关 ======================
/**
 * 获取股票趋势
 * @param {number} [type=0] - 类型：0=其他 1=上证 2=未知 116=港股 105=美股 155=英股
 * @param {string} code - 股票代码
 * @param {number} [ndays=1] - 天数：1=分时 5=五日
 * @returns {Promise<Object>}
 */
export async function stockTrends2(type = 0, code, ndays = 1) {
    return callFundApi({ action_name: "stockTrends2", type, code, ndays });
}

/**
 * 获取股票K线
 * @param {number} [type=0] - 类型（同stockTrends2）
 * @param {string} code - 股票代码
 * @param {number} [klt=101] - K线类型：101=日K 102=周K 103=月K 1=1分钟 5=5分钟
 * @param {number} [lmt=20] - 每页数量
 * @param {number} [fqt=1] - 页数
 * @param {string} [end=''] - 结束时间（例：20230410）
 * @returns {Promise<Object>}
 */
export async function stockKline(type = 0, code, klt = 101, lmt = 20, fqt = 1, end = '') {
    return callFundApi({ action_name: "stockKline", type, code, klt, lmt, fqt, end });
}

/**
 * 获取股票交易明细
 * @param {number} [type=0] - 类型（同stockTrends2）
 * @param {string} code - 股票代码
 * @returns {Promise<Object>}
 */
export async function stockDetails(type = 0, code) {
    return callFundApi({ action_name: "stockDetails", type, code });
}

/**
 * 获取股票详情
 * @param {number} [type=0] - 类型（同stockTrends2）
 * @param {string} code - 股票代码
 * @returns {Promise<Object>}
 */
export async function stockGet(type = 0, code) {
    return callFundApi({ action_name: "stockGet", type, code });
}