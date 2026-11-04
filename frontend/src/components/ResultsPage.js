import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';
import { ArrowLeft, Share2, Download, Calendar, Clock, MapPin, User, Eye, EyeOff, ChevronRight, Sparkles, Copy, X } from 'lucide-react';
import CodeRedemptionModal from './CodeRedemptionModal';
import apiService, { aiAnalysisAPI } from '../services/api';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ResultsPage = (props) => {
    const location = useLocation();
    const navigate = useNavigate();
    const data = props.data || location.state?.chartData || (() => {
        try { return JSON.parse(localStorage.getItem('li_last_chart') || 'null'); } catch { return null; }
    })();
    const [isVisible, setIsVisible] = useState(false);
    const [hoveredCard, setHoveredCard] = useState(null);
    const [expandedSections, setExpandedSections] = useState({
        bazi: false,
        ziwei: false,
        vedic: false
    });
    const [showPayModal, setShowPayModal] = useState(false);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [currentGenerationStep, setCurrentGenerationStep] = useState('');
    const [showCodeModal, setShowCodeModal] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    // 结果持久化：刷新或误关页面后还能找回这次排盘
    useEffect(() => {
        if (data) {
            try { localStorage.setItem('li_last_chart', JSON.stringify(data)); } catch { /* 存储不可用时忽略 */ }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 在线支付直达：支付成功页把已付费的码暂存 li_paid_code，回到结果页自动核销并生成报告，
    // 用户无需再手动输码。核销序列与手动输码完全一致（verify → generate）。
    const autoRedeemTried = React.useRef(false);
    useEffect(() => {
        if (!data || autoRedeemTried.current) return;
        let paidCode = null;
        try { paidCode = localStorage.getItem('li_paid_code'); } catch { /* 存储不可用时忽略 */ }
        if (!paidCode) return;
        autoRedeemTried.current = true;
        try { localStorage.removeItem('li_paid_code'); } catch { /* 忽略 */ }
        (async () => {
            try {
                const r = await fetch(`${API_BASE}/api/redemption-codes/verify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: paidCode })
                });
                if (r.ok) {
                    toast.success('付款已确认，正在生成你的完整报告…');
                    generateAIReport(paidCode);
                } else {
                    toast.error('自动开通失败，请点“获取完整报告”手动输入付款成功页的恢复码');
                }
            } catch {
                toast.error('自动开通失败，请点“获取完整报告”手动输入付款成功页的恢复码');
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 免费快速解读（本地规则引擎，基于本盘真实数据）
    const [quickRead, setQuickRead] = useState({ type: 'comprehensive', loading: true, text: '', summary: '', points: [], suggestions: [], basis: [], error: '' });
    const loadQuickRead = async (type) => {
        if (!data) return;
        setQuickRead(prev => ({ ...prev, type, loading: true, error: '' }));
        try {
            const r = await apiService.localAnalysis(data, type);
            setQuickRead({ type, loading: false, text: typeof r.analysis === 'string' ? r.analysis : '', summary: r.summary || '', points: r.key_points || [], suggestions: r.suggestions || [], basis: r.basis || [], error: '' });
        } catch (e) {
            setQuickRead(prev => ({ ...prev, loading: false, error: '快速解读暂时生成失败，展开上方任意命盘卡片也能查看完整排盘。' }));
        }
    };
    useEffect(() => {
        if (data) loadQuickRead('comprehensive');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const [shareTip, setShareTip] = useState('');

    // 先判空再解构：直接打开/刷新 /results 时 data 为空，
    // 先解构会抛 TypeError 白屏（守卫原本写在解构之后，永远执行不到）
    if (!data) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 px-4">
                <p className="text-ink-soft">还没有排盘结果 — 先输入出生信息，排一张属于你的盘。</p>
                <button onClick={() => navigate('/')} className="btn-primary px-5 py-2">返回首页排盘</button>
            </div>
        );
    }

    const { input, bazi, ziwei, vedic } = data;

    // 切换展开状态
    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // 下载报告：把本次排盘整理成文本报告下载（纯本地生成，不经服务器）
    const downloadReport = () => {
        const lines = [];
        lines.push('生命洞察 · 三盘合参命盘报告');
        lines.push('============================');
        if (input) {
            lines.push(`出生日期：${input.birth_date || ''}  出生时间：${input.birth_time || ''}`);
            lines.push(`出生地点：${input.location_name || ''}  性别：${input.gender === 0 ? '女' : '男'}`);
        }
        if (bazi) {
            lines.push('', '【八字命盘】');
            const p = bazi.pillars || {};
            const fmt = (x) => x ? `${x.stem || ''}${x.branch || ''}` : '';
            lines.push(`四柱：年 ${fmt(p.year)} · 月 ${fmt(p.month)} · 日 ${fmt(p.day)} · 时 ${fmt(p.hour)}`);
            if (bazi.day_master) lines.push(`日主：${bazi.day_master}${bazi.body_strength ? `（${bazi.body_strength}）` : ''}`);
            const ec = bazi.five_elements_count || {};
            const es = Object.entries(ec).map(([k, v]) => `${k}${v}`).join(' ');
            if (es) lines.push(`五行分布：${es}`);
        }
        if (ziwei) {
            lines.push('', '【紫微斗数】');
            const bi = ziwei.basic_info || {};
            if (bi.life_palace_branch) lines.push(`命宫地支：${bi.life_palace_branch}${bi.five_element_bureau ? ` · ${bi.five_element_bureau}` : ''}`);
            const sp = ziwei.chart?.star_positions || {};
            const names = Object.values(sp).flat().filter(Boolean);
            if (names.length) lines.push(`主要星曜：${[...new Set(names)].join('、')}`);
        }
        if (vedic) {
            lines.push('', '【印度星盘】');
            if (vedic.ascendant?.sign) lines.push(`上升星座：${vedic.ascendant.sign}`);
            const pl = vedic.planets || {};
            const ps = Object.entries(pl).map(([k, v]) => `${k}·${v?.sign || ''}${v?.house ? `(${v.house}宫)` : ''}`).join('；');
            if (ps) lines.push(`行星落座：${ps}`);
        }
        if (quickRead.text) lines.push('', '【免费快速解读】', quickRead.text);
        lines.push('', '—— 命理由三盘合参，仅供参考；命运掌握在自己手中。');
        const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '生命洞察命盘报告.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    // 分享结果：系统分享优先，否则复制文案
    const shareResults = async () => {
        const dm = bazi?.day_master ? `日主${bazi.day_master}` : '';
        const text = `我在「生命洞察」排了一张三盘合参命盘（八字 · 紫微 · 吠陀）${dm ? `，${dm}` : ''}。你也来看看你的：`;
        const url = window.location.origin + '/';
        try {
            if (navigator.share) {
                await navigator.share({ title: '生命洞察 · 三盘合参', text, url });
                return;
            }
            throw new Error('no-native-share');
        } catch (e) {
            try {
                await navigator.clipboard.writeText(`${text} ${url}`);
                setShareTip('分享文案已复制，去粘贴给朋友吧');
            } catch {
                setShareTip('复制失败，请截图分享');
            }
            setTimeout(() => setShareTip(''), 2600);
        }
    };

    // 生成AI报告 - 两阶段调用 + 模拟进度
    const generateAIReport = async (redemptionCode) => {
        setIsGeneratingReport(true);
        setGenerationProgress(0);
        setCurrentGenerationStep('正在准备...');

        try {
            // 使用兑换码作为订单号
            const orderId = redemptionCode;

            // 只生成prompt文件，不调用AI
            setCurrentGenerationStep('正在为您编制报告...');
            setGenerationProgress(30);

            const response = await fetch(`${API_BASE}/api/ai-report/generate`, {
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

            setCurrentGenerationStep('编制完成，正在打开报告...');
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

    const analysisItems = [
        {
            id: "bazi",
            title: "八字命盘",
            subtitle: "中华传统四柱推命",
            gradient: "bg-primary-600",
            bgGradient: "bg-primary-50 border-primary-200 text-primary-700",
            icon: "八",
            progress: 100,
            data: bazi,
        },
        {
            id: "ziwei",
            title: "紫微斗数",
            subtitle: "紫微斗数命盘分析",
            gradient: "bg-secondary-600",
            bgGradient: "bg-secondary-50 border-secondary-200 text-secondary-700",
            icon: "紫",
            progress: 100,
            data: ziwei,
        },
        {
            id: "vedic",
            title: "印度星盘",
            subtitle: "吠陀占星学分析",
            gradient: "bg-accent-500",
            bgGradient: "bg-accent-50 border-accent-200 text-accent-800",
            icon: "吠",
            progress: 100,
            data: vedic,
        },
    ];

    const userInfo = [
        { label: "出生日期", value: input.birth_date, icon: Calendar, color: "text-primary-600", bg: "bg-primary-50" },
        { label: "出生时间", value: input.birth_time, icon: Clock, color: "text-secondary-600", bg: "bg-secondary-50" },
        { label: "出生地点", value: input.location_name || `${input.longitude}°, ${input.latitude}°`, icon: MapPin, color: "text-accent-700", bg: "bg-accent-50" },
        { label: "性别", value: input.gender_str, icon: User, color: "text-ink-soft", bg: "bg-paper-deep" },
    ];

    return (
        <div className="min-h-screen bg-paper">

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between px-6 py-4 bg-paper-card border-b border-line">
                <button
                    onClick={props.onBack || (() => navigate('/'))}
                    className="flex items-center text-ink-soft hover:text-primary-700 hover:bg-paper-deep transition-colors duration-200 px-3 py-2 rounded"
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
                        <span className="seal w-8 h-8 text-sm">命</span>
                        <h1 className="text-4xl font-serif font-black text-ink tracking-wide">
                            命理分析报告
                        </h1>
                        
                    </div>
                    <p className="text-ink-faint text-lg">专业的命理分析，为您揭示人生密码</p>
                    <div className="mt-2 text-center">
                        <span className="text-ink-soft text-base">
                            出生日期：{input.birth_date || '未知'}
                            <p className="text-xs text-ink-faint mt-1">本次结果保存在你当前浏览器中，刷新页面不会丢失；换设备需重新排盘。</p>
                            &nbsp;&nbsp;出生时间：{input.birth_time || '未知'}
                            &nbsp;&nbsp;出生地点：{input.location_name || `${input.longitude}°, ${input.latitude}°`}
                            &nbsp;&nbsp;性别：{input.gender_str || '未知'}
                        </span>
                    </div>

                    {/* 三盘混合深度分析按钮 */}
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={() => setShowPayModal(true)}
                            className="group relative inline-flex items-center space-x-3 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-paper-card font-semibold rounded shadow-soft transition-colors duration-200"
                        >
                            {/* 钱币图标 */}
                            <div className="seal w-6 h-6">
                                <span className="text-xs font-bold">¥</span>
                            </div>
                            <span className="text-lg">三盘混合深度分析</span>
                            <div className="px-2 py-0.5 bg-paper-card text-primary-700 text-xs font-bold rounded-sm tracking-widest">VIP</div>
                        </button>
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-3"><span className="h-px w-24 bg-accent-400"></span><span className="seal w-5 h-5 text-[10px]">印</span><span className="h-px w-24 bg-accent-400"></span></div>
                </div>

                {/* Analysis Cards */}
                <div className="space-y-6">
                    {analysisItems.map((item, index) => (
                        <div
                            key={item.id}
                            className={`group cursor-pointer transition-all duration-500 border border-line bg-paper-card overflow-hidden rounded hover:border-accent-300 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
                            style={{ transitionDelay: `${600 + index * 200}ms` }}
                            onMouseEnter={() => setHoveredCard(item.id)}
                            onMouseLeave={() => setHoveredCard(null)}
                            onClick={() => toggleSection(item.id)}
                        >
                            <div className="p-0">
                                <div className="flex items-center">
                                    {/* 左侧竖色条 */}
                                    <div className={`w-2 md:w-3 h-24 ${item.gradient} rounded-l mr-6`} />
                                    {/* 图标+内容 */}
                                    <div className="flex items-center space-x-4 flex-1">
                                        <div className="ml-2">
                                            <div className={`w-16 h-16 rounded border ${item.bgGradient} flex items-center justify-center font-serif font-bold text-2xl`}>
                                                {item.icon}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-serif font-bold text-ink mb-1">
                                                {item.title}
                                            </h3>
                                            <p className="text-ink-faint mb-3">{item.subtitle}</p>
                                            {/* Progress Bar */}
                                            <div className="w-48 h-1.5 bg-paper-deep rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${item.gradient} rounded-full transition-all duration-1000 ease-out`}
                                                    style={{
                                                        width: hoveredCard === item.id ? `${item.progress}%` : "0%",
                                                        transitionDelay: hoveredCard === item.id ? "200ms" : "0ms",
                                                    }}
                                                ></div>
                                            </div>
                                            <p className="text-sm text-ink-faint mt-1">分析完成度: {item.progress}%</p>
                                        </div>
                                    </div>
                                    {/* 右侧按钮（电脑端） */}
                                    <div className="hidden md:flex items-center space-x-2 mr-4">
                                        <div
                                            className="p-3 rounded-full border border-line bg-paper-deep/60 group-hover:border-accent-300 transition-colors duration-200"
                                        >
                                            {expandedSections[item.id] ?
                                                <EyeOff className="w-5 h-5 text-ink-faint group-hover:text-primary-600 transition-colors duration-200" /> :
                                                <Eye className="w-5 h-5 text-ink-faint group-hover:text-primary-600 transition-colors duration-200" />
                                            }
                                        </div>
                                    </div>
                                    {/* 手机端按钮（下方） */}
                                    <div className="flex md:hidden w-full mt-2 gap-2">
                                        <div
                                            className="p-3 rounded-full border border-line bg-paper-deep/60 group-hover:border-accent-300 transition-colors duration-200"
                                        >
                                            {expandedSections[item.id] ?
                                                <EyeOff className="w-5 h-5 text-ink-faint group-hover:text-primary-600 transition-colors duration-200" /> :
                                                <Eye className="w-5 h-5 text-ink-faint group-hover:text-primary-600 transition-colors duration-200" />
                                            }
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                {expandedSections[item.id] && item.data && (
                                    <div className="border-t border-line bg-paper-deep/40 p-6">
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

            {/* 免费快速解读：先给价值，再谈付费 */}
            <div className="max-w-6xl mx-auto px-4 mt-8">
                <div className="bg-paper-card border border-line rounded shadow-soft p-5 md:p-7">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="seal w-9 h-9 text-base">读</span>
                        <h3 className="text-xl font-serif font-bold text-ink">免费快速解读</h3>
                        <span className="text-xs bg-secondary-50 text-secondary-700 border border-secondary-200 rounded px-2 py-0.5">基于你的命盘实时生成</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {[['comprehensive', '综合'], ['personality', '性格'], ['career', '事业'], ['wealth', '财富'], ['relationship', '感情'], ['health', '健康']].map(([t, label]) => (
                            <button
                                key={t}
                                onClick={() => loadQuickRead(t)}
                                className={`px-3 py-1.5 rounded text-sm border transition-colors ${quickRead.type === t ? 'bg-primary-600 text-paper-card border-primary-600' : 'bg-paper-card text-ink-soft border-line hover:border-accent-300'}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    {quickRead.loading ? (
                        <p className="text-ink-faint text-sm py-6 text-center">正在解读你的命盘…</p>
                    ) : quickRead.error ? (
                        <p className="text-primary-700 text-sm py-4">{quickRead.error}</p>
                    ) : (
                        <div className="space-y-3">
                            {quickRead.summary && <p className="text-ink font-medium leading-relaxed text-[15px]">{quickRead.summary}</p>}
                            {quickRead.points.length > 0 && (
                                <ul className="space-y-1.5">
                                    {quickRead.points.map((pt, i) => (
                                        <li key={i} className="text-ink-soft leading-relaxed text-[15px] flex gap-2"><span className="text-primary-600 mt-0.5">·</span><span>{pt}</span></li>
                                    ))}
                                </ul>
                            )}
                            {quickRead.suggestions.length > 0 && (
                                <div className="bg-paper-deep/50 border border-line rounded p-3">
                                    <p className="text-sm font-medium text-ink mb-1">建议</p>
                                    <ul className="space-y-1">
                                        {quickRead.suggestions.map((sg, i) => (
                                            <li key={i} className="text-sm text-ink-soft leading-relaxed">{sg}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {quickRead.text.split('\n').filter(Boolean).map((para, i) => (
                                <p key={i} className="text-ink-soft leading-relaxed text-[15px]">{para}</p>
                            ))}
                            {quickRead.basis?.length > 0 && (
                                <p className="text-xs text-ink-faint pt-2 border-t border-line">
                                    解读依据：{quickRead.basis.slice(0, 6).join(' · ')}
                                </p>
                            )}
                            <p className="text-xs text-ink-faint">以上为免费版要点解读；完整的三盘交叉分析（含运势与 30 问答疑）在深度报告中展开。</p>
                        </div>
                    )}
                </div>
                <div className="flex gap-3 mt-4">
                    <button onClick={shareResults} className="btn-secondary flex-1 flex items-center justify-center gap-2 py-2.5">
                        <Share2 className="w-4 h-4" /> 分享结果
                    </button>
                    <button onClick={downloadReport} className="btn-secondary flex-1 flex items-center justify-center gap-2 py-2.5">
                        <Download className="w-4 h-4" /> 下载报告
                    </button>
                </div>
            </div>

            {shareTip && (
                <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 bg-ink text-paper-card px-6 py-2 rounded shadow-soft text-base font-medium">
                    {shareTip}
                </div>
            )}


            {/* 付费弹窗 */}
            {showPayModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 md:p-4">
                    <div className="bg-paper-card frame-double shadow-soft max-w-xs md:max-w-2xl w-full relative overflow-hidden">
                        {/* Decorative background elements */}
                        <div className="p-4 md:p-8 relative z-10">
                            {/* 关闭按钮 */}
                            <button onClick={() => setShowPayModal(false)} className="absolute top-2 right-2 md:top-4 md:right-4 p-2 text-ink-faint hover:text-ink hover:bg-paper-deep rounded-full transition-colors duration-200">
                                <X className="w-5 h-5 md:w-6 md:h-6" />
                            </button>
                            {/* Header */}
                            <div className="text-center mb-4 md:mb-8">
                                <div className="inline-flex items-center gap-2 mb-2 md:mb-4">
                                    <span className="inline-block h-px w-8 bg-accent-400"></span>
                                    <h3 className="text-lg md:text-2xl font-serif font-black text-ink">专业版命理分析</h3>
                                    <span className="inline-block h-px w-8 bg-accent-400"></span>
                                </div>
                                <p className="text-ink-faint text-sm md:text-base">解锁完整的命理密码，获得专业级分析报告</p>
                            </div>
                            {/* Price Display */}
                            <div className="text-center mb-4 md:mb-8">
                                <div className="inline-flex items-baseline gap-2 bg-paper-deep/70 rounded px-4 py-2 md:px-6 md:py-4 border border-line">
                                    <span className="text-ink-faint text-base md:text-lg">仅需</span>
                                    <span className="text-2xl md:text-4xl font-serif font-black text-primary-600">¥99</span>
                                    <span className="text-ink-faint text-xs md:text-sm">人民币</span>
                                </div>
                                <div className="flex justify-center mt-2">
                                    <button
                                        onClick={() => { setShowPayModal(false); navigate('/final-report/LIFEDEMO1995'); }}
                                        className="px-4 py-1 bg-paper-card border border-line text-ink-soft text-xs rounded hover:border-accent-300 hover:text-primary-700 transition-colors duration-200"
                                    >
                                        展示示例
                                    </button>
                                </div>
                            </div>
                            {/* Features Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 mb-4 md:mb-8">
                                {[
                                    {
                                        icon: "衡",
                                        title: "优劣混合分析",
                                        description: "结合三个盘一起找出你的优势劣势",
                                        gradient: "bg-primary-50",
                                    },
                                    {
                                        icon: "图",
                                        title: "思维导图呈现",
                                        description: "用思维导图方式梳理命理结构与人生主线",
                                        gradient: "bg-secondary-50",
                                    },
                                    {
                                        icon: "运",
                                        title: "运势预测报告",
                                        description: "未来一年运势详细预测，助您把握人生机遇",
                                        gradient: "bg-accent-50",
                                    },
                                    {
                                        icon: "策",
                                        title: "个性化建议",
                                        description: "五维（性格，事业，财富，感情，成长）的30个问题回答",
                                        gradient: "bg-paper-deep/70",
                                    },
                                ].map((feature, index) => (
                                    <div
                                        key={feature.title}
                                        className={`group p-2 md:p-4 rounded ${feature.gradient} border border-line hover:border-accent-300 transition-colors duration-200`}
                                    >
                                        <div className="flex items-start gap-2 md:gap-3">
                                            <div className="font-serif font-bold text-xl md:text-2xl text-primary-700 flex-shrink-0 w-8 text-center">
                                                {feature.icon}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-ink mb-1 text-sm md:text-base">
                                                    {feature.title}
                                                </h4>
                                                <p className="text-xs md:text-sm text-ink-faint">
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
                                    className="bg-primary-600 hover:bg-primary-700 text-paper-card px-6 md:px-12 py-3 md:py-4 text-base md:text-lg font-semibold rounded shadow-soft transition-colors duration-200 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="relative z-10">
                                        {isGeneratingReport ? '报告编制中...' : '立即获取完整报告'}
                                    </span>
                                    {isGeneratingReport && (
                                        <div
                                            className="absolute bottom-0 left-0 h-1 bg-paper-card/40 transition-all duration-300"
                                            style={{ width: `${generationProgress}%` }}
                                        ></div>
                                    )}
                                    </button>
                                <p className="text-ink-faint text-xs mt-2 md:mt-3">
                                    {isGeneratingReport
                                        ? currentGenerationStep || '正在为您编制专属报告，请稍候...'
                                        : '深度解读 ｜ 数据安全 ｜ 支持所有设备'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 付费悬浮窗 */}
            <CodeRedemptionModal
                isOpen={showCodeModal}
                onClose={() => setShowCodeModal(false)}
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
                    <div className="bg-accent-50 border border-accent-200 rounded p-4">
                        <h4 className="font-serif font-bold text-accent-800 mb-2">真太阳时修正</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-accent-700">原始时间：</span>
                                <span className="font-medium text-ink ml-2">
                                    {input.birth_date} {input.birth_time}
                                </span>
                            </div>
                            <div>
                                <span className="text-accent-700">真太阳时：</span>
                                <span className="font-medium text-ink ml-2">
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
                    <h4 className="font-serif font-bold text-ink mb-4">四柱信息</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-paper-deep/70">
                                    <th className="border border-line px-4 py-3 text-left font-medium text-ink-soft">柱位</th>
                                    <th className="border border-line px-4 py-3 text-left font-medium text-ink-soft">干支</th>
                                    <th className="border border-line px-4 py-3 text-left font-medium text-ink-soft">纳音</th>
                                    <th className="border border-line px-4 py-3 text-left font-medium text-ink-soft">藏干</th>
                                    <th className="border border-line px-4 py-3 text-left font-medium text-ink-soft">十神</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-line px-4 py-3 font-medium text-ink-soft">年柱</td>
                                    <td className="border border-line px-4 py-3 text-primary-600 font-serif font-bold">{bazi.year_pillar || '未知'}</td>
                                    <td className="border border-line px-4 py-3 text-secondary-600">
                                        {bazi.enhanced_analysis?.四柱详析?.[0]?.纳音 || bazi.nayin?.年柱 || '未知'}
                                    </td>
                                    <td className="border border-line px-4 py-3 text-ink-soft">
                                        {bazi.enhanced_analysis?.四柱详析?.[0]?.藏干?.join(', ') || '未知'}
                                    </td>
                                    <td className="border border-line px-4 py-3 text-accent-700">
                                        {bazi.enhanced_analysis?.四柱详析?.[0]?.藏干十神?.map(item => `${item.藏干}(${item.十神})`).join(', ') || bazi.ten_gods?.年干 || '未知'}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border border-line px-4 py-3 font-medium text-ink-soft">月柱</td>
                                    <td className="border border-line px-4 py-3 text-primary-600 font-serif font-bold">{bazi.month_pillar || '未知'}</td>
                                    <td className="border border-line px-4 py-3 text-secondary-600">
                                        {bazi.enhanced_analysis?.四柱详析?.[1]?.纳音 || bazi.nayin?.月柱 || '未知'}
                                    </td>
                                    <td className="border border-line px-4 py-3 text-ink-soft">
                                        {bazi.enhanced_analysis?.四柱详析?.[1]?.藏干?.join(', ') || '未知'}
                                    </td>
                                    <td className="border border-line px-4 py-3 text-accent-700">
                                        {bazi.enhanced_analysis?.四柱详析?.[1]?.藏干十神?.map(item => `${item.藏干}(${item.十神})`).join(', ') || bazi.ten_gods?.月干 || '未知'}
                                    </td>
                                </tr>
                                <tr className="bg-accent-50">
                                    <td className="border border-line px-4 py-3 font-medium text-ink-soft">日柱 (日主)</td>
                                    <td className="border border-line px-4 py-3 text-primary-700 font-serif font-black text-lg">{bazi.day_pillar || '未知'}</td>
                                    <td className="border border-line px-4 py-3 text-secondary-600">
                                        {bazi.enhanced_analysis?.四柱详析?.[2]?.纳音 || bazi.nayin?.日柱 || '未知'}
                                    </td>
                                    <td className="border border-line px-4 py-3 text-ink-soft">
                                        {bazi.enhanced_analysis?.四柱详析?.[2]?.藏干?.join(', ') || '未知'}
                                    </td>
                                    <td className="border border-line px-4 py-3 text-accent-700">
                                        {bazi.enhanced_analysis?.四柱详析?.[2]?.藏干十神?.map(item => `${item.藏干}(${item.十神})`).join(', ') || bazi.ten_gods?.日干 || '未知'}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border border-line px-4 py-3 font-medium text-ink-soft">时柱</td>
                                    <td className="border border-line px-4 py-3 text-primary-600 font-serif font-bold">{bazi.hour_pillar || '未知'}</td>
                                    <td className="border border-line px-4 py-3 text-secondary-600">
                                        {bazi.enhanced_analysis?.四柱详析?.[3]?.纳音 || bazi.nayin?.时柱 || '未知'}
                                    </td>
                                    <td className="border border-line px-4 py-3 text-ink-soft">
                                        {bazi.enhanced_analysis?.四柱详析?.[3]?.藏干?.join(', ') || '未知'}
                                    </td>
                                    <td className="border border-line px-4 py-3 text-accent-700">
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
                        <h4 className="font-serif font-bold text-ink mb-4">五行分布</h4>
                        <div className="space-y-3">
                            {Object.entries(bazi.five_elements).map(([element, count]) => (
                                <div key={element} className="flex items-center justify-between">
                                    <span className="text-ink-soft">{element}</span>
                                    <div className="flex items-center space-x-3 flex-1 max-w-xs">
                                        <div className="flex-1 bg-paper-deep rounded-full h-2">
                                            <div
                                                className="bg-primary-500 h-2 rounded-full transition-all duration-1000"
                                                style={{ width: `${(count / Math.max(...Object.values(bazi.five_elements))) * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-ink-soft text-sm w-8">{count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 综合分析 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-serif font-bold text-ink mb-4">命理基础</h4>
                        <div className="space-y-3">
                            <div className="p-4 bg-primary-50 border border-primary-100 rounded">
                                <p className="text-sm text-primary-600 mb-1">日主</p>
                                <p className="font-bold text-ink font-serif text-lg">{bazi.day_master || '未知'}</p>
                            </div>
                            <div className="p-4 bg-secondary-50 border border-secondary-100 rounded">
                                <p className="text-sm text-secondary-600 mb-1">身强身弱</p>
                                <p className="font-bold text-ink font-serif text-lg">{bazi.body_strength || '未知'}</p>
                            </div>

                        </div>
                    </div>

                    <div>
                        <h4 className="font-serif font-bold text-ink mb-4">十神关系</h4>
                        <div className="space-y-2">
                            {bazi.ten_gods && Object.entries(bazi.ten_gods).map(([position, god]) => (
                                <div key={position} className="flex justify-between p-3 bg-paper-card border border-line rounded">
                                    <span className="text-ink-faint">{position}：</span>
                                    <span className="font-medium text-ink">{god}</span>
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
                        <h4 className="font-serif font-bold text-ink mb-4">基本信息</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between p-3 bg-paper-card border border-line rounded">
                                <span className="text-ink-faint">命宫主星：</span>
                                <span className="font-medium text-ink">{ziwei.basic_info?.soul || '未知'}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-paper-card border border-line rounded">
                                <span className="text-ink-faint">身宫主星：</span>
                                <span className="font-medium text-ink">{ziwei.basic_info?.body || '未知'}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-paper-card border border-line rounded">
                                <span className="text-ink-faint">五行局：</span>
                                <span className="font-medium text-ink">{ziwei.basic_info?.five_elements_class || '未知'}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-paper-card border border-line rounded">
                                <span className="text-ink-faint">农历：</span>
                                <span className="font-medium text-ink">{ziwei.basic_info?.lunar_date || '未知'}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-paper-card border border-line rounded">
                                <span className="text-ink-faint">干支：</span>
                                <span className="font-medium text-ink">{ziwei.basic_info?.chinese_date || '未知'}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-serif font-bold text-ink mb-4">年干四化</h4>
                        <div className="space-y-3">
                            {ziwei.year_four_trans && Object.entries(ziwei.year_four_trans).map(([type, star]) => (
                                <div key={type} className="flex justify-between p-3 bg-secondary-50 border border-secondary-100 rounded">
                                    <span className="text-secondary-700 font-medium">{type}：</span>
                                    <span className="font-medium text-ink">{star}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 十四主星位置 */}
                <div>
                    <h4 className="font-serif font-bold text-ink mb-4">十四主星分布</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {ziwei.chart?.star_positions && Object.entries(ziwei.chart.star_positions).map(([star, palace]) => (
                            <div key={star} className="flex justify-between p-3 bg-secondary-50 border border-secondary-100 rounded">
                                <span className="text-secondary-700 font-medium">{star}</span>
                                <span className="text-ink">{palace}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 十二宫详细信息 */}
                <div>
                    <h4 className="font-serif font-bold text-ink mb-4">十二宫详析</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {ziwei.chart?.palaces && Object.entries(ziwei.chart.palaces).map(([palaceName, palace]) => (
                            <div key={palaceName} className="bg-paper-card border border-line rounded p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h5 className="font-semibold text-ink font-serif">{palaceName}</h5>
                                    {palace.is_body_palace && (
                                        <span className="px-2 py-0.5 bg-primary-600 text-paper-card text-xs rounded-sm tracking-widest">身宫</span>
                                    )}
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="text-ink-faint">宫位：</span>
                                        <span className="font-medium text-ink">{palace.heavenly_stem}{palace.earthly_branch}</span>
                                    </div>
                                    {palace.major_stars && palace.major_stars.length > 0 && (
                                        <div>
                                            <span className="text-ink-faint">主星：</span>
                                            <div className="mt-1">
                                                {palace.major_stars.map((star, idx) => (
                                                    <span key={idx} className="inline-block mr-2 mb-1 px-2 py-1 bg-secondary-50 border border-secondary-100 text-secondary-700 text-xs rounded-sm">
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
                                            <span className="text-ink-faint">辅星：</span>
                                            <div className="mt-1">
                                                {palace.minor_stars.map((star, idx) => (
                                                    <span key={idx} className="inline-block mr-1 mb-1 px-2 py-1 bg-paper-deep border border-line text-ink-soft text-xs rounded-sm">
                                                        {star}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {palace.adjective_stars && palace.adjective_stars.length > 0 && (
                                        <div>
                                            <span className="text-ink-faint">煞星：</span>
                                            <div className="mt-1">
                                                {palace.adjective_stars.map((star, idx) => (
                                                    <span key={idx} className="inline-block mr-1 mb-1 px-2 py-1 bg-primary-50 border border-primary-100 text-primary-700 text-xs rounded-sm">
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
                        <h4 className="font-serif font-bold text-ink mb-4">基本信息</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between p-3 bg-paper-card border border-line rounded">
                                <span className="text-ink-faint">星盘类型：</span>
                                <span className="font-medium text-ink">{vedic.chart_type || '未知'}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-paper-card border border-line rounded">
                                <span className="text-ink-faint">春分点岁差：</span>
                                <span className="font-medium text-ink">{vedic.ayanamsa?.type} ({vedic.ayanamsa?.value}°)</span>
                            </div>
                            <div className="flex justify-between p-3 bg-paper-card border border-line rounded">
                                <span className="text-ink-faint">上升星座：</span>
                                <span className="font-medium text-ink">{vedic.ascendant?.sign || '未知'} (第{vedic.ascendant?.house}宫 {vedic.ascendant?.lon?.toFixed(2)}°)</span>
                            </div>
                            <div className="flex justify-between p-3 bg-paper-card border border-line rounded">
                                <span className="text-ink-faint">计算时间：</span>
                                <span className="font-medium text-ink">{vedic.input?.date} {vedic.input?.time} {vedic.input?.timezone}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-paper-card border border-line rounded">
                                <span className="text-ink-faint">地理坐标：</span>
                                <span className="font-medium text-ink">{vedic.input?.latitude}°N, {vedic.input?.longitude}°E</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-serif font-bold text-ink mb-4">重要轴点</h4>
                        <div className="space-y-3">
                            {vedic.axis_points && Object.entries(vedic.axis_points).map(([point, data]) => (
                                <div key={point} className="flex justify-between p-3 bg-accent-50 border border-accent-200 rounded">
                                    <span className="text-accent-700 font-medium">{point}：</span>
                                    <span className="font-medium text-ink">
                                        {data.sign} (第{data.house}宫 {data.lon?.toFixed(2)}°)
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 九大行星位置 */}
                <div>
                    <h4 className="font-serif font-bold text-ink mb-4">九大行星分布</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {vedic.planets && Object.entries(vedic.planets).map(([planet, data]) => {
                            // 转换行星名称
                            const planetName = planet === 'North Node' ? 'Rahu（拉胡）' :
                                planet === 'South Node' ? 'Ketu（凯图）' : planet;

                            return (
                                <div key={planet} className="bg-accent-50/60 border border-accent-200 rounded p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h5 className="font-semibold text-ink font-serif">{planetName}</h5>
                                        <span className="text-sm text-accent-700">第{data.house}宫</span>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-ink-faint">星座：</span>
                                            <span className="font-medium text-ink">{data.sign}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-ink-faint">度数：</span>
                                            <span className="font-medium text-ink">{data.lon?.toFixed(2)}°</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 宫位分布统计 */}
                <div>
                    <h4 className="font-serif font-bold text-ink mb-4">宫位分布统计</h4>
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
                                <div key={houseNum} className="bg-paper-card border border-line rounded p-3">
                                    <div className="font-semibold text-ink font-serif mb-2">第{houseNum}宫</div>
                                    <div className="space-y-1">
                                        {houseStats[houseNum] ? houseStats[houseNum].map((planetName, idx) => (
                                            <span key={idx} className="inline-block mr-1 mb-1 px-2 py-1 bg-accent-50 border border-accent-200 text-accent-800 text-xs rounded-sm">
                                                {planetName}
                                            </span>
                                        )) : (
                                            <span className="text-ink-faint text-xs">空宫</span>
                                        )}
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                </div>

                {/* 星座分布统计 */}
                <div>
                    <h4 className="font-serif font-bold text-ink mb-4">星座分布统计</h4>
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
                                <div key={sign} className="bg-paper-card border border-line rounded p-3">
                                    <div className="font-semibold text-ink font-serif mb-2">{sign}</div>
                                    <div className="space-y-1">
                                        {planets.map((planetName, idx) => (
                                            <span key={idx} className="inline-block mr-1 mb-1 px-2 py-1 bg-paper-deep border border-line text-ink-soft text-xs rounded-sm">
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