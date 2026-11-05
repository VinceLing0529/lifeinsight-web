import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-ink text-paper/80 mt-auto flex-shrink-0">
            <div className="container mx-auto px-4 lg:px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <h3 className="text-base font-serif font-bold text-paper mb-2 tracking-widest">生命洞察</h3>
                        <p className="text-paper/60 text-xs leading-relaxed">
                            融合东西方命理学精华，基于八字、紫微斗数和印度星盘的综合分析系统，
                            为您提供专业、准确的命理解读服务。
                        </p>
                    </div>

                    <div>
                        <h3 className="text-base font-serif font-bold text-paper mb-2 tracking-widest">技术特色</h3>
                        <ul className="text-paper/60 text-xs space-y-1.5">
                            <li>三盘融合分析算法</li>
                            <li>真太阳时精确计算</li>
                            <li>全球时区自动识别</li>
                            <li>交互式思维导图展示</li>
                            <li>三盘合参智能引擎</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-base font-serif font-bold text-paper mb-2 tracking-widest">使用说明</h3>
                        <p className="text-paper/60 text-xs leading-relaxed">
                            本系统提供的命理分析仅供参考，不应作为人生重大决策的唯一依据。
                            命运掌握在自己手中，积极向上的心态才是成功的关键。
                        </p>
                    </div>
                </div>

                <div className="border-t border-paper/15 mt-6 pt-4 flex flex-col md:flex-row justify-between items-center gap-1">
                    <p className="text-paper/40 text-xs">LifeInsight Team</p>
                    <a
                        href="mailto:support@aimingpan.com"
                        className="text-paper/40 text-xs hover:text-paper/80 transition-colors"
                    >
                        客服邮箱 · support@aimingpan.com
                    </a>
                    <p className="text-paper/40 text-xs">© 2026 生命洞察命盘分析系统</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
