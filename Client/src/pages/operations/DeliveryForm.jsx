// Similar to ReceiptForm.jsx with customer field
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';

export default function DeliveryForm() {
    const navigate = useNavigate();
    const [warehouses, setWarehouses] = useState([]);
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        customer: '',
        warehouseId: '',
        scheduledDate: '',
        notes: '',
        items: []
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

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { productId: '', quantity: 0 }]
        });
    };

    const removeItem = (index) => {
        setFormData({
            ...formData,
            items: formData.items.filter((_, i) => i !== index)
        });
    };

    const updateItem = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        setFormData({ ...formData, items: newItems });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/deliveries', formData);
            navigate('/deliveries');
        } catch (error) {
            alert('Failed to create delivery');
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">New Delivery</h1>

            <form onSubmit={handleSubmit} className="card space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Customer</label>
                        <input
                            type="text"
                            required
                            className="input-field mt-1"
                            value={formData.customer}
                            onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                        />
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
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Scheduled Date</label>
                    <input
                        type="date"
                        className="input-field mt-1"
                        value={formData.scheduledDate}
                        onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
                    {formData.items.map((item, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                            <select
                                required
                                className="input-field flex-1"
                                value={item.productId}
                                onChange={(e) => updateItem(index, 'productId', e.target.value)}
                            >
                                <option value="">Select Product</option>
                                {products.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <input
                                type="number"
                                required
                                placeholder="Quantity"
                                className="input-field w-32"
                                value={item.quantity}
                                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                            />
                            <button type="button" onClick={() => removeItem(index)} className="btn-danger">Remove</button>
                        </div>
                    ))}
                    <button type="button" onClick={addItem} className="btn-secondary mt-2">Add Item</button>
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
                    <button type="submit" className="btn-primary flex-1">Create Delivery</button>
                    <button type="button" onClick={() => navigate('/deliveries')} className="btn-secondary flex-1">Cancel</button>
                </div>
            </form>
        </div>
    );
}
