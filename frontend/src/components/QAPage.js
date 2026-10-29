import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

const QAPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [aiData, setAiData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setIsVisible(true);
        fetchQAData();
    }, [orderId]);

    const QA_QUESTIONS = {
        wealth: [
            '我这辈子能不能发财？',
            '我靠正财还是偏财容易赚钱？',
            '投资理财对我有没有好处？',
            '我什么时候财运最好？',
            '我是不是容易漏财、赔钱？',
            '我要不要现在换工作/跳槽才能赚得更多？'
        ],
        career: [
            '我适合做哪一行能成事？',
            '我适合创业还是打工？',
            '我会不会一辈子穷忙没有结果？',
            '我的贵人在哪一类人/方向？',
            '我做的这件事有前途吗？',
            '我什么时候事业能真正起来？'
        ],
        love: [
            '我适合什么样的伴侣？',
            '我什么时候容易遇到正缘？',
            '我的感情容易遇到什么问题？',
            '我适合主动还是被动追求感情？',
            '我和另一半的相处建议？',
            '未来一年我的感情运势如何？'
        ],
        fortune: [
            '我什么时候会有真正的转运点？',
            '我过去这么倒霉，是不是流年不好？',
            '明年运势怎么样？能不能做重大决定？',
            '我要不要出国/换城市发展会更好？',
            '我这辈子有没有一次彻底翻身的机会？',
            '我这命，是要靠人、靠天，还是靠自己？'
        ],
        personality: [
            '我天生有啥命？是福命还是苦命？',
            '我性格最大的死穴是什么？',
            '我是不是命里容易孤独、跟别人难亲近？',
            '我是不是天生劳碌命、操心命？',
            '我这人到底适合顺其自然还是奋力争？',
            '命里有没有什么特别的天赋我没用上？'
        ]
    };

    // 分类中文映射
    const CATEGORY_LABELS = {
        wealth: '财富',
        career: '事业',
        love: '感情',
        fortune: '运势',
        personality: '性格'
    };

    // AI返回字段与前端key的映射
    const AI_KEY_MAP = {
        wealth: 'wealth_questions',
        career: 'career_questions',
        love: 'love_questions',
        fortune: 'fortune_questions',
        personality: 'personality_questions'
    };

    const fetchQAData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/ai-report/module-data/${orderId}/qa`);
            if (response.ok) {
                const data = await response.json();
                console.log('QA API返回数据:', data);

                let content = data.content;
                if (content.includes('```json')) {
                    content = content.replace(/```json\n/, '').replace(/\n```/, '');
                }

                // 更安全的JSON解析
                let parsedContent;
                try {
                    parsedContent = JSON.parse(content);
                } catch (jsonError) {
                    console.error('JSON解析失败:', jsonError);
                    console.log('原始content:', content);
                    // 如果JSON解析失败，设置空数据
                    parsedContent = {};
                }

                // 组装新数据：只用AI answer，未返回answer则显示"生成失败"
                const newQAData = {};
                Object.keys(QA_QUESTIONS).forEach(catKey => {
                    const aiList = parsedContent[AI_KEY_MAP[catKey]] || [];
                    newQAData[catKey] = QA_QUESTIONS[catKey].map((q, idx) => ({
                        question: q,
                        answer: aiList[idx]?.answer || '生成失败'
                    }));
                });
                setAiData(newQAData);
            } else {
                console.error('Failed to fetch QA data:', response.status, response.statusText);
                // 设置默认数据
                const defaultQAData = {};
                Object.keys(QA_QUESTIONS).forEach(catKey => {
                    defaultQAData[catKey] = QA_QUESTIONS[catKey].map(q => ({
                        question: q,
                        answer: '数据加载失败，请稍后重试'
                    }));
                });
                setAiData(defaultQAData);
            }
        } catch (error) {
            console.error('Error fetching QA data:', error);
            // 设置默认数据
            const defaultQAData = {};
            Object.keys(QA_QUESTIONS).forEach(catKey => {
                defaultQAData[catKey] = QA_QUESTIONS[catKey].map(q => ({
                    question: q,
                    answer: '数据加载失败，请稍后重试'
                }));
            });
            setAiData(defaultQAData);
        } finally {
            setLoading(false);
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 relative overflow-hidden" >
            {/* Background Effects */}
            < div className="absolute inset-0 overflow-hidden pointer-events-none" >
                <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-teal-500/10 to-emerald-500/10 rounded-full blur-3xl"></div>
            </div >

            {/* Header */}
            < div className="relative z-10 flex items-center justify-between p-6 bg-slate-800/80 backdrop-blur-sm border-b border-slate-700" >
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-300 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="text-2xl">💡</div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-100">个性化建议</h1>
                            <p className="text-sm text-slate-400">订单号: {orderId} | 30个核心问题解答</p>
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
                            <span className="text-xs font-bold text-slate-200">100</span>
                        </div>
                    </div>
                </div>
            </div >

            {/* Main Content */}
            < div className="relative z-10 max-w-7xl mx-auto p-6" >
                <div className={`transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>

                    {/* 概述卡片 */}
                    <div className="mb-8 p-6 bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-xl">
                        <h2 className="text-lg font-bold text-slate-100 mb-4">问答概述</h2>
                        <p className="text-slate-300 leading-relaxed mb-4">基于您的八字、紫微斗数、印度星盘三盘合参，为您提供30个核心问题的专业解答，涵盖财富、事业、感情、性格、运势五大维度，帮助您更好地了解自己，做出明智的人生决策。</p>
                        <div className="text-sm text-slate-400">
                            <p>• 涵盖五大维度：财富、事业、感情、性格、运势</p>
                            <p>• 每个维度6个核心问题，共30个专业解答</p>
                            <p>• 点击问题查看详细答案和建议</p>
                        </div>
                    </div>

                    {/* 五个维度的问题 */}
                    <div className="space-y-8">
                        {aiData && Object.entries(aiData).map(([key, category], categoryIndex) => (
                            <div
                                key={key}
                                className="p-6 bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-xl"
                                style={{ transitionDelay: `${categoryIndex * 200}ms` }}
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="text-2xl">{key === 'wealth' ? '💰' : key === 'career' ? '💼' : key === 'love' ? '❤️' : key === 'fortune' ? '🌱' : '🧠'}</div>
                                    <h3 className="text-xl font-bold text-slate-100">{CATEGORY_LABELS[key] || key}</h3>
                                    <div className="text-sm text-slate-400">（6问）</div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {category.map((item, questionIndex) => (
                                        <button
                                            key={questionIndex}
                                            onClick={() => handleQuestionClick(item.question, item.answer)}
                                            className={`p-4 text-left bg-gradient-to-br ${key === 'wealth' ? 'from-emerald-500 to-teal-500' : key === 'career' ? 'from-blue-500 to-cyan-500' : key === 'love' ? 'from-pink-500 to-rose-500' : key === 'fortune' ? 'from-orange-500 to-red-500' : 'from-purple-500 to-indigo-500'}/10 border border-slate-600/30 rounded-lg hover:scale-105 transition-all duration-300 hover:border-slate-500/50`}
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
            </div >

            {/* 答案弹窗 */}
            {
                showAnswer && selectedQuestion && (
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
                )
            }
        </div >
    );
};

export default QAPage; 