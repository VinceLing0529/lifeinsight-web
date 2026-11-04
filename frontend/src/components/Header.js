import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Eye } from 'lucide-react';

const Header = ({ onShowAnalysisModal }) => {
    const location = useLocation();

    return (
        <header className="flex justify-between items-center px-4 lg:px-6 py-3 border-b border-line bg-paper flex-shrink-0">
            <Link to="/" className="flex items-center space-x-3">
                <span className="seal w-9 h-9 text-lg">洞</span>
                <span>
                    <span className="block text-lg font-serif font-bold text-ink leading-tight tracking-widest">生命洞察</span>
                    <span className="hidden sm:block text-[11px] text-ink-faint tracking-[0.3em]">三盘合参 · 命理分析</span>
                </span>
            </Link>

            <nav className="flex items-center space-x-2">
                <Link
                    to="/"
                    className={`px-3 py-2 rounded transition-colors duration-200 text-sm tracking-wide ${location.pathname === '/'
                        ? 'text-primary-700 font-medium'
                        : 'text-ink-soft hover:text-ink'
                        }`}
                >
                    首页
                </Link>
                <button
                    onClick={() => onShowAnalysisModal()}
                    className="flex items-center px-3 py-2 rounded transition-colors duration-200 text-sm tracking-wide text-ink-soft hover:text-ink whitespace-nowrap"
                >
                    <Eye className="w-4 h-4 mr-1 shrink-0" />
                    查看我的报告
                </button>
            </nav>
        </header>
    );
};

export default Header;
