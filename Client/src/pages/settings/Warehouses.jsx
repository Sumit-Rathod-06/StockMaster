import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { FiPlus, FiEdit, FiTrash2, FiMapPin } from 'react-icons/fi';

export default function Warehouses() {
    const navigate = useNavigate();
    const [warehouses, setWarehouses] = useState([]);

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const fetchWarehouses = async () => {
        try {
            const res = await api.get('/warehouses');
            setWarehouses(res.data.data || []);
        } catch (error) {
            console.error('Failed to fetch warehouses:', error);
            setWarehouses([]);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this warehouse?')) return;
        try {
            await api.delete(`/warehouses/${id}`);
            fetchWarehouses();
        } catch (error) {
            console.error('Failed to delete warehouse:', error);
            alert('Failed to delete warehouse');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Warehouses</h1>
                <button
                    onClick={() => navigate('/warehouses/new')}
                    className="btn-primary flex items-center gap-2"
                >
                    <FiPlus className="h-4 w-4" />
                    Add Warehouse
                </button>
            </div>

            <div className="card bg-gray-50 border border-gray-200">
                <p className="text-sm text-gray-600 italic">
                    This page contains the warehouse details & location.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {warehouses.map((wh) => (
                    <div key={wh.id} className="card hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900">{wh.name}</h3>
                                <p className="text-sm text-gray-500 mt-1">Code: {wh.code}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => navigate(`/warehouses/${wh.id}`)}
                                    className="text-primary-600 hover:text-primary-900 transition-colors"
                                >
                                    <FiEdit className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(wh.id)}
                                    className="text-red-600 hover:text-red-900 transition-colors"
                                >
                                    <FiTrash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        
                        {wh.address && (
                            <p className="text-sm text-gray-600 mb-2">
                                📍 {wh.address}
                            </p>
                        )}
                        
                        {(wh.city || wh.state || wh.postal_code) && (
                            <p className="text-xs text-gray-500 mb-3 pb-3 border-b border-gray-200">
                                {[wh.city, wh.state, wh.postal_code, wh.country].filter(Boolean).join(', ')}
                            </p>
                        )}
                        
                        {(wh.contact_person || wh.contact_phone) && (
                            <div className="mb-3 pb-3 border-b border-gray-200 text-xs">
                                {wh.contact_person && <p className="text-gray-700"><strong>Contact:</strong> {wh.contact_person}</p>}
                                {wh.contact_phone && <p className="text-gray-700"><strong>Phone:</strong> {wh.contact_phone}</p>}
                            </div>
                        )}
                        
                        <button
                            onClick={() => navigate('/locations')}
                            className="w-full mt-2 flex items-center justify-center gap-2 text-sm text-primary-600 hover:text-primary-900 font-medium transition-colors"
                        >
                            <FiMapPin className="h-4 w-4" />
                            View Locations
                        </button>
                    </div>
                ))}
            </div>

            {warehouses.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">No warehouses found. Add your first warehouse to get started.</p>
                </div>
            )}
        </div>
    );
}
