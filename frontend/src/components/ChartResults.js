import React, { useState, useEffect } from 'react';
import { RotateCcw, Download, Brain, Map, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import MindMapViewer from './MindMapViewer';
import AnalysisPanel from './AnalysisPanel';
import ChartCard from './ChartCard';
import apiService from '../services/api';

const ChartResults = ({ data, onReset }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [mindmapData, setMindmapData] = useState(null);
    const [analysisData, setAnalysisData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        bazi: true,
        ziwei: true,
        vedic: true
    });

    const { input, bazi, ziwei, vedic } = data;

    // 生成思维导图
    const generateMindmap = async () => {
        setLoading(true);
        try {
            const result = await apiService.generateMindmap(data);
            setMindmapData(result);
            setActiveTab('mindmap');
            toast.success('思维导图生成成功！');
        } catch (error) {
            console.error('思维导图生成失败:', error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    // 进行分析
    const performAnalysis = async (analysisType) => {
        setLoading(true);
        try {
            const result = await apiService.analyzeWithChatGPT(data, analysisType);
            setAnalysisData(result);
            setActiveTab('analysis');
            toast.success('分析完成！');
        } catch (error) {
            console.error('分析失败:', error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    // 本地分析
    const performLocalAnalysis = async (analysisType) => {
        setLoading(true);
        try {
            const result = await apiService.localAnalysis(data, analysisType);
            setAnalysisData({ data: result, success: true });
            setActiveTab('analysis');
            toast.success('本地分析完成！');
        } catch (error) {
            console.error('本地分析失败:', error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    // 下载PDF报告
    const downloadPDF = async () => {
        try {
            // 这里可以实现PDF生成逻辑
            toast.success('PDF下载功能正在开发中...');
        } catch (error) {
            toast.error('PDF下载失败');
        }
    };

    // 切换展开状态
    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // 选项卡配置
    const tabs = [
        { id: 'overview', label: '命盘总览', icon: Eye },
        { id: 'mindmap', label: '思维导图', icon: Map },
        { id: 'analysis', label: '智能分析', icon: Brain },
    ];

    return (
        <div className="space-y-6">
            {/* 页面头部 */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        {input.location_name || '命盘分析结果'}
                    </h2>
                    <p className="text-gray-600 mt-1">
                        {input.birth_date} {input.birth_time} • {input.gender_str} •
                        经度{input.longitude} 纬度{input.latitude}
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={generateMindmap}
                        disabled={loading}
                        className="btn-secondary flex items-center"
                    >
                        <Map className="w-4 h-4 mr-2" />
                        生成思维导图
                    </button>

                    <button
                        onClick={downloadPDF}
                        className="btn-outline flex items-center"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        下载报告
                    </button>

                    <button
                        onClick={onReset}
                        className="btn-outline flex items-center"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        重新计算
                    </button>
                </div>
            </div>

            {/* 选项卡导航 */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === tab.id
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <Icon className="w-4 h-4 mr-2" />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* 选项卡内容 */}
            <div className="min-h-[500px]">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* 八字命盘 */}
                        <ChartCard
                            title="八字命盘"
                            subtitle="中华传统四柱推命"
                            color="primary"
                            isExpanded={expandedSections.bazi}
                            onToggle={() => toggleSection('bazi')}
                        >
                            {bazi && (
                                <div className="space-y-6">
                                    {/* 真太阳时信息框 */}
                                    {input.true_solar_time && (
                                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 shadow-sm">
                                            <div className="flex items-center mb-2">
                                                <div className="w-5 h-5 mr-2 text-amber-600">☀️</div>
                                                <h4 className="font-semibold text-amber-800">真太阳时计算</h4>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-amber-700">输入时间：</span>
                                                    <span className="font-medium text-amber-900 ml-2">
                                                        {input.birth_date} {input.birth_time}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-amber-700">真太阳时：</span>
                                                    <span className="font-medium text-amber-900 ml-2">
                                                        {input.true_solar_time.year}-
                                                        {String(input.true_solar_time.month).padStart(2, '0')}-
                                                        {String(input.true_solar_time.day).padStart(2, '0')} {' '}
                                                        {String(input.true_solar_time.hour).padStart(2, '0')}:
                                                        {String(input.true_solar_time.minute).padStart(2, '0')}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="mt-3 text-xs text-amber-600 bg-amber-100/50 rounded p-2">
                                                <span className="font-medium">说明：</span>
                                                八字计算已根据地理经度（{input.longitude}°）自动修正为真太阳时，确保命盘准确性。
                                            </div>
                                        </div>
                                    )}
                                    {/* 四柱与日主 */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-semibold text-gray-800 mb-3">四柱信息</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-gray-600">年柱：</span>
                                                    <span className="font-medium">{bazi.year_pillar || '未知'}</span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-gray-600">月柱：</span>
                                                    <span className="font-medium">{bazi.month_pillar || '未知'}</span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-gray-600">日柱：</span>
                                                    <span className="font-medium">{bazi.day_pillar || '未知'}</span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-gray-600">时柱：</span>
                                                    <span className="font-medium">{bazi.hour_pillar || '未知'}</span>
                                                </div>
                                                <div className="mt-4 p-3 bg-primary-50 rounded-lg">
                                                    <span className="text-primary-800 font-medium">
                                                        日主：{bazi.day_master || '未知'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold text-gray-800 mb-3">五行分析</h4>
                                            <div className="space-y-2">
                                                {bazi.five_elements_count && Object.entries(bazi.five_elements_count).map(([element, count]) => (
                                                    <div key={element} className="flex justify-between py-2 border-b border-gray-100">
                                                        <span className="text-gray-600">{element}：</span>
                                                        <span className={`font-medium ${count > 2 ? 'text-red-600' : count === 0 ? 'text-gray-400' : 'text-green-600'}`}>
                                                            {count}
                                                        </span>
                                                    </div>
                                                ))}
                                                <div className="mt-4 p-3 bg-secondary-50 rounded-lg">
                                                    <span className="text-secondary-800 font-medium">
                                                        身强身弱：{bazi.body_strength || '未知'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 四柱详析 - 使用增强分析结果 */}
                                    {bazi.enhanced_analysis?.四柱详析 && (
                                        <div>
                                            <h4 className="font-semibold text-gray-800 mb-3">四柱详析</h4>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                {bazi.enhanced_analysis.四柱详析.map((pillar, index) => (
                                                    <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <h5 className="font-semibold text-gray-800">{pillar.柱序}</h5>
                                                            <span className="text-lg font-bold text-primary-600">{pillar.干支}</span>
                                                        </div>

                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-600">主星：</span>
                                                                <span className="font-medium text-blue-600">{pillar.主星}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-600">纳音：</span>
                                                                <span className="font-medium text-green-600">{pillar.纳音}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-600">星运：</span>
                                                                <span className="font-medium text-purple-600">{pillar['星运（十二长生）']}</span>
                                                            </div>

                                                            {/* 藏干 */}
                                                            {pillar.藏干 && pillar.藏干.length > 0 && (
                                                                <div>
                                                                    <span className="text-gray-600">藏干：</span>
                                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                                        {pillar.藏干.map((gan, ganIndex) => (
                                                                            <span key={ganIndex} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                                                                                {gan}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* 藏干十神 */}
                                                            {pillar.藏干十神 && pillar.藏干十神.length > 0 && (
                                                                <div>
                                                                    <span className="text-gray-600">藏干十神：</span>
                                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                                        {pillar.藏干十神.map((item, itemIndex) => (
                                                                            <span key={itemIndex} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded">
                                                                                {item.藏干}({item.十神})
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* 空亡 */}
                                                            {pillar.空亡 && pillar.空亡.length > 0 && (
                                                                <div>
                                                                    <span className="text-gray-600">空亡：</span>
                                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                                        {pillar.空亡.map((kong, kongIndex) => (
                                                                            <span key={kongIndex} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                                                                                {kong}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 十神统计 */}
                                    {bazi.enhanced_analysis?.十神统计 && (
                                        <div>
                                            <h4 className="font-semibold text-gray-800 mb-3">十神统计</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                                {Object.entries(bazi.enhanced_analysis.十神统计).map(([god, count]) => (
                                                    <div key={god} className="p-3 bg-gray-50 rounded-lg text-center">
                                                        <div className="text-xs text-gray-500">{god}</div>
                                                        <div className="font-bold text-gray-800 text-lg">{count}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 十神分析（回退显示） */}
                                    {!bazi.enhanced_analysis?.四柱详析 && bazi.ten_gods && (
                                        <div>
                                            <h4 className="font-semibold text-gray-800 mb-3">十神分析</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {Object.entries(bazi.ten_gods).map(([position, god]) => (
                                                    <div key={position} className="p-3 bg-gray-50 rounded-lg text-center">
                                                        <div className="text-xs text-gray-500">{position}</div>
                                                        <div className="font-medium text-gray-800">{god}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 神煞信息 */}
                                    {bazi.spirits && (
                                        <div>
                                            <h4 className="font-semibold text-gray-800 mb-3">神煞信息</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {bazi.spirits.map((spirit, index) => (
                                                    <span key={index} className="px-3 py-1 bg-accent-100 text-accent-800 rounded-full text-sm">
                                                        {spirit}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </ChartCard>

                        {/* 紫微斗数 */}
                        <ChartCard
                            title="紫微斗数"
                            subtitle="中华传统斗数推命"
                            color="secondary"
                            isExpanded={expandedSections.ziwei}
                            onToggle={() => toggleSection('ziwei')}
                        >
                            {ziwei && (
                                <div className="space-y-6">
                                    {/* 基本信息和四化 */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-semibold text-gray-800 mb-3">基本信息</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-gray-600">五行局：</span>
                                                    <span className="font-medium">{ziwei.basic_info?.five_elements_class || '未知'}</span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-gray-600">命主：</span>
                                                    <span className="font-medium">{ziwei.basic_info?.soul || '未知'}</span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-gray-600">身主：</span>
                                                    <span className="font-medium">{ziwei.basic_info?.body || '未知'}</span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-gray-600">农历：</span>
                                                    <span className="font-medium">{ziwei.basic_info?.lunar_date || '未知'}</span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-gray-600">干支：</span>
                                                    <span className="font-medium">{ziwei.basic_info?.chinese_date || '未知'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold text-gray-800 mb-3">年干四化</h4>
                                            <div className="space-y-2">
                                                {ziwei.year_four_trans && Object.entries(ziwei.year_four_trans).map(([trans, star]) => (
                                                    <div key={trans} className="flex justify-between py-2 border-b border-gray-100">
                                                        <span className="text-gray-600">{trans}：</span>
                                                        <span className={`font-medium ${trans === '禄' ? 'text-green-600' :
                                                            trans === '权' ? 'text-blue-600' :
                                                                trans === '科' ? 'text-purple-600' :
                                                                    trans === '忌' ? 'text-red-600' : 'text-gray-800'
                                                            }`}>
                                                            {star}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 主星分布 */}
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-3">主星分布</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                            {ziwei.chart?.star_positions && Object.entries(ziwei.chart.star_positions).map(([star, palace]) => (
                                                <div key={star} className="p-3 bg-gray-50 rounded-lg text-center">
                                                    <div className="text-xs text-gray-500">{star}</div>
                                                    <div className="font-medium text-gray-800">{palace}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 十二宫详情 */}
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-3">十二宫详情</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {ziwei.chart?.palaces && Object.entries(ziwei.chart.palaces).map(([palaceName, palaceData]) => (
                                                <div key={palaceName} className="border rounded-lg p-4 bg-white shadow-sm">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h5 className="font-semibold text-gray-800">{palaceName}</h5>
                                                        {palaceData.is_body_palace && (
                                                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">身宫</span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-600 mb-2">
                                                        {palaceData.heavenly_stem}{palaceData.earthly_branch}
                                                    </div>

                                                    {/* 主星 */}
                                                    {palaceData.major_stars && palaceData.major_stars.length > 0 && (
                                                        <div className="mb-2">
                                                            <div className="text-xs text-gray-500">主星：</div>
                                                            <div className="flex flex-wrap gap-1">
                                                                {palaceData.major_stars.map((star, index) => (
                                                                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                                                        {typeof star === 'object' ?
                                                                            `${star.name}${star.brightness ? `(${star.brightness})` : ''}${star.mutagen ? `[${star.mutagen}]` : ''}` :
                                                                            star
                                                                        }
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* 辅星 */}
                                                    {palaceData.minor_stars && palaceData.minor_stars.length > 0 && (
                                                        <div className="mb-2">
                                                            <div className="text-xs text-gray-500">辅星：</div>
                                                            <div className="flex flex-wrap gap-1">
                                                                {palaceData.minor_stars.map((star, index) => (
                                                                    <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                                                        {star}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* 杂耀 */}
                                                    {palaceData.adjective_stars && palaceData.adjective_stars.length > 0 && (
                                                        <div>
                                                            <div className="text-xs text-gray-500">杂耀：</div>
                                                            <div className="flex flex-wrap gap-1">
                                                                {palaceData.adjective_stars.map((star, index) => (
                                                                    <span key={index} className="px-1 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                                                                        {star}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </ChartCard>

                        {/* 印度星盘 */}
                        <ChartCard
                            title="印度星盘"
                            subtitle="吠陀占星体系"
                            color="accent"
                            isExpanded={expandedSections.vedic}
                            onToggle={() => toggleSection('vedic')}
                        >
                            {vedic && (
                                <div className="space-y-6">
                                    {/* 基本信息和技术参数 */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-semibold text-gray-800 mb-3">基本信息</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-gray-600">星盘类型：</span>
                                                    <span className="font-medium">{vedic.chart_type || '未知'}</span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-gray-600">上升星座：</span>
                                                    <span className="font-medium">{vedic.ascendant?.sign || '未知'}</span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-gray-600">上升度数：</span>
                                                    <span className="font-medium">{vedic.ascendant?.lon ? `${vedic.ascendant.lon.toFixed(2)}°` : '未知'}</span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-gray-600">月亮星座：</span>
                                                    <span className="font-medium">{vedic.planets?.Moon?.sign || '未知'}</span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-gray-600">太阳星座：</span>
                                                    <span className="font-medium">{vedic.planets?.Sun?.sign || '未知'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold text-gray-800 mb-3">技术参数</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-gray-600">岁差系统：</span>
                                                    <span className="font-medium">{vedic.ayanamsa?.type || '未知'}</span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-gray-600">岁差值：</span>
                                                    <span className="font-medium">{vedic.ayanamsa?.value ? `${vedic.ayanamsa.value}°` : '未知'}</span>
                                                </div>
                                                {vedic.axis_points?.Midheaven && (
                                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                                        <span className="text-gray-600">天顶：</span>
                                                        <span className="font-medium">{vedic.axis_points.Midheaven.sign} {vedic.axis_points.Midheaven.lon?.toFixed(2)}°</span>
                                                    </div>
                                                )}
                                                {vedic.axis_points?.['Imum Coeli'] && (
                                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                                        <span className="text-gray-600">天底：</span>
                                                        <span className="font-medium">{vedic.axis_points['Imum Coeli'].sign} {vedic.axis_points['Imum Coeli'].lon?.toFixed(2)}°</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 行星详细信息 */}
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-3">行星详细位置</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {vedic.planets && Object.entries(vedic.planets).map(([planet, data]) => (
                                                <div key={planet} className="border rounded-lg p-4 bg-white shadow-sm">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h5 className="font-semibold text-gray-800">{planet}</h5>
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                                            {data.house}宫
                                                        </span>
                                                    </div>
                                                    <div className="space-y-1 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">星座：</span>
                                                            <span className="font-medium">{data.sign}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">度数：</span>
                                                            <span className="font-medium">{data.lon?.toFixed(2)}°</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">宫位：</span>
                                                            <span className="font-medium">第{data.house}宫</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 轴点信息 */}
                                    {vedic.axis_points && (
                                        <div>
                                            <h4 className="font-semibold text-gray-800 mb-3">重要轴点</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                {Object.entries(vedic.axis_points).map(([point, data]) => (
                                                    <div key={point} className="p-3 bg-gray-50 rounded-lg">
                                                        <div className="font-medium text-gray-800 text-sm">{point}</div>
                                                        <div className="text-xs text-gray-600 mt-1">
                                                            {data.sign} {data.house}宫
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {data.lon?.toFixed(2)}°
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 宫位星座分布 */}
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-3">宫位星座分布</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {Array.from({ length: 12 }, (_, i) => i + 1).map(house => {
                                                const planetsInHouse = vedic.planets ?
                                                    Object.entries(vedic.planets).filter(([_, data]) => data.house === house) : [];
                                                const houseSign = planetsInHouse.length > 0 ? planetsInHouse[0][1].sign : '未知';

                                                return (
                                                    <div key={house} className="p-3 border rounded-lg bg-white">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="font-medium text-gray-800">第{house}宫</span>
                                                            <span className="text-xs text-gray-500">{houseSign}</span>
                                                        </div>
                                                        {planetsInHouse.length > 0 && (
                                                            <div className="flex flex-wrap gap-1">
                                                                {planetsInHouse.map(([planet, _]) => (
                                                                    <span key={planet} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                                                                        {planet}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </ChartCard>
                    </div>
                )}

                {activeTab === 'mindmap' && (
                    <MindMapViewer
                        data={mindmapData}
                        onGenerate={generateMindmap}
                        loading={loading}
                    />
                )}

                {activeTab === 'analysis' && (
                    <AnalysisPanel
                        chartData={data}
                        analysisData={analysisData}
                        onAnalyze={performAnalysis}
                        onLocalAnalyze={performLocalAnalysis}
                        loading={loading}
                    />
                )}
            </div>
        </div>
    );
};

export default ChartResults; 