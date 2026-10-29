import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ResultsPage from './ResultsPage';

const ResultsPageWrapper = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // 从路由状态中获取图表数据
    const chartData = location.state?.chartData;

    // 如果没有数据，重定向到主页
    if (!chartData) {
        navigate('/');
        return null;
    }

    const handleBack = () => {
        navigate('/');
    };

    return <ResultsPage data={chartData} onBack={handleBack} />;
};

export default ResultsPageWrapper; 