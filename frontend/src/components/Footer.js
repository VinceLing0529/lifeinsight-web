import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-slate-800/50 text-slate-200 py-3 border-t border-slate-600/30 backdrop-blur-sm flex-shrink-0">
            <div className="container mx-auto px-4 lg:px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 lg:gap-4">
                    {/* 系统介绍 */}
                    <div>
                        <h3 className="text-base font-semibold mb-2 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-clip-text text-transparent">生命洞察</h3>
                        <p className="text-slate-300 text-xs leading-relaxed">
                            融合东西方命理学精华，基于八字、紫微斗数和印度星盘的综合分析系统，
                            为您提供专业、准确的命理解读服务。
                        </p>
                    </div>

                    {/* 技术特色 */}
                    <div>
                        <h3 className="text-base font-semibold mb-2 text-slate-100">技术特色</h3>
                        <ul className="text-slate-300 text-xs space-y-1">
                            <li>• 三盘融合分析算法</li>
                            <li>• 真太阳时精确计算</li>
                            <li>• 全球时区自动识别</li>
                            <li>• 交互式思维导图展示</li>
                            <li>• AI智能分析引擎</li>
                        </ul>
                    </div>

                    {/* 免责声明 */}
                    <div>
                        <h3 className="text-base font-semibold mb-2 text-slate-100">使用说明</h3>
                        <p className="text-slate-300 text-xs leading-relaxed">
                            本系统提供的命理分析仅供参考，不应作为人生重大决策的唯一依据。
                            命运掌握在自己手中，积极向上的心态才是成功的关键。
                        </p>
                    </div>
                </div>

                <div className="border-t border-slate-600/30 mt-4 pt-3">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-slate-400 text-xs flex items-center">
                            <div className="w-3 h-3 mr-1 text-red-400">❤️</div>
                            Made with love by LifeInsight Team
                        </p>
                        <p className="text-slate-400 text-xs flex items-center mt-1 md:mt-0">
                            <div className="w-3 h-3 mr-1">💻</div>
                            © 2024 生命洞察命盘分析系统
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer; 