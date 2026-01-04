import { Books, Buildings, ClipboardText, Gear, SignOut, SquaresFour } from '@phosphor-icons/react';
import React, { memo, useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../contexts/RoleContext';

export type SidebarPageKey = 'dashboard' | 'organization' | 'evaluation' | 'library' | 'settings';

const NAV_ITEMS: ReadonlyArray<{
    key: SidebarPageKey;
    icon: any; // Phosphor Icon type
    label: string;
    roles: ('SUPER_ADMIN' | 'HQ_LEADER' | 'TEAM_LEADER' | 'USER')[];
}> = [
    { key: 'dashboard', icon: SquaresFour, label: '성과 대시보드', roles: ['SUPER_ADMIN', 'HQ_LEADER', 'TEAM_LEADER'] },
    { key: 'organization', icon: Buildings, label: '조직 관리', roles: ['SUPER_ADMIN', 'HQ_LEADER', 'TEAM_LEADER'] },
    {
        key: 'evaluation',
        icon: ClipboardText,
        label: '평가 관리',
        roles: ['SUPER_ADMIN', 'HQ_LEADER', 'TEAM_LEADER', 'USER'],
    },
    { key: 'library', icon: Books, label: '평가 라이브러리', roles: ['SUPER_ADMIN', 'HQ_LEADER', 'TEAM_LEADER'] },
    { key: 'settings', icon: Gear, label: '설정', roles: ['SUPER_ADMIN', 'HQ_LEADER', 'TEAM_LEADER', 'USER'] },
];

interface NavItemProps {
    icon: any;
    label: string;
    active?: boolean;
    onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

const NavItem: React.FC<NavItemProps> = memo(({ icon: IconComponent, label, active = false, onClick }) => (
    <a
        href="#"
        onClick={onClick}
        className={`
            flex items-center min-h-[50px] px-4 py-3 text-[15px] font-medium rounded-2xl
            transition-all duration-200 group
            ${
                active
                    ? 'bg-secondary text-primary' // Toss style: Light grey bg + Vivid Blue Text
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors'
            }
        `
            .trim()
            .replace(/\s+/g, ' ')}
        aria-current={active ? 'page' : undefined}
    >
        <IconComponent
            weight={active ? 'fill' : 'regular'}
            className={`w-6 h-6 mr-3 transition-transform duration-200 ${!active ? 'group-hover:scale-110' : ''}`}
        />
        <span>{label}</span>
        {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" />}
    </a>
));

NavItem.displayName = 'NavItem';

interface SidebarProps {
    isOpen: boolean;
    activePage: SidebarPageKey;
    onNavigate: (pageKey: SidebarPageKey) => void;
}

export const Sidebar: React.FC<SidebarProps> = memo(({ isOpen, activePage, onNavigate }) => {
    const { role } = useRole();
    const { currentUser: authCurrentUser, logout } = useAuth();

    const navItems = useMemo(() => {
        return NAV_ITEMS.filter((item) => item.roles.includes(role as any));
    }, [role]);

    const handleNavItemClick = useCallback(
        (pageKey: SidebarPageKey) => (e: React.MouseEvent<HTMLAnchorElement>) => {
            e.preventDefault();
            onNavigate(pageKey);
        },
        [onNavigate]
    );

    return (
        <aside
            className={`
                bg-card/80 backdrop-blur-sm border-r border-border
                text-card-foreground flex flex-col
                transition-all duration-300 ease-in-out
                ${isOpen ? 'w-64' : 'w-0 overflow-hidden'}
            `
                .trim()
                .replace(/\s+/g, ' ')}
        >
            {/* Logo */}
            <div className="flex items-center justify-center h-20 border-b border-border">
                <h1 className="text-xl font-extrabold text-primary whitespace-nowrap">Performance Portal</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-1" aria-label="메인 네비게이션">
                {navItems.map((item) => (
                    <NavItem
                        key={item.key}
                        icon={item.key === 'dashboard' ? SquaresFour : item.icon} // Ensure robust icon rendering
                        label={item.label}
                        active={activePage === item.key}
                        onClick={handleNavItemClick(item.key)}
                    />
                ))}
            </nav>

            {/* User Profile */}
            <div className="px-4 py-5 border-t border-border">
                <div className="flex items-center justify-between p-2 rounded-xl hover:bg-accent/30 transition-colors group">
                    <div className="flex items-center min-w-0">
                        {authCurrentUser?.photoURL ? (
                            <img
                                className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/20"
                                src={authCurrentUser.photoURL}
                                alt="User avatar"
                            />
                        ) : (
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center ring-2 ring-primary/20">
                                <span className="text-indigo-600 font-bold text-lg">
                                    {authCurrentUser?.email?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            </div>
                        )}
                        <div className="ml-3 whitespace-nowrap overflow-hidden">
                            <p className="text-sm font-semibold text-foreground truncate">
                                {authCurrentUser?.displayName || 'User'}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                {role === 'SUPER_ADMIN'
                                    ? '슈퍼 관리자'
                                    : role === 'HQ_LEADER'
                                      ? '클라우드사업본부장'
                                      : role === 'TEAM_LEADER'
                                        ? 'Sales팀장'
                                        : '구성원'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => logout()}
                        className="p-2 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Sign out"
                    >
                        <SignOut size={20} weight="bold" />
                    </button>
                </div>
            </div>
        </aside>
    );
});

Sidebar.displayName = 'Sidebar';
