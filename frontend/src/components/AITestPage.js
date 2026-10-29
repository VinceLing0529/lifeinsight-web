import React, { useState, useEffect } from 'react';
import { aiAnalysisAPI } from '../services/api';
import './AITestPage.css';

const AITestPage = () => {
    const [prompts, setPrompts] = useState({});
    const [sampleData, setSampleData] = useState({});
    const [loading, setLoading] = useState(true);
    const [testResults, setTestResults] = useState({});
    const [activeTab, setActiveTab] = useState('');
    const [batchTesting, setBatchTesting] = useState(false);
    const [batchResults, setBatchResults] = useState(null);
    const [editingPrompt, setEditingPrompt] = useState(null);
    const [editedPromptText, setEditedPromptText] = useState('');
    const [selectedPrompts, setSelectedPrompts] = useState([]);
    const [comparisonResults, setComparisonResults] = useState(null);
    const [backendEditing, setBackendEditing] = useState(null);
    const [backendPromptText, setBackendPromptText] = useState('');

    useEffect(() => {
        loadPrompts();
    }, []);

    const loadPrompts = async () => {
        try {
            const response = await fetch('http://localhost:8000/test/get-prompts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({})
            });
            const data = await response.json();

            if (data.success) {
                setPrompts(data.prompts);
                setSampleData(data.sample_data);
                setActiveTab(Object.keys(data.prompts)[0] || '');
            }
        } catch (error) {
            console.error('加载prompts失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const testSinglePrompt = async (promptKey) => {
        const prompt = prompts[promptKey];
        if (!prompt) return;

        setTestResults(prev => ({
            ...prev,
            [promptKey]: { loading: true }
        }));

        try {
            const response = await fetch('http://localhost:8000/test/single-prompt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: prompt.prompt,
                    name: prompt.name
                })
            });
            const result = await response.json();

            setTestResults(prev => ({
                ...prev,
                [promptKey]: {
                    loading: false,
                    ...result,
                    // Ensure error is always a string if it exists
                    error: result.error && typeof result.error === 'object'
                        ? JSON.stringify(result.error)
                        : result.error,
                    // Ensure parse_error is always a string if it exists
                    parse_error: result.parse_error && typeof result.parse_error === 'object'
                        ? JSON.stringify(result.parse_error)
                        : result.parse_error
                }
            }));
        } catch (error) {
            setTestResults(prev => ({
                ...prev,
                [promptKey]: {
                    loading: false,
                    success: false,
                    error: error.message
                }
            }));
        }
    };

    const testAllPrompts = async () => {
        setBatchTesting(true);
        setBatchResults(null);

        try {
            const response = await fetch('http://localhost:8000/test/batch-test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({})
            });
            const data = await response.json();

            if (data.success) {
                setBatchResults(data);
                // Ensure all error fields in batch results are strings
                const cleanedResults = {};
                Object.entries(data.results).forEach(([key, result]) => {
                    cleanedResults[key] = {
                        ...result,
                        error: result.error && typeof result.error === 'object'
                            ? JSON.stringify(result.error)
                            : result.error,
                        parse_error: result.parse_error && typeof result.parse_error === 'object'
                            ? JSON.stringify(result.parse_error)
                            : result.parse_error
                    };
                });
                setTestResults(cleanedResults);
            } else {
                console.error('批量测试失败:', data.error);
            }
        } catch (error) {
            console.error('批量测试失败:', error);
        } finally {
            setBatchTesting(false);
        }
    };

    const startEditPrompt = (promptKey) => {
        setEditingPrompt(promptKey);
        setEditedPromptText(prompts[promptKey]?.prompt || '');
    };

    const saveEditedPrompt = async () => {
        if (!editingPrompt || !editedPromptText.trim()) return;

        try {
            const response = await fetch('http://localhost:8000/test/update-prompt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt_key: editingPrompt,
                    new_prompt: editedPromptText
                })
            });
            const data = await response.json();

            if (data.success) {
                // 更新本地prompts
                setPrompts(prev => ({
                    ...prev,
                    [editingPrompt]: {
                        ...prev[editingPrompt],
                        prompt: editedPromptText
                    }
                }));
                setEditingPrompt(null);
                setEditedPromptText('');
            }
        } catch (error) {
            console.error('保存prompt失败:', error);
        }
    };

    const cancelEdit = () => {
        setEditingPrompt(null);
        setEditedPromptText('');
    };

    const togglePromptSelection = (promptKey) => {
        setSelectedPrompts(prev => {
            if (prev.includes(promptKey)) {
                return prev.filter(key => key !== promptKey);
            } else {
                return [...prev, promptKey];
            }
        });
    };

    const compareSelectedPrompts = async () => {
        if (selectedPrompts.length < 2) {
            alert('请至少选择2个prompt进行对比');
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/test/compare-responses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt_keys: selectedPrompts
                })
            });
            const data = await response.json();

            if (data.success) {
                setComparisonResults(data);
            } else {
                console.error('对比失败:', data.error);
            }
        } catch (error) {
            console.error('对比失败:', error);
        }
    };

    const startBackendEdit = async (promptKey) => {
        try {
            // 获取后端prompt内容
            const response = await fetch(`http://localhost:8000/test/get-backend-prompt/${promptKey}`, {
                method: 'GET',
            });
            const data = await response.json();

            if (data.success) {
                setBackendEditing(promptKey);
                setBackendPromptText(data.prompt);
            } else {
                alert('获取后端prompt失败: ' + data.error);
            }
        } catch (error) {
            console.error('获取后端prompt失败:', error);
            alert('获取后端prompt失败');
        }
    };

    const saveBackendPrompt = async () => {
        if (!backendEditing || !backendPromptText.trim()) return;

        try {
            const response = await fetch('http://localhost:8000/test/update-backend-prompt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt_key: backendEditing,
                    new_prompt: backendPromptText
                })
            });
            const data = await response.json();

            if (data.success) {
                alert('后端Prompt更新成功！');
                setBackendEditing(null);
                setBackendPromptText('');
                // 重新加载prompts以获取最新内容
                loadPrompts();
            } else {
                alert('保存失败: ' + data.error);
            }
        } catch (error) {
            console.error('保存后端prompt失败:', error);
            alert('保存后端prompt失败');
        }
    };

    const cancelBackendEdit = () => {
        setBackendEditing(null);
        setBackendPromptText('');
    };

    const exportResults = async (format = 'json') => {
        if (!testResults || Object.keys(testResults).length === 0) {
            alert('没有测试结果可以导出');
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/test/export-results', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    results: testResults,
                    format: format
                })
            });
            const data = await response.json();

            if (data.success) {
                // 创建下载链接
                const blob = new Blob([data.content], {
                    type: format === 'json' ? 'application/json' : 'text/plain'
                });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = data.filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (error) {
            console.error('导出失败:', error);
        }
    };

    const formatPromptText = (text) => {
        return text.split('\n').map((line, index) => (
            <div key={index} className="prompt-line">
                {line}
            </div>
        ));
    };

    const safeRender = (value) => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') {
            return JSON.stringify(value);
        }
        return String(value);
    };

    const renderValidationStatus = (validation) => {
        if (!validation) return null;

        return (
            <div className={`validation-status ${validation.valid ? 'valid' : 'invalid'}`}>
                <span className="validation-icon">
                    {validation.valid ? '✅' : '❌'}
                </span>
                <span className="validation-message">
                    {safeRender(validation.message)}
                </span>
            </div>
        );
    };

    if (loading) {
        return <div className="ai-test-page loading">加载中...</div>;
    }

    return (
        <div className="ai-test-page">
            <div className="test-header">
                <h1>🧪 AI Prompt 测试调试工具</h1>
                <p>测试和验证AI分析系统的所有prompt和数据解析</p>

                <div className="header-actions">
                    <button
                        className="test-all-btn"
                        onClick={testAllPrompts}
                        disabled={batchTesting || Object.values(testResults).some(result => result?.loading)}
                    >
                        {batchTesting ? '🔄 批量测试中...' : '🚀 批量测试所有Prompt'}
                    </button>

                    <button
                        className="compare-btn"
                        onClick={compareSelectedPrompts}
                        disabled={selectedPrompts.length < 2}
                    >
                        📊 对比选中Prompt ({selectedPrompts.length})
                    </button>

                    <div className="export-group">
                        <button
                            className="export-btn"
                            onClick={() => exportResults('json')}
                            disabled={Object.keys(testResults).length === 0}
                        >
                            📥 导出JSON
                        </button>
                        <button
                            className="export-btn"
                            onClick={() => exportResults('csv')}
                            disabled={Object.keys(testResults).length === 0}
                        >
                            📊 导出CSV
                        </button>
                        <button
                            className="export-btn"
                            onClick={() => exportResults('txt')}
                            disabled={Object.keys(testResults).length === 0}
                        >
                            📄 导出TXT
                        </button>
                    </div>
                </div>

                {batchResults && (
                    <div className="batch-report">
                        <h3>📈 批量测试报告</h3>
                        <div className="report-stats">
                            <div className="stat">
                                <span className="stat-label">总测试数:</span>
                                <span className="stat-value">{batchResults.report.total_tests}</span>
                            </div>
                            <div className="stat">
                                <span className="stat-label">成功率:</span>
                                <span className="stat-value">{batchResults.report.success_rate}%</span>
                            </div>
                            <div className="stat">
                                <span className="stat-label">验证通过率:</span>
                                <span className="stat-value">{batchResults.report.validation_rate}%</span>
                            </div>
                            <div className="stat">
                                <span className="stat-label">测试时间:</span>
                                <span className="stat-value">{new Date(batchResults.report.timestamp).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="test-content">
                <div className="prompt-tabs">
                    {Object.entries(prompts).map(([key, prompt]) => (
                        <div key={key} className="tab-container">
                            <input
                                type="checkbox"
                                className="tab-checkbox"
                                checked={selectedPrompts.includes(key)}
                                onChange={() => togglePromptSelection(key)}
                            />
                            <button
                                className={`tab ${activeTab === key ? 'active' : ''}`}
                                onClick={() => setActiveTab(key)}
                            >
                                {prompt.name}
                                {testResults[key]?.success && (
                                    <span className="tab-status success">✅</span>
                                )}
                                {testResults[key]?.success === false && (
                                    <span className="tab-status error">❌</span>
                                )}
                                {testResults[key]?.loading && (
                                    <span className="tab-status loading">⏳</span>
                                )}
                            </button>
                        </div>
                    ))}
                </div>

                {activeTab && prompts[activeTab] && (
                    <div className="prompt-detail">
                        <div className="prompt-section">
                            <div className="prompt-header">
                                <h3>📝 Prompt内容</h3>
                                <div className="prompt-actions">
                                    {editingPrompt === activeTab ? (
                                        <>
                                            <button className="save-btn" onClick={saveEditedPrompt}>
                                                💾 保存
                                            </button>
                                            <button className="cancel-btn" onClick={cancelEdit}>
                                                ❌ 取消
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button className="edit-btn" onClick={() => startEditPrompt(activeTab)}>
                                                ✏️ 编辑前端显示
                                            </button>
                                            <button className="backend-edit-btn" onClick={() => startBackendEdit(activeTab)}>
                                                🔧 编辑后端模板
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {editingPrompt === activeTab ? (
                                <textarea
                                    className="prompt-editor"
                                    value={editedPromptText}
                                    onChange={(e) => setEditedPromptText(e.target.value)}
                                    rows={20}
                                />
                            ) : (
                                <div className="prompt-text">
                                    {formatPromptText(prompts[activeTab].prompt)}
                                </div>
                            )}

                            <div className="expected-format">
                                <strong>期望格式:</strong> {prompts[activeTab].expected_format}
                            </div>
                            <button
                                className="test-btn"
                                onClick={() => testSinglePrompt(activeTab)}
                                disabled={testResults[activeTab]?.loading || editingPrompt === activeTab || backendEditing === activeTab}
                            >
                                {testResults[activeTab]?.loading ? '🔄 测试中...' : '🧪 测试此Prompt'}
                            </button>
                        </div>

                        {/* 后端Prompt编辑区域 */}
                        {backendEditing === activeTab && (
                            <div className="backend-prompt-section">
                                <div className="backend-prompt-header">
                                    <h3>🔧 后端Prompt模板编辑</h3>
                                    <div className="backend-prompt-actions">
                                        <button className="save-btn" onClick={saveBackendPrompt}>
                                            💾 保存到后端
                                        </button>
                                        <button className="cancel-btn" onClick={cancelBackendEdit}>
                                            ❌ 取消
                                        </button>
                                    </div>
                                </div>
                                <textarea
                                    className="backend-prompt-editor"
                                    value={backendPromptText}
                                    onChange={(e) => setBackendPromptText(e.target.value)}
                                    rows={25}
                                    placeholder="在这里编辑后端的prompt模板..."
                                />
                                <div className="backend-prompt-warning">
                                    ⚠️ 注意：修改后端prompt模板将影响实际的AI分析功能，请谨慎操作！
                                </div>
                            </div>
                        )}

                        {testResults[activeTab] && !testResults[activeTab].loading && (
                            <div className="test-result">
                                <h3>📊 测试结果</h3>

                                {/* 总是显示AI原始回答，无论成功还是失败 */}
                                <div className="result-section">
                                    <h4>🤖 AI原始回答</h4>
                                    <div className="raw-response">
                                        <pre>{safeRender(testResults[activeTab].raw_response || testResults[activeTab].error)}</pre>
                                    </div>
                                </div>

                                {testResults[activeTab].success ? (
                                    <>
                                        {testResults[activeTab].parsed_data && (
                                            <div className="result-section">
                                                <h4>📋 解析后的数据</h4>
                                                <div className="parsed-data">
                                                    <pre>{JSON.stringify(testResults[activeTab].parsed_data, null, 2)}</pre>
                                                </div>
                                            </div>
                                        )}

                                        {testResults[activeTab].parse_error && (
                                            <div className="result-section error">
                                                <h4>❌ JSON解析错误</h4>
                                                <div className="parse-error">
                                                    {safeRender(testResults[activeTab].parse_error)}
                                                </div>
                                            </div>
                                        )}

                                        <div className="result-section">
                                            <h4>✅ 数据验证结果</h4>
                                            {renderValidationStatus(testResults[activeTab].validation)}
                                        </div>
                                    </>
                                ) : (
                                    <div className="result-section error">
                                        <h4>❌ 测试失败原因</h4>
                                        <div className="error-message">
                                            {safeRender(testResults[activeTab].error)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {comparisonResults && (
                <div className="comparison-section">
                    <h3>📊 Prompt对比结果</h3>
                    <div className="comparison-summary">
                        <div className="summary-item">
                            <span>最佳验证:</span>
                            <span>{comparisonResults.analysis.best_validation}</span>
                        </div>
                        <div className="summary-item">
                            <span>最长回答:</span>
                            <span>{comparisonResults.analysis.longest_response}</span>
                        </div>
                        <div className="summary-item">
                            <span>解析成功:</span>
                            <span>{comparisonResults.analysis.parse_success_count}/{Object.keys(comparisonResults.comparison_results).length}</span>
                        </div>
                        <div className="summary-item">
                            <span>验证通过:</span>
                            <span>{comparisonResults.analysis.validation_success_count}/{Object.keys(comparisonResults.comparison_results).length}</span>
                        </div>
                    </div>

                    <div className="comparison-details">
                        {Object.entries(comparisonResults.comparison_results).map(([key, result]) => (
                            <div key={key} className="comparison-item">
                                <h4>{result.prompt_name}</h4>
                                <div className="comparison-metrics">
                                    <div className="metric">
                                        <span>回答长度:</span>
                                        <span>{result.response_length}</span>
                                    </div>
                                    <div className="metric">
                                        <span>词数:</span>
                                        <span>{result.word_count}</span>
                                    </div>
                                    <div className="metric">
                                        <span>验证通过:</span>
                                        <span className={result.validation_valid ? 'success' : 'error'}>
                                            {result.validation_valid ? '✅' : '❌'}
                                        </span>
                                    </div>
                                    <div className="metric">
                                        <span>解析成功:</span>
                                        <span className={result.parse_success ? 'success' : 'error'}>
                                            {result.parse_success ? '✅' : '❌'}
                                        </span>
                                    </div>
                                </div>
                                <div className="comparison-response">
                                    <strong>回答预览:</strong>
                                    <div className="response-preview">{safeRender(result.raw_response)}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        className="close-comparison-btn"
                        onClick={() => setComparisonResults(null)}
                    >
                        关闭对比
                    </button>
                </div>
            )}

            <div className="sample-data-section">
                <h3>📋 测试用的示例数据</h3>
                <div className="sample-data">
                    <pre>{JSON.stringify(sampleData, null, 2)}</pre>
                </div>
            </div>
        </div>
    );
};

export default AITestPage; 