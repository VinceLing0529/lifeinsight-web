import React, { useState } from 'react';

function CodeRedemptionModal({ isOpen, onClose, onSuccess }) {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePurchase = () => {
        // 跳转到外部购买链接
        window.open('https://www.dtjishou.net/item/s0devq', '_blank');
    };

    const handleVerify = async () => {
        if (!code.trim()) {
            alert('请输入兑换码');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/redemption-codes/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: code.trim() })
            });

            if (response.ok) {
                const result = await response.json();
                alert('兑换码验证成功！');
                onSuccess(code.trim()); // 验证成功，传递兑换码给父组件
                onClose();
            } else {
                const error = await response.json();
                alert(error.detail || '兑换码无效或已使用');
            }
        } catch (error) {
            console.error('验证失败:', error);
            alert('验证失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg p-6 w-96 max-w-[90vw]">
                <h3 className="text-xl text-slate-100 mb-4 text-center">获取完整报告</h3>

                <button
                    onClick={handlePurchase}
                    className="w-full bg-amber-500 text-white py-3 rounded-lg mb-4 hover:bg-amber-600 transition-colors font-medium"
                >
                    💳 购买兑换码
                </button>

                <div className="mb-4">
                    <label className="block text-slate-300 text-sm mb-2">兑换码</label>
                    <input
                        type="text"
                        placeholder="请输入兑换码"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 text-slate-100 px-3 py-2 rounded-lg focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                        maxLength={20}
                    />
                </div>

                <button
                    onClick={handleVerify}
                    disabled={loading || !code.trim()}
                    className="w-full bg-blue-500 text-white py-3 rounded-lg mb-4 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                    {loading ? '🔍 验证中...' : '🚀 开始探索'}
                </button>

                <button
                    onClick={onClose}
                    className="w-full bg-slate-600 text-slate-300 py-2 rounded-lg hover:bg-slate-700 transition-colors"
                >
                    取消
                </button>
            </div>
        </div>
    );
}

export default CodeRedemptionModal; 