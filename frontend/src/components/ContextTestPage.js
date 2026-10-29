import React, { useState, useEffect } from 'react';
import './ContextTestPage.css';

const ContextTestPage = () => {
    const [contextModes, setContextModes] = useState([]);
    const [testablePrompts, setTestablePrompts] = useState([]);
    const [selectedMode, setSelectedMode] = useState('with_context');
    const [selectedPrompts, setSelectedPrompts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [testResults, setTestResults] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        loadContextModes();
        loadTestablePrompts();
    }, []);

    const loadContextModes = async () => {
        try {
            const response = await fetch('http://localhost:8000/test/context-modes');
            const data = await response.json();
            if (data.success) {
                setContextModes(data.modes);
            }
        } catch (error) {
            console.error('Failed to load context modes:', error);
        }
    };

    const loadTestablePrompts = async () => {
        try {
            const response = await fetch('http://localhost:8000/test/context-prompts');
            const data = await response.json();
            if (data.success) {
                setTestablePrompts(data.prompts);
                // 默认选中所有prompt
                setSelectedPrompts(data.prompts.map(p => p.key));
            }
        } catch (error) {
            console.error('Failed to load testable prompts:', error);
        }
    };

    const handlePromptToggle = (promptKey) => {
        setSelectedPrompts(prev => {
            if (prev.includes(promptKey)) {
                return prev.filter(key => key !== promptKey);
            } else {
                return [...prev, promptKey];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectedPrompts.length === testablePrompts.length) {
            setSelectedPrompts([]);
        } else {
            setSelectedPrompts(testablePrompts.map(p => p.key));
        }
    };

    const runContextTest = async () => {
        if (selectedPrompts.length === 0) {
            setError('请至少选择一个Prompt进行测试');
            return;
        }

        setIsLoading(true);
        setError('');
        setTestResults(null);

        try {
            const response = await fetch('http://localhost:8000/test/context-test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    context_mode: selectedMode,
                    test_prompts: selectedPrompts
                })
            });

            const data = await response.json();
            if (data.success) {
                setTestResults(data);
            } else {
                setError(data.summary?.error || '测试失败');
            }
        } catch (error) {
            setError('网络错误：' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const getResultStatusIcon = (result) => {
        if (result.test_passed) {
            return '✅';
        } else if (result.error) {
            return '❌';
        } else {
            return '⚠️';
        }
    };

    const getResultStatusText = (result) => {
        if (result.test_passed) {
            return '通过';
        } else if (result.error) {
            return '错误';
        } else {
            return '失败';
        }
    };

    return (
        <div className="context-test-page">
            <div className="context-test-header">
                <h1>🔮 AI上下文测试工具</h1>
                <p>专门测试AI是否能够建立和保持上下文的功能</p>
            </div>

            <div className="context-test-content">
                {/* 上下文模式选择 */}
                <div className="test-section">
                    <h2>📋 测试模式选择</h2>
                    <div className="mode-selection">
                        {contextModes.map(mode => (
                            <label key={mode.value} className="mode-option">
                                <input
                                    type="radio"
                                    value={mode.value}
                                    checked={selectedMode === mode.value}
                                    onChange={(e) => setSelectedMode(e.target.value)}
                                />
                                <div className="mode-info">
                                    <strong>{mode.label}</strong>
                                    <span>{mode.description}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Prompt选择 */}
                <div className="test-section">
                    <h2>🎯 测试Prompt选择</h2>
                    <div className="prompts-selection">
                        <div className="select-all-section">
                            <button
                                className="select-all-btn"
                                onClick={handleSelectAll}
                            >
                                {selectedPrompts.length === testablePrompts.length ? '取消全选' : '全选'}
                            </button>
                            <span className="selected-count">
                                已选择 {selectedPrompts.length} / {testablePrompts.length} 个Prompt
                            </span>
                        </div>

                        <div className="prompts-grid">
                            {testablePrompts.map(prompt => (
                                <label key={prompt.key} className="prompt-option">
                                    <input
                                        type="checkbox"
                                        checked={selectedPrompts.includes(prompt.key)}
                                        onChange={() => handlePromptToggle(prompt.key)}
                                    />
                                    <div className="prompt-info">
                                        <div className="prompt-name">
                                            {prompt.name}
                                            {prompt.context_dependent && <span className="context-badge">依赖上下文</span>}
                                        </div>
                                        <div className="prompt-description">{prompt.description}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 测试控制 */}
                <div className="test-section">
                    <h2>🚀 开始测试</h2>
                    <div className="test-controls">
                        <button
                            className="run-test-btn"
                            onClick={runContextTest}
                            disabled={isLoading || selectedPrompts.length === 0}
                        >
                            {isLoading ? '🔄 测试中...' : '🧪 开始上下文测试'}
                        </button>
                        {error && <div className="error-message">❌ {error}</div>}
                    </div>
                </div>

                {/* 测试结果 */}
                {testResults && (
                    <div className="test-section">
                        <h2>📊 测试结果</h2>

                        {/* 测试总结 */}
                        <div className="test-summary">
                            <div className="summary-card">
                                <h3>测试总结</h3>
                                <div className="summary-stats">
                                    <div className="stat-item">
                                        <span className="stat-label">测试模式:</span>
                                        <span className="stat-value">
                                            {testResults.context_mode === 'with_context' ? '🟢 上下文可用' : '🔴 上下文不可用'}
                                        </span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">总测试数:</span>
                                        <span className="stat-value">{testResults.summary.total_tests}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">通过数:</span>
                                        <span className="stat-value">{testResults.summary.passed_tests}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">通过率:</span>
                                        <span className="stat-value">{testResults.summary.pass_rate}%</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">依赖上下文:</span>
                                        <span className="stat-value">{testResults.summary.context_dependent_tests}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">"否"回答:</span>
                                        <span className="stat-value">{testResults.summary.no_responses}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">有效JSON:</span>
                                        <span className="stat-value">{testResults.summary.valid_json_responses}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 详细结果 */}
                        <div className="detailed-results">
                            <h3>详细结果</h3>
                            <div className="results-grid">
                                {Object.entries(testResults.results).map(([key, result]) => (
                                    <div key={key} className={`result-card ${result.test_passed ? 'passed' : 'failed'}`}>
                                        <div className="result-header">
                                            <span className="result-icon">{getResultStatusIcon(result)}</span>
                                            <span className="result-name">{result.prompt_name}</span>
                                            <span className="result-status">{getResultStatusText(result)}</span>
                                        </div>

                                        <div className="result-details">
                                            {result.is_context_dependent && (
                                                <div className="result-tag context-dependent">依赖上下文</div>
                                            )}
                                            {result.expected_no_response && (
                                                <div className="result-tag expected-no">预期回答"否"</div>
                                            )}
                                            {result.is_no_response && (
                                                <div className="result-tag no-response">回答"否"</div>
                                            )}
                                            {result.is_valid_json && (
                                                <div className="result-tag valid-json">有效JSON</div>
                                            )}
                                        </div>

                                        <div className="result-response">
                                            <strong>响应内容:</strong>
                                            <div className="response-text">{result.response}</div>
                                        </div>

                                        {result.error && (
                                            <div className="result-error">
                                                <strong>错误:</strong> {result.error}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContextTestPage; 