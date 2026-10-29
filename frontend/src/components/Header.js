import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Eye } from 'lucide-react';

const Header = ({ onShowAnalysisModal }) => {
    const location = useLocation();

    return (
        <header className="flex justify-between items-center p-4 border-b border-slate-600/30 backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center space-x-3">
                <div className="relative">
                    <div className="w-8 h-8 text-slate-300">☽</div>
                    <div className="w-4 h-4 text-amber-300 absolute -top-1 -right-1">☉</div>
                </div>
                <div>
                    <h1 className="text-xl font-bold text-slate-100">生命洞察</h1>
                    <p className="text-sm text-slate-400">三维命理分析系统</p>
                </div>
            </div>

            <nav className="flex items-center space-x-4">
                <Link
                    to="/"
                    className={`px-3 py-2 rounded-lg transition-colors duration-200 ${location.pathname === '/'
                        ? 'bg-slate-700/50 text-slate-100'
                        : 'text-slate-300 hover:text-slate-100 hover:bg-slate-700/30'
                        }`}
                >
                    首页
                </Link>
                <button
                    onClick={() => onShowAnalysisModal()}
                    className="flex items-center px-3 py-2 rounded-lg transition-colors duration-200 text-slate-300 hover:text-slate-100 hover:bg-slate-700/30"
                >
                    <Eye className="w-4 h-4 mr-1" />
                    查看已购分析
                </button>
            </nav>
        </header>
    );
};

export default Header; 