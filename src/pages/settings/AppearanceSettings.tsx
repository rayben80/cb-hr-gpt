import { Desktop, Moon, Sun } from '@phosphor-icons/react';
import { SettingsCard } from '../../components/settings/SettingsCard';
import { useTheme as useThemeHook } from '../../contexts/ThemeContext';

export const AppearanceSettings = () => {
    const { theme, setTheme, resolvedTheme } = useThemeHook();

    const themeOptions: { value: 'light' | 'dark' | 'system'; label: string; icon: React.ElementType }[] = [
        { value: 'light', label: '라이트', icon: Sun },
        { value: 'dark', label: '다크', icon: Moon },
        { value: 'system', label: '시스템', icon: Desktop },
    ];

    return (
        <SettingsCard title="화면 설정" description="작업 환경을 커스터마이징합니다.">
            <div className="space-y-8">
                <div>
                    <label className="text-sm font-bold text-slate-900 dark:text-slate-100 block mb-3">테마 설정</label>
                    <div className="grid grid-cols-3 gap-4">
                        {themeOptions.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setTheme(opt.value)}
                                className={`group flex flex-col items-center p-4 border rounded-xl transition-all ${
                                    theme === opt.value
                                        ? 'border-primary bg-primary/10 dark:bg-primary/20 ring-1 ring-primary'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                            >
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${theme === opt.value ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}
                                >
                                    <opt.icon className="w-5 h-5" weight={theme === opt.value ? 'fill' : 'regular'} />
                                </div>
                                <span
                                    className={`text-sm font-medium ${theme === opt.value ? 'text-primary-foreground dark:text-primary' : 'text-slate-600 dark:text-slate-400'}`}
                                >
                                    {opt.label}
                                </span>
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                        현재 적용된 테마:{' '}
                        <span className="font-medium">{resolvedTheme === 'dark' ? '다크 모드' : '라이트 모드'}</span>
                    </p>
                </div>
            </div>
        </SettingsCard>
    );
};
