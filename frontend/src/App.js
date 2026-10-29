import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Eye, X } from 'lucide-react';
import HomePage from './components/HomePage';
import ResultsPageWrapper from './components/ResultsPageWrapper';
import Header from './components/Header';
import Footer from './components/Footer';
import BirthInfoForm from './components/BirthInfoForm';
import ResultsPage from './components/ResultsPage';
import AIReportPage from './components/AIReportPage';
import ExamplePage from './components/ExamplePage';
import FinalReport from './components/FinalReport';
import InteractiveMindMapPage from './components/InteractiveMindMapPage';
import FortuneChartPage from './components/FortuneChartPage';
import QAPage from './components/QAPage';
import AnalysisPage from './components/AnalysisPage';
import PromptAdminPage from './components/PromptAdminPage';
import RedemptionCodeAdmin from './components/RedemptionCodeAdmin';
import ManageAdminPage from './components/ManageAdminPage';
import './index.css';

// 中西方神秘符号组件
const MysticalSymbols = () => {
    const chineseSymbols = [
        { symbol: "☰", name: "乾", x: 15, y: 20, rotation: 0, size: 24 },
        { symbol: "☱", name: "兑", x: 85, y: 25, rotation: 45, size: 20 },
        { symbol: "☲", name: "离", x: 25, y: 80, rotation: 90, size: 22 },
        { symbol: "☳", name: "震", x: 75, y: 75, rotation: 135, size: 18 },
        { symbol: "☴", name: "巽", x: 10, y: 60, rotation: 180, size: 20 },
        { symbol: "☵", name: "坎", x: 90, y: 60, rotation: 225, size: 24 },
        { symbol: "☶", name: "艮", x: 45, y: 15, rotation: 270, size: 19 },
        { symbol: "☷", name: "坤", x: 55, y: 85, rotation: 315, size: 21 },
    ];

    const westernSymbols = [
        { symbol: "♈", name: "白羊", x: 20, y: 35, rotation: 0, size: 18 },
        { symbol: "♉", name: "金牛", x: 80, y: 40, rotation: 30, size: 16 },
        { symbol: "♊", name: "双子", x: 30, y: 65, rotation: 60, size: 17 },
        { symbol: "♋", name: "巨蟹", x: 70, y: 30, rotation: 90, size: 19 },
        { symbol: "♌", name: "狮子", x: 15, y: 75, rotation: 120, size: 18 },
        { symbol: "♍", name: "处女", x: 85, y: 70, rotation: 150, size: 16 },
        { symbol: "♎", name: "天秤", x: 40, y: 25, rotation: 180, size: 17 },
        { symbol: "♏", name: "天蝎", x: 60, y: 70, rotation: 210, size: 18 },
        { symbol: "♐", name: "射手", x: 25, y: 45, rotation: 240, size: 19 },
        { symbol: "♑", name: "摩羯", x: 75, y: 55, rotation: 270, size: 17 },
        { symbol: "♒", name: "水瓶", x: 35, y: 30, rotation: 300, size: 18 },
        { symbol: "♓", name: "双鱼", x: 65, y: 45, rotation: 330, size: 16 },
    ];

    const mysticalSymbols = [
        { symbol: "☽", name: "月亮", x: 12, y: 40, rotation: 0, size: 20 },
        { symbol: "☉", name: "太阳", x: 88, y: 35, rotation: 45, size: 22 },
        { symbol: "☿", name: "水星", x: 22, y: 25, rotation: 90, size: 16 },
        { symbol: "♀", name: "金星", x: 78, y: 65, rotation: 135, size: 18 },
        { symbol: "♂", name: "火星", x: 32, y: 75, rotation: 180, size: 17 },
        { symbol: "♃", name: "木星", x: 68, y: 20, rotation: 225, size: 19 },
        { symbol: "♄", name: "土星", x: 18, y: 55, rotation: 270, size: 18 },
        { symbol: "⚹", name: "六芒星", x: 82, y: 80, rotation: 315, size: 20 },
    ];

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-8 z-0">
            {/* 中国八卦符号 */}
            {chineseSymbols.map((item, index) => (
                <div
                    key={`chinese-${index}`}
                    className="absolute text-slate-400/20 font-bold select-none"
                    style={{
                        left: `${item.x}%`,
                        top: `${item.y}%`,
                        fontSize: `${item.size}px`,
                        transform: `rotate(${item.rotation}deg)`,
                        animation: `float 25s ease-in-out infinite ${index * 3}s, gentleGlow 8s ease-in-out infinite alternate ${index * 2}s`,
                    }}
                >
                    {item.symbol}
                </div>
            ))}

            {/* 西方星座符号 */}
            {westernSymbols.map((item, index) => (
                <div
                    key={`western-${index}`}
                    className="absolute text-slate-300/15 select-none"
                    style={{
                        left: `${item.x}%`,
                        top: `${item.y}%`,
                        fontSize: `${item.size}px`,
                        transform: `rotate(${item.rotation}deg)`,
                        animation: `float 30s ease-in-out infinite ${index * 2.5}s, gentleGlow 10s ease-in-out infinite alternate ${index * 1.5}s`,
                    }}
                >
                    {item.symbol}
                </div>
            ))}

            {/* 神秘学符号 */}
            {mysticalSymbols.map((item, index) => (
                <div
                    key={`mystical-${index}`}
                    className="absolute text-slate-400/18 select-none"
                    style={{
                        left: `${item.x}%`,
                        top: `${item.y}%`,
                        fontSize: `${item.size}px`,
                        transform: `rotate(${item.rotation}deg)`,
                        animation: `float 20s ease-in-out infinite ${index * 4}s, gentleGlow 6s ease-in-out infinite alternate ${index * 3}s`,
                    }}
                >
                    {item.symbol}
                </div>
            ))}
        </div>
    );
};

// 太极图案组件
const TaijiSymbol = ({ x, y, size, opacity = 0.1 }) => {
    return (
        <div
            className="absolute"
            style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${size}px`,
                height: `${size}px`,
                opacity,
                animation: "rotate 60s linear infinite, gentleGlow 12s ease-in-out infinite alternate",
            }}
        >
            <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle
                    cx="50"
                    cy="50"
                    r="48"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-slate-400/30"
                />
                <path
                    d="M50 2 A48 48 0 0 1 50 98 A24 24 0 0 1 50 50 A24 24 0 0 0 50 2"
                    fill="currentColor"
                    className="text-slate-400/20"
                />
                <circle cx="50" cy="26" r="8" fill="currentColor" className="text-slate-600/40" />
                <circle cx="50" cy="74" r="8" fill="currentColor" className="text-slate-300/30" />
            </svg>
        </div>
    );
};

// 魔法阵图案组件
const MagicCircle = ({ x, y, size, opacity = 0.08 }) => {
    return (
        <div
            className="absolute"
            style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${size}px`,
                height: `${size}px`,
                opacity,
                animation: "rotate 45s linear infinite reverse, gentleGlow 15s ease-in-out infinite alternate",
            }}
        >
            <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* 外圈 */}
                <circle
                    cx="100"
                    cy="100"
                    r="95"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-slate-400/40"
                />
                <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    className="text-slate-400/30"
                />
                <circle
                    cx="100"
                    cy="100"
                    r="65"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    className="text-slate-400/25"
                />

                {/* 五角星 */}
                <path
                    d="M100 35 L112 70 L147 70 L120 90 L132 125 L100 105 L68 125 L80 90 L53 70 L88 70 Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-slate-400/35"
                />

                {/* 内圈装饰 */}
                <circle
                    cx="100"
                    cy="100"
                    r="25"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    className="text-slate-400/30"
                />
            </svg>
        </div>
    );
};

// 浮动粒子组件
const FloatingParticles = () => {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        const generateParticles = () => {
            const newParticles = [];
            for (let i = 0; i < 15; i++) {
                newParticles.push({
                    id: i,
                    x: Math.random() * 100,
                    y: Math.random() * 100,
                    size: Math.random() * 3 + 1,
                    duration: Math.random() * 20 + 15,
                    delay: Math.random() * 10,
                });
            }
            setParticles(newParticles);
        };

        generateParticles();
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className="absolute bg-slate-300/20 rounded-full"
                    style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        animation: `float ${particle.duration}s ease-in-out infinite ${particle.delay}s, gentleGlow 8s ease-in-out infinite alternate`,
                    }}
                />
            ))}
        </div>
    );
};

function App() {
    const [data, setData] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const [showAIReportPage, setShowAIReportPage] = useState(false);
    const [showExamplePage, setShowExamplePage] = useState(false);
    const [showAnalysisModal, setShowAnalysisModal] = useState(false);
    const [analysisOrderInput, setAnalysisOrderInput] = useState('');

    const handleDataSubmit = (formData) => {
        setData(formData);
        setShowResults(true);
    };

    const handleBack = () => {
        setShowResults(false);
        setShowAIReportPage(false);
        setShowExamplePage(false);
        setData(null);
    };

    const handleError = (error) => {
        console.error('表单错误:', error);
    };

    const handleLoadingChange = (loading) => {
        // 可以在这里处理加载状态
    };

    const handleShowAnalysisModal = () => {
        setShowAnalysisModal(true);
    };

    const handleLoadHistoryReport = async () => {
        if (!analysisOrderInput.trim()) {
            alert('请输入订单号');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/api/ai-report/report/${analysisOrderInput.trim()}`);
            if (response.ok) {
                const data = await response.json();
                window.location.href = `/final-report/${analysisOrderInput.trim()}`;
                setShowAnalysisModal(false);
                setAnalysisOrderInput('');
            } else {
                alert('未找到该订单号的报告，请检查订单号是否正确');
            }
        } catch (error) {
            console.error('加载历史报告失败:', error);
            alert('加载失败，请检查网络连接');
        }
    };

    // 注入神秘学动画样式
    useEffect(() => {
        const styles = `
          @keyframes float {
            0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
            25% { transform: translateY(-20px) translateX(10px) rotate(45deg); }
            50% { transform: translateY(-10px) translateX(-8px) rotate(90deg); }
            75% { transform: translateY(-25px) translateX(12px) rotate(135deg); }
          }
          
          @keyframes gentleGlow {
            0% { 
              opacity: 0.3; 
              filter: blur(1px);
            }
            100% { 
              opacity: 0.7; 
              filter: blur(0px);
            }
          }
          
          @keyframes rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          
          .mystical-card {
            position: relative;
            overflow: hidden;
          }
          
          .mystical-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.05), transparent);
            animation: shimmer 12s ease-in-out infinite;
          }
        `;

        const styleSheet = document.createElement("style");
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);
        return () => {
            if (document.head.contains(styleSheet)) {
                document.head.removeChild(styleSheet);
            }
        };
    }, []);

    return (
        <Router>
            <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 relative flex flex-col overflow-x-hidden scroll-smooth">
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: 'rgba(51, 65, 85, 0.9)',
                            color: '#e2e8f0',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                            border: '1px solid rgba(148, 163, 184, 0.2)',
                        },
                    }}
                />

                {/* 中西方神秘符号背景 */}
                <MysticalSymbols />

                {/* 太极图案 */}
                <TaijiSymbol x={5} y={15} size={120} opacity={0.08} />
                <TaijiSymbol x={85} y={75} size={80} opacity={0.06} />

                {/* 魔法阵图案 */}
                <MagicCircle x={70} y={10} size={150} opacity={0.05} />
                <MagicCircle x={15} y={70} size={100} opacity={0.04} />

                {/* 浮动粒子 */}
                <FloatingParticles />

                {/* 温和的背景元素 */}
                <div className="fixed inset-0 opacity-15 pointer-events-none z-0">
                    <div className="absolute top-20 left-20 w-32 h-32 border border-slate-400/20 rounded-full animate-pulse"></div>
                    <div className="absolute top-40 right-32 w-24 h-24 border border-gray-400/20 rounded-full animate-pulse delay-1000"></div>
                    <div className="absolute bottom-32 left-1/4 w-40 h-40 border border-slate-500/20 rounded-full animate-pulse delay-2000"></div>
                    <div className="absolute bottom-20 right-20 w-28 h-28 border border-gray-500/20 rounded-full animate-pulse delay-500"></div>
                </div>

                {/* 温和的浮动星星 */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-16 left-16 w-4 h-4 text-slate-300/40 animate-pulse">✨</div>
                    <div className="absolute top-32 right-24 w-3 h-3 text-gray-300/40 animate-pulse delay-700">✨</div>
                    <div className="absolute bottom-40 left-32 w-5 h-5 text-slate-400/40 animate-pulse delay-1500">✨</div>
                    <div className="absolute bottom-24 right-40 w-4 h-4 text-gray-400/40 animate-pulse delay-300">✨</div>
                    <div className="absolute top-1/2 left-1/2 w-6 h-6 text-slate-300/40 animate-pulse delay-1000">✨</div>
                </div>

                <div className="relative z-10 flex flex-col min-h-screen">
                    <Header onShowAnalysisModal={handleShowAnalysisModal} />

                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/results" element={<ResultsPage />} />
                        <Route path="/final-report/:orderId" element={<FinalReport />} />
                        <Route path="/final-report/:orderId/interactive-mind-map" element={<InteractiveMindMapPage />} />
                        <Route path="/final-report/:orderId/fortune-chart" element={<FortuneChartPage />} />
                        <Route path="/final-report/:orderId/qa" element={<QAPage />} />
                        <Route path="/final-report/:orderId/analysis" element={<AnalysisPage />} />
                        <Route path="/manage" element={<ManageAdminPage />} />
                    </Routes>

                    <Footer />
                </div>

                {/* 全局查看已购分析弹窗 */}
                {showAnalysisModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                        <div className="bg-slate-800 border border-slate-600 rounded-lg shadow-2xl max-w-md w-full">
                            <div className="flex items-center justify-between p-6 border-b border-slate-600">
                                <h3 className="text-xl font-bold text-slate-100">查看已购分析</h3>
                                <button
                                    onClick={() => {
                                        setShowAnalysisModal(false);
                                        setAnalysisOrderInput('');
                                    }}
                                    className="p-2 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors duration-300"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        请输入订单号
                                    </label>
                                    <input
                                        type="text"
                                        value={analysisOrderInput}
                                        onChange={(e) => setAnalysisOrderInput(e.target.value)}
                                        placeholder="例如: AI20250626225734syaww7qn7"
                                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleLoadHistoryReport();
                                            }
                                        }}
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleLoadHistoryReport}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300"
                                    >
                                        读取报告
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowAnalysisModal(false);
                                            setAnalysisOrderInput('');
                                        }}
                                        className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors duration-300"
                                    >
                                        取消
                                    </button>
                                </div>
                                <div className="mt-4 text-center">
                                    <p className="text-sm text-slate-400">如果想看展示请输入 zhanshi</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Router>
    );
}

export default App; 