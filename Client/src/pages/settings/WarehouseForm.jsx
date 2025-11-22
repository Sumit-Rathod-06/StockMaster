import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/api';
import { FiArrowLeft, FiSave } from 'react-icons/fi';

export default function WarehouseForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        address: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (id) {
            fetchWarehouse();
        }
    }, [id]);

    const fetchWarehouse = async () => {
        try {
            const res = await api.get(`/warehouses/${id}`);
            setFormData(res.data.data);
        } catch (error) {
            console.error('Failed to fetch warehouse:', error);
            alert('Failed to load warehouse details');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (id) {
                await api.put(`/warehouses/${id}`, formData);
            } else {
                await api.post('/warehouses', formData);
            }
            navigate('/warehouses');
        } catch (error) {
            console.error('Failed to save warehouse:', error);
            alert('Failed to save warehouse');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/warehouses')}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <FiArrowLeft className="h-6 w-6" />
                </button>
                <h1 className="text-2xl font-bold text-white">
                    {id ? 'Edit Warehouse' : 'New Warehouse'}
                </h1>
            </div>

            <div className="card max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Name:
                            </label>
                            <input
                                type="text"
                                required
                                className="input-field w-full"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter warehouse name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Short Code:
                            </label>
                            <input
                                type="text"
                                required
                                className="input-field w-full"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                placeholder="Enter short code (e.g., WH01)"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Address:
                            </label>
                            <textarea
                                rows="3"
                                className="input-field w-full"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Enter warehouse address"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary flex items-center gap-2"
                        >
                            <FiSave className="h-4 w-4" />
                            {loading ? 'Saving...' : 'Save Warehouse'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/warehouses')}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>

            <div className="card max-w-2xl bg-gray-50 border border-gray-200">
                <p className="text-sm text-gray-600 italic">
                    This page contains the warehouse details & location.
                </p>
            </div>
        </div>
    );
}
