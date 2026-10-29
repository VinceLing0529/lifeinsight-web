import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

const FortuneChartPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);
    const [aiData, setAiData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setIsVisible(true);
        fetchFortuneData();
    }, [orderId]);

    const fetchFortuneData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/ai-report/module-data/${orderId}/fortune`);
            if (response.ok) {
                const data = await response.json();
                // 处理AI返回的JSON内容，去除所有代码块标记
                let content = data.content;
                content = content.replace(/```json[\s\S]*?\n/, '').replace(/\n```$/, '').trim();
                const parsedContent = JSON.parse(content);
                setAiData(parsedContent);
            } else {
                console.error('Failed to fetch fortune data');
            }
        } catch (error) {
            console.error('Error fetching fortune data:', error);
        } finally {
            setLoading(false);
        }
    };

    // 获取当前时间并生成未来12个月
    const generateMonthlyFortune = () => {
        // 如果AI数据存在，使用AI数据
        if (aiData?.monthly_predictions) {
            // 兼容月份乱码，若month字段异常则用顺序补全
            const now = new Date();
            return aiData.monthly_predictions.map((prediction, idx) => {
                let month = prediction.month;
                if (!month || /[?]/.test(month)) {
                    const futureDate = new Date(now.getFullYear(), now.getMonth() + idx + 1, 1);
                    month = futureDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });
                }
                return {
                    month,
                    career: prediction.career_score,
                    wealth: prediction.wealth_score,
                    love: prediction.relationship_score,
                    health: prediction.health_score,
                    analysis: prediction.analysis || ''
                };
            });
        }

        // 否则使用预设数据
        const now = new Date();
        const months = [];

        // 预设运势模式，使其更有规律性
        const fortunePatterns = [
            { career: 8, wealth: 7, love: 9, health: 8 },  // 1月
            { career: 7, wealth: 8, love: 8, health: 9 },  // 2月
            { career: 9, wealth: 6, love: 7, health: 8 },  // 3月
            { career: 8, wealth: 9, love: 8, health: 7 },  // 4月
            { career: 6, wealth: 7, love: 9, health: 8 },  // 5月
            { career: 9, wealth: 8, love: 6, health: 9 },  // 6月
            { career: 7, wealth: 6, love: 8, health: 8 },  // 7月
            { career: 8, wealth: 9, love: 7, health: 7 },  // 8月
            { career: 9, wealth: 8, love: 9, health: 8 },  // 9月
            { career: 7, wealth: 7, love: 8, health: 9 },  // 10月
            { career: 8, wealth: 8, love: 7, health: 8 },  // 11月
            { career: 9, wealth: 9, love: 8, health: 7 }   // 12月
        ];

        for (let i = 1; i <= 12; i++) {
            const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
            const monthName = futureDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });

            const fortuneData = {
                month: monthName,
                ...fortunePatterns[(i - 1) % 12]
            };

            months.push(fortuneData);
        }

        return months;
    };

    const monthlyData = generateMonthlyFortune();

    const handleBack = () => {
        navigate(`/final-report/${orderId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center">
                <div className="text-white text-lg">加载中...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
            </div>

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between p-6 bg-slate-800/80 backdrop-blur-sm border-b border-slate-700">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-300 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="text-2xl">🔮</div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-100">运势预测报告</h1>
                            <p className="text-sm text-slate-400">订单号: {orderId} | 12个月运势预测</p>
                        </div>
                    </div>
                </div>

                {/* Current Time Display */}
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-sm text-slate-300">当前时间</p>
                        <p className="text-xs text-slate-500">{new Date().toLocaleDateString('zh-CN')}</p>
                    </div>
                    <div className="relative w-16 h-16">
                        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                            <defs>
                                <linearGradient id="fortune-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#A855F7" />
                                    <stop offset="100%" stopColor="#EC4899" />
                                </linearGradient>
                            </defs>
                            <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                                className="text-slate-700"
                            />
                            <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="url(#fortune-gradient)"
                                strokeWidth="4"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 28}`}
                                strokeDashoffset={`${2 * Math.PI * 28 * (1 - 85 / 100)}`}
                                className="transition-all duration-500"
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold text-slate-200">85</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 max-w-7xl mx-auto p-6">
                <div className={`transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>

                    {/* 概述卡片 */}
                    <div className="mb-8 p-6 bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-xl">
                        <h2 className="text-lg font-bold text-slate-100 mb-4">运势概述</h2>
                        <p className="text-slate-300 leading-relaxed mb-4">基于您的八字、紫微斗数、印度星盘三盘合参，为您预测未来12个月的运势走向。运势评分采用1-10分制，10分为最佳状态。</p>
                        <div className="text-sm text-slate-400">
                            <p>• 运势评分范围：1-10分（10分为最佳）</p>
                            <p>• 基于当前时间：{new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            <p>• 预测周期：未来12个月（不包含当前月份）</p>
                        </div>
                    </div>

                    {/* 四维说明 */}
                    <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg text-center">
                            <div className="text-2xl mb-2">💼</div>
                            <h3 className="font-bold text-slate-100 text-sm">事业运势</h3>
                            <p className="text-xs text-slate-400 mt-1">工作发展机遇</p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-lg text-center">
                            <div className="text-2xl mb-2">💰</div>
                            <h3 className="font-bold text-slate-100 text-sm">财运指数</h3>
                            <p className="text-xs text-slate-400 mt-1">财富积累潜力</p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/30 rounded-lg text-center">
                            <div className="text-2xl mb-2">💕</div>
                            <h3 className="font-bold text-slate-100 text-sm">感情运势</h3>
                            <p className="text-xs text-slate-400 mt-1">情感关系发展</p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg text-center">
                            <div className="text-2xl mb-2">🏃</div>
                            <h3 className="font-bold text-slate-100 text-sm">健康指数</h3>
                            <p className="text-xs text-slate-400 mt-1">身心健康状态</p>
                        </div>
                    </div>

                    {/* 12个月柱状图 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {monthlyData.map((monthData, index) => (
                            <div
                                key={index}
                                className="p-6 bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-xl transition-all duration-500 hover:scale-105"
                                style={{ transitionDelay: `${index * 100}ms` }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-slate-100">{monthData.month}</h3>
                                    <div className="text-right">
                                        <div className="text-xs text-slate-400">综合运势</div>
                                        <div className="text-lg font-bold text-slate-200">
                                            {
                                                (() => {
                                                    const scores = [monthData.career, monthData.wealth, monthData.love, monthData.health]
                                                        .map(x => {
                                                            const n = typeof x === 'number' ? x : (typeof x === 'string' ? parseFloat(x) : 0);
                                                            return isNaN(n) ? 0 : n;
                                                        });
                                                    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
                                                    return Math.round(avg * 10) / 10;
                                                })()
                                            }
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {/* 事业运势 */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm">💼</span>
                                            <span className="text-xs text-slate-300">事业</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-1000"
                                                    style={{ width: `${monthData.career * 10}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs text-slate-200 w-6">{monthData.career}</span>
                                        </div>
                                    </div>
                                    {/* 财运指数 */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm">💰</span>
                                            <span className="text-xs text-slate-300">财富</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-1000"
                                                    style={{ width: `${monthData.wealth * 10}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs text-slate-200 w-6">{monthData.wealth}</span>
                                        </div>
                                    </div>
                                    {/* 感情运势 */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm">💕</span>
                                            <span className="text-xs text-slate-300">感情</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-1000"
                                                    style={{ width: `${monthData.love * 10}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs text-slate-200 w-6">{monthData.love}</span>
                                        </div>
                                    </div>
                                    {/* 健康指数 */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm">🏃</span>
                                            <span className="text-xs text-slate-300">健康</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-1000"
                                                    style={{ width: `${monthData.health * 10}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs text-slate-200 w-6">{monthData.health}</span>
                                        </div>
                                    </div>
                                    {/* AI分析内容 */}
                                    {monthData.analysis && (
                                        <div className="mt-2 p-2 bg-slate-700/40 rounded text-xs text-slate-300 whitespace-pre-line">
                                            {monthData.analysis}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FortuneChartPage; 