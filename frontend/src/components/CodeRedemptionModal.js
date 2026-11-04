import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { API_BASE } from '../config';

function CodeRedemptionModal({ isOpen, onClose }) {
    const [stripeEnabled, setStripeEnabled] = useState(false);
    const [paying, setPaying] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        fetch(`${API_BASE}/api/payments/config`)
            .then(r => r.ok ? r.json() : null)
            .then(d => setStripeEnabled(!!(d && d.stripe_enabled)))
            .catch(() => setStripeEnabled(false));
    }, [isOpen]);

    const handleOnlinePay = async () => {
        setPaying(true);
        try {
            const response = await fetch(`${API_BASE}/api/payments/stripe/checkout`, { method: 'POST' });
            if (!response.ok) throw new Error('checkout failed');
            const data = await response.json();
            window.location.href = data.url;
        } catch (error) {
            console.error('在线支付发起失败:', error);
            toast.error('在线支付暂时不可用，请稍后再试');
            setPaying(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50">
            <div className="bg-paper-card border border-line rounded shadow-2xl p-6 w-96 max-w-[90vw]">
                <h3 className="text-xl font-serif font-bold text-ink mb-4 text-center tracking-widest">获取完整报告</h3>

                <p className="text-center text-ink-soft text-sm mb-4">
                    完整报告 <span className="text-lg font-bold text-primary-600">¥99</span> / 份（含运势预测与 30 问答疑）
                </p>

                <p className="text-sm text-ink-soft mb-4">
                    点击下方按钮在线支付（支付宝 / 银行卡），付完自动进入报告，全程无需输入任何码。
                </p>

                {stripeEnabled ? (
                    <button
                        onClick={handleOnlinePay}
                        disabled={paying}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-paper-card py-3 rounded mb-3 disabled:opacity-50 transition-colors font-medium"
                    >
                        {paying ? '正在跳转到支付页...' : '在线支付 ¥99（支付宝 / 银行卡）'}
                    </button>
                ) : (
                    <p className="text-center text-sm text-ink-faint border border-line rounded py-3 mb-3">
                        在线支付通道维护中，请稍后再试
                    </p>
                )}

                <p className="text-xs text-ink-faint mb-4">
                    在线支付由 Stripe 安全处理。支付成功后将自动进入您的报告；如中途关闭页面，用同一浏览器回到本站即可恢复。
                </p>

                <button
                    onClick={onClose}
                    className="w-full bg-paper-deep hover:bg-line text-ink-soft py-2 rounded transition-colors"
                >
                    取消
                </button>
            </div>
        </div>
    );
}

export default CodeRedemptionModal;
