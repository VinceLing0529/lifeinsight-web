import React, { useState, useEffect } from 'react';
import { X, Clock, CheckCircle, Loader2 } from 'lucide-react';

// 交互式思维导图组件
const InteractiveMindMap = ({ section, onBack }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [selectedNode, setSelectedNode] = useState(null);

    useEffect(() => {
        setIsVisible(true);
    }, []);

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
                content: "您具备优秀的稳定性，能在变化中保持内心平静。创造力丰富，善于在工作中提出新想法。意志力坚定，一旦确定目标就会坚持到底。沟通能力强，能准确表达自己的观点并理解他人。智慧深邃，善于透过现象看本质。同理心强，能设身处地为他人着想。",
                details: ["稳定性：情绪平稳，不易受外界干扰", "创造力：思维活跃，富有想象力", "意志力：目标明确，执行力强", "沟通力：表达清晰，倾听有效", "智慧：洞察力强，分析能力佳", "同理心：善解人意，人际和谐"]
            },
            {
                id: "negative",
                title: "负向性格倾向",
                icon: "⚠️",
                color: "from-red-500 to-pink-500",
                bgColor: "from-red-500/10 to-pink-500/10",
                source: "八字忌神、紫微四化忌星、印度凶相、劫煞",
                content: "偶尔会出现冲动行为，特别是在压力较大时。面对重要决策时可能犹豫不决，反复权衡得失。情绪起伏相对明显，容易受环境影响。遇到困难时有逃避倾向，不愿正面解决问题。对某些观念容易产生执念，难以改变既定想法。有时会过度相信他人，缺乏必要的防范。",
                details: ["冲动：压力下易做出草率决定", "犹豫：重大选择时摇摆不定", "情绪起伏：容易受外界情绪感染", "逃避：困难面前倾向于回避", "执念：固执己见，难以变通", "盲信：过度信任，缺乏防范"]
            },
            {
                id: "conflict",
                title: "潜在冲突性格",
                icon: "⚖️",
                color: "from-orange-500 to-yellow-500",
                bgColor: "from-orange-500/10 to-yellow-500/10",
                source: "三盘中出现性格张力的点（理性 vs 感性、行动 vs 被动）",
                content: "您的内在存在理性与感性的平衡点，有时会在逻辑分析与直觉判断之间摇摆。行动力与深思熟虑之间也存在张力，既想快速执行又希望充分考虑。这种内在矛盾让您在决策时需要更多时间，但也让您的选择更加全面和慎重。",
                details: ["理性vs感性：逻辑与直觉的内在冲突", "行动vs思考：执行与规划的时机把握", "独立vs依赖：自主与寻求支持的平衡", "完美vs效率：追求完美与时间效率的权衡"]
            },
            {
                id: "strength",
                title: "易发展的领域",
                icon: "🚀",
                color: "from-blue-500 to-cyan-500",
                bgColor: "from-blue-500/10 to-cyan-500/10",
                source: "格局、宫位、行运加持区域",
                content: "您在管理类、咨询类、教育类行业容易获得成功，这些领域能充分发挥您的分析能力和沟通优势。人际风格以稳重可靠见长，容易获得他人信任。在需要深度思考和系统规划的工作中表现出色，能够统筹全局，很少出现重大失误。",
                details: ["适合行业：管理、咨询、教育、分析", "人际风格：稳重可靠，值得信赖", "表达方式：逻辑清晰，条理分明", "工作特长：系统规划，全局统筹"]
            },
            {
                id: "weakness",
                title: "易出问题的领域",
                icon: "⚡",
                color: "from-purple-500 to-violet-500",
                bgColor: "from-purple-500/10 to-violet-500/10",
                source: "弱宫位、凶星汇聚区、负向行运叠加点",
                content: "在快节奏、高压力的环境中容易出现状况，需要注意工作与生活的平衡。感情方面要避免过度理性，多表达情感关怀。健康方面需要关注因工作压力导致的肠胃问题。财务管理上要避免过于保守，错失投资机会。",
                details: ["感情破裂点：过度理性，缺乏情感表达", "人际失衡点：完美主义导致的人际疏远", "健康压力点：工作压力影响肠胃健康", "资源耗损点：过于保守的财务策略"]
            }
        ]
    };

    const handleNodeClick = (node) => {
        setSelectedNode(selectedNode?.id === node.id ? null : node);
    };

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
                        onClick={onBack}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-300 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="text-2xl">⭐</div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-100">交互式思维导图</h1>
                            <p className="text-sm text-slate-400">订单号: zhanshi | 性格全景分析</p>
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
                                                className="opacity-70"
                                            />
                                        );
                                    })}
                                </svg>

                                {/* 中心节点 */}
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                                    <div className="w-32 h-20 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-amber-500/50 rounded-xl flex items-center justify-center cursor-pointer active:scale-95 transition-transform duration-300 shadow-lg backdrop-blur-sm">
                                        <div className="text-center">
                                            <div className="text-xl mb-1">🎯</div>
                                            <h3 className="font-bold text-slate-100 text-xs leading-tight">{mindMapData.center.title}</h3>
                                        </div>
                                    </div>
                                </div>

                                {/* 五大分支节点 - 五角星排列 */}
                                {mindMapData.branches.map((branch, index) => {
                                    // 五角星顶点计算（从顶部开始，顺时针分布）
                                    const angle = (index * 72 - 90) * (Math.PI / 180); // 五个点，每个72度间隔
                                    const radius = 38; // 增大半径避免重叠
                                    const x = 50 + radius * Math.cos(angle);
                                    const y = 50 + radius * Math.sin(angle);

                                    return (
                                        <div
                                            key={branch.id}
                                            className={`absolute w-28 p-2 bg-gradient-to-br ${branch.bgColor} border border-slate-600/50 rounded-lg cursor-pointer transition-all duration-300 active:scale-95 z-10 backdrop-blur-sm shadow-lg ${selectedNode?.id === branch.id ? 'ring-2 ring-amber-500 scale-105' : ''}`}
                                            style={{
                                                top: `${y}%`,
                                                left: `${x}%`,
                                                transform: 'translate(-50%, -50%)'
                                            }}
                                            onClick={() => handleNodeClick(branch)}
                                        >
                                            <div className="flex items-center gap-1 mb-1">
                                                <div className="text-sm">{branch.icon}</div>
                                                <h3 className="font-bold text-slate-100 text-xs leading-tight">{branch.title}</h3>
                                            </div>
                                            <div className={`w-full h-1 bg-gradient-to-r ${branch.color} rounded-full mb-1`}></div>
                                            <p className="text-xs text-slate-300 leading-tight">点击查看分析</p>
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
                                                const title = detail.split('：')[0] || detail.split(':')[0] || `表现${index + 1}`;
                                                const description = detail.split('：')[1] || detail.split(':')[1] || detail;

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
                                                const title = detail.split('：')[0] || detail.split(':')[0] || `表现${index + 1}`;
                                                const description = detail.split('：')[1] || detail.split(':')[1] || detail;

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
                                                            <h5 className="font-medium text-slate-100 text-xs mb-1 leading-tight">{title}</h5>
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
                                            <p className="text-xs text-blue-200">中心节点代表该性格特征，周围分支展示具体表现形式。点击可查看详细描述。</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// 问答页面组件
const QAPage = ({ section, onBack }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [showAnswer, setShowAnswer] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    // 30个问题数据
    const qaData = {
        wealth: {
            title: "财富类",
            icon: "💰",
            gradient: "from-emerald-500 to-teal-500",
            questions: [
                {
                    question: "我这辈子能不能发财？",
                    answer: "根据您的八字分析，您具备一定的财富积累能力。命中正财星较旺，说明通过正当途径获得财富的机会较大。建议您专注于本职工作的发展，同时可以考虑稳健的投资理财。虽然不是暴富之命，但通过持续努力和合理规划，中等偏上的财富水平是可以达到的。关键在于坚持和耐心。"
                },
                {
                    question: "我靠正财还是偏财容易赚钱？",
                    answer: "您的命格显示正财运势更强。这意味着通过稳定工作、薪资收入、经营实业等正当途径赚钱会更容易成功。偏财运势相对较弱，不建议过多依赖投机、彩票、股票短线操作等偏财方式。建议您将主要精力放在提升专业技能、争取升职加薪上，这样的财富积累更稳定可靠。"
                },
                {
                    question: "投资理财对我有没有好处？",
                    answer: "投资理财对您是有好处的，但需要选择合适的方式。您适合稳健型投资，如定期存款、债券、蓝筹股长期持有等。避免高风险的投机性投资。建议将收入的20-30%用于理财，采用分散投资的策略。学习基本的理财知识对您很重要，可以帮助您更好地管理和增值财富。"
                },
                {
                    question: "我什么时候财运最好？",
                    answer: "根据您的大运分析，35-45岁期间是您财运最旺的阶段。这个时期您的事业会相对稳定，收入也会有明显提升。另外，每年的春季（2-4月）和秋季（8-10月）是您的财运旺季，适合做重要的财务决策。建议您在财运好的时期积极进取，在财运一般的时期保守稳健。"
                },
                {
                    question: "我是不是容易漏财、赔钱？",
                    answer: "您确实存在一定的漏财倾向，主要体现在冲动消费和人情支出方面。建议您制定详细的预算计划，避免不必要的开支。在借钱给他人时要谨慎，做好书面记录。投资时不要跟风，要有自己的判断。养成记账的习惯，定期检视财务状况，这样可以有效减少漏财的情况。"
                },
                {
                    question: "我要不要现在换工作/跳槽才能赚得更多？",
                    answer: "当前不是您跳槽的最佳时机。您的命理显示在现有岗位上还有上升空间，建议先在当前工作中寻求突破和提升。如果一定要考虑换工作，建议等到明年春季之后，那时您的事业运势会更好。换工作时要选择与您专业技能匹配的岗位，不要为了短期的薪资提升而放弃长期发展机会。"
                }
            ]
        },
        career: {
            title: "事业类",
            icon: "💼",
            gradient: "from-blue-500 to-cyan-500",
            questions: [
                {
                    question: "我适合做哪一行能成事？",
                    answer: "根据您的五行喜忌和性格特点，您适合从事与金融、管理、咨询、教育相关的行业。您的分析能力强，逻辑思维清晰，适合做需要深度思考和决策的工作。具体来说，银行、保险、投资顾问、企业管理、培训师等职业都比较适合您。避免过于依赖体力劳动或纯销售类的工作。"
                },
                {
                    question: "我适合创业还是打工？",
                    answer: "您更适合先打工积累经验和资源，再考虑创业。您的命格显示您需要一个稳定的平台来发挥才能，过早创业可能会面临较大风险。建议您在35岁之后考虑创业，那时您的经验、人脉和资金都会更加充足。如果创业，选择与您专业背景相关的领域，并且要有合适的合作伙伴。"
                },
                {
                    question: "我会不会一辈子穷忙没有结果？",
                    answer: "您不会一辈子穷忙。虽然前期可能需要较多的努力和积累，但您的命中有贵人相助，中年之后事业会有明显起色。关键是要找准方向，发挥自己的优势。不要急于求成，踏实做好每一步，您的努力最终会得到回报。建议您制定清晰的职业规划，定期评估和调整。"
                },
                {
                    question: "我的贵人在哪一类人/方向？",
                    answer: "您的贵人主要出现在年长的同事、领导，以及从事金融、教育行业的人群中。另外，您的同学、校友也可能成为您的贵人。在地理方向上，东南方向对您更有利。建议您多参加行业聚会，保持与老同事、老同学的联系，主动向有经验的前辈请教，这些都有助于遇到贵人。"
                },
                {
                    question: "我做的这件事有前途吗？",
                    answer: "需要具体分析您目前从事的工作内容。总体来说，如果这件事符合您的专业特长，并且是正当合法的事业，那么是有前途的。但如果偏离了您的核心能力，或者过于投机性质，建议您谨慎考虑。判断一件事是否有前途，要看它是否能发挥您的优势，是否有长期发展空间，是否符合行业趋势。"
                },
                {
                    question: "我什么时候事业能真正起来？",
                    answer: "您的事业起飞期预计在38-42岁之间。这个时期您的经验、能力和机遇会达到最佳结合点。在此之前，您需要继续积累和准备。32-35岁是您的事业上升期，会有一些小的突破。要保持耐心，不要因为暂时的平淡而放弃努力。每个阶段都有其意义，当前的积累都是为将来的成功做准备。"
                }
            ]
        },
        love: {
            title: "感情类",
            icon: "❤️",
            gradient: "from-pink-500 to-rose-500",
            questions: [
                {
                    question: "我的正缘长什么样、什么时候遇到？",
                    answer: "您的正缘很可能是一个性格温和、有责任心的人，年龄可能比您大2-4岁。对方从事稳定的职业，如教师、公务员、医生等。外貌上可能偏向清秀型，不是特别张扬的类型。遇到的时间预计在28-30岁之间，地点可能是通过朋友介绍、工作场合或学习环境。要保持开放的心态，不要过于挑剔外在条件。"
                },
                {
                    question: "我现在身边这个人是不是命中注定的？",
                    answer: "需要看您目前的感情状况和对方的具体情况。如果这个人让您感到舒适、安全，并且你们在价值观上比较一致，那么很可能就是您的正缘。命中注定不是指完全没有选择，而是指在合适的时间遇到合适的人。建议您仔细观察对方的品格和对待感情的态度，如果是真心相待且适合长期发展，就值得珍惜。"
                },
                {
                    question: "我这辈子能不能结婚/稳定下来？",
                    answer: "您这辈子是能够结婚并稳定下来的。您的命中有正官星，说明您有稳定婚姻的基础。虽然可能在感情路上会有一些波折，但最终会找到适合的伴侣。关键是要学会包容和沟通，不要过于理想化。您适合在30岁左右结婚，这个年龄段您的心智和经济条件都比较成熟，更有利于维持稳定的婚姻关系。"
                },
                {
                    question: "感情上我是不是特别难遇到对的人？",
                    answer: "您在感情上确实比较谨慎，这可能会让您觉得难遇到对的人。但这不是坏事，说明您对感情有自己的标准和要求。您不适合随便开始一段感情，更适合深度了解后再发展。建议您多参加一些社交活动，扩大交友圈。同时要适度降低一些不切实际的期望，给彼此一些时间和空间去了解。"
                },
                {
                    question: "我适合早婚还是晚婚？",
                    answer: "您更适合晚婚，建议在28-32岁之间结婚。早婚对您来说可能会面临较多的磨合问题，因为您需要时间来完善自己的性格和提升经济基础。晚婚的好处是您会更加成熟理性，能够更好地处理婚姻中的各种问题。而且您的事业在这个年龄段也会相对稳定，为婚姻提供更好的物质基础。"
                },
                {
                    question: "我感情老出问题，是命里就这样吗？",
                    answer: "感情出问题不完全是命理原因，更多是沟通和相处方式的问题。您的性格可能比较理性，有时候会忽略伴侣的情感需求。建议您学会更多地表达关爱，多倾听对方的想法。同时要学会妥协和包容，不要过于坚持己见。命理只是一个参考，真正的感情需要双方共同经营。改变一些相处模式，您的感情运势会有明显改善。"
                }
            ]
        },
        personality: {
            title: "性格与命格",
            icon: "🧠",
            gradient: "from-purple-500 to-indigo-500",
            questions: [
                {
                    question: "我天生有啥命？是福命还是苦命？",
                    answer: "您属于中等偏上的命格，不是大富大贵，但也不是苦命。您的命中有福气，主要体现在智慧和稳定方面。您不需要为生计过分担忧，但也需要通过努力来实现更好的生活。您的福气在于能够通过自己的智慧和努力获得相对稳定的生活，虽然不会大起大落，但胜在平稳安康。珍惜这种平和的福气。"
                },
                {
                    question: "我性格最大的死穴是什么？",
                    answer: "您性格最大的死穴是过于理性和固执。有时候您会过分依赖逻辑分析，忽略了情感因素和直觉判断。另外，您一旦认定某件事，很难被别人说服改变，这可能会错过一些机会。建议您学会适度听取他人意见，保持开放的心态。有时候感性的判断也很重要，不要完全排斥情感因素。"
                },
                {
                    question: "我是不是命里容易孤独、跟别人难亲近？",
                    answer: "您确实有一些孤独的倾向，但这不是命中注定无法改变的。您的性格比较内敛，喜欢独处思考，这让您看起来不太容易亲近。但您内心是渴望真诚友谊的。建议您主动一些，多参加集体活动，学会表达自己的想法和情感。真正的朋友不需要太多，几个知心的就足够了。"
                },
                {
                    question: "我是不是天生劳碌命、操心命？",
                    answer: "您确实有操心的倾向，喜欢为别人考虑，承担责任。这既是您的优点，也可能成为负担。您不是典型的劳碌命，但确实比较勤奋和负责任。建议您学会适度放手，不要什么事都自己扛。有时候让别人承担一些责任，对大家都有好处。学会享受生活，不要总是处于紧张状态。"
                },
                {
                    question: "我这人到底适合顺其自然还是奋力争？",
                    answer: "您更适合在关键时刻奋力争取，平时保持顺其自然的心态。您不是那种需要时刻拼搏的性格，但在重要机会面前，您需要主动出击。建议您制定清晰的目标，在重要的事情上全力以赴，在次要的事情上可以随缘。这样既能发挥您的优势，又不会让自己过于疲惫。"
                },
                {
                    question: "命里有没有什么特别的天赋我没用上？",
                    answer: "您有很强的分析和洞察能力，这是您最大的天赋。您能够看透事物的本质，做出准确的判断。但您可能没有充分利用这个天赋来帮助别人或者发展事业。建议您考虑从事咨询、分析、指导类的工作，或者在现有工作中更多地发挥这种能力。您的洞察力如果用在正确的地方，会带来很大的价值。"
                }
            ]
        },
        fortune: {
            title: "运势与转折",
            icon: "🌱",
            gradient: "from-orange-500 to-red-500",
            questions: [
                {
                    question: "我什么时候会有真正的转运点？",
                    answer: "您的真正转运点预计在35-38岁之间。这个时期您的各方面条件都会达到一个比较好的状态，事业、财运、人际关系都会有明显改善。在此之前，您需要继续积累和准备。32岁左右会有一个小的转机，可以作为大转运的前奏。要保持耐心和信心，转运需要时间，但一定会到来。"
                },
                {
                    question: "我过去这么倒霉，是不是流年不好？",
                    answer: "过去几年确实是您的低潮期，这与流年运势有关。25-30岁这个阶段对您来说比较辛苦，容易遇到挫折和困难。但这个阶段即将过去，从今年开始您的运势会逐渐好转。过去的困难都是为了让您成长和积累经验，现在这些经历会成为您的财富。要相信苦尽甘来，好运正在路上。"
                },
                {
                    question: "明年运势怎么样？能不能做重大决定？",
                    answer: "明年您的运势会比今年好一些，特别是在事业和人际关系方面。但仍然不是做重大决定的最佳时机，建议保持稳健的策略。如果是关于工作调动、投资理财的决定，可以考虑，但要谨慎评估风险。关于婚姻、创业等人生重大决定，建议再等一到两年。明年适合做准备和规划，为将来的重大决定打基础。"
                },
                {
                    question: "我要不要出国/换城市发展会更好？",
                    answer: "换城市发展对您是有好处的，特别是往东南方向的城市。您的命理显示您适合在大城市发展，那里的机会和平台更适合您的特长。至于出国，如果有好的机会可以考虑，但不要为了出国而出国。关键是要有明确的目标和规划。建议您先在国内的大城市发展几年，积累经验后再考虑国际发展。"
                },
                {
                    question: "我这辈子有没有一次彻底翻身的机会？",
                    answer: "您这辈子会有翻身的机会，但不是一夜暴富式的翻身，而是通过持续努力实现的稳步提升。您的翻身机会主要在事业发展方面，通过专业能力的提升和职位的晋升来实现。时间点大概在35-45岁之间。这种翻身更加稳固和持久，虽然过程可能比较缓慢，但结果会更好。"
                },
                {
                    question: "我这命，是要靠人、靠天，还是靠自己？",
                    answer: "您这个命主要还是要靠自己，但也需要适度依靠贵人的帮助。您有自立自强的能力，通过自己的努力可以获得不错的成就。但在关键时刻，贵人的帮助会让您事半功倍。建议您在努力提升自己的同时，也要注重人际关系的维护。七分靠自己，三分靠贵人，这样的组合对您最为有利。"
                }
            ]
        }
    };

    const handleQuestionClick = (question, answer) => {
        setSelectedQuestion({ question, answer });
        setShowAnswer(true);
    };

    const closeAnswer = () => {
        setShowAnswer(false);
        setSelectedQuestion(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-teal-500/10 to-emerald-500/10 rounded-full blur-3xl"></div>
            </div>

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between p-6 bg-slate-800/80 backdrop-blur-sm border-b border-slate-700">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-300 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="text-2xl">{section.icon}</div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-100">{section.title}</h1>
                            <p className="text-sm text-slate-400">订单号: zhanshi | 30个核心问题解答</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-sm text-slate-300">完成度</p>
                        <p className="text-xs text-slate-500">100%</p>
                    </div>
                    <div className="relative w-16 h-16">
                        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                            <defs>
                                <linearGradient id="qa-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#10B981" />
                                    <stop offset="100%" stopColor="#14B8A6" />
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
                                stroke="url(#qa-gradient)"
                                strokeWidth="4"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 28}`}
                                strokeDashoffset={0}
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
            <div className="relative z-10 max-w-7xl mx-auto p-6">
                <div className={`transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>

                    {/* 概述卡片 */}
                    <div className="mb-8 p-6 bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-xl">
                        <h2 className="text-lg font-bold text-slate-100 mb-4">问答概述</h2>
                        <p className="text-slate-300 leading-relaxed mb-4">{section.summary}</p>
                        <div className="text-sm text-slate-400">
                            <p>• 涵盖五大维度：财富、事业、感情、性格、运势</p>
                            <p>• 每个维度6个核心问题，共30个专业解答</p>
                            <p>• 点击问题查看详细答案和建议</p>
                        </div>
                    </div>

                    {/* 五个维度的问题 */}
                    <div className="space-y-8">
                        {Object.entries(qaData).map(([key, category], categoryIndex) => (
                            <div
                                key={key}
                                className="p-6 bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-xl"
                                style={{ transitionDelay: `${categoryIndex * 200}ms` }}
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="text-2xl">{category.icon}</div>
                                    <h3 className="text-xl font-bold text-slate-100">{category.title}</h3>
                                    <div className="text-sm text-slate-400">（6问）</div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {category.questions.map((item, questionIndex) => (
                                        <button
                                            key={questionIndex}
                                            onClick={() => handleQuestionClick(item.question, item.answer)}
                                            className={`p-4 text-left bg-gradient-to-br ${category.gradient}/10 border border-slate-600/30 rounded-lg hover:scale-105 transition-all duration-300 hover:border-slate-500/50`}
                                        >
                                            <div className="text-sm text-slate-200 leading-relaxed">
                                                {item.question}
                                            </div>
                                            <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                                                <span>点击查看答案</span>
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 答案弹窗 */}
            {showAnswer && selectedQuestion && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800/95 backdrop-blur-sm border border-slate-600 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-lg font-bold text-slate-100 pr-4">
                                    {selectedQuestion.question}
                                </h3>
                                <button
                                    onClick={closeAnswer}
                                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-300 rounded-lg flex-shrink-0"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="bg-slate-700/50 rounded-lg p-4">
                                <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                                    {selectedQuestion.answer}
                                </p>
                            </div>

                            <div className="mt-4 text-center">
                                <button
                                    onClick={closeAnswer}
                                    className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-300"
                                >
                                    我知道了
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// 运势预测报告组件
const FortuneChartPage = ({ section, onBack }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    // 获取当前时间并生成未来12个月
    const generateMonthlyFortune = () => {
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
                        onClick={onBack}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-300 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="text-2xl">{section.icon}</div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-100">{section.title}</h1>
                            <p className="text-sm text-slate-400">订单号: zhanshi | 12个月运势预测</p>
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
            <div className="relative z-10 max-w-7xl mx-auto p-6">
                <div className={`transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>

                    {/* 概述卡片 */}
                    <div className="mb-8 p-6 bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-xl">
                        <h2 className="text-lg font-bold text-slate-100 mb-4">运势概述</h2>
                        <p className="text-slate-300 leading-relaxed mb-4">{section.description}</p>
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
                                            {Math.round((monthData.career + monthData.wealth + monthData.love + monthData.health) / 4 * 10) / 10}
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
                                            <span className="text-xs text-slate-300">财运</span>
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
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 总结卡片 */}
                    <div className="mt-8 p-6 bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm border border-slate-600 rounded-xl">
                        <h2 className="text-lg font-bold text-slate-100 mb-4">运势总结</h2>
                        <div className={`p-4 rounded-lg bg-gradient-to-br ${section.gradient}/10 border border-slate-600/30`}>
                            <p className="text-slate-300 leading-relaxed">{section.summary}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 优劣混合分析组件
const AnalysisPage = ({ section, onBack }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [activeTab, setActiveTab] = useState(section.tabSections[0].id);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const activeSection = section.tabSections.find(tab => tab.id === activeTab);

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
                        onClick={onBack}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-300 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="text-2xl">{section.icon}</div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-100">{section.title}</h1>
                            <p className="text-sm text-slate-400">订单号: zhanshi | 四维分析</p>
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
                                            <p className="text-sm text-slate-300 leading-relaxed">觉察自己惯性反应（比如讨好、压抑、逃避）是改变的第一步。</p>
                                        </div>

                                        {/* 成长引导 - 第二阶段 */}
                                        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg p-4 transition-all duration-300 hover:scale-[1.02]">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                                                <h5 className="font-bold text-slate-100">第二阶段｜学会松手</h5>
                                            </div>
                                            <p className="text-sm text-slate-300 leading-relaxed">接受"做不到完美"，允许自己有缺口，有弹性。</p>
                                        </div>

                                        {/* 成长引导 - 第三阶段 */}
                                        <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/30 rounded-lg p-4 transition-all duration-300 hover:scale-[1.02]">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                                                <h5 className="font-bold text-slate-100">第三阶段｜建立正循环</h5>
                                            </div>
                                            <p className="text-sm text-slate-300 leading-relaxed">学习表达、运动、艺术、情绪日记，找到让你舒服的出口。</p>
                                        </div>

                                        {/* 成长引导 - 第四阶段 */}
                                        <div className="bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/30 rounded-lg p-4 transition-all duration-300 hover:scale-[1.02]">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm">4</div>
                                                <h5 className="font-bold text-slate-100">第四阶段｜对世界说YES</h5>
                                            </div>
                                            <p className="text-sm text-slate-300 leading-relaxed">去体验、去信任关系、去回应挑战，而不是光想不动。</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* 使用说明 */}
                            <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="text-blue-400 text-sm">🌱</div>
                                    <span className="text-sm font-medium text-blue-300">成长指引</span>
                                </div>
                                <p className="text-xs text-blue-200">按照四个阶段循序渐进，每个阶段都是下一阶段的基础。建议专注完成当前阶段再进入下一阶段。</p>
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
        </div>
    );
};

// 详细页面组件
const DetailPage = ({ section, onBack }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    // 如果是优劣混合分析，显示分析组件
    if (section.id === 'analysis') {
        return <AnalysisPage section={section} onBack={onBack} />;
    }

    // 如果是思维导图，显示交互式组件
    if (section.id === 'mindmap') {
        return <InteractiveMindMap section={section} onBack={onBack} />;
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
                        onClick={onBack}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-300 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="text-2xl">{section.icon}</div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-100">{section.title}</h1>
                            <p className="text-sm text-slate-400">订单号: zhanshi | 详细分析</p>
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
                                <linearGradient id={`detail-gradient-${section.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#3B82F6" />
                                    <stop offset="100%" stopColor="#8B5CF6" />
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
                                stroke={`url(#detail-gradient-${section.id})`}
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
            <div className="relative z-10 max-w-4xl mx-auto p-6">
                <div className={`transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                    {/* 概述卡片 */}
                    <div className="mb-8 p-6 bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-xl">
                        <h2 className="text-lg font-bold text-slate-100 mb-4">概述</h2>
                        <p className="text-slate-300 leading-relaxed">{section.description}</p>
                    </div>

                    {/* 详细内容卡片 */}
                    <div className="space-y-6">
                        {section.detailSections.map((detail, index) => (
                            <div
                                key={index}
                                className={`p-6 bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-xl transition-all duration-500`}
                                style={{ transitionDelay: `${index * 200}ms` }}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`p-2 rounded-lg bg-gradient-to-br ${section.bgGradient}`}>
                                        <div className="text-lg">{detail.icon}</div>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-100">{detail.title}</h3>
                                </div>

                                <div className={`p-4 rounded-lg bg-gradient-to-br ${section.gradient.replace("from-", "from-").replace("to-", "/5 to-")}/5 border border-slate-600/30`}>
                                    <p className="text-slate-300 leading-relaxed whitespace-pre-line">{detail.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 总结卡片 */}
                    <div className="mt-8 p-6 bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm border border-slate-600 rounded-xl">
                        <h2 className="text-lg font-bold text-slate-100 mb-4">总结建议</h2>
                        <div className={`p-4 rounded-lg bg-gradient-to-br ${section.gradient}/10 border border-slate-600/30`}>
                            <p className="text-slate-300 leading-relaxed">{section.summary}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function ExamplePage({ onBack }) {
    const [isVisible, setIsVisible] = useState(false);
    const [hoveredCard, setHoveredCard] = useState(null);
    const [currentDetailPage, setCurrentDetailPage] = useState(null);

    const reportProgress = {
        analysis: 100,
        mindmap: 100,
        fortune: 100,
        suggestions: 100,
    };

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const reportSections = [
        {
            id: "analysis",
            title: "优劣混合分析",
            description: "结合三盘找出您的优势与劣势，深度剖析命理结构。",
            icon: "📊",
            gradient: "from-blue-500 to-cyan-500",
            bgGradient: "from-blue-500/10 to-cyan-500/10",
            borderGradient: "from-blue-500/50 to-cyan-500/50",
            score: 88,
            summary: "综合三大命理系统分析，您的命格整体平衡度较好，具备成功的基础条件。建议重点关注情绪管理和人际关系的协调发展。",
            tabSections: [
                {
                    id: "talents",
                    icon: "⭐",
                    title: "天赋优势",
                    gradient: "from-amber-500 to-yellow-500",
                    bgGradient: "from-amber-500/10 to-yellow-500/10",
                    content: "您具备卓越的分析思维能力，能够快速洞察事物本质。逻辑推理能力强，擅长处理复杂问题。学习能力优秀，接受新知识速度快。沟通表达清晰，能够准确传达观点。具备天生的领导气质，在团队中容易获得他人信任。",
                    details: [
                        "分析能力：能够快速分解复杂问题，找到核心要点",
                        "学习天赋：接受新知识速度快，理解能力强",
                        "逻辑思维：推理严密，思路清晰有条理",
                        "沟通能力：表达准确，善于说服他人",
                        "领导气质：天生具备影响力，容易获得信任",
                        "创新思维：能够跳出常规，提出新颖见解"
                    ]
                },
                {
                    id: "tensions",
                    icon: "⚡",
                    title: "内心张力",
                    gradient: "from-orange-500 to-red-500",
                    bgGradient: "from-orange-500/10 to-red-500/10",
                    content: "您内心存在理性与感性的冲突，有时会在逻辑判断和情感直觉之间摇摆。追求完美的倾向与现实限制产生张力。渴望独立自主，但又希望获得他人支持。在追求效率与追求质量之间需要平衡。",
                    details: [
                        "理性vs感性：逻辑思维与直觉判断的内在冲突",
                        "完美vs现实：高标准期望与客观条件的矛盾",
                        "独立vs依赖：自主意识与寻求支持的平衡需求",
                        "效率vs质量：快速完成与精益求精的选择困难",
                        "保守vs冒险：稳妥策略与突破创新的内心纠结"
                    ]
                },
                {
                    id: "blindspots",
                    icon: "🔍",
                    title: "命盘盲区",
                    gradient: "from-purple-500 to-indigo-500",
                    bgGradient: "from-purple-500/10 to-indigo-500/10",
                    content: "在情感表达方面存在盲区，容易被误解为冷漠。对于非理性行为的理解不足，难以处理纯粹情感问题。在快节奏环境下容易焦虑，抗压能力有待提升。对艺术和创意领域的敏感度较低。",
                    details: [
                        "情感表达：不善于表达内心情感，容易被误解",
                        "非理性理解：难以理解他人的感性决策",
                        "压力管理：高压环境下容易产生焦虑情绪",
                        "艺术敏感：对美学和创意缺乏天然感知",
                        "人际细节：容易忽略人际交往中的微妙信号"
                    ]
                },
                {
                    id: "guidance",
                    icon: "🌱",
                    title: "成长引导",
                    gradient: "from-green-500 to-teal-500",
                    bgGradient: "from-green-500/10 to-teal-500/10",
                    content: "建议多培养情感表达能力，学会用更温和的方式与人沟通。可以通过艺术欣赏提升审美能力。在压力管理方面，建议学习冥想或瑜伽等放松技巧。适当放下完美主义，接受80%的完成度。",
                    details: [
                        "情感培养：多参与情感交流，学习情感表达技巧",
                        "艺术修养：通过音乐、绘画等艺术形式提升感性认知",
                        "压力释放：学习冥想、瑜伽等身心放松方法",
                        "完美平衡：适当降低标准，接受不完美的结果",
                        "人际技巧：多观察他人情绪，提升同理心",
                        "持续学习：保持开放心态，接受新观念和方法"
                    ]
                }
            ]
        },
        {
            id: "mindmap",
            title: "思维导图呈现",
            description: "用思维导图方式呈现命理构造与人生主线。",
            icon: "⭐",
            gradient: "from-amber-500 to-orange-500",
            bgGradient: "from-amber-500/10 to-orange-500/10",
            borderGradient: "from-amber-500/50 to-orange-500/50",
            score: 92,
            summary: "您的人生发展轨迹清晰，各个阶段都有明确的成长目标。建议按照既定路线稳步推进，同时保持适度的灵活性。",
            detailSections: [
                {
                    icon: "🌟",
                    title: "核心主线：智慧发展",
                    content: "学习能力强 → 逻辑思维佳 → 善于分析 → 决策准确 → 事业成功\n\n这是您人生发展的核心脉络，每个环节都相互促进，形成良性循环。建议持续投资于知识学习和技能提升。",
                    score: 95
                },
                {
                    icon: "💝",
                    title: "感情线：稳定专一",
                    content: "重视家庭 → 感情专一 → 夫妻和谐 → 子女成才 → 家族兴旺\n\n您在感情方面表现出高度的责任感和忠诚度，这是您人生幸福的重要基石。建议多花时间陪伴家人，维护家庭和谐。",
                    score: 90
                },
                {
                    icon: "💰",
                    title: "财富线：稳健增长",
                    content: "正财稳定 → 理财有道 → 投资谨慎 → 财富积累 → 财务自由\n\n您的财运以正财为主，通过努力工作和合理理财逐步积累财富。建议保持稳健的投资策略，避免高风险投机。",
                    score: 88
                },
                {
                    icon: "🏥",
                    title: "健康线：注重保养",
                    content: "体质中等 → 注意肠胃 → 规律作息 → 适量运动 → 身心健康\n\n您的健康状况总体良好，但需要注意肠胃保养和作息规律。建议定期体检，预防为主。",
                    score: 92
                }
            ]
        },
        {
            id: "fortune",
            title: "运势预测报告",
            description: "基于当前时间未来12个月运势详细预测，助您把握人生机遇。",
            icon: "🔮",
            gradient: "from-purple-500 to-pink-500",
            bgGradient: "from-purple-500/10 to-pink-500/10",
            borderGradient: "from-purple-500/50 to-pink-500/50",
            score: 85,
            summary: "未来12个月整体运势呈现波动上升趋势，春夏季节运势较强，秋冬季节需要谨慎。建议在高峰期积极进取，低谷期稳健保守。",
            isFortuneChart: true
        },
        {
            id: "suggestions",
            title: "个性化建议",
            description: "五维30个核心问题深度解答，点击问题查看专属答案。",
            icon: "💡",
            gradient: "from-emerald-500 to-teal-500",
            bgGradient: "from-emerald-500/10 to-teal-500/10",
            borderGradient: "from-emerald-500/50 to-teal-500/50",
            score: 90,
            summary: "基于您的命理特点，我们为您准备了30个最关心的人生问题的深度解答，涵盖财富、事业、感情、性格和运势五大维度。",
            isQAPage: true
        },
    ];

    // 如果显示详细页面，渲染相应的组件
    if (currentDetailPage) {
        if (currentDetailPage.isFortuneChart) {
            return <FortuneChartPage section={currentDetailPage} onBack={() => setCurrentDetailPage(null)} />;
        }
        if (currentDetailPage.isQAPage) {
            return <QAPage section={currentDetailPage} onBack={() => setCurrentDetailPage(null)} />;
        }
        return <DetailPage section={currentDetailPage} onBack={() => setCurrentDetailPage(null)} />;
    }

    const handleCardClick = (section) => {
        setCurrentDetailPage(section);
    };

    const getStatusIcon = (progress) => {
        if (progress >= 100) {
            return <CheckCircle className="w-5 h-5 text-green-400" />;
        } else if (progress > 0) {
            return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
        } else {
            return <Clock className="w-5 h-5 text-slate-400" />;
        }
    };

    const getStatusText = (progress) => {
        if (progress >= 100) return "生成完成";
        if (progress > 0) return "内容生成中...";
        return "等待生成";
    };

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
                        onClick={onBack}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-300 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-100">示例完整报告</h1>
                        <p className="text-sm text-slate-400">订单号: zhanshi</p>
                    </div>
                </div>

                {/* Overall Progress */}
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-sm text-slate-300">总体进度</p>
                        <p className="text-xs text-slate-500">100%</p>
                    </div>
                    <div className="w-16 h-16 relative">
                        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
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
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 28}`}
                                strokeDashoffset={0}
                                className="text-blue-400 transition-all duration-500"
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold text-slate-200">100%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 max-w-6xl mx-auto p-6">
                <div className="grid md:grid-cols-2 gap-6">
                    {reportSections.map((section, index) => {
                        const progress = 100;

                        return (
                            <div
                                key={section.id}
                                className={`group transition-all duration-500 border bg-slate-800/60 backdrop-blur-sm overflow-hidden relative rounded-lg cursor-pointer hover:scale-105 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                                    }`}
                                style={{
                                    transitionDelay: `${index * 200}ms`,
                                }}
                                onMouseEnter={() => setHoveredCard(section.id)}
                                onMouseLeave={() => setHoveredCard(null)}
                                onClick={() => handleCardClick(section)}
                            >
                                {/* Animated border */}
                                <div
                                    className={`absolute inset-0 bg-gradient-to-r ${section.borderGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                                    style={{ padding: "1px" }}
                                >
                                    <div className="w-full h-full bg-slate-800/90 rounded-lg"></div>
                                </div>

                                <div className="p-6 relative z-10">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`p-3 rounded-xl bg-gradient-to-br ${section.bgGradient} border border-slate-600/50 group-hover:scale-110 transition-transform duration-300 text-2xl`}
                                            >
                                                {section.icon}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-100 group-hover:bg-gradient-to-r group-hover:from-slate-100 group-hover:to-slate-300 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                                                    {section.title}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {getStatusIcon(progress)}
                                                    <span className="text-sm text-slate-400">{getStatusText(progress)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-slate-400 text-sm mb-4 group-hover:text-slate-300 transition-colors duration-300">
                                        {section.description}
                                    </p>

                                    {/* Progress Bar */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-slate-500">生成进度</span>
                                            <span className="text-xs text-slate-400">100%</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full bg-gradient-to-r ${section.gradient} rounded-full transition-all duration-500 ease-out relative`}
                                                style={{ width: `100%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Completion indicator */}
                                    <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-400" />
                                            <span className="text-sm text-green-300">点击查看详细报告</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Hover effect overlay */}
                                <div
                                    className={`absolute inset-0 bg-gradient-to-br ${section.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                                ></div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
} 