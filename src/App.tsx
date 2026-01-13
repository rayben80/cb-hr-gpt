import ErrorBoundary from '@/components/feedback/ErrorBoundary';
import { ErrorLogModal } from '@/components/feedback/ErrorLogModal';
import { Layout, SidebarPageKey } from '@/components/layout/Layout';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { RoleProvider, useRole } from '@/contexts/RoleContext';
import AccessPending from '@/pages/AccessPending';
import Dashboard from '@/pages/Dashboard';
import EvaluationLibrary from '@/pages/EvaluationLibrary';
import EvaluationManagement from '@/pages/EvaluationManagement';
import Login from '@/pages/Login';
import OrganizationManagement from '@/pages/OrganizationManagement';
import SettingsPage from '@/pages/SettingsPage';
import { QueryProvider } from '@/providers/QueryProvider';
import { Toaster } from '@/utils/toast';
import { useCallback, useEffect, useState } from 'react';

const App = () => {
    return (
        <ErrorBoundary>
            <QueryProvider>
                <AuthProvider>
                    <RoleProvider>
                        <AppContent />
                        <Toaster position="top-right" richColors />
                    </RoleProvider>
                </AuthProvider>
            </QueryProvider>
        </ErrorBoundary>
    );
};

const AppContent = () => {
    const { currentUser, loading, accessStatus } = useAuth();
    const { role } = useRole();
    const isE2EBypass = import.meta.env.VITE_E2E_BYPASS_AUTH === 'true';
    const [isSidebarOpen, setSidebarOpen] = useState(() =>
        typeof window !== 'undefined' ? window.innerWidth > 1024 : true
    );
    const [activePage, setActivePage] = useState<SidebarPageKey>('evaluation');
    const [isErrorLogOpen, setIsErrorLogOpen] = useState(false);

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    // Redirect if accessing restricted pages as USER
    useEffect(() => {
        if (role === 'USER') {
            const restrictedPages: SidebarPageKey[] = ['dashboard', 'organization', 'library'];
            if (restrictedPages.includes(activePage)) {
                setActivePage('evaluation');
            }
        }
        // HQ_LEADER and TEAM_LEADER have access to all pages
        // Specific data filtering is handled in individual components
    }, [role, activePage]);

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

    if (loading && !isE2EBypass) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!currentUser && !isE2EBypass) {
        return <Login />;
    }

    if (!isE2EBypass && accessStatus !== 'approved') {
        return <AccessPending />;
    }

    return (
        <>
            <Layout
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={toggleSidebar}
                activePage={activePage}
                onNavigate={(page) => setActivePage(page)}
                onErrorLogClick={() => setIsErrorLogOpen(true)}
            >
                <ErrorBoundary>{renderPage()}</ErrorBoundary>
            </Layout>
            <ErrorLogModal isOpen={isErrorLogOpen} onClose={() => setIsErrorLogOpen(false)} />
        </>
    );
};

export default App;
