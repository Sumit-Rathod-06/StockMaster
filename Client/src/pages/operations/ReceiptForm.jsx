import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';

export default function ReceiptForm() {
    const navigate = useNavigate();
    const [warehouses, setWarehouses] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        reference: '',
        supplier_id: null,
        supplier_name: '',
        warehouse_id: '',
        expected_date: '',
        notes: '',
        items: []
    });

    useEffect(() => {
        fetchData();
        // Generate reference number and set defaults
        const today = new Date().toISOString().split('T')[0];
        setFormData(prev => ({
            ...prev,
            reference: `RCPT-${Date.now()}`,
            expected_date: today,
            supplier_id: null,
            supplier_name: ''
        }));
    }, []); const fetchData = async () => {
        try {
            const [warehousesRes, productsRes] = await Promise.all([
                api.get('/warehouses'),
                api.get('/products')
            ]);
            setWarehouses(warehousesRes.data.data);
            setProducts(productsRes.data.data);
            // For now, suppliers will be entered as text since there's no suppliers endpoint
            setSuppliers([]);
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
                supplier_id: formData.supplier_id,
                warehouse_id: formData.warehouse_id,
                expected_date: formData.expected_date,
                notes: formData.notes
            };
            await api.post('/receipts', payload);
            navigate('/receipts');
        } catch (error) {
            console.error('Error creating receipt:', error);
            alert('Failed to create receipt: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">New Receipt</h1>

            <form onSubmit={handleSubmit} className="magic-bento-card magic-bento-card--border-glow" style={{ aspectRatio: 'auto', minHeight: '500px' }}>
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
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Supplier Name</label>
                        <input
                            type="text"
                            placeholder="Enter supplier name"
                            className="input-field mt-1"
                            value={formData.supplier_name}
                            onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Expected Date</label>
                        <input
                            type="date"
                            className="input-field mt-1"
                            value={formData.expected_date || new Date().toISOString().split('T')[0]}
                            onChange={(e) => setFormData({ ...formData, expected_date: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Responsible Person</label>
                        <input
                            type="text"
                            placeholder="Enter responsible person"
                            className="input-field mt-1"
                            value={formData.responsible || ''}
                            onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Products</label>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-dark-300">
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Product</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Quantity</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-300">
                                {formData.items.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-4 py-3">
                                            <select
                                                required
                                                className="input-field w-full"
                                                value={item.productId}
                                                onChange={(e) => updateItem(index, 'productId', e.target.value)}
                                            >
                                                <option value="">Select Product</option>
                                                {products.map((p) => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="number"
                                                required
                                                placeholder="Quantity"
                                                className="input-field w-full text-right"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button type="button" onClick={() => removeItem(index)} className="text-red-400 hover:text-red-300">
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                <tr>
                                    <td colSpan="3" className="px-4 py-3">
                                        <button type="button" onClick={addItem} className="text-sm text-primary-400 hover:text-primary-300">
                                            New Product
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
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
                    <button type="submit" className="btn-primary flex-1">Create</button>
                    <button type="button" onClick={() => navigate('/receipts')} className="btn-secondary flex-1">Cancel</button>
                </div>
            </form>
        </div>
    );
}
