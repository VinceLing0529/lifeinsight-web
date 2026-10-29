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
                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 backdrop-blur-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-300">计算失败</h3>
                                <div className="mt-2 text-sm text-red-200">
                                    <p>{error}</p>
                                </div>
                                <div className="mt-4">
                                    <button
                                        onClick={handleReset}
                                        className="bg-red-800/30 hover:bg-red-700/40 text-red-200 font-medium py-2 px-4 rounded-lg transition-colors duration-200 border border-red-500/30"
                                    >
                                        重新开始
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!chartData && !loading && !error && (
                <div className="w-full max-w-4xl mx-auto flex flex-col justify-center min-h-[calc(100vh-200px)]">
                    {/* 主标题 - 紧凑版 */}
                    <div className="text-center mb-4">
                        <div className="flex justify-center items-center mb-2">
                            <div className="w-6 h-6 text-amber-300 mr-2 animate-pulse">⭐</div>
                            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-clip-text text-transparent">
                                生命洞察命盘分析
                            </h1>
                            <div className="w-6 h-6 text-amber-300 ml-2 animate-pulse">⭐</div>
                        </div>
                        <p className="text-slate-300 text-sm lg:text-base mb-1">融合八字、紫微斗数与印度星盘的三维命理分析系统</p>
                        <p className="text-slate-400 text-xs lg:text-sm">输入您的出生信息，获得专业的命理解读</p>
                    </div>

                    <BirthInfoForm
                        onCalculated={handleChartCalculated}
                        onError={handleError}
                        onLoadingChange={setLoading}
                    />
                </div>
            )}
        </main>
    );
};

export default HomePage; 