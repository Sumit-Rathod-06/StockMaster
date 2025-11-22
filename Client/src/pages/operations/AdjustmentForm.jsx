// Adjustment form
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';

export default function AdjustmentForm() {
    const navigate = useNavigate();
    const [warehouses, setWarehouses] = useState([]);
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        productId: '',
        warehouseId: '',
        countedQuantity: 0,
        reason: '',
        notes: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [warehousesRes, productsRes] = await Promise.all([
                api.get('/warehouses'),
                api.get('/products')
            ]);
            setWarehouses(warehousesRes.data.data);
            setProducts(productsRes.data.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/adjustments', formData);
            navigate('/adjustments');
        } catch (error) {
            alert('Failed to create adjustment');
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">New Stock Adjustment</h1>

            <form onSubmit={handleSubmit} className="card space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Product</label>
                    <select
                        required
                        className="input-field mt-1"
                        value={formData.productId}
                        onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                    >
                        <option value="">Select Product</option>
                        {products.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Warehouse</label>
                    <select
                        required
                        className="input-field mt-1"
                        value={formData.warehouseId}
                        onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                    >
                        <option value="">Select Warehouse</option>
                        {warehouses.map((wh) => (
                            <option key={wh.id} value={wh.id}>{wh.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Counted Quantity</label>
                    <input
                        type="number"
                        step="0.01"
                        required
                        className="input-field mt-1"
                        value={formData.countedQuantity}
                        onChange={(e) => setFormData({ ...formData, countedQuantity: e.target.value })}
                    />
                    <p className="text-sm text-gray-500 mt-1">Enter the actual counted quantity</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Reason</label>
                    <input
                        type="text"
                        className="input-field mt-1"
                        placeholder="e.g., Damaged, Lost, Physical count"
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                        rows="3"
                        className="input-field mt-1"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                </div>

                <div className="flex gap-4">
                    <button type="submit" className="btn-primary flex-1">Create Adjustment</button>
                    <button type="button" onClick={() => navigate('/adjustments')} className="btn-secondary flex-1">Cancel</button>
                </div>
            </form>
        </div>
    );
}
