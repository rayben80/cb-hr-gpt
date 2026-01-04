import React from 'react';
import { Header } from './Header';
import { Sidebar, SidebarPageKey } from './Sidebar';

export { Header, Sidebar, type SidebarPageKey };

interface LayoutProps {
    isSidebarOpen: boolean;
    onToggleSidebar: () => void;
    activePage: SidebarPageKey;
    onNavigate: (page: SidebarPageKey) => void;
    onErrorLogClick: () => void;
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
    isSidebarOpen,
    onToggleSidebar,
    activePage,
    onNavigate,
    onErrorLogClick,
    children,
}) => {
    return (
        <div className="flex h-screen bg-slate-100 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-200">
            <Sidebar isOpen={isSidebarOpen} activePage={activePage} onNavigate={onNavigate} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header onMenuClick={onToggleSidebar} onErrorLogClick={onErrorLogClick} />
                <main className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-900 p-8">{children}</main>
            </div>
        </div>
    );
};
