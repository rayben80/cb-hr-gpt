import { GoogleLogo, WarningCircle } from '@phosphor-icons/react';
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
    const { signInWithGoogle } = useAuth();
    const [error, setError] = useState<string | null>(null);

    const handleGoogleSignIn = async () => {
        try {
            setError(null);
            await signInWithGoogle();
        } catch (error: any) {
            console.error('Failed to sign in', error);
            if (error.message === 'Only @forcs.com email addresses are allowed.') {
                setError('Only @forcs.com email addresses are allowed.');
            } else {
                setError('Failed to sign in. Please try again.');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-slate-900">HR Manager GPT</h2>
                    <p className="mt-2 text-sm text-slate-600">Sign in to access your dashboard</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
                        <WarningCircle size={20} weight="fill" />
                        {error}
                    </div>
                )}

                <div className="mt-8 space-y-6">
                    <button
                        onClick={handleGoogleSignIn}
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                    >
                        <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                            <GoogleLogo className="h-5 w-5 text-indigo-50 group-hover:text-white" weight="bold" />
                        </span>
                        Sign in with Google
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
