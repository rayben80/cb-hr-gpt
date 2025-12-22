import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, Header, SidebarPageKey } from './components/Layout';
import Dashboard from './components/Dashboard';
import OrganizationManagement from './components/OrganizationManagement';
import EvaluationManagement from './components/EvaluationManagement';
import EvaluationLibrary from './components/EvaluationLibrary';
import SettingsPage from './components/SettingsPage';
import { ErrorProvider } from './contexts/ErrorContext';
import ErrorToast from './components/ErrorToast';
import ErrorBoundary from './components/ErrorBoundary';
import { ErrorLogModal } from './components/ErrorLogModal';

const App = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(() => (typeof window !== 'undefined' ? window.innerWidth > 1024 : true));
    const [activePage, setActivePage] = useState<SidebarPageKey>('evaluation');
    const [isErrorLogOpen, setIsErrorLogOpen] = useState(false);

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const handleResize = () => {
            setSidebarOpen(window.innerWidth > 1024);
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Call on initial render
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const renderPage = useCallback(() => {
        switch (activePage) {
            case 'dashboard':
                return <Dashboard />;
            case 'organization':
                return <OrganizationManagement />;
            case 'evaluation':
                return <EvaluationManagement />;
            case 'library':
                return <EvaluationLibrary />;
            case 'settings':
                return <SettingsPage />;
            default:
                return <EvaluationManagement />;
        }
    }, [activePage]);

    return (
        <ErrorBoundary>
            <ErrorProvider>
                <div className="flex h-screen bg-slate-100 font-sans text-slate-800">
                    <Sidebar isOpen={isSidebarOpen} activePage={activePage} onNavigate={(page) => setActivePage(page)} />
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <Header onMenuClick={toggleSidebar} onErrorLogClick={() => setIsErrorLogOpen(true)} />
                        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 p-8">
                            <ErrorBoundary>
                                {renderPage()}
                            </ErrorBoundary>
                        </main>
                    </div>
                    <ErrorToast />
                    <ErrorLogModal isOpen={isErrorLogOpen} onClose={() => setIsErrorLogOpen(false)} />
                </div>
            </ErrorProvider>
        </ErrorBoundary>
    );
};

export default App;
