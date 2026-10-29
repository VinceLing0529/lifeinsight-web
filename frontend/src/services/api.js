import axios from 'axios';

// 创建axios实例
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 请求拦截器
api.interceptors.request.use(
    (config) => {
        console.log('API Request:', config.method?.toUpperCase(), config.url);
        return config;
    },
    (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// 响应拦截器
api.interceptors.response.use(
    (response) => {
        console.log('API Response:', response.status, response.config.url);
        return response;
    },
    (error) => {
        console.error('API Response Error:', error.response?.status, error.response?.data);
        return Promise.reject(error);
    }
);

// API服务类
class ApiService {
    // 健康检查
    async healthCheck() {
        try {
            const response = await api.get('/health');
            return response.data;
        } catch (error) {
            throw new Error(`健康检查失败: ${error.message}`);
        }
    }

    // 获取时区信息
    async getTimezone(longitude, latitude) {
        try {
            const response = await api.get('/api/timezone', {
                params: { longitude, latitude }
            });
            return response.data;
        } catch (error) {
            throw new Error(`时区查询失败: ${error.response?.data?.detail || error.message}`);
        }
    }

    // 计算三盘命盘
    async calculateCharts(birthInfo) {
        try {
            const response = await api.post('/api/charts/calculate', birthInfo);
            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || '计算失败');
            }
        } catch (error) {
            if (error.response?.data?.detail) {
                throw new Error(error.response.data.detail);
            } else if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            } else {
                throw new Error(`命盘计算失败: ${error.message}`);
            }
        }
    }

    // 仅计算八字
    async calculateBaziOnly(birthInfo) {
        try {
            const response = await api.post('/api/charts/bazi-only', birthInfo);
            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || '八字计算失败');
            }
        } catch (error) {
            throw new Error(`八字计算失败: ${error.response?.data?.detail || error.message}`);
        }
    }

    // 仅计算紫微斗数
    async calculateZiweiOnly(birthInfo) {
        try {
            const response = await api.post('/api/charts/ziwei-only', birthInfo);
            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || '紫微斗数计算失败');
            }
        } catch (error) {
            throw new Error(`紫微斗数计算失败: ${error.response?.data?.detail || error.message}`);
        }
    }

    // 仅计算印度星盘
    async calculateVedicOnly(birthInfo) {
        try {
            const response = await api.post('/api/charts/vedic-only', birthInfo);
            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || '印度星盘计算失败');
            }
        } catch (error) {
            throw new Error(`印度星盘计算失败: ${error.response?.data?.detail || error.message}`);
        }
    }

    // ChatGPT分析
    async analyzeWithChatGPT(chartData, analysisType, customQuestion = '') {
        try {
            const response = await api.post('/api/analysis/chatgpt', {
                chart_data: chartData,
                analysis_type: analysisType,
                custom_question: customQuestion
            });
            return response.data;
        } catch (error) {
            throw new Error(`ChatGPT分析失败: ${error.response?.data?.detail || error.message}`);
        }
    }

    // 生成思维导图
    async generateMindmap(chartData, focusArea = 'comprehensive') {
        try {
            const response = await api.post('/api/analysis/mindmap', {
                chart_data: chartData,
                focus_area: focusArea
            });
            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || '思维导图生成失败');
            }
        } catch (error) {
            throw new Error(`思维导图生成失败: ${error.response?.data?.detail || error.message}`);
        }
    }

    // 本地分析
    async localAnalysis(chartData, analysisType) {
        try {
            const response = await api.post('/api/analysis/local-analysis', {
                chart_data: chartData,
                analysis_type: analysisType
            });
            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || '本地分析失败');
            }
        } catch (error) {
            throw new Error(`本地分析失败: ${error.response?.data?.detail || error.message}`);
        }
    }

    // 测试API连接
    async testConnection() {
        try {
            const response = await api.get('/api/charts/test');
            return response.data;
        } catch (error) {
            throw new Error(`API连接测试失败: ${error.message}`);
        }
    }

    // 生成AI报告
    async generateAIReport(userData) {
        try {
            const response = await api.post('/api/ai-report/generate', {
                user_data: userData
            });
            return response.data;
        } catch (error) {
            throw new Error(`AI报告生成失败: ${error.response?.data?.detail || error.message}`);
        }
    }

    // 通过订单号获取历史报告
    async getReportByOrderId(orderId) {
        try {
            const response = await api.get(`/api/ai-report/report/${orderId}`);
            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                throw new Error('订单号不存在，请检查后重试');
            }
            throw new Error(`获取历史报告失败: ${error.response?.data?.detail || error.message}`);
        }
    }

    // 查询订单状态
    async getOrderStatus(orderId) {
        try {
            const response = await api.get(`/api/ai-report/status/${orderId}`);
            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                throw new Error('订单号不存在');
            }
            throw new Error(`查询订单状态失败: ${error.response?.data?.detail || error.message}`);
        }
    }

    // 列出所有报告（管理用）
    async listAllReports() {
        try {
            const response = await api.get('/api/ai-report/reports/list');
            return response.data;
        } catch (error) {
            throw new Error(`获取报告列表失败: ${error.response?.data?.detail || error.message}`);
        }
    }
}

// 创建并导出实例
const apiService = new ApiService();
export default apiService;

// AI分析相关API
export const aiAnalysisAPI = {
    // 批量生成分析 - 直接传入用户数据
    async batchGenerate(userData, orderId) {
        try {
            const response = await api.post('/api/ai-report/generate', {
                user_data: userData,
                order_id: orderId
            });
            return response.data;
        } catch (error) {
            console.error('批量生成分析失败:', error);
            throw new Error(error.response?.data?.detail || '批量生成分析失败');
        }
    },

    // 原有的单独API（兼容性保留）
    async generateDimensionAnalysis(dimensionId, birthData, orderId) {
        try {
            const response = await api.post('/api/ai-report/dimension', {
                dimension_id: dimensionId,
                birth_data: birthData,
                order_id: orderId
            });
            return response.data;
        } catch (error) {
            console.error('生成维度分析失败:', error);
            throw new Error(error.response?.data?.detail || '生成维度分析失败');
        }
    },

    async generateComprehensiveAnalysis(dimensionResults, birthData, orderId) {
        try {
            const response = await api.post('/api/ai-report/comprehensive', {
                dimension_results: dimensionResults,
                birth_data: birthData,
                order_id: orderId
            });
            return response.data;
        } catch (error) {
            console.error('生成综合分析失败:', error);
            throw new Error(error.response?.data?.detail || '生成综合分析失败');
        }
    },

    async getSavedAnalysis(orderId) {
        try {
            const response = await api.get(`/api/ai-report/report/${orderId}`);
            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                throw new Error('分析结果不存在');
            }
            console.error('获取分析结果失败:', error);
            throw new Error(error.response?.data?.detail || '获取分析结果失败');
        }
    }
};

// 新增API函数（全部改为相对路径）
export const generateSingleModule = async (orderId, module) => {
    try {
        const response = await fetch(`/api/ai-report/generate-module`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                order_id: orderId,
                module: module
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('生成单个模块失败:', error);
        throw error;
    }
};

export const getModuleStatus = async (orderId) => {
    try {
        const response = await fetch(`/api/ai-report/module-status/${orderId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('获取模块状态失败:', error);
        throw error;
    }
};

export const getModuleData = async (orderId, module) => {
    try {
        const response = await fetch(`/api/ai-report/module-data/${orderId}/${module}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('获取模块数据失败:', error);
        throw error;
    }
};

export const simulateProgress = async (orderId, module) => {
    try {
        const response = await fetch(`/api/ai-report/simulate-progress/${orderId}/${module}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('模拟进度失败:', error);
        throw error;
    }
}; 