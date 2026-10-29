import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

const InteractiveMindMapPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);
    const [selectedNode, setSelectedNode] = useState(null);
    const [aiData, setAiData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setIsVisible(true);
        fetchMindMapData();
    }, [orderId]);

    const fetchMindMapData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/ai-report/module-data/${orderId}/mindmap`);
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
                console.error('Failed to fetch mindmap data');
            }
        } catch (error) {
            console.error('Error fetching mindmap data:', error);
        } finally {
            setLoading(false);
        }
    };

    const mindMapData = {
        center: {
            title: "命主性格全景图",
            description: "基于八字、紫微斗数、印度星盘三盘合参的性格分析"
        },
        branches: [
            {
                id: "positive",
                title: "正向性格特征",
                icon: "✨",
                color: "from-green-500 to-emerald-500",
                bgColor: "from-green-500/10 to-emerald-500/10",
                source: "八字用神、紫微命主星、印度上升星与吉相",
                content: aiData?.positive_traits?.overview || "您具备优秀的稳定性，能在变化中保持内心平静。创造力丰富，善于在工作中提出新想法。意志力坚定，一旦确定目标就会坚持到底。沟通能力强，能准确表达自己的观点并理解他人。智慧深邃，善于透过现象看本质。同理心强，能设身处地为他人着想。",
                details: aiData?.positive_traits?.details?.map(detail => ({
                    title: detail.title,
                    description: detail.description
                })) || [
                        { title: "稳定性", description: "情绪平稳，不易受外界干扰" },
                        { title: "创造力", description: "思维活跃，富有想象力" },
                        { title: "意志力", description: "目标明确，执行力强" },
                        { title: "沟通力", description: "表达清晰，倾听有效" },
                        { title: "智慧", description: "洞察力强，分析能力佳" },
                        { title: "同理心", description: "善解人意，人际和谐" }
                    ]
            },
            {
                id: "negative",
                title: "负向性格倾向",
                icon: "⚠️",
                color: "from-red-500 to-pink-500",
                bgColor: "from-red-500/10 to-pink-500/10",
                source: "八字忌神、紫微四化忌星、印度凶相、劫煞",
                content: aiData?.negative_tendencies?.overview || "偶尔会出现冲动行为，特别是在压力较大时。面对重要决策时可能犹豫不决，反复权衡得失。情绪起伏相对明显，容易受环境影响。遇到困难时有逃避倾向，不愿正面解决问题。对某些观念容易产生执念，难以改变既定想法。有时会过度相信他人，缺乏必要的防范。",
                details: aiData?.negative_tendencies?.details?.map(detail => ({
                    title: detail.title,
                    description: detail.description
                })) || [
                        { title: "冲动", description: "压力下易做出草率决定" },
                        { title: "犹豫", description: "重大选择时摇摆不定" },
                        { title: "情绪起伏", description: "容易受外界情绪感染" },
                        { title: "逃避", description: "困难面前倾向于回避" },
                        { title: "执念", description: "固执己见，难以变通" },
                        { title: "盲信", description: "过度信任，缺乏防范" }
                    ]
            },
            {
                id: "conflict",
                title: "潜在冲突性格",
                icon: "⚖️",
                color: "from-orange-500 to-yellow-500",
                bgColor: "from-orange-500/10 to-yellow-500/10",
                source: "三盘中出现性格张力的点（理性 vs 感性、行动 vs 被动）",
                content: aiData?.conflicting_aspects?.overview || "您的内在存在理性与感性的平衡点，有时会在逻辑分析与直觉判断之间摇摆。行动力与深思熟虑之间也存在张力，既想快速执行又希望充分考虑。这种内在矛盾让您在决策时需要更多时间，但也让您的选择更加全面和慎重。",
                details: aiData?.conflicting_aspects?.details?.map(detail => ({
                    title: detail.title,
                    description: detail.description
                })) || [
                        { title: "理性vs感性", description: "逻辑与直觉的内在冲突" },
                        { title: "行动vs思考", description: "执行与规划的时机把握" },
                        { title: "独立vs依赖", description: "自主与寻求支持的平衡" },
                        { title: "完美vs效率", description: "追求完美与时间效率的权衡" }
                    ]
            },
            {
                id: "strength",
                title: "易发展的领域",
                icon: "🚀",
                color: "from-blue-500 to-cyan-500",
                bgColor: "from-blue-500/10 to-cyan-500/10",
                source: "格局、宫位、行运加持区域",
                content: aiData?.strength_areas?.overview || "您在管理类、咨询类、教育类行业容易获得成功，这些领域能充分发挥您的分析能力和沟通优势。人际风格以稳重可靠见长，容易获得他人信任。在需要深度思考和系统规划的工作中表现出色，能够统筹全局，很少出现重大失误。",
                details: aiData?.strength_areas?.details?.map(detail => ({
                    title: detail.title,
                    description: detail.description
                })) || [
                        { title: "适合行业", description: "管理、咨询、教育、分析" },
                        { title: "人际风格", description: "稳重可靠，值得信赖" },
                        { title: "表达方式", description: "逻辑清晰，条理分明" },
                        { title: "工作特长", description: "系统规划，全局统筹" }
                    ]
            },
            {
                id: "weakness",
                title: "易出问题的领域",
                icon: "⚡",
                color: "from-purple-500 to-violet-500",
                bgColor: "from-purple-500/10 to-violet-500/10",
                source: "弱宫位、凶星汇聚区、负向行运叠加点",
                content: aiData?.weakness_areas?.overview || "在快节奏、高压力的环境中容易出现状况，需要注意工作与生活的平衡。感情方面要避免过度理性，多表达情感关怀。健康方面需要关注因工作压力导致的肠胃问题。财务管理上要避免过于保守，错失投资机会。",
                details: aiData?.weakness_areas?.details?.map(detail => ({
                    title: detail.title,
                    description: detail.description
                })) || [
                        { title: "感情破裂点", description: "过度理性，缺乏情感表达" },
                        { title: "人际失衡点", description: "完美主义导致的人际疏远" },
                        { title: "健康压力点", description: "工作压力影响肠胃健康" },
                        { title: "资源耗损点", description: "过于保守的财务策略" }
                    ]
            }
        ]
    };

    const handleNodeClick = (node) => {
        setSelectedNode(selectedNode?.id === node.id ? null : node);
    };

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
                        <div className="text-2xl">⭐</div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-100">交互式思维导图</h1>
                            <p className="text-sm text-slate-400">订单号: {orderId} | 性格全景分析</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 max-w-7xl mx-auto p-6">
                <div className={`transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>

                    {/* 思维导图可视化区域 */}
                    <div className="mb-8 p-4 md:p-8 bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-xl">
                        <h2 className="text-lg font-bold text-slate-100 mb-6 text-center">🧠 互动式性格思维导图</h2>

                        {/* 桌面端：五角星排列 */}
                        <div className="hidden md:block">
                            <div className="relative w-full h-[600px]">
                                {/* 连接线 */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                    {mindMapData.branches.map((_, index) => {
                                        // 中心点位置（屏幕中央）
                                        const centerX = 50;
                                        const centerY = 50;

                                        // 五角星顶点计算（从顶部开始，顺时针分布）
                                        const angle = (index * 72 - 90) * (Math.PI / 180); // 五个点，每个72度间隔，从顶部开始
                                        const radius = 35; // 半径增大，增加间距
                                        const targetX = centerX + radius * Math.cos(angle);
                                        const targetY = centerY + radius * Math.sin(angle);

                                        return (
                                            <line
                                                key={index}
                                                x1={`${centerX}%`}
                                                y1={`${centerY}%`}
                                                x2={`${targetX}%`}
                                                y2={`${targetY}%`}
                                                stroke="#64748b"
                                                strokeWidth="3"
                                                strokeDasharray="10,8"
                                                className="opacity-70"
                                            />
                                        );
                                    })}
                                </svg>

                                {/* 中心节点 */}
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                                    <div className="w-64 h-40 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-amber-500/50 rounded-xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300 shadow-lg backdrop-blur-sm">
                                        <div className="text-center">
                                            <div className="text-4xl mb-2">🎯</div>
                                            <h3 className="font-bold text-slate-100 text-xl">{mindMapData.center.title}</h3>
                                            <p className="text-xs text-slate-400 mt-2">{mindMapData.center.description}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* 五大分支节点 - 五角星排列 */}
                                {mindMapData.branches.map((branch, index) => {
                                    // 五角星顶点计算（从顶部开始，顺时针分布）
                                    const angle = (index * 72 - 90) * (Math.PI / 180); // 五个点，每个72度间隔
                                    const radius = 35; // 半径增大
                                    const x = 50 + radius * Math.cos(angle);
                                    const y = 50 + radius * Math.sin(angle);

                                    return (
                                        <div
                                            key={branch.id}
                                            className={`absolute w-52 p-4 bg-gradient-to-br ${branch.bgColor} border border-slate-600/50 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 z-10 backdrop-blur-sm shadow-lg ${selectedNode?.id === branch.id ? 'ring-2 ring-amber-500 scale-105' : ''}`}
                                            style={{
                                                top: `${y}%`,
                                                left: `${x}%`,
                                                transform: 'translate(-50%, -50%)'
                                            }}
                                            onClick={() => handleNodeClick(branch)}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="text-2xl">{branch.icon}</div>
                                                <h3 className="font-bold text-slate-100 text-sm">{branch.title}</h3>
                                            </div>
                                            <div className={`w-full h-1.5 bg-gradient-to-r ${branch.color} rounded-full mb-2`}></div>
                                            <p className="text-xs text-slate-300">点击查看详细分析</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 手机端：优化五角星布局 */}
                        <div className="md:hidden">
                            <div className="relative w-full h-[600px]">
                                {/* 连接线 */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                    {mindMapData.branches.map((_, index) => {
                                        // 中心点位置（屏幕中央）
                                        const centerX = 50;
                                        const centerY = 50;

                                        // 五角星顶点计算（从顶部开始，顺时针分布）
                                        const angle = (index * 72 - 90) * (Math.PI / 180); // 五个点，每个72度间隔，从顶部开始
                                        const radius = 38; // 增大半径避免重叠
                                        const targetX = centerX + radius * Math.cos(angle);
                                        const targetY = centerY + radius * Math.sin(angle);

                                        return (
                                            <line
                                                key={index}
                                                x1={`${centerX}%`}
                                                y1={`${centerY}%`}
                                                x2={`${targetX}%`}
                                                y2={`${targetY}%`}
                                                stroke="#64748b"
                                                strokeWidth="2"
                                                strokeDasharray="8,6"
                                                className="opacity-60"
                                            />
                                        );
                                    })}
                                </svg>

                                {/* 中心节点 */}
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                                    <div className="w-48 h-32 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-amber-500/50 rounded-xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300 shadow-lg backdrop-blur-sm">
                                        <div className="text-center">
                                            <div className="text-3xl mb-1">🎯</div>
                                            <h3 className="font-bold text-slate-100 text-lg">{mindMapData.center.title}</h3>
                                            <p className="text-xs text-slate-400 mt-1">{mindMapData.center.description}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* 五大分支节点 - 手机端优化 */}
                                {mindMapData.branches.map((branch, index) => {
                                    // 五角星顶点计算（从顶部开始，顺时针分布）
                                    const angle = (index * 72 - 90) * (Math.PI / 180); // 五个点，每个72度间隔
                                    const radius = 38; // 增大半径
                                    const x = 50 + radius * Math.cos(angle);
                                    const y = 50 + radius * Math.sin(angle);

                                    return (
                                        <div
                                            key={branch.id}
                                            className={`absolute w-40 p-3 bg-gradient-to-br ${branch.bgColor} border border-slate-600/50 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 z-10 backdrop-blur-sm shadow-lg ${selectedNode?.id === branch.id ? 'ring-2 ring-amber-500 scale-105' : ''}`}
                                            style={{
                                                top: `${y}%`,
                                                left: `${x}%`,
                                                transform: 'translate(-50%, -50%)'
                                            }}
                                            onClick={() => handleNodeClick(branch)}
                                        >
                                            <div className="flex items-center gap-1 mb-1">
                                                <div className="text-xl">{branch.icon}</div>
                                                <h3 className="font-bold text-slate-100 text-xs">{branch.title}</h3>
                                            </div>
                                            <div className={`w-full h-1 bg-gradient-to-r ${branch.color} rounded-full mb-1`}></div>
                                            <p className="text-xs text-slate-300">点击查看</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 使用说明 */}
                        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="text-blue-400">💡</div>
                                <span className="text-sm font-medium text-blue-300">使用说明</span>
                            </div>
                            <p className="text-xs text-blue-200">点击任意分支节点查看详细分析内容，再次点击可关闭。中心节点展示您的整体性格框架。</p>
                            <div className="mt-2 text-xs text-blue-300">
                                <p><strong>数据来源：</strong></p>
                                <p>• 正向性格特征：八字用神、紫微命主星、印度上升星与吉相</p>
                                <p>• 负向性格倾向：八字忌神、紫微四化忌星、印度凶相、劫煞</p>
                                <p>• 潜在冲突性格：三盘中出现性格张力的点（理性 vs 感性、行动 vs 被动）</p>
                                <p>• 易发展的领域：格局、宫位、行运加持区域</p>
                                <p>• 易出问题的领域：弱宫位、凶星汇聚区、负向行运叠加点</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 悬浮窗详细内容展示 */}
            {selectedNode && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4">
                    <div className="bg-slate-800/95 backdrop-blur-sm border border-slate-600 rounded-xl max-w-4xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
                        {/* 悬浮窗头部 */}
                        <div className="sticky top-0 bg-slate-800/95 backdrop-blur-sm border-b border-slate-600 p-4 md:p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl md:text-3xl">{selectedNode.icon}</div>
                                    <h3 className="text-lg md:text-2xl font-bold text-slate-100">{selectedNode.title}</h3>
                                </div>
                                <button
                                    onClick={() => setSelectedNode(null)}
                                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* 悬浮窗内容 */}
                        <div className="p-4 md:p-6">
                            {/* 概述部分 */}
                            <div className={`p-4 md:p-6 rounded-xl bg-gradient-to-br ${selectedNode.bgColor} border border-slate-600/30 mb-6`}>
                                <h4 className="text-base md:text-lg font-bold text-slate-100 mb-4">性格特征概述</h4>
                                <p className="text-slate-200 leading-relaxed text-sm md:text-base">{selectedNode.content}</p>
                            </div>

                            {/* 桌面端：二级思维导图 */}
                            <div className="hidden md:block bg-slate-700/50 backdrop-blur-sm border border-slate-600 rounded-xl p-6">
                                <h4 className="text-lg font-bold text-slate-100 mb-6 text-center">具体表现思维导图</h4>

                                <div className="relative w-full h-80">
                                    {/* 连接线 */}
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                        {selectedNode.details.map((_, index) => {
                                            const centerX = 50;
                                            const centerY = 50;
                                            const angleStep = 360 / selectedNode.details.length;
                                            const angle = (index * angleStep - 90) * (Math.PI / 180);
                                            const radius = 30;
                                            const targetX = centerX + radius * Math.cos(angle);
                                            const targetY = centerY + radius * Math.sin(angle);

                                            return (
                                                <line
                                                    key={index}
                                                    x1={`${centerX}%`}
                                                    y1={`${centerY}%`}
                                                    x2={`${targetX}%`}
                                                    y2={`${targetY}%`}
                                                    stroke="#64748b"
                                                    strokeWidth="2"
                                                    strokeDasharray="6,4"
                                                    className="opacity-60"
                                                />
                                            );
                                        })}
                                    </svg>

                                    {/* 中心节点 */}
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                                        <div className={`w-32 h-20 bg-gradient-to-br ${selectedNode.color}/20 border-2 border-slate-500 rounded-lg flex items-center justify-center shadow-lg backdrop-blur-sm`}>
                                            <div className="text-center">
                                                <div className="text-xl mb-1">{selectedNode.icon}</div>
                                                <p className="text-xs font-medium text-slate-200">具体表现</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 分支节点 */}
                                    {selectedNode.details.map((detail, index) => {
                                        const angleStep = 360 / selectedNode.details.length;
                                        const angle = (index * angleStep - 90) * (Math.PI / 180);
                                        const radius = 30;
                                        const x = 50 + radius * Math.cos(angle);
                                        const y = 50 + radius * Math.sin(angle);

                                        // 从详细文本中提取关键词作为标题
                                        const title = detail.title;
                                        const description = detail.description;

                                        return (
                                            <div
                                                key={index}
                                                className={`absolute bg-gradient-to-br ${selectedNode.bgColor} backdrop-blur-sm border border-slate-500/50 rounded-lg p-3 w-36 transition-all duration-300 hover:scale-105 shadow-lg`}
                                                style={{
                                                    top: `${y}%`,
                                                    left: `${x}%`,
                                                    transform: 'translate(-50%, -50%)'
                                                }}
                                            >
                                                <div className="text-center">
                                                    <h5 className="font-medium text-slate-100 text-sm mb-1">{title}</h5>
                                                    <p className="text-xs text-slate-300 leading-tight">{description}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* 使用说明 */}
                                <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="text-blue-400 text-sm">💡</div>
                                        <span className="text-sm font-medium text-blue-300">思维导图说明</span>
                                    </div>
                                    <p className="text-xs text-blue-200">中心节点代表该性格特征，周围分支展示具体表现形式。鼠标悬浮可查看详细描述。</p>
                                </div>
                            </div>

                            {/* 手机端：五角星思维导图 */}
                            <div className="md:hidden bg-slate-700/50 backdrop-blur-sm border border-slate-600 rounded-xl p-4">
                                <h4 className="text-base font-bold text-slate-100 mb-4 text-center">具体表现思维导图</h4>

                                <div className="relative w-full h-80">
                                    {/* 连接线 */}
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                        {selectedNode.details.map((_, index) => {
                                            const centerX = 50;
                                            const centerY = 50;
                                            const angleStep = 360 / selectedNode.details.length;
                                            const angle = (index * angleStep - 90) * (Math.PI / 180);
                                            const radius = 35; // 手机端适中半径
                                            const targetX = centerX + radius * Math.cos(angle);
                                            const targetY = centerY + radius * Math.sin(angle);

                                            return (
                                                <line
                                                    key={index}
                                                    x1={`${centerX}%`}
                                                    y1={`${centerY}%`}
                                                    x2={`${targetX}%`}
                                                    y2={`${targetY}%`}
                                                    stroke="#64748b"
                                                    strokeWidth="2"
                                                    strokeDasharray="6,4"
                                                    className="opacity-60"
                                                />
                                            );
                                        })}
                                    </svg>

                                    {/* 中心节点 */}
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                                        <div className={`w-24 h-16 bg-gradient-to-br ${selectedNode.color}/20 border-2 border-slate-500 rounded-lg flex items-center justify-center shadow-lg backdrop-blur-sm`}>
                                            <div className="text-center">
                                                <div className="text-lg mb-1">{selectedNode.icon}</div>
                                                <p className="text-xs font-medium text-slate-200">具体表现</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 分支节点 */}
                                    {selectedNode.details.map((detail, index) => {
                                        const angleStep = 360 / selectedNode.details.length;
                                        const angle = (index * angleStep - 90) * (Math.PI / 180);
                                        const radius = 35; // 手机端适中半径
                                        const x = 50 + radius * Math.cos(angle);
                                        const y = 50 + radius * Math.sin(angle);

                                        // 从详细文本中提取关键词作为标题
                                        const title = detail.title;
                                        const description = detail.description;

                                        return (
                                            <div
                                                key={index}
                                                className={`absolute bg-gradient-to-br ${selectedNode.bgColor} backdrop-blur-sm border border-slate-500/50 rounded-lg p-2 w-28 transition-all duration-300 active:scale-95 shadow-lg`}
                                                style={{
                                                    top: `${y}%`,
                                                    left: `${x}%`,
                                                    transform: 'translate(-50%, -50%)'
                                                }}
                                            >
                                                <div className="text-center">
                                                    <h5 className="font-medium text-slate-100 text-xs mb-1">{title}</h5>
                                                    <p className="text-xs text-slate-300 leading-tight">{description}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* 使用说明 */}
                                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="text-blue-400 text-sm">💡</div>
                                        <span className="text-sm font-medium text-blue-300">思维导图说明</span>
                                    </div>
                                    <p className="text-xs text-blue-200">中心节点代表该性格特征，周围分支展示具体表现形式。</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InteractiveMindMapPage; 