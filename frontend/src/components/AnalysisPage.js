import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

const AnalysisPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('talents');
    const [aiData, setAiData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setIsVisible(true);
        fetchAnalysisData();
    }, [orderId]);

    const fetchAnalysisData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/ai-report/module-data/${orderId}/analysis`);
            if (response.ok) {
                const data = await response.json();
                // 处理AI返回的JSON内容，去除可能的代码块标记
                let content = data.content;
                if (content.includes('```json')) {
                    content = content.replace(/```json\n/, '').replace(/\n```/, '');
                }
                const parsedContent = JSON.parse(content);
                setAiData(parsedContent);
            } else {
                console.error('Failed to fetch analysis data');
            }
        } catch (error) {
            console.error('Error fetching analysis data:', error);
        } finally {
            setLoading(false);
        }
    };

    const section = {
        id: "analysis",
        title: "优劣混合分析",
        description: "四维深度分析您的天赋优势、内心张力、命盘盲区和成长引导。",
        icon: "📊",
        gradient: "from-blue-500 to-cyan-500",
        bgGradient: "from-blue-500/10 to-cyan-500/10",
        borderGradient: "from-blue-500/50 to-cyan-500/50",
        score: 88,
        summary: aiData?.summary?.overview || "您的命盘显示天赋与挑战并存，通过深入了解这四个维度，可以更好地发挥优势，规避风险，实现人生目标。",
        tabSections: [
            {
                id: "talents",
                title: "天赋优势",
                icon: "🌟",
                bgGradient: "from-amber-500/10 to-yellow-500/10",
                content: aiData?.talents?.overview || "您具备卓越的分析思维能力和逻辑推理天赋。在数据处理、问题解决、战略规划等方面表现出色。您的学习能力极强，能够快速掌握新知识和技能。沟通表达清晰准确，善于说服他人。在团队中容易成为核心人物，具备天生的领导气质。您的创造力和创新思维也很突出，能够提出独特的见解和解决方案。"
            },
            {
                id: "tensions",
                title: "内心张力",
                icon: "⚖️",
                bgGradient: "from-orange-500/10 to-red-500/10",
                content: aiData?.tensions?.overview || "您的内在存在理性与感性的深刻冲突。一方面追求逻辑完美和系统化思维，另一方面又渴望情感连接和直觉判断。在决策时经常在深思熟虑和快速行动之间摇摆。您既希望独立自主，又需要他人的认可和支持。对完美的追求与现实的妥协之间也存在张力。这些内在矛盾既是挑战，也是您独特魅力的来源。"
            },
            {
                id: "blindspots",
                title: "命盘盲区",
                icon: "👁️",
                bgGradient: "from-purple-500/10 to-indigo-500/10",
                content: aiData?.blindspots?.overview || "您可能过于依赖理性分析，忽视了情感因素和人际关系的重要性。在压力下容易变得固执己见，难以接受不同观点。对细节的过度关注可能导致失去全局视野。在人际交往中可能显得过于直接，缺乏必要的委婉。您可能低估了直觉和灵感的价值，过分依赖逻辑推理。这些盲区需要通过自我觉察和他人反馈来逐步改善。"
            },
            {
                id: "guidance",
                title: "成长引导",
                icon: "🌱",
                bgGradient: "from-green-500/10 to-teal-500/10",
                content: aiData?.guidance?.overview || "建议您学会在理性与感性之间找到平衡，既保持逻辑思维的清晰，又重视情感体验的丰富。培养更强的同理心和倾听能力，在人际交往中更加圆融。学会适度放松对完美的追求，接受不完美的现实。多关注自己的身心健康，避免过度工作。培养多元化的兴趣爱好，丰富精神世界。定期进行自我反思和总结，持续提升个人成长。"
            }
        ]
    };

    const activeSection = section.tabSections.find(tab => tab.id === activeTab);

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
                <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
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
                        <div className="text-2xl">{section.icon}</div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-100">{section.title}</h1>
                            <p className="text-sm text-slate-400">订单号: {orderId} | 四维分析</p>
                        </div>
                    </div>
                </div>

                {/* Score Circle */}
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-sm text-slate-300">评分</p>
                        <p className="text-xs text-slate-500">{section.score}分</p>
                    </div>
                    <div className="relative w-16 h-16">
                        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                            <defs>
                                <linearGradient id={`analysis-gradient`} x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#3B82F6" />
                                    <stop offset="100%" stopColor="#06B6D4" />
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
                                stroke={`url(#analysis-gradient)`}
                                strokeWidth="4"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 28}`}
                                strokeDashoffset={`${2 * Math.PI * 28 * (1 - section.score / 100)}`}
                                className="transition-all duration-500"
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold text-slate-200">{section.score}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 max-w-6xl mx-auto p-6">
                <div className={`transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>

                    {/* 分页导航 */}
                    <div className="mb-8 p-6 bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-xl">
                        <h2 className="text-lg font-bold text-slate-100 mb-6 text-center">四维分析导航</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {section.tabSections.map((tab, index) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`p-4 rounded-lg border transition-all duration-300 ${activeTab === tab.id
                                        ? `bg-gradient-to-br ${tab.bgGradient} border-slate-500 ring-2 ring-slate-400`
                                        : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'
                                        }`}
                                >
                                    <div className="text-center">
                                        <div className="text-2xl mb-2">{tab.icon}</div>
                                        <h3 className="font-medium text-slate-100 text-sm">{tab.title}</h3>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 当前分页内容 */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* 左侧：概述内容 */}
                        <div className="space-y-6">
                            <div className={`p-6 bg-gradient-to-br ${activeSection.bgGradient} backdrop-blur-sm border border-slate-600/30 rounded-xl`}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="text-3xl">{activeSection.icon}</div>
                                    <h3 className="text-xl font-bold text-slate-100">{activeSection.title}</h3>
                                </div>
                                <p className="text-slate-200 leading-relaxed">{activeSection.content}</p>
                            </div>
                        </div>

                        {/* 右侧：阶段式成长建议卡片 */}
                        <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                            <h4 className="text-lg font-bold text-slate-100 mb-6 text-center">{activeSection.title} · 四阶段建议</h4>

                            <div className="space-y-4">
                                {activeSection.id === 'talents' && (
                                    <>
                                        {/* 天赋优势 - 第一阶段 */}
                                        <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30 rounded-lg p-4 transition-all duration-300 hover:scale-[1.02]">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                                                <h5 className="font-bold text-slate-100">第一阶段｜认识天赋</h5>
                                            </div>
                                            <p className="text-sm text-slate-300 leading-relaxed">通过测试、反馈和自我观察，明确自己的核心优势领域。</p>
                                        </div>

                                        {/* 天赋优势 - 第二阶段 */}
                                        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg p-4 transition-all duration-300 hover:scale-[1.02]">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                                                <h5 className="font-bold text-slate-100">第二阶段｜刻意练习</h5>
                                            </div>
                                            <p className="text-sm text-slate-300 leading-relaxed">在优势领域进行有针对性的深度练习，将天赋转化为技能。</p>
                                        </div>

                                        {/* 天赋优势 - 第三阶段 */}
                                        <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/30 rounded-lg p-4 transition-all duration-300 hover:scale-[1.02]">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                                                <h5 className="font-bold text-slate-100">第三阶段｜整合应用</h5>
                                            </div>
                                            <p className="text-sm text-slate-300 leading-relaxed">将多项天赋优势组合运用，创造独特的个人竞争力。</p>
                                        </div>

                                        {/* 天赋优势 - 第四阶段 */}
                                        <div className="bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/30 rounded-lg p-4 transition-all duration-300 hover:scale-[1.02]">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm">4</div>
                                                <h5 className="font-bold text-slate-100">第四阶段｜价值创造</h5>
                                            </div>
                                            <p className="text-sm text-slate-300 leading-relaxed">运用天赋为他人和社会创造价值，实现个人价值最大化。</p>
                                        </div>
                                    </>
                                )}

                                {activeSection.id === 'tensions' && (
                                    <>
                                        {/* 内心张力 - 第一阶段 */}
                                        <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30 rounded-lg p-4 transition-all duration-300 hover:scale-[1.02]">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                                                <h5 className="font-bold text-slate-100">第一阶段｜识别张力</h5>
                                            </div>
                                            <p className="text-sm text-slate-300 leading-relaxed">觉察内心冲突的具体表现，记录触发情境和情绪反应。</p>
                                        </div>

                                        {/* 内心张力 - 第二阶段 */}
                                        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg p-4 transition-all duration-300 hover:scale-[1.02]">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                                                <h5 className="font-bold text-slate-100">第二阶段｜理解根源</h5>
                                            </div>
                                            <p className="text-sm text-slate-300 leading-relaxed">探索张力背后的深层需求和价值观冲突，理解其形成原因。</p>
                                        </div>

                                        {/* 内心张力 - 第三阶段 */}
                                        <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/30 rounded-lg p-4 transition-all duration-300 hover:scale-[1.02]">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                                                <h5 className="font-bold text-slate-100">第三阶段｜寻找平衡</h5>
                                            </div>
                                            <p className="text-sm text-slate-300 leading-relaxed">学习在对立面之间找到动态平衡，接受矛盾的存在。</p>
                                        </div>

                                        {/* 内心张力 - 第四阶段 */}
                                        <div className="bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/30 rounded-lg p-4 transition-all duration-300 hover:scale-[1.02]">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm">4</div>
                                                <h5 className="font-bold text-slate-100">第四阶段｜转化力量</h5>
                                            </div>
                                            <p className="text-sm text-slate-300 leading-relaxed">将内心张力转化为创造力和行动力的源泉。</p>
                                        </div>
                                    </>
                                )}

                                {activeSection.id === 'blindspots' && (
                                    <>
                                        {/* 命盘盲区 - 第一阶段 */}
                                        <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30 rounded-lg p-4 transition-all duration-300 hover:scale-[1.02]">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                                                <h5 className="font-bold text-slate-100">第一阶段｜承认盲区</h5>
                                            </div>
                                            <p className="text-sm text-slate-300 leading-relaxed">勇敢面对自己的不足，接受他人的反馈和建议。</p>
                                        </div>

                                        {/* 命盘盲区 - 第二阶段 */}
                                        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg p-4 transition-all duration-300 hover:scale-[1.02]">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                                                <h5 className="font-bold text-slate-100">第二阶段｜寻求帮助</h5>
                                            </div>
                                            <p className="text-sm text-slate-300 leading-relaxed">主动寻找导师、朋友或专业人士的指导和支持。</p>
                                        </div>

                                        {/* 命盘盲区 - 第三阶段 */}
                                        <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/30 rounded-lg p-4 transition-all duration-300 hover:scale-[1.02]">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                                                <h5 className="font-bold text-slate-100">第三阶段｜刻意补强</h5>
                                            </div>
                                            <p className="text-sm text-slate-300 leading-relaxed">针对关键盲区进行有计划的学习和练习。</p>
                                        </div>

                                        {/* 命盘盲区 - 第四阶段 */}
                                        <div className="bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/30 rounded-lg p-4 transition-all duration-300 hover:scale-[1.02]">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm">4</div>
                                                <h5 className="font-bold text-slate-100">第四阶段｜建立系统</h5>
                                            </div>
                                            <p className="text-sm text-slate-300 leading-relaxed">建立长期的反馈和监督机制，持续改进薄弱环节。</p>
                                        </div>
                                    </>
                                )}

                                {activeSection.id === 'guidance' && (
                                    <>
                                        {/* 成长引导 - 第一阶段 */}
                                        <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30 rounded-lg p-4 transition-all duration-300 hover:scale-[1.02]">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                                                <h5 className="font-bold text-slate-100">第一阶段｜看清自己</h5>
                                            </div>
                                            <p className="text-sm text-slate-300 leading-relaxed">通过深度自我反思，明确自己的价值观和人生目标。</p>
                                        </div>

                                        {/* 成长引导 - 第二阶段 */}
                                        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg p-4 transition-all duration-300 hover:scale-[1.02]">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                                                <h5 className="font-bold text-slate-100">第二阶段｜制定计划</h5>
                                            </div>
                                            <p className="text-sm text-slate-300 leading-relaxed">基于自我认知，制定具体的成长计划和行动步骤。</p>
                                        </div>

                                        {/* 成长引导 - 第三阶段 */}
                                        <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/30 rounded-lg p-4 transition-all duration-300 hover:scale-[1.02]">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                                                <h5 className="font-bold text-slate-100">第三阶段｜持续行动</h5>
                                            </div>
                                            <p className="text-sm text-slate-300 leading-relaxed">坚持执行成长计划，在行动中不断调整和优化。</p>
                                        </div>

                                        {/* 成长引导 - 第四阶段 */}
                                        <div className="bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/30 rounded-lg p-4 transition-all duration-300 hover:scale-[1.02]">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm">4</div>
                                                <h5 className="font-bold text-slate-100">第四阶段｜形成习惯</h5>
                                            </div>
                                            <p className="text-sm text-slate-300 leading-relaxed">将成长行为内化为习惯，实现持续的个人发展。</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 总结卡片 */}
                <div className="mt-8 p-6 bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm border border-slate-600 rounded-xl">
                    <h2 className="text-lg font-bold text-slate-100 mb-4">综合分析总结</h2>
                    <div className={`p-4 rounded-lg bg-gradient-to-br ${section.gradient}/10 border border-slate-600/30`}>
                        <p className="text-slate-300 leading-relaxed">{section.summary}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalysisPage; 