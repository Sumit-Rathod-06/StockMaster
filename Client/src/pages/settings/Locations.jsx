import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { FiPlus, FiEdit, FiTrash2, FiArrowLeft } from 'react-icons/fi';

export default function Locations() {
    const navigate = useNavigate();
    const [locations, setLocations] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        warehouse_id: ''
    });
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        fetchLocations();
        fetchWarehouses();
    }, []);

    const fetchLocations = async () => {
        try {
            const res = await api.get('/locations');
            setLocations(res.data.data || []);
        } catch (error) {
            console.error('Failed to fetch locations:', error);
            setLocations([]);
        }
    };

    const fetchWarehouses = async () => {
        try {
            const res = await api.get('/warehouses');
            setWarehouses(res.data.data || []);
        } catch (error) {
            console.error('Failed to fetch warehouses:', error);
            setWarehouses([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await api.put(`/locations/${editId}`, formData);
            } else {
                await api.post('/locations', formData);
            }
            setFormData({ name: '', code: '', warehouse_id: '' });
            setEditId(null);
            setShowForm(false);
            fetchLocations();
        } catch (error) {
            console.error('Failed to save location:', error);
            alert('Failed to save location');
        }
    };

    const handleEdit = (location) => {
        setFormData({
            name: location.name,
            code: location.code,
            warehouse_id: location.warehouse_id
        });
        setEditId(location.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this location?')) return;
        try {
            await api.delete(`/locations/${id}`);
            fetchLocations();
        } catch (error) {
            console.error('Failed to delete location:', error);
            alert('Failed to delete location');
        }
    };

    const getWarehouseName = (warehouseId) => {
        const warehouse = warehouses.find(w => w.id === warehouseId);
        return warehouse ? warehouse.name : 'N/A';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/warehouses')}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FiArrowLeft className="h-6 w-6" />
                    </button>
                    <h1 className="text-2xl font-bold text-white">Locations</h1>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn-primary flex items-center gap-2"
                >
                    <FiPlus className="h-4 w-4" />
                    Add Location
                </button>
            </div>

            <div className="card bg-gray-50 border border-gray-200">
                <p className="text-sm text-gray-600 italic">
                    This holds the multiple locations of warehouse, rooms, etc..
                </p>
            </div>

            {showForm && (
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">
                        {editId ? 'Edit Location' : 'New Location'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                                placeholder="Enter location name"
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
                                placeholder="Enter short code"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Warehouse:
                            </label>
                            <select
                                required
                                className="input-field w-full"
                                value={formData.warehouse_id}
                                onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value })}
                            >
                                <option value="">Select warehouse</option>
                                {warehouses.map((wh) => (
                                    <option key={wh.id} value={wh.id}>
                                        {wh.name} ({wh.code})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button type="submit" className="btn-primary">
                                Save Location
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditId(null);
                                    setFormData({ name: '', code: '', warehouse_id: '' });
                                }}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {locations.map((location) => (
                    <div key={location.id} className="card hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {location.name}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Code: {location.code}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(location)}
                                    className="text-primary-600 hover:text-primary-900 transition-colors"
                                >
                                    <FiEdit className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(location.id)}
                                    className="text-red-600 hover:text-red-900 transition-colors"
                                >
                                    <FiTrash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        <div className="pt-2 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                                Warehouse: <span className="font-medium text-gray-900">{getWarehouseName(location.warehouse_id)}</span>
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {locations.length === 0 && !showForm && (
                <div className="text-center py-12">
                    <p className="text-gray-500">No locations found. Add your first location to get started.</p>
                </div>
            )}
        </div>
    );
}
