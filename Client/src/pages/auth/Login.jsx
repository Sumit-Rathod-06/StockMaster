import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BlobCursor from '../../components/BlobCursor';
import LightRays from '../../components/LightRays';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(formData.email, formData.password);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.message);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <LightRays
                raysOrigin="top-center"
                raysColor="#7c3aed"
                raysSpeed={0.8}
                lightSpread={0.6}
                rayLength={1.5}
                followMouse={true}
                mouseInfluence={0.15}
                noiseAmount={0.05}
                distortion={0.03}
            />
            <BlobCursor
                blobType="circle"
                fillColor="#ffffff"
                trailCount={3}
                sizes={[50, 100, 65]}
                innerSizes={[15, 30, 20]}
                innerColor="rgba(0,0,0,0.3)"
                opacities={[0.8, 0.6, 0.4]}
                shadowColor="rgba(255,255,255,0.3)"
                shadowBlur={10}
                shadowOffsetX={0}
                shadowOffsetY={0}
                filterStdDeviation={25}
                useFilter={true}
                fastDuration={0.1}
                slowDuration={0.5}
                zIndex={1}
            />

            <div className="max-w-md w-full relative z-10">
                <div className="bg-dark-100/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-dark-200">
                    <div className="text-center mb-8">
                        <div className="inline-block">
                            <h2 className="text-4xl font-bold text-white">
                                StockMaster
                            </h2>
                            <div className="h-1 bg-primary-500 rounded-full mt-2"></div>
                        </div>
                        <p className="mt-3 text-sm text-gray-400">Sign in to your account</p>
                    </div>

                    {error && (
                        <div className="mb-4 bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg backdrop-blur-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                                Email address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                className="input-field mt-1"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                className="input-field mt-1"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Link to="/forgot-password" className="text-sm text-accent-400 hover:text-accent-300 transition-colors">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary"
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>

                        <p className="text-center text-sm text-gray-400">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                                Register here
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
