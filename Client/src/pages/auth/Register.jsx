import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BlobCursor from '../../components/BlobCursor';
import LightRays from '../../components/LightRays';

export default function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        loginId: '',
        emailId: '',
        password: '',
        confirmPassword: '',
        role: 'WarehouseStaff'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        const { confirmPassword, ...userData } = formData;
        const result = await register(userData.loginId, userData.emailId, userData.password, userData.role);

        if (result.success) {
            // After registration, redirect to login
            navigate('/login');
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
                        <p className="mt-3 text-sm text-gray-400">Create your account</p>
                    </div>

                    {error && (
                        <div className="mb-4 bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg backdrop-blur-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="loginId" className="block text-sm font-medium text-gray-300">
                                Login ID
                            </label>
                            <input
                                id="loginId"
                                type="text"
                                required
                                className="input-field mt-1"
                                placeholder="your_login_id"
                                value={formData.loginId}
                                onChange={(e) => setFormData({ ...formData, loginId: e.target.value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="emailId" className="block text-sm font-medium text-gray-300">
                                Email address
                            </label>
                            <input
                                id="emailId"
                                type="email"
                                required
                                className="input-field mt-1"
                                placeholder="you@example.com"
                                value={formData.emailId}
                                onChange={(e) => setFormData({ ...formData, emailId: e.target.value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-300">
                                Role
                            </label>
                            <select
                                id="role"
                                className="input-field mt-1"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="WarehouseStaff">Warehouse Staff</option>
                                <option value="InventoryManager">Inventory Manager</option>
                                <option value="Admin">Admin</option>
                            </select>
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

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                required
                                className="input-field mt-1"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary"
                        >
                            {loading ? 'Creating account...' : 'Register'}
                        </button>

                        <p className="text-center text-sm text-gray-400">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                                Sign in here
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
