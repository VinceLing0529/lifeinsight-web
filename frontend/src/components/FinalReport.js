import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, ArrowLeft } from 'lucide-react';

export default function FinalReport() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [moduleStatus, setModuleStatus] = useState({});
    const [generatingModule, setGeneratingModule] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [fakeProgress, setFakeProgress] = useState({});
    const fakeTimers = React.useRef({});
    const pollTimers = React.useRef({});

    useEffect(() => {
        loadModuleStatus();
        loadReportData();
    }, [orderId]);

    const loadModuleStatus = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/ai-report/module-status/${orderId}`);
            if (response.ok) {
                const statusData = await response.json();
                console.log('模块状态数据:', statusData);

                // 将后端状态格式转换为前端期望的格式
                const moduleProgress = {};
                if (statusData.modules) {
                    Object.keys(statusData.modules).forEach(moduleName => {
                        const moduleStatus = statusData.modules[moduleName];
                        moduleProgress[moduleName] = moduleStatus.progress || 0;
                    });
                }

                setModuleStatus(moduleProgress);
            }
        } catch (err) {
            console.error('加载模块状态失败:', err);
        }
    };

    const handleGenerateModule = async (moduleName) => {
        setGeneratingModule(moduleName);
        setFakeProgress(prev => ({ ...prev, [moduleName]: 0 }));
        let progress = 0;
        // 前端动画定时器
        fakeTimers.current[moduleName] = setInterval(() => {
            progress += 10;
            if (progress > 90) progress = 90;
            setFakeProgress(prev => ({ ...prev, [moduleName]: progress }));
        }, 1000);
        // 后端轮询定时器
        pollTimers.current[moduleName] = setInterval(async () => {
            const resp = await fetch(`http://localhost:8000/api/ai-report/module-status/${orderId}`);
            if (resp.ok) {
                const statusData = await resp.json();
                const backendProgress = statusData.modules?.[moduleName]?.progress || 0;
                if (backendProgress >= 100) {
                    clearInterval(fakeTimers.current[moduleName]);
                    clearInterval(pollTimers.current[moduleName]);
                    setFakeProgress(prev => ({ ...prev, [moduleName]: 100 }));
                    setGeneratingModule(null);
                    loadModuleStatus();
                }
            }
        }, 1000);
        // 实际请求后端
        try {
            await fetch(`http://localhost:8000/api/ai-report/generate-module`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: orderId, module: moduleName })
            });
        } catch (err) {
            setError('生成模块失败');
        }
    };

    const loadReportData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:8000/api/ai-report/report/${orderId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('报告不存在，请检查订单号');
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }

            const data = await response.json();
            console.log('加载的报告数据:', data);

            // 将后端数据结构映射到前端期望的格式
            const mappedData = {
                sections: data.sections || [],
                order_id: data.order_id,
                generated_at: data.generated_at
            };

            setReportData(mappedData);
        } catch (err) {
            console.error('加载报告失败:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/');
    };

    const handleCardClick = (section) => {
        // 导航到独立的页面
        switch (section.id) {
            case 'mindmap':
                navigate(`/final-report/${orderId}/interactive-mind-map`);
                break;
            case 'fortune':
                navigate(`/final-report/${orderId}/fortune-chart`);
                break;
            case 'qa':
                navigate(`/final-report/${orderId}/qa`);
                break;
            case 'analysis':
                navigate(`/final-report/${orderId}/analysis`);
                break;
            default:
                console.log('未知的section:', section.id);
        }
    };

    const getStatusIcon = (progress) => {
        if (progress >= 100) {
            return <CheckCircle className="w-5 h-5 text-green-400" />;
        } else if (progress > 0) {
            return <Clock className="w-5 h-5 text-blue-400 animate-spin" />;
        } else {
            return <Clock className="w-5 h-5 text-slate-400" />;
        }
    };

    const getStatusText = (progress) => {
        if (progress >= 100) return "生成完成";
        if (progress > 0) return "内容生成中...";
        return "等待生成";
    };

    // 固定的示例数据，直接使用ExamplePage的内容
    const reportSections = [
        {
            id: "analysis",
            title: "优劣混合分析",
            description: "结合三盘找出您的优势与劣势，深度剖析命理结构。",
            icon: "📊",
            gradient: "from-blue-500 to-cyan-500",
            bgGradient: "from-blue-500/10 to-cyan-500/10",
            borderGradient: "from-blue-500/50 to-cyan-500/50"
        },
        {
            id: "mindmap",
            title: "思维导图呈现",
            description: "用思维导图方式呈现命理构造与人生主线。",
            icon: "⭐",
            gradient: "from-amber-500 to-orange-500",
            bgGradient: "from-amber-500/10 to-orange-500/10",
            borderGradient: "from-amber-500/50 to-orange-500/50"
        },
        {
            id: "fortune",
            title: "运势预测报告",
            description: "基于当前时间未来12个月运势详细预测，助您把握人生机遇。",
            icon: "🔮",
            gradient: "from-purple-500 to-pink-500",
            bgGradient: "from-purple-500/10 to-pink-500/10",
            borderGradient: "from-purple-500/50 to-pink-500/50"
        },
        {
            id: "qa",
            title: "个性化建议",
            description: "五维30个核心问题深度解答，点击问题查看专属答案。",
            icon: "💡",
            gradient: "from-emerald-500 to-teal-500",
            bgGradient: "from-emerald-500/10 to-teal-500/10",
            borderGradient: "from-emerald-500/50 to-teal-500/50"
        }
    ];

    // 加载状态
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center">
                <div className="text-center">
                    <Clock className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
                    <p className="text-slate-300">正在加载报告...</p>
                </div>
            </div>
        );
    }

    // 错误状态
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button
                        onClick={handleBack}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        返回首页
                    </button>
                </div>
            </div>
        );
    }

    // 主页面 - 使用ExamplePage的完整样式
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>

                {/* Floating particles */}
                <div className="absolute top-1/4 left-1/6 w-2 h-2 bg-blue-400 rounded-full animate-pulse opacity-60"></div>
                <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-purple-400 rounded-full animate-ping opacity-40"></div>
                <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse opacity-50"></div>
            </div>

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between p-6 bg-slate-800/80 backdrop-blur-sm border-b border-slate-700">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-300" />
                    </button>
                    <div>
                        <h1 className="text-xl font-semibold text-white">AI命理分析报告</h1>
                        <p className="text-slate-400 text-sm">订单号: {orderId}</p>
                    </div>
                </div>

                {/* Overall Progress */}
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-sm text-slate-400">整体进度</p>
                        <p className="text-lg font-semibold text-white">
                            {Math.round(Object.values(moduleStatus).reduce((sum, val) => sum + (val || 0), 0) / 4)}%
                        </p>
                    </div>
                    <div className="w-24 bg-slate-700 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                            style={{
                                width: `${Object.values(moduleStatus).reduce((sum, val) => sum + (val || 0), 0) / 4}%`
                            }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 max-w-6xl mx-auto p-6">
                <div className={`transition-all duration-500 opacity-100 translate-y-0`}>
                    {/* Welcome Section */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-4">欢迎查看您的专属命理报告</h2>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                            基于您的出生信息，我们为您准备了四个维度的深度分析。每个模块都可以独立生成，让您逐步了解自己的命理特点。
                        </p>
                    </div>

                    {/* Report Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {reportSections.map((section) => {
                            const progress = Math.max(fakeProgress[section.id] || 0, moduleStatus[section.id] || 0);
                            const isGenerating = generatingModule === section.id;

                            return (
                                <div
                                    key={section.id}
                                    className={`relative group cursor-pointer transition-all duration-300 transform hover:scale-105 ${progress >= 100 ? 'hover:shadow-2xl' : ''
                                        }`}
                                    onClick={() => progress >= 100 && handleCardClick(section)}
                                >
                                    {/* Card Background */}
                                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${section.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

                                    {/* Card Content */}
                                    <div className={`relative rounded-2xl p-6 border transition-all duration-300 ${progress >= 100
                                        ? `border-gradient-to-r ${section.borderGradient} bg-slate-800/80 backdrop-blur-sm`
                                        : 'border-slate-700/50 bg-slate-800/50'
                                        }`}>
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{section.icon}</span>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-white">{section.title}</h3>
                                                    <p className="text-slate-400 text-sm">{section.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(progress)}
                                                <span className="text-xs text-slate-400">{getStatusText(progress)}</span>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-slate-400">生成进度</span>
                                                <span className="text-sm text-white">{progress}%</span>
                                            </div>
                                            <div className="w-full bg-slate-700 rounded-full h-2">
                                                <div
                                                    className={`bg-gradient-to-r ${section.gradient} h-2 rounded-full transition-all duration-500`}
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        {progress < 100 ? (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleGenerateModule(section.id);
                                                }}
                                                disabled={isGenerating}
                                                className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 ${isGenerating
                                                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                                                    : `bg-gradient-to-r ${section.gradient} text-white hover:shadow-lg hover:scale-105`
                                                    }`}
                                            >
                                                {isGenerating ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Clock className="w-4 h-4 animate-spin" />
                                                        生成中...
                                                    </div>
                                                ) : (
                                                    '生成报告'
                                                )}
                                            </button>
                                        ) : (
                                            <div className="flex items-center justify-center gap-2 text-green-400 text-sm">
                                                <CheckCircle className="w-4 h-4" />
                                                点击查看详细报告
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Additional Info */}
                    <div className="text-center text-slate-400 text-sm">
                        <p>每个模块生成完成后，点击卡片即可查看详细分析内容</p>
                    </div>
                </div>
            </div>
        </div>
    );
} 