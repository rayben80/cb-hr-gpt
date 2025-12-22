import React, { memo, useMemo, useCallback } from 'react';
import { Icon } from './common';
import { ICONS, currentUser } from '../constants';
import { useError } from '../contexts/ErrorContext';

export type SidebarPageKey = 'dashboard' | 'organization' | 'evaluation' | 'library' | 'settings';

const NAV_ITEMS: ReadonlyArray<{ key: SidebarPageKey; icon: string; label: string }> = [
    { key: 'dashboard', icon: ICONS.dashboard, label: '성과 대시보드' },
    { key: 'organization', icon: ICONS.buildingOffice2, label: '조직 관리' },
    { key: 'evaluation', icon: ICONS.evaluations, label: '평가 관리' },
    { key: 'library', icon: ICONS.library, label: '평가 라이브러리' },
    { key: 'settings', icon: ICONS.settingsModern, label: '설정' },
];

interface NavItemProps {
    icon: string;
    label: string;
    active?: boolean;
    onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

const NavItem: React.FC<NavItemProps> = memo(({ icon, label, active = false, onClick }) => (
    <a href="#" onClick={onClick} className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${active ? 'bg-sky-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-800'}`}>
        <Icon path={icon} className="w-5 h-5 mr-3" />
        <span>{label}</span>
    </a>
));

NavItem.displayName = 'NavItem';

interface SidebarProps {
    isOpen: boolean;
    activePage: SidebarPageKey;
    onNavigate: (pageKey: SidebarPageKey) => void;
}

export const Sidebar: React.FC<SidebarProps> = memo(({ isOpen, activePage, onNavigate }) => {
    const navItems = useMemo(() => NAV_ITEMS, []);

    const handleNavItemClick = useCallback((pageKey: SidebarPageKey) => (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        onNavigate(pageKey);
    }, [onNavigate]);

    return (
        <aside className={`bg-white text-slate-800 flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-0 -translate-x-full'}`} style={{ transition: 'width 0.3s' }}>
            <div className="flex items-center justify-center h-20 border-b border-slate-200">
                <h1 className="text-xl font-bold text-sky-600 whitespace-nowrap">Performance Portal</h1>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
                {navItems.map(item => (
                    <NavItem
                        key={item.key}
                        icon={item.icon}
                        label={item.label}
                        active={activePage === item.key}
                        onClick={handleNavItemClick(item.key)}
                    />
                ))}
            </nav>
            <div className="px-4 py-6 border-t border-slate-200">
                <div className="flex items-center">
                    <img className="h-10 w-10 rounded-full object-cover" src={currentUser.avatar} alt="User avatar" />
                    <div className="ml-3 whitespace-nowrap">
                        <p className="text-sm font-semibold text-slate-900">{currentUser.name}</p>
                        <p className="text-xs text-slate-500">{currentUser.role}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
});

Sidebar.displayName = 'Sidebar';

interface HeaderProps {
    onMenuClick: () => void;
    onErrorLogClick: () => void;
}

export const Header: React.FC<HeaderProps> = memo(({ onMenuClick, onErrorLogClick }) => {
    const { errors } = useError();
    const errorCount = errors.filter(e => e.type === 'error').length;

    return (
        <header className="bg-white shadow-sm h-20 flex items-center justify-between px-8">
            <div className="flex items-center space-x-4">
                <button onClick={onMenuClick} className="text-slate-500 hover:text-slate-800 lg:hidden">
                    <Icon path={ICONS.menu} />
                </button>
                <div className="relative hidden md:block">
                    <Icon path={ICONS.search} className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                    <input type="text" placeholder="기능 검색..." className="pl-10 pr-4 py-2 w-64 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all" />
                </div>
            </div>
            <div className="flex items-center space-x-6">
                <button 
                    onClick={onErrorLogClick}
                    className="relative p-2 text-slate-500 hover:text-slate-800"
                >
                    <Icon path={ICONS.bug} className="w-5 h-5" />
                    {errorCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 text-xs font-bold text-white bg-red-500 rounded-full">
                            {errorCount}
                        </span>
                    )}
                </button>
                <button className="text-slate-500 hover:text-slate-800 relative">
                    <Icon path={ICONS.bell} />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                </button>
                <div className="flex items-center space-x-2 cursor-pointer">
                    <img className="h-10 w-10 rounded-full object-cover" src={currentUser.avatar} alt="User avatar" />
                    <div>
                        <span className="text-sm font-semibold text-slate-900">{currentUser.name}</span>
                    </div>
                    <Icon path={ICONS.chevronDown} className="w-4 h-4 text-slate-400" />
                </div>
            </div>
        </header>
    );
});

Header.displayName = 'Header';
