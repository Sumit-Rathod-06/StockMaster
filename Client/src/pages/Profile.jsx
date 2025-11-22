// User profile page
import { useAuth } from '../context/AuthContext';

export default function Profile() {
    const { user } = useAuth();

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-white mb-6">My Profile</h1>

            <div className="card space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300">Name</label>
                    <p className="mt-1 text-white">{user?.name}</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300">Email</label>
                    <p className="mt-1 text-white">{user?.email}</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300">Role</label>
                    <p className="mt-1">
                        <span className="badge badge-ready capitalize">{user?.role?.replace('_', ' ')}</span>
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300">Account ID</label>
                    <p className="mt-1 text-xs text-gray-400 font-mono">{user?.id}</p>
                </div>
            </div>
        </div>
    );
}
