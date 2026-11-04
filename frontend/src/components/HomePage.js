import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BirthInfoForm from './BirthInfoForm';
import LoadingSpinner from './LoadingSpinner';

const HomePage = () => {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChartCalculated = (data) => {
        setChartData(data);
        setError(null);
        // 导航到结果页面，传递数据
        navigate('/results', { state: { chartData: data } });
    };

    const handleError = (error) => {
        setError(error);
        setChartData(null);
    };

    const handleReset = () => {
        setChartData(null);
        setError(null);
    };

    return (
        <main className="container mx-auto px-6 py-4 flex-1">
            {loading && (
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner />
                </div>
            )}

            {error && (
                <div className="max-w-2xl mx-auto mb-8">
                    <div className="bg-primary-50 border border-primary-200 rounded p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-primary-800">计算失败</h3>
                                <div className="mt-2 text-sm text-primary-700">
                                    <p>{error}</p>
                                </div>
                                <div className="mt-4">
                                    <button
                                        onClick={handleReset}
                                        className="bg-primary-600 hover:bg-primary-700 text-paper-card font-medium py-2 px-4 rounded transition-colors duration-200"
                                    >
                                        重新开始
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!chartData && !loading && (
                <div className="w-full max-w-4xl mx-auto flex flex-col justify-start pt-4 md:pt-8">
                    {/* 主标题 */}
                    <div className="text-center mb-6">
                        <div className="flex justify-center mb-3">
                            <span className="seal w-11 h-11 text-xl">命</span>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-serif font-black text-ink tracking-[0.2em] mb-3">
                            生命洞察
                        </h1>
                        <div className="flex items-center justify-center gap-3 mb-3">
                            <span className="h-px w-16 bg-accent-400" />
                            <span className="text-[11px] tracking-[0.5em] text-ink-faint">八字 · 紫微 · 吠陀</span>
                            <span className="h-px w-16 bg-accent-400" />
                        </div>
                        <p className="text-ink-soft text-sm lg:text-base">三盘合参，互为印证——输入出生信息，排出属于你的那一张盘</p>
                        <p className="text-ink-faint text-xs lg:text-sm mt-3">排盘与快速解读免费 · 深度报告 ¥99（含运势预测与 30 问答疑）</p>
                        <p className="text-ink-faint text-xs mt-2 tracking-wide">填生辰 → 看三盘 → 读解读 · 不用注册</p>
                    </div>

                    <>
                        <BirthInfoForm
                            onCalculated={handleChartCalculated}
                            onError={handleError}
                            onLoadingChange={setLoading}
                        />
                        <p className="text-center mt-4">
                            <button onClick={() => navigate('/final-report/LIFEDEMO1995')} className="text-sm text-primary-700 underline underline-offset-4 decoration-accent-300 hover:text-primary-800">
                                还不想填？先看一份完整的示例报告 →
                            </button>
                        </p>
                    </>
                </div>
            )}
        </main>
    );
};

export default HomePage; 