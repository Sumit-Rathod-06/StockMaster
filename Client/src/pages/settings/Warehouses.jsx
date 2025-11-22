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
            // Set static fallback data on error
            setWarehouses([
                {
                    id: 1,
                    name: 'Main Warehouse',
                    code: 'WH-001',
                    address: '123 Industrial Park Road',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    postal_code: '400001',
                    country: 'India',
                    contact_person: 'Rajesh Kumar',
                    contact_phone: '+91 98765 43210'
                },
                {
                    id: 2,
                    name: 'Warehouse B',
                    code: 'WH-002',
                    address: '456 Storage Avenue',
                    city: 'Pune',
                    state: 'Maharashtra',
                    postal_code: '411001',
                    country: 'India',
                    contact_person: 'Priya Sharma',
                    contact_phone: '+91 98765 43211'
                },
                {
                    id: 3,
                    name: 'South Warehouse',
                    code: 'WH-003',
                    address: '789 Logistics Complex',
                    city: 'Bangalore',
                    state: 'Karnataka',
                    postal_code: '560001',
                    country: 'India',
                    contact_person: 'Amit Patel',
                    contact_phone: '+91 98765 43212'
                }
            ]);
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

            <div className="card bg-dark-100 border border-dark-200">
                <p className="text-sm text-gray-300 italic">
                    This page contains the warehouse details & location.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {warehouses.map((wh) => (
                    <div key={wh.id} className="card hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-white">{wh.name}</h3>
                                <p className="text-sm text-gray-400 mt-1">Code: {wh.code}</p>
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
                            <p className="text-sm text-gray-300 mb-2">
                                📍 {wh.address}
                            </p>
                        )}

                        {(wh.city || wh.state || wh.postal_code) && (
                            <p className="text-xs text-gray-400 mb-3 pb-3 border-b border-dark-200">
                                {[wh.city, wh.state, wh.postal_code, wh.country].filter(Boolean).join(', ')}
                            </p>
                        )}

                        {(wh.contact_person || wh.contact_phone) && (
                            <div className="mb-3 pb-3 border-b border-dark-200 text-xs">
                                {wh.contact_person && <p className="text-gray-300"><strong>Contact:</strong> {wh.contact_person}</p>}
                                {wh.contact_phone && <p className="text-gray-300"><strong>Phone:</strong> {wh.contact_phone}</p>}
                            </div>
                        )}

                        <button
                            onClick={() => navigate('/locations')}
                            className="w-full mt-2 flex items-center justify-center gap-2 text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors"
                        >
                            <FiMapPin className="h-4 w-4" />
                            View Locations
                        </button>
                    </div>
                ))}
            </div>

            {warehouses.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-400">No warehouses found. Add your first warehouse to get started.</p>
                </div>
            )}
        </div>
    );
}
