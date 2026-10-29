import React, { useState, useEffect } from 'react';
import { ArrowLeft, Share2, Download, Calendar, Clock, MapPin, User, Eye, EyeOff, ChevronRight, Sparkles, Wand2, Copy, X } from 'lucide-react';
import ExamplePage from './ExamplePage';
import AIReportPage from './AIReportPage';
import CodeRedemptionModal from './CodeRedemptionModal';
import { aiAnalysisAPI } from '../services/api';
import { useLocation, useNavigate } from 'react-router-dom';

const ResultsPage = (props) => {
    const location = useLocation();
    const navigate = useNavigate();
    const data = props.data || location.state?.chartData;
    const [isVisible, setIsVisible] = useState(false);
    const [hoveredCard, setHoveredCard] = useState(null);
    const [expandedSections, setExpandedSections] = useState({
        bazi: false,
        ziwei: false,
        vedic: false
    });
    const [promptModal, setPromptModal] = useState({
        isOpen: false,
        type: '',
        content: ''
    });
    const [showPayModal, setShowPayModal] = useState(false);
    const [showCopyTip, setShowCopyTip] = useState(false);
    const [showExamplePage, setShowExamplePage] = useState(false);
    const [showAIReportPage, setShowAIReportPage] = useState(false);
    const [aiReportData, setAiReportData] = useState(null);
    const [aiReportOrderId, setAiReportOrderId] = useState("");
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [currentGenerationStep, setCurrentGenerationStep] = useState('');
    const [showCodeModal, setShowCodeModal] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const { input, bazi, ziwei, vedic } = data;

    if (!data) {
        return <div>无分析数据，请先提交表单。</div>;
    }

    // 如果显示示例页面，渲染 ExamplePage
    if (showExamplePage) {
        return <ExamplePage onBack={() => setShowExamplePage(false)} />;
    }

    // 如果显示AI报告页面，渲染 AIReportPage
    if (showAIReportPage) {
        return <AIReportPage
            onBack={() => setShowAIReportPage(false)}
            reportData={aiReportData}
            orderId={aiReportOrderId}
        />;
    }

    // 切换展开状态
    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // 下载报告
    const downloadReport = () => {
        alert('报告下载功能开发中...');
    };

    // 分享结果
    const shareResults = () => {
        alert('分享功能开发中...');
    };

    // 生成AI报告 - 两阶段调用 + 模拟进度
    const generateAIReport = async (redemptionCode) => {
        setIsGeneratingReport(true);
        setGenerationProgress(0);
        setCurrentGenerationStep('准备分析...');

        try {
            // 使用兑换码作为订单号
            const orderId = redemptionCode;

            // 只生成prompt文件，不调用AI
            setCurrentGenerationStep('📝 正在生成分析模板...');
            setGenerationProgress(30);

            const response = await fetch('http://localhost:8000/api/ai-report/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_data: data,
                    order_id: orderId
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Prompt文件生成成功:', result);

            setCurrentGenerationStep('✨ 模板生成完成！正在跳转...');
            setGenerationProgress(100);

            // 跳转到FinalReport页面
            window.location.href = `/final-report/${orderId}`;

        } catch (error) {
            console.error('生成AI报告错误:', error);
            alert(`生成报告失败：${error.message}`);
        } finally {
            setIsGeneratingReport(false);
            setGenerationProgress(0);
            setCurrentGenerationStep('');
        }
    };

    // 生成提示词
    const generatePrompt = (type) => {
        const prompts = {
            bazi: `情境说明
你是一位资深的中国命理师，擅长八字（四柱）命理学，拥有数十年传统中国玄学与命运分析的经验。你精通五行理论、十神体系，并擅长将其应用于人生指导中。你正在为一位客户提供咨询服务，客户希望通过八字命盘获取全面的人生命运解析。

任务内容
请根据客户提供的八字命盘，提供一份详尽的命运分析与人生指导报告。需要精准、深入地分析客户指定的八个方面，确保每一部分都以传统八字理论为基础，同时提供切实可行的生活建议。

目标
通过五行与八字原理，为客户呈现一份全面的人生蓝图，帮助其认清自身优势与挑战，明确在事业、财富、感情、健康、时运节奏与提升方法等关键人生领域中的最佳策略。

客户命盘信息：

基本信息：
性别：${input.gender_str || '未知'}

八字四柱：
年柱：${bazi.year_pillar || '未知'}
月柱：${bazi.month_pillar || '未知'}  
日柱：${bazi.day_pillar || '未知'}（日主）
时柱：${bazi.hour_pillar || '未知'}

命理要素：
日主：${bazi.day_master || '未知'}
身强身弱：${bazi.body_strength || '未知'}

五行分布详析：
${bazi.five_elements ? Object.entries(bazi.five_elements).map(([element, count]) => `${element}：${count}个`).join('\n') : '五行分布未知'}

十神配置：${bazi.ten_gods ? Object.entries(bazi.ten_gods).map(([pos, god]) => `${pos}${god}`).join('、') : '未知'}

请你分析以下八个方面，每一项都需同等重视，深入解析：

1. 五行分析（Five Elements Analysis）
2. 性格特质（Personality Traits）
3. 事业方向（Career Direction）
4. 财运分析（Wealth Analysis）
5. 感情婚姻（Love and Marriage）
6. 健康养生（Health and Wellness）
7. 人生节奏（Life Rhythm and Timing）
8. 开运改善（Enhancement and Improvement Methods）

关键分析要求：
• 特别注意五行之间的平衡与失衡对命主的影响
• 分析日主"${bazi.day_master || '日主'}"的格局下，其他五行与十神的关系
• 精细剖析十神配置对性格与人生轨迹的影响
• 所有建议需具体可执行，切勿空泛笼统
• 所有分析必须以传统八字命理为理论基础，但同时具有现实指导意义
• 需指出命盘中的优势可以如何发挥，弱点应如何化解

请记住：你的生命就取决于是否能对上述八个方面逐一提供详尽、具体的分析与建议。任何遗漏、表面化分析、或敷衍处理都不被允许。`,
            ziwei: `情境说明
你是一位精通紫微斗数的资深命理大师，拥有数十年星曜宫位研究与实践经验。你深谙紫微斗数之精髓，能够准确解读十四主星、四化飞星、宫位互动的奥秘。你正在为一位客户提供专业的紫微斗数咨询，客户希望通过命盘获得全面深入的人生指导。

任务内容
请根据客户提供的紫微斗数命盘，运用传统斗数理论，为其提供一份深度的命运分析与人生策略报告。需要对十二宫位逐一深入解析，揭示星曜组合的深层含义，提供具体可行的人生建议。

目标
通过紫微斗数之星曜宫位理论，为客户描绘完整的命运轨迹，帮助其明晰各个人生领域的发展规律，把握时机，趋吉避凶，实现人生价值最大化。

客户命盘信息：

基本信息：
性别：${input.gender_str || '未知'}

命盘基础：
命宫主星：${ziwei.basic_info?.soul || '未知'}
身宫主星：${ziwei.basic_info?.body || '未知'}
五行局：${ziwei.basic_info?.five_elements_class || '未知'}
命盘干支：${ziwei.basic_info?.chinese_date || '未知'}

主星分布：${ziwei.chart?.star_positions ? Object.entries(ziwei.chart.star_positions).map(([star, palace]) => `${star}在${palace}`).join('、') : '未知'}

年干四化：${ziwei.year_four_trans ? Object.entries(ziwei.year_four_trans).map(([type, star]) => `${type}${star}`).join('、') : '未知'}

请你深入分析以下十二宫位，每一宫都需详尽解读：

1. 命宫分析（Life Palace Analysis）
2. 兄弟宫（Siblings Palace Analysis）
3. 夫妻宫（Marriage Palace Analysis）
4. 子女宫（Children Palace Analysis）
5. 财帛宫（Wealth Palace Analysis）
6. 疾厄宫（Health Palace Analysis）
7. 迁移宫（Migration Palace Analysis）
8. 奴仆宫（Friends Palace Analysis）
9. 官禄宫（Career Palace Analysis）
10. 田宅宫（Property Palace Analysis）
11. 福德宫（Fortune Palace Analysis）
12. 父母宫（Parents Palace Analysis）

关键分析要求：
• 深入解读命宫主星组合对整体命格的影响
• 分析身宫与命宫的互动关系及其人生意义
• 详细阐述四化飞星对各宫位的具体影响
• 重点关注星曜庙旺陷落对命运的实际作用
• 所有分析必须基于传统紫微斗数理论框架
• 提供具体可行的改善建议和人生策略
• 指出各个人生阶段的关键发展节点

请记住：你的使命是为客户提供最专业、最深入的紫微斗数解读。每个宫位的分析都必须详尽透彻，任何敷衍或表面化的解读都是不被允许的。`,
            vedic: `情境说明
你是一位精通印度吠陀占星学的权威大师，拥有深厚的梵语古典占星典籍研究功底和数十年实践经验。你深谙恒星占星学、纳瓦姆萨分盘、达萨周期系统等吠陀占星核心理论。你正在为一位客户提供专业的吠陀占星咨询，客户希望通过星盘获得深层的业力洞察和人生指导。

任务内容
请根据客户提供的吠陀占星星盘，运用传统印度占星学理论，为其提供一份深度的命运分析与精神成长指导报告。需要详细分析十二宫位、九大行星配置、达萨周期影响，揭示灵魂的进化路径与今生的使命。

目标
通过吠陀占星学的宇宙智慧，为客户揭示业力模式、人生课题与精神发展方向，帮助其理解生命的深层意义，在物质与精神层面都获得成长与解脱。

客户星盘信息：

基本信息：
性别：${input.gender_str || '未知'}

星盘基础：
上升星座：${vedic.ascendant?.sign || '未知'}（位于第${vedic.ascendant?.house}宫 ${vedic.ascendant?.lon?.toFixed(2)}°）
星盘系统：${vedic.chart_type || '未知'}
岁差系统：${vedic.ayanamsa?.type} (${vedic.ayanamsa?.value}°)

行星分布：${vedic.planets ? Object.entries(vedic.planets).map(([planet, data]) => `${planet}在${data.sign}座第${data.house}宫`).join('、') : '未知'}

重要轴点：${vedic.axis_points ? Object.entries(vedic.axis_points).map(([point, data]) => `${point}在${data.sign}座第${data.house}宫`).join('、') : '未知'}

请你深入分析以下十二宫位和行星组合，每一宫都需透彻解读：

1. 第一宫（Lagna - 自我宫）：上升星座特质、人生使命、灵魂表达方式
2. 第二宫（Dhana - 财富宫）：价值观念、财富业力、家族传承与语言天赋
3. 第三宫（Sahaja - 勇气宫）：沟通能力、手足关系、短途旅行与个人努力
4. 第四宫（Sukha - 快乐宫）：内心世界、家庭环境、母亲关系与情感基础
5. 第五宫（Putra - 智慧宫）：创造力、子女缘分、前世功德与智慧修行
6. 第六宫（Ari - 敌人宫）：健康挑战、工作服务、克服障碍与业力清理
7. 第七宫（Kalatra - 伴侣宫）：婚姻关系、商业合作、人际互动与对方业力
8. 第八宫（Ayus - 寿命宫）：生死转化、神秘学研究、他人资源与深层心理
9. 第九宫（Bhagya - 运气宫）：高等智慧、精神导师、宗教信仰与人生哲学
10. 第十宫（Karma - 事业宫）：职业使命、社会地位、权威力量与父亲关系
11. 第十一宫（Labha - 收获宫）：愿望实现、朋友网络、收入来源与团体活动
12. 第十二宫（Vyaya - 损失宫）：精神解脱、潜意识模式、隐藏业力与终极修行

关键分析要求：
• 深入解读上升星座对整体人生模式的根本影响
• 分析九大行星在各宫位的业力意义与实际作用
• 详细阐述主要行星组合（瑜伽）对命运的影响
• 重点关注月亮星座与太阳星座的内在整合
• 所有分析必须基于传统吠陀占星学理论
• 提供具体的精神修行建议和人生发展策略
• 指出重要的达萨周期时间节点与人生转折

请记住：你的使命是为客户提供最深层的灵魂洞察。每个宫位的分析都必须揭示其业力含义和精神发展价值，任何肤浅或世俗化的解读都无法触及吠陀占星学的真正智慧。`
        };

        setPromptModal({
            isOpen: true,
            type,
            content: prompts[type] || '暂无提示词模板'
        });
    };

    // 复制提示词
    const copyPrompt = async () => {
        try {
            await navigator.clipboard.writeText(promptModal.content);
            setShowCopyTip(true);
            setTimeout(() => setShowCopyTip(false), 1500);
        } catch (err) {
            const textArea = document.createElement('textarea');
            textArea.value = promptModal.content;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setShowCopyTip(true);
            setTimeout(() => setShowCopyTip(false), 1500);
        }
    };

    // 关闭提示词弹窗
    const closePromptModal = () => {
        setPromptModal({
            isOpen: false,
            type: '',
            content: ''
        });
    };

    const analysisItems = [
        {
            id: "bazi",
            title: "八字命盘",
            subtitle: "中华传统四柱推命",
            gradient: "from-rose-400 to-pink-500",
            bgGradient: "from-rose-50 to-pink-50",
            icon: "🌸",
            progress: 100,
            data: bazi,
        },
        {
            id: "ziwei",
            title: "紫微斗数",
            subtitle: "紫微斗数命盘分析",
            gradient: "from-violet-400 to-purple-500",
            bgGradient: "from-violet-50 to-purple-50",
            icon: "⭐",
            progress: 100,
            data: ziwei,
        },
        {
            id: "vedic",
            title: "印度星盘",
            subtitle: "吠陀占星学分析",
            gradient: "from-amber-400 to-orange-500",
            bgGradient: "from-amber-50 to-orange-50",
            icon: "🔮",
            progress: 100,
            data: vedic,
        },
    ];

    const userInfo = [
        { label: "出生日期", value: input.birth_date, icon: Calendar, color: "text-blue-600", bg: "bg-blue-100" },
        { label: "出生时间", value: input.birth_time, icon: Clock, color: "text-emerald-600", bg: "bg-emerald-100" },
        { label: "出生地点", value: input.location_name || `${input.longitude}°, ${input.latitude}°`, icon: MapPin, color: "text-orange-600", bg: "bg-orange-100" },
        { label: "性别", value: input.gender_str, icon: User, color: "text-purple-600", bg: "bg-purple-100" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
            {/* Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-slate-800/40 to-gray-800/40 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-slate-700/30 to-gray-700/30 rounded-full blur-3xl"></div>

                {/* Floating geometric shapes */}
                <div className="absolute top-1/4 left-1/6 w-2 h-2 bg-blue-400 rounded-full animate-float opacity-60"></div>
                <div
                    className="absolute top-1/3 right-1/4 w-1 h-1 bg-purple-400 rounded-full animate-float opacity-40"
                    style={{ animationDelay: "1s" }}
                ></div>
                <div
                    className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-pink-400 rounded-full animate-float opacity-50"
                    style={{ animationDelay: "2s" }}
                ></div>
            </div>

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between p-6 bg-slate-800/80 backdrop-blur-sm border-b border-slate-700">
                <button
                    onClick={props.onBack || (() => navigate('/'))}
                    className="flex items-center text-slate-200 hover:bg-slate-700 hover:text-white transition-all duration-300 px-4 py-2 rounded-lg"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    返回
                </button>
            </div>

            {/* Main Content */}
            <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">
                {/* Title Section */}
                <div
                    className={`text-center mb-12 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                >
                    <div className="inline-flex items-center gap-2 mb-4">
                        <Sparkles className="w-6 h-6 text-purple-400" />
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                            命理分析报告
                        </h1>
                        <Sparkles className="w-6 h-6 text-blue-400" />
                    </div>
                    <p className="text-slate-400 text-lg">专业的命理分析，为您揭示人生密码</p>
                    <div className="mt-2 text-center">
                        <span className="text-slate-400 text-base">
                            出生日期：{input.birth_date || '未知'}
                            &nbsp;&nbsp;出生时间：{input.birth_time || '未知'}
                            &nbsp;&nbsp;出生地点：{input.location_name || `${input.longitude}°, ${input.latitude}°`}
                            &nbsp;&nbsp;性别：{input.gender_str || '未知'}
                        </span>
                    </div>

                    {/* 三盘混合深度分析按钮 */}
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={() => setShowPayModal(true)}
                            className="group relative inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-600 hover:via-yellow-600 hover:to-orange-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                            {/* 钱币图标 */}
                            <div className="flex items-center justify-center w-6 h-6 bg-yellow-400 rounded-full text-orange-800 group-hover:rotate-12 transition-transform duration-300">
                                <span className="text-sm font-bold">¥</span>
                            </div>
                            <span className="text-lg">三盘混合深度分析</span>
                            <div className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">VIP</div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                        </button>
                    </div>

                    <div className="mt-6 w-32 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto rounded-full"></div>
                </div>

                {/* Analysis Cards */}
                <div className="space-y-6">
                    {analysisItems.map((item, index) => (
                        <div
                            key={item.id}
                            className={`group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-slate-900/50 border border-slate-700 bg-slate-800/80 backdrop-blur-sm overflow-hidden rounded-lg ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
                            style={{ transitionDelay: `${600 + index * 200}ms` }}
                            onMouseEnter={() => setHoveredCard(item.id)}
                            onMouseLeave={() => setHoveredCard(null)}
                            onClick={() => toggleSection(item.id)}
                        >
                            <div className="p-0">
                                <div className="flex items-center">
                                    {/* 左侧竖色条 */}
                                    <div className={`w-2 md:w-3 h-24 bg-gradient-to-b ${item.gradient} rounded-l-lg mr-6`} />
                                    {/* 图标+内容 */}
                                    <div className="flex items-center space-x-4 flex-1">
                                        <div className="ml-2">
                                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.bgGradient} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300`}>
                                                {item.icon}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-100 mb-1 group-hover:bg-gradient-to-r group-hover:from-slate-100 group-hover:to-slate-300 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                                                {item.title}
                                            </h3>
                                            <p className="text-slate-400 mb-3">{item.subtitle}</p>
                                            {/* Progress Bar */}
                                            <div className="w-48 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full bg-gradient-to-r ${item.gradient} rounded-full transition-all duration-1000 ease-out`}
                                                    style={{
                                                        width: hoveredCard === item.id ? `${item.progress}%` : "0%",
                                                        transitionDelay: hoveredCard === item.id ? "200ms" : "0ms",
                                                    }}
                                                ></div>
                                            </div>
                                            <p className="text-sm text-slate-500 mt-1">分析完成度: {item.progress}%</p>
                                        </div>
                                    </div>
                                    {/* 右侧按钮（电脑端） */}
                                    <div className="hidden md:flex items-center space-x-2 mr-4">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); generatePrompt(item.id); }}
                                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg bg-gradient-to-r ${item.gradient} hover:shadow-lg transition-all duration-300 group/btn`}
                                            title="生成 AI 提示"
                                        >
                                            <Wand2 className="w-4 h-4 text-white group-hover/btn:scale-110 transition-transform duration-300" />
                                            <span className="text-white text-sm font-medium">生成 AI 提示</span>
                                        </button>
                                        <div
                                            className={`p-3 rounded-full bg-slate-700 group-hover:bg-gradient-to-r group-hover:${item.gradient} transition-all duration-300`}
                                        >
                                            {expandedSections[item.id] ?
                                                <EyeOff className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors duration-300" /> :
                                                <Eye className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors duration-300" />
                                            }
                                        </div>
                                    </div>
                                    {/* 手机端按钮（下方） */}
                                    <div className="flex md:hidden w-full mt-2 gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); generatePrompt(item.id); }}
                                            className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg bg-gradient-to-r ${item.gradient} hover:shadow-lg transition-all duration-300 group/btn`}
                                            title="生成 AI 提示"
                                        >
                                            <Wand2 className="w-4 h-4 text-white group-hover/btn:scale-110 transition-transform duration-300" />
                                            <span className="text-white text-sm font-medium">生成 AI 提示</span>
                                        </button>
                                        <div
                                            className={`p-3 rounded-full bg-slate-700 group-hover:bg-gradient-to-r group-hover:${item.gradient} transition-all duration-300`}
                                        >
                                            {expandedSections[item.id] ?
                                                <EyeOff className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors duration-300" /> :
                                                <Eye className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors duration-300" />
                                            }
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                {expandedSections[item.id] && item.data && (
                                    <div className="border-t border-slate-700 bg-slate-900/50 p-6">
                                        {item.id === 'bazi' && renderBaziContent(item.data, input)}
                                        {item.id === 'ziwei' && renderZiweiContent(item.data)}
                                        {item.id === 'vedic' && renderVedicContent(item.data)}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 提示词弹窗 */}
            {promptModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800 border border-slate-600 rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                        {/* 弹窗头部 */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-600">
                            <div className="flex items-center space-x-3">
                                <Wand2 className="w-6 h-6 text-purple-400" />
                                <h3 className="text-xl font-bold text-slate-100">
                                    {promptModal.type === 'bazi' && '八字命盘'}
                                    {promptModal.type === 'ziwei' && '紫微斗数'}
                                    {promptModal.type === 'vedic' && '印度星盘'}
                                    提示词
                                </h3>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={copyPrompt}
                                    className={`flex items-center space-x-2 px-4 py-2 bg-gradient-to-r ${promptModal.type === 'bazi' ? 'from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600' :
                                        promptModal.type === 'ziwei' ? 'from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600' :
                                            'from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600'
                                        } text-white rounded-lg transition-all duration-300`}
                                >
                                    <Copy className="w-4 h-4" />
                                    <span>复制</span>
                                </button>
                                <button
                                    onClick={closePromptModal}
                                    className="p-2 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors duration-300"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* 弹窗内容 */}
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4">
                                <pre className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                                    {promptModal.content}
                                </pre>
                            </div>

                            {/* 使用说明 */}
                            <div className="mt-4 p-4 bg-blue-900/20 border border-blue-800/50 rounded-lg">
                                <h4 className="text-blue-300 font-medium mb-2">使用说明：</h4>
                                <ul className="text-blue-200 text-sm space-y-1">
                                    <li>• 点击"一键复制"将提示词复制到剪贴板</li>
                                    <li>• 将提示词粘贴到您喜欢的AI智能助手中</li>
                                    <li>• AI将根据您的命盘信息提供详细的分析和指导</li>
                                    <li>• 您可以进一步询问具体问题获得更精准的建议</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showCopyTip && (
                <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 bg-blue-600 text-white px-6 py-2 rounded-lg shadow-lg text-base font-semibold animate-fade-in-out">
                    复制成功，粘贴到你喜欢的ai吧！
                </div>
            )}

            {/* 付费弹窗 */}
            {showPayModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 md:p-4">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 shadow-2xl rounded-xl md:rounded-2xl max-w-xs md:max-w-2xl w-full relative overflow-hidden">
                        {/* Decorative background elements */}
                        <div className="absolute top-0 right-0 w-20 h-20 md:w-32 md:h-32 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-14 h-14 md:w-24 md:h-24 bg-gradient-to-tr from-pink-500/10 to-orange-500/10 rounded-full blur-2xl"></div>
                        <div className="p-4 md:p-8 relative z-10">
                            {/* 关闭按钮 */}
                            <button onClick={() => setShowPayModal(false)} className="absolute top-2 right-2 md:top-4 md:right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors duration-300">
                                <X className="w-5 h-5 md:w-6 md:h-6" />
                            </button>
                            {/* Header */}
                            <div className="text-center mb-4 md:mb-8">
                                <div className="inline-flex items-center gap-2 mb-2 md:mb-4">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                    <h3 className="text-lg md:text-2xl font-bold text-slate-100">专业版命理分析</h3>
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                                </div>
                                <p className="text-slate-400 text-sm md:text-base">解锁完整的命理密码，获得专业级分析报告</p>
                            </div>
                            {/* Price Display */}
                            <div className="text-center mb-4 md:mb-8">
                                <div className="inline-flex items-baseline gap-2 bg-gradient-to-r from-slate-700 to-slate-600 rounded-xl md:rounded-2xl px-4 py-2 md:px-6 md:py-4 border border-slate-500">
                                    <span className="text-slate-400 text-base md:text-lg">仅需</span>
                                    <span className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">¥19.9</span>
                                    <span className="text-slate-400 text-xs md:text-sm">人民币</span>
                                </div>
                                <div className="flex justify-center mt-2">
                                    <button
                                        onClick={() => { setShowPayModal(false); setShowExamplePage(true); }}
                                        className="px-4 py-1 bg-gradient-to-r from-slate-700 to-slate-600 border border-slate-500 text-slate-200 text-xs rounded-xl hover:from-slate-600 hover:to-slate-700 transition-all duration-200 shadow"
                                    >
                                        展示示例
                                    </button>
                                </div>
                            </div>
                            {/* Features Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 mb-4 md:mb-8">
                                {[
                                    {
                                        icon: "📊",
                                        title: "优劣混合分析",
                                        description: "结合三个盘一起找出你的优势劣势",
                                        gradient: "from-blue-500/20 to-cyan-500/20",
                                    },
                                    {
                                        icon: "⭐",
                                        title: "思维导图呈现",
                                        description: "用思维导图方式梳理命理结构与人生主线",
                                        gradient: "from-purple-500/20 to-violet-500/20",
                                    },
                                    {
                                        icon: "🔮",
                                        title: "运势预测报告",
                                        description: "未来一年运势详细预测，助您把握人生机遇",
                                        gradient: "from-pink-500/20 to-rose-500/20",
                                    },
                                    {
                                        icon: "💡",
                                        title: "个性化建议",
                                        description: "五维（性格，事业，财富，感情，成长）的30个问题回答",
                                        gradient: "from-amber-500/20 to-orange-500/20",
                                    },
                                ].map((feature, index) => (
                                    <div
                                        key={feature.title}
                                        className={`group p-2 md:p-4 rounded-lg md:rounded-xl bg-gradient-to-br ${feature.gradient} border border-slate-600/50 hover:border-slate-500 transition-all duration-300 hover:scale-105`}
                                    >
                                        <div className="flex items-start gap-2 md:gap-3">
                                            <div className="text-xl md:text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                                {feature.icon}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-200 mb-1 group-hover:text-white transition-colors duration-300 text-sm md:text-base">
                                                    {feature.title}
                                                </h4>
                                                <p className="text-xs md:text-sm text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
                                                    {feature.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* CTA Button */}
                            <div className="text-center">
                                <button
                                    onClick={() => setShowCodeModal(true)}
                                    disabled={isGeneratingReport}
                                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white px-6 md:px-12 py-3 md:py-4 text-base md:text-lg font-semibold rounded-lg md:rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="relative z-10">
                                        {isGeneratingReport ? `生成中 ${generationProgress}%` : '立即获取完整报告'}
                                    </span>
                                    {isGeneratingReport && (
                                        <div
                                            className="absolute bottom-0 left-0 h-1 bg-white/40 transition-all duration-300"
                                            style={{ width: `${generationProgress}%` }}
                                        ></div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                </button>
                                <p className="text-slate-500 text-xs mt-2 md:mt-3">
                                    {isGeneratingReport
                                        ? currentGenerationStep || '🤖 AI正在基于您的命理数据深度分析中...'
                                        : '✨ AI深度分析 | 🔒 数据安全 | 📱 支持所有设备'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 兑换码悬浮窗 */}
            <CodeRedemptionModal
                isOpen={showCodeModal}
                onClose={() => setShowCodeModal(false)}
                onSuccess={generateAIReport}
            />

            {/* Inline Styles for animations */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
                @keyframes fade-in-out {
                    0% { opacity: 0; transform: translateY(-10px); }
                    10% { opacity: 1; transform: translateY(0); }
                    90% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(-10px); }
                }
                .animate-fade-in-out {
                    animation: fade-in-out 1.5s;
                }
            `}</style>
        </div>
    );

    // 渲染八字内容
    function renderBaziContent(bazi, input) {
        return (
            <div className="space-y-6">
                {/* 真太阳时信息 */}
                {input.true_solar_time && (
                    <div className="bg-amber-900/20 border border-amber-800/50 rounded-lg p-4">
                        <h4 className="font-medium text-amber-200 mb-2">真太阳时修正</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-amber-300">原始时间：</span>
                                <span className="font-medium text-amber-100 ml-2">
                                    {input.birth_date} {input.birth_time}
                                </span>
                            </div>
                            <div>
                                <span className="text-amber-300">真太阳时：</span>
                                <span className="font-medium text-amber-100 ml-2">
                                    {input.true_solar_time.year}-
                                    {String(input.true_solar_time.month).padStart(2, '0')}-
                                    {String(input.true_solar_time.day).padStart(2, '0')} {' '}
                                    {String(input.true_solar_time.hour).padStart(2, '0')}:
                                    {String(input.true_solar_time.minute).padStart(2, '0')}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* 四柱表格 */}
                <div>
                    <h4 className="font-medium text-slate-200 mb-4">四柱信息</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-800/50">
                                    <th className="border border-slate-600 px-4 py-3 text-left font-medium text-slate-200">柱位</th>
                                    <th className="border border-slate-600 px-4 py-3 text-left font-medium text-slate-200">干支</th>
                                    <th className="border border-slate-600 px-4 py-3 text-left font-medium text-slate-200">纳音</th>
                                    <th className="border border-slate-600 px-4 py-3 text-left font-medium text-slate-200">藏干</th>
                                    <th className="border border-slate-600 px-4 py-3 text-left font-medium text-slate-200">十神</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-slate-600 px-4 py-3 font-medium text-slate-300">年柱</td>
                                    <td className="border border-slate-600 px-4 py-3 text-rose-400 font-medium">{bazi.year_pillar || '未知'}</td>
                                    <td className="border border-slate-600 px-4 py-3 text-emerald-400">
                                        {bazi.enhanced_analysis?.四柱详析?.[0]?.纳音 || bazi.nayin?.年柱 || '未知'}
                                    </td>
                                    <td className="border border-slate-600 px-4 py-3 text-blue-400">
                                        {bazi.enhanced_analysis?.四柱详析?.[0]?.藏干?.join(', ') || '未知'}
                                    </td>
                                    <td className="border border-slate-600 px-4 py-3 text-purple-400">
                                        {bazi.enhanced_analysis?.四柱详析?.[0]?.藏干十神?.map(item => `${item.藏干}(${item.十神})`).join(', ') || bazi.ten_gods?.年干 || '未知'}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border border-slate-600 px-4 py-3 font-medium text-slate-300">月柱</td>
                                    <td className="border border-slate-600 px-4 py-3 text-rose-400 font-medium">{bazi.month_pillar || '未知'}</td>
                                    <td className="border border-slate-600 px-4 py-3 text-emerald-400">
                                        {bazi.enhanced_analysis?.四柱详析?.[1]?.纳音 || bazi.nayin?.月柱 || '未知'}
                                    </td>
                                    <td className="border border-slate-600 px-4 py-3 text-blue-400">
                                        {bazi.enhanced_analysis?.四柱详析?.[1]?.藏干?.join(', ') || '未知'}
                                    </td>
                                    <td className="border border-slate-600 px-4 py-3 text-purple-400">
                                        {bazi.enhanced_analysis?.四柱详析?.[1]?.藏干十神?.map(item => `${item.藏干}(${item.十神})`).join(', ') || bazi.ten_gods?.月干 || '未知'}
                                    </td>
                                </tr>
                                <tr className="bg-yellow-900/20">
                                    <td className="border border-slate-600 px-4 py-3 font-medium text-slate-300">日柱 (日主)</td>
                                    <td className="border border-slate-600 px-4 py-3 text-rose-400 font-bold text-lg">{bazi.day_pillar || '未知'}</td>
                                    <td className="border border-slate-600 px-4 py-3 text-emerald-400">
                                        {bazi.enhanced_analysis?.四柱详析?.[2]?.纳音 || bazi.nayin?.日柱 || '未知'}
                                    </td>
                                    <td className="border border-slate-600 px-4 py-3 text-blue-400">
                                        {bazi.enhanced_analysis?.四柱详析?.[2]?.藏干?.join(', ') || '未知'}
                                    </td>
                                    <td className="border border-slate-600 px-4 py-3 text-purple-400">
                                        {bazi.enhanced_analysis?.四柱详析?.[2]?.藏干十神?.map(item => `${item.藏干}(${item.十神})`).join(', ') || bazi.ten_gods?.日干 || '未知'}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border border-slate-600 px-4 py-3 font-medium text-slate-300">时柱</td>
                                    <td className="border border-slate-600 px-4 py-3 text-rose-400 font-medium">{bazi.hour_pillar || '未知'}</td>
                                    <td className="border border-slate-600 px-4 py-3 text-emerald-400">
                                        {bazi.enhanced_analysis?.四柱详析?.[3]?.纳音 || bazi.nayin?.时柱 || '未知'}
                                    </td>
                                    <td className="border border-slate-600 px-4 py-3 text-blue-400">
                                        {bazi.enhanced_analysis?.四柱详析?.[3]?.藏干?.join(', ') || '未知'}
                                    </td>
                                    <td className="border border-slate-600 px-4 py-3 text-purple-400">
                                        {bazi.enhanced_analysis?.四柱详析?.[3]?.藏干十神?.map(item => `${item.藏干}(${item.十神})`).join(', ') || bazi.ten_gods?.时干 || '未知'}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 五行分布 */}
                {bazi.five_elements && (
                    <div>
                        <h4 className="font-medium text-slate-200 mb-4">五行分布</h4>
                        <div className="space-y-3">
                            {Object.entries(bazi.five_elements).map(([element, count]) => (
                                <div key={element} className="flex items-center justify-between">
                                    <span className="text-slate-300">{element}</span>
                                    <div className="flex items-center space-x-3 flex-1 max-w-xs">
                                        <div className="flex-1 bg-slate-700 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-rose-400 to-pink-500 h-2 rounded-full transition-all duration-1000"
                                                style={{ width: `${(count / Math.max(...Object.values(bazi.five_elements))) * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-slate-400 text-sm w-8">{count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 综合分析 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-medium text-slate-200 mb-4">命理基础</h4>
                        <div className="space-y-3">
                            <div className="p-4 bg-blue-900/20 border border-blue-800/50 rounded-lg">
                                <p className="text-sm text-blue-300 mb-1">日主</p>
                                <p className="font-bold text-blue-100 text-lg">{bazi.day_master || '未知'}</p>
                            </div>
                            <div className="p-4 bg-green-900/20 border border-green-800/50 rounded-lg">
                                <p className="text-sm text-green-300 mb-1">身强身弱</p>
                                <p className="font-bold text-green-100 text-lg">{bazi.body_strength || '未知'}</p>
                            </div>

                        </div>
                    </div>

                    <div>
                        <h4 className="font-medium text-slate-200 mb-4">十神关系</h4>
                        <div className="space-y-2">
                            {bazi.ten_gods && Object.entries(bazi.ten_gods).map(([position, god]) => (
                                <div key={position} className="flex justify-between p-3 bg-purple-900/20 border border-purple-800/50 rounded-lg">
                                    <span className="text-purple-300">{position}：</span>
                                    <span className="font-medium text-purple-100">{god}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>


            </div>
        );
    }

    // 渲染紫微斗数内容
    function renderZiweiContent(ziwei) {
        return (
            <div className="space-y-6">
                {/* 基本信息 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-medium text-slate-200 mb-4">基本信息</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between p-3 bg-slate-800/50 rounded-lg">
                                <span className="text-slate-400">命宫主星：</span>
                                <span className="font-medium text-slate-200">{ziwei.basic_info?.soul || '未知'}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-slate-800/50 rounded-lg">
                                <span className="text-slate-400">身宫主星：</span>
                                <span className="font-medium text-slate-200">{ziwei.basic_info?.body || '未知'}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-slate-800/50 rounded-lg">
                                <span className="text-slate-400">五行局：</span>
                                <span className="font-medium text-slate-200">{ziwei.basic_info?.five_elements_class || '未知'}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-slate-800/50 rounded-lg">
                                <span className="text-slate-400">农历：</span>
                                <span className="font-medium text-slate-200">{ziwei.basic_info?.lunar_date || '未知'}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-slate-800/50 rounded-lg">
                                <span className="text-slate-400">干支：</span>
                                <span className="font-medium text-slate-200">{ziwei.basic_info?.chinese_date || '未知'}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-medium text-slate-200 mb-4">年干四化</h4>
                        <div className="space-y-3">
                            {ziwei.year_four_trans && Object.entries(ziwei.year_four_trans).map(([type, star]) => (
                                <div key={type} className="flex justify-between p-3 bg-violet-900/20 border border-violet-800/50 rounded-lg">
                                    <span className="text-violet-300 font-medium">{type}：</span>
                                    <span className="font-medium text-violet-100">{star}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 十四主星位置 */}
                <div>
                    <h4 className="font-medium text-slate-200 mb-4">十四主星分布</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {ziwei.chart?.star_positions && Object.entries(ziwei.chart.star_positions).map(([star, palace]) => (
                            <div key={star} className="flex justify-between p-3 bg-violet-900/20 border border-violet-800/50 rounded-lg">
                                <span className="text-violet-300 font-medium">{star}</span>
                                <span className="text-violet-100">{palace}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 十二宫详细信息 */}
                <div>
                    <h4 className="font-medium text-slate-200 mb-4">十二宫详析</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {ziwei.chart?.palaces && Object.entries(ziwei.chart.palaces).map(([palaceName, palace]) => (
                            <div key={palaceName} className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h5 className="font-semibold text-slate-200">{palaceName}</h5>
                                    {palace.is_body_palace && (
                                        <span className="px-2 py-1 bg-yellow-900/30 text-yellow-300 text-xs rounded-full">身宫</span>
                                    )}
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="text-slate-400">宫位：</span>
                                        <span className="font-medium text-slate-300">{palace.heavenly_stem}{palace.earthly_branch}</span>
                                    </div>
                                    {palace.major_stars && palace.major_stars.length > 0 && (
                                        <div>
                                            <span className="text-slate-400">主星：</span>
                                            <div className="mt-1">
                                                {palace.major_stars.map((star, idx) => (
                                                    <span key={idx} className="inline-block mr-2 mb-1 px-2 py-1 bg-violet-900/30 text-violet-300 text-xs rounded">
                                                        {star.name}
                                                        {star.brightness && `(${star.brightness})`}
                                                        {star.mutagen && `[${star.mutagen}]`}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {palace.minor_stars && palace.minor_stars.length > 0 && (
                                        <div>
                                            <span className="text-slate-400">辅星：</span>
                                            <div className="mt-1">
                                                {palace.minor_stars.map((star, idx) => (
                                                    <span key={idx} className="inline-block mr-1 mb-1 px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded">
                                                        {star}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {palace.adjective_stars && palace.adjective_stars.length > 0 && (
                                        <div>
                                            <span className="text-slate-400">煞星：</span>
                                            <div className="mt-1">
                                                {palace.adjective_stars.map((star, idx) => (
                                                    <span key={idx} className="inline-block mr-1 mb-1 px-2 py-1 bg-red-900/30 text-red-300 text-xs rounded">
                                                        {star}
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
            </div>
        );
    }

    // 渲染印度星盘内容  
    function renderVedicContent(vedic) {
        return (
            <div className="space-y-6">
                {/* 基本信息 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-medium text-slate-200 mb-4">基本信息</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between p-3 bg-slate-800/50 rounded-lg">
                                <span className="text-slate-400">星盘类型：</span>
                                <span className="font-medium text-slate-200">{vedic.chart_type || '未知'}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-slate-800/50 rounded-lg">
                                <span className="text-slate-400">春分点岁差：</span>
                                <span className="font-medium text-slate-200">{vedic.ayanamsa?.type} ({vedic.ayanamsa?.value}°)</span>
                            </div>
                            <div className="flex justify-between p-3 bg-slate-800/50 rounded-lg">
                                <span className="text-slate-400">上升星座：</span>
                                <span className="font-medium text-slate-200">{vedic.ascendant?.sign || '未知'} (第{vedic.ascendant?.house}宫 {vedic.ascendant?.lon?.toFixed(2)}°)</span>
                            </div>
                            <div className="flex justify-between p-3 bg-slate-800/50 rounded-lg">
                                <span className="text-slate-400">计算时间：</span>
                                <span className="font-medium text-slate-200">{vedic.input?.date} {vedic.input?.time} {vedic.input?.timezone}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-slate-800/50 rounded-lg">
                                <span className="text-slate-400">地理坐标：</span>
                                <span className="font-medium text-slate-200">{vedic.input?.latitude}°N, {vedic.input?.longitude}°E</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-medium text-slate-200 mb-4">重要轴点</h4>
                        <div className="space-y-3">
                            {vedic.axis_points && Object.entries(vedic.axis_points).map(([point, data]) => (
                                <div key={point} className="flex justify-between p-3 bg-amber-900/20 border border-amber-800/50 rounded-lg">
                                    <span className="text-amber-300 font-medium">{point}：</span>
                                    <span className="font-medium text-amber-100">
                                        {data.sign} (第{data.house}宫 {data.lon?.toFixed(2)}°)
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 九大行星位置 */}
                <div>
                    <h4 className="font-medium text-slate-200 mb-4">九大行星分布</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {vedic.planets && Object.entries(vedic.planets).map(([planet, data]) => {
                            // 转换行星名称
                            const planetName = planet === 'North Node' ? 'Rahu（拉胡）' :
                                planet === 'South Node' ? 'Ketu（凯图）' : planet;

                            return (
                                <div key={planet} className="bg-amber-900/20 border border-amber-800/50 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h5 className="font-semibold text-amber-200">{planetName}</h5>
                                        <span className="text-sm text-amber-300">第{data.house}宫</span>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-amber-400">星座：</span>
                                            <span className="font-medium text-amber-100">{data.sign}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-amber-400">度数：</span>
                                            <span className="font-medium text-amber-100">{data.lon?.toFixed(2)}°</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 宫位分布统计 */}
                <div>
                    <h4 className="font-medium text-slate-200 mb-4">宫位分布统计</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {(() => {
                            // 统计每个宫位的行星
                            const houseStats = {};
                            if (vedic.planets) {
                                Object.entries(vedic.planets).forEach(([planet, data]) => {
                                    const house = data.house;
                                    if (!houseStats[house]) houseStats[house] = [];
                                    // 转换行星名称
                                    const planetName = planet === 'North Node' ? 'Rahu（拉胡）' :
                                        planet === 'South Node' ? 'Ketu（凯图）' : planet;
                                    houseStats[house].push(planetName);
                                });
                            }

                            return Array.from({ length: 12 }, (_, i) => i + 1).map(houseNum => (
                                <div key={houseNum} className="bg-slate-800/50 border border-slate-600 rounded-lg p-3">
                                    <div className="font-semibold text-slate-200 mb-2">第{houseNum}宫</div>
                                    <div className="space-y-1">
                                        {houseStats[houseNum] ? houseStats[houseNum].map((planetName, idx) => (
                                            <span key={idx} className="inline-block mr-1 mb-1 px-2 py-1 bg-amber-900/30 text-amber-300 text-xs rounded">
                                                {planetName}
                                            </span>
                                        )) : (
                                            <span className="text-slate-500 text-xs">空宫</span>
                                        )}
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                </div>

                {/* 星座分布统计 */}
                <div>
                    <h4 className="font-medium text-slate-200 mb-4">星座分布统计</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {(() => {
                            // 统计每个星座的行星
                            const signStats = {};
                            if (vedic.planets) {
                                Object.entries(vedic.planets).forEach(([planet, data]) => {
                                    const sign = data.sign;
                                    if (!signStats[sign]) signStats[sign] = [];
                                    // 转换行星名称
                                    const planetName = planet === 'North Node' ? 'Rahu（拉胡）' :
                                        planet === 'South Node' ? 'Ketu（凯图）' : planet;
                                    signStats[sign].push(planetName);
                                });
                            }

                            return Object.entries(signStats).map(([sign, planets]) => (
                                <div key={sign} className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-3">
                                    <div className="font-semibold text-blue-200 mb-2">{sign}</div>
                                    <div className="space-y-1">
                                        {planets.map((planetName, idx) => (
                                            <span key={idx} className="inline-block mr-1 mb-1 px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded">
                                                {planetName}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                </div>
            </div>
        );
    }
};

export default ResultsPage; 