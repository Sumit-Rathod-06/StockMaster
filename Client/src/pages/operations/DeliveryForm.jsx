// Similar to ReceiptForm.jsx with customer field
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';

export default function DeliveryForm() {
    const navigate = useNavigate();
    const [warehouses, setWarehouses] = useState([]);
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        reference: '',
        customer_id: '',
        warehouse_id: '',
        scheduled_date: '',
        delivery_address: '',
        notes: '',
        items: []
    });

    useEffect(() => {
        fetchData();
        // Generate reference number and set defaults
        const today = new Date().toISOString().split('T')[0];
        setFormData(prev => ({
            ...prev,
            reference: `DEL-${Date.now()}`,
            scheduled_date: today,
            customer_id: null,
            delivery_address: 'Main Office'
        }));
    }, []); const fetchData = async () => {
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
            // Send only the fields backend expects
            const payload = {
                reference: formData.reference,
                customer_id: formData.customer_id,
                warehouse_id: formData.warehouse_id,
                scheduled_date: formData.scheduled_date,
                delivery_address: formData.delivery_address,
                notes: formData.notes
            };
            await api.post('/deliveries', payload);
            navigate('/deliveries');
        } catch (error) {
            console.error('Error creating delivery:', error);
            alert('Failed to create delivery: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-white mb-6">New Delivery</h1>

            <form onSubmit={handleSubmit} className="card space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Warehouse</label>
                        <select
                            required
                            className="input-field mt-1"
                            value={formData.warehouse_id}
                            onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value })}
                        >
                            <option value="">Select Warehouse</option>
                            {warehouses.map((wh) => (
                                <option key={wh.id} value={wh.id}>{wh.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300">Scheduled Date</label>
                    <input
                        type="date"
                        className="input-field mt-1"
                        value={formData.scheduled_date || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300">Delivery Address</label>
                    <input
                        type="text"
                        placeholder="Enter delivery address"
                        className="input-field mt-1"
                        value={formData.delivery_address}
                        onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Items</label>
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
                    <label className="block text-sm font-medium text-gray-300">Notes</label>
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
