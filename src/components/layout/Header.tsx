import { Bell, Bug, List as Menu, Moon, Sun } from '@phosphor-icons/react';
import React, { memo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useError } from '../../contexts/ErrorContext';
import { useRole } from '../../contexts/RoleContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getDisplayAvatarUrl } from '../../utils/avatarUtils';
import { Button, IconButton } from '../common';

interface HeaderProps {
    onMenuClick: () => void;
    onErrorLogClick: () => void;
}

export const Header: React.FC<HeaderProps> = memo(({ onMenuClick, onErrorLogClick }) => {
    const { errors } = useError();
    const { role, setRole } = useRole();
    const { theme, toggleTheme } = useTheme();
    const { currentUser } = useAuth();
    const errorCount = errors.filter((e: any) => e.type === 'error').length;
    const canOverrideRole = import.meta.env.DEV;
    const profileName = currentUser?.displayName || currentUser?.email || 'User';
    const profileSeed = currentUser?.email || profileName;
    const profileAvatar = getDisplayAvatarUrl(profileName, null, profileSeed);

    // Toggle Role for Demo Purpose
    const toggleRole = () => {
        if (role === 'HQ_LEADER') setRole('TEAM_LEADER');
        else if (role === 'TEAM_LEADER') setRole('USER');
        else setRole('HQ_LEADER');
    };

    const getRoleLabel = () => {
        switch (role) {
            case 'HQ_LEADER':
                return '본부장 모드';
            case 'TEAM_LEADER':
                return '팀장 모드';
            case 'USER':
                return '팀원 모드';
            default:
                return 'Role';
        }
    };

    return (
        <header className="bg-card/80 backdrop-blur-sm border-b border-border h-20 flex items-center justify-between px-8 sticky top-0 z-40">
            <div className="flex items-center space-x-4">
                {/* Mobile Menu Button */}
                <IconButton onClick={onMenuClick} variant="ghost" aria-label="메뉴 열기" className="lg:hidden">
                    <Menu className="w-6 h-6" weight="regular" />
                </IconButton>

                {/* Role Switcher for Demo - Uses Button component */}
                {canOverrideRole && (
                    <div className="hidden md:flex items-center space-x-2">
                        <Button onClick={toggleRole} variant={role !== 'USER' ? 'primary' : 'secondary'} size="sm">
                            {getRoleLabel()}
                        </Button>
                    </div>
                )}
            </div>

            <div className="flex items-center space-x-2">
                {/* Dark Mode Toggle */}
                <IconButton
                    onClick={toggleTheme}
                    variant="ghost"
                    aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
                >
                    {theme === 'dark' ? (
                        <Moon className="w-6 h-6" weight="fill" />
                    ) : (
                        <Sun className="w-6 h-6" weight="fill" />
                    )}
                </IconButton>

                {/* Error Log Button */}
                <IconButton onClick={onErrorLogClick} variant="ghost" aria-label="에러 로그" className="relative">
                    <Bug className="w-6 h-6" weight="regular" />
                    {errorCount > 0 && (
                        <span className="absolute top-1 right-1 flex items-center justify-center h-5 w-5 text-[10px] font-bold text-white bg-destructive rounded-full animate-pulse">
                            {errorCount}
                        </span>
                    )}
                </IconButton>

                {/* Notification Button */}
                <IconButton variant="ghost" aria-label="알림" className="relative">
                    <Bell className="w-6 h-6" weight="regular" />
                    <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive"></span>
                    </span>
                </IconButton>

                {/* User Profile */}
                <div className="flex items-center space-x-3 ml-2 pl-4 border-l border-border">
                    <img
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/20 transition-all hover:ring-primary/40"
                        src={profileAvatar}
                        alt="User avatar"
                    />
                    <div className="hidden sm:block">
                        <span className="text-sm font-semibold text-foreground">{profileName}</span>
                    </div>
                </div>
            </div>
        </header>
    );
});

Header.displayName = 'Header';
