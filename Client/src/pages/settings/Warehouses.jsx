// Warehouses management
import { useState, useEffect } from 'react';
import api from '../../api/api';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';

export default function Warehouses() {
    const [warehouses, setWarehouses] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', code: '', location: '', address: '' });
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const fetchWarehouses = async () => {
        try {
            const res = await api.get('/warehouses');
            setWarehouses(res.data.data);
        } catch (error) {
            console.error('Failed to fetch warehouses:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await api.put(`/warehouses/${editId}`, formData);
            } else {
                await api.post('/warehouses', formData);
            }
            setFormData({ name: '', code: '', location: '', address: '' });
            setEditId(null);
            setShowForm(false);
            fetchWarehouses();
        } catch (error) {
            alert('Failed to save warehouse');
        }
    };

    const handleEdit = (warehouse) => {
        setFormData(warehouse);
        setEditId(warehouse.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure?')) return;
        try {
            await api.delete(`/warehouses/${id}`);
            fetchWarehouses();
        } catch (error) {
            alert('Failed to delete warehouse');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Warehouses</h1>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center">
                    <FiPlus className="mr-2" /> Add Warehouse
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="card space-y-4">
                    <h3 className="text-lg font-semibold">{editId ? 'Edit' : 'New'} Warehouse</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Name"
                            required
                            className="input-field"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Code"
                            required
                            className="input-field"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        />
                    </div>
                    <input
                        type="text"
                        placeholder="Location"
                        className="input-field"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                    <textarea
                        placeholder="Address"
                        rows="2"
                        className="input-field"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                    <div className="flex gap-2">
                        <button type="submit" className="btn-primary">Save</button>
                        <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="btn-secondary">Cancel</button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {warehouses.map((wh) => (
                    <div key={wh.id} className="card">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{wh.name}</h3>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(wh)} className="text-primary-600 hover:text-primary-900">
                                    <FiEdit />
                                </button>
                                <button onClick={() => handleDelete(wh.id)} className="text-red-600 hover:text-red-900">
                                    <FiTrash2 />
                                </button>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500">Code: {wh.code}</p>
                        {wh.location && <p className="text-sm text-gray-500">Location: {wh.location}</p>}
                        {wh.address && <p className="text-sm text-gray-500 mt-2">{wh.address}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
}
