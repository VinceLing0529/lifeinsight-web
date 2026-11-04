import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API_BASE } from '../config';

// Stripe 支付成功回跳页：凭 session_id 向后端取已付费的码（后端核验付款后发放）。
// 正常路径不再要求用户输码：码暂存 localStorage，自动跳回结果页直达报告生成；
// 码同时以“恢复码”形式展示，作为换设备/自动跳转失败时的兜底。
function PaymentSuccessPage() {
    const [params] = useSearchParams();
    const sessionId = params.get('session_id') || '';
    const [state, setState] = useState({ status: 'checking', code: null, hasChart: false });

    useEffect(() => {
        if (!sessionId) { setState({ status: 'missing', code: null, hasChart: false }); return; }
        let tries = 0;
        let timer = null;
        const poll = async () => {
            tries += 1;
            try {
                const r = await fetch(`${API_BASE}/api/payments/stripe/session/${sessionId}`);
                const d = await r.json();
                if (d.code) {
                    let hasChart = false;
                    try {
                        localStorage.setItem('li_paid_code', d.code);
                        hasChart = !!localStorage.getItem('li_last_chart');
                    } catch { /* 存储不可用时走手动兜底 */ }
                    setState({ status: 'paid', code: d.code, hasChart });
                    return;
                }
                if (d.status === 'paid') { setState({ status: 'paid', code: null, hasChart: false }); return; }
            } catch (e) { /* 网络抖动时继续轮询 */ }
            if (tries < 15) { timer = setTimeout(poll, 2000); }
            else { setState({ status: 'timeout', code: null, hasChart: false }); }
        };
        poll();
        return () => { if (timer) clearTimeout(timer); }
    }, [sessionId]);

    // 同浏览器有排盘记录时自动直达结果页（结果页会核销并开始生成报告）
    useEffect(() => {
        if (state.status === 'paid' && state.code && state.hasChart) {
            const t = setTimeout(() => { window.location.href = '/results'; }, 1500);
            return () => clearTimeout(t);
        }
    }, [state]);

    const copyCode = async () => {
        try { await navigator.clipboard.writeText(state.code); toast.success('恢复码已复制'); }
        catch (e) { toast.error('复制失败，请手动复制'); }
    };

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
            <div className="bg-paper-card border border-line rounded shadow-xl p-8 w-[28rem] max-w-[92vw] text-center">
                <h2 className="text-2xl font-serif font-bold text-ink mb-4 tracking-widest">支付结果</h2>
                {state.status === 'checking' && <p className="text-ink-soft">正在核验付款状态…</p>}
                {state.status === 'paid' && state.code && state.hasChart && (
                    <>
                        <p className="text-ink-soft mb-3">付款成功！正在为你打开完整报告，无需再做任何操作…</p>
                        <button onClick={() => { window.location.href = '/results'; }} className="w-full bg-primary-600 hover:bg-primary-700 text-paper-card py-3 rounded mb-3 transition-colors font-medium">立即进入报告</button>
                        <p className="text-xs text-ink-faint">若自动跳转失败，这是你的恢复码：<span className="font-mono font-bold text-primary-600">{state.code}</span>（回到结果页点“获取完整报告”输入即可，仅可使用一次）</p>
                    </>
                )}
                {state.status === 'paid' && state.code && !state.hasChart && (
                    <>
                        <p className="text-ink-soft mb-3">付款成功！这是你的报告恢复码，请妥善保存：</p>
                        <p className="text-2xl font-mono font-bold text-primary-600 tracking-widest mb-4">{state.code}</p>
                        <button onClick={copyCode} className="w-full bg-primary-600 hover:bg-primary-700 text-paper-card py-3 rounded mb-3 transition-colors font-medium">复制恢复码</button>
                        <p className="text-xs text-ink-faint mb-4">在本页没找到你的排盘记录（可能是在另一台设备上排的盘）。回到排盘所在设备打开结果页，点“获取完整报告”输入恢复码即可生成。恢复码仅可使用一次。</p>
                    </>
                )}
                {state.status === 'paid' && !state.code && <p className="text-ink-soft">付款已确认，报告开通中，请稍后刷新本页。</p>}
                {state.status === 'timeout' && <p className="text-ink-soft">核验超时。若你已完成付款，开通会随付款确认自动完成，请稍后重新打开本页；仍有问题请凭付款记录联系客服。</p>}
                {state.status === 'missing' && <p className="text-ink-soft">缺少支付会话信息，无法核验。</p>}
                <Link to="/" className="inline-block mt-2 text-primary-600 underline">返回首页</Link>
            </div>
        </div>
    );
}

export default PaymentSuccessPage;
