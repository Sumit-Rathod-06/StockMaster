import { useState, useEffect } from 'react';
import api from '../api/api';
import { FiPrinter, FiCheck, FiX, FiCopy } from 'react-icons/fi';

export default function ReceiptModal({ receiptId, onClose, onUpdate }) {
    const [receipt, setReceipt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({
        supplier: '',
        warehouseId: '',
        scheduledDate: '',
        responsible: '',
        notes: '',
        items: []
    });
    const [warehouses, setWarehouses] = useState([]);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        if (receiptId === 'preview') {
            // Load preview data
            setReceipt({
                id: 'preview',
                receiptNumber: 'WH/IN/0001',
                supplier: 'Vendor ABC',
                responsible: 'John Doe',
                scheduledDate: new Date().toISOString(),
                status: 'draft',
                items: [
                    { product: { name: '[Desk007] Desk' }, quantity: 6 }
                ]
            });
            setLoading(false);
        } else if (receiptId) {
            fetchReceipt();
            fetchData();
        }
    }, [receiptId]);

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

    const fetchReceipt = async () => {
        try {
            const res = await api.get(`/receipts/${receiptId}`);
            setReceipt(res.data.data);
            setFormData({
                supplier: res.data.data.supplier || '',
                warehouseId: res.data.data.warehouseId || '',
                scheduledDate: res.data.data.scheduledDate ? res.data.data.scheduledDate.split('T')[0] : '',
                responsible: res.data.data.responsible || '',
                notes: res.data.data.notes || '',
                items: res.data.data.items || []
            });
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch receipt:', error);
            setLoading(false);
        }
    };

    const handleValidate = async () => {
        if (receiptId === 'preview') {
            alert('This is a preview. No action will be taken.');
            return;
        }
        if (!confirm('Validate this receipt? Stock will be updated and status will move to Done.')) return;
        try {
            await api.post(`/receipts/${receiptId}/validate`);
            await fetchReceipt();
            if (onUpdate) onUpdate();
        } catch (error) {
            alert('Failed to validate receipt');
        }
    };

    const handlePrint = () => {
        if (receiptId === 'preview') {
            alert('This is a preview. Printing is disabled.');
            return;
        }
        window.print();
    };

    const handleCopy = async () => {
        if (receiptId === 'preview') {
            alert('This is a preview. No action will be taken.');
            return;
        }
        try {
            const res = await api.post(`/receipts/${receiptId}/copy`);
            if (onUpdate) onUpdate();
            onClose();
            // Optionally open the new receipt
            window.location.href = `/receipts`;
        } catch (error) {
            alert('Failed to copy receipt');
        }
    };

    const handleSave = async () => {
        try {
            await api.put(`/receipts/${receiptId}`, formData);
            await fetchReceipt();
            setIsEditMode(false);
            if (onUpdate) onUpdate();
        } catch (error) {
            alert('Failed to save receipt');
        }
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { productId: '', quantity: 1 }]
        });
    };

    const removeItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const updateItem = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData({ ...formData, items: newItems });
    };

    if (!receiptId) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-dark-100 rounded-xl border border-dark-300 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {loading ? (
                    <div className="p-12 text-center text-gray-400">Loading...</div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="sticky top-0 bg-dark-100 border-b border-dark-300 px-6 py-4 flex items-center justify-between z-10">
                            <div className="flex items-center gap-4">
                                <h2 className="text-xl font-bold text-white">Receipt</h2>
                                {/* Action Buttons */}
                                <div className="flex items-center gap-2">
                                    {!isEditMode && receipt.status !== 'done' && (
                                        <button onClick={handleValidate} className="btn-primary flex items-center gap-2 text-sm py-1.5 px-3">
                                            <FiCheck className="h-4 w-4" /> Validate
                                        </button>
                                    )}
                                    <button onClick={handlePrint} className="btn-secondary flex items-center gap-2 text-sm py-1.5 px-3">
                                        <FiPrinter className="h-4 w-4" /> Print
                                    </button>
                                    {!isEditMode && (
                                        <button onClick={handleCopy} className="btn-secondary flex items-center gap-2 text-sm py-1.5 px-3">
                                            <FiCopy className="h-4 w-4" /> Copy
                                        </button>
                                    )}
                                    <button onClick={onClose} className="btn-secondary flex items-center gap-2 text-sm py-1.5 px-3">
                                        <FiX className="h-4 w-4" /> Cancel
                                    </button>
                                </div>
                            </div>
                            {/* Status Badge */}
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <div className="text-xs text-gray-400 mb-1">Draft → Ready → Done</div>
                                    <span className={`badge badge-${receipt.status || 'draft'}`}>
                                        {receipt.status || 'Draft'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {!isEditMode ? (
                                // View Mode
                                <div className="space-y-6">
                                    {/* Receipt Number and Details */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <h3 className="text-2xl font-bold text-white mb-4">{receipt.receiptNumber || 'WH/IN/0001'}</h3>
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="text-xs text-gray-400">Receive From</label>
                                                    <p className="text-sm text-gray-300">{receipt.supplier || 'Vendor'}</p>
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-400">Responsible</label>
                                                    <p className="text-sm text-gray-300">{receipt.responsible || 'Not assigned'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-xs text-gray-400">Scheduled Date</label>
                                                <p className="text-sm text-gray-300">
                                                    {receipt.scheduledDate ? new Date(receipt.scheduledDate).toLocaleDateString() : 'Not set'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Products Table */}
                                    <div>
                                        <h4 className="text-lg font-semibold text-white mb-4">Products</h4>
                                        <div className="border border-dark-300 rounded-lg overflow-hidden">
                                            <table className="min-w-full">
                                                <thead className="bg-dark-200/50">
                                                    <tr className="border-b border-dark-300">
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Product</th>
                                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Quantity</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-dark-300">
                                                    {receipt.items && receipt.items.length > 0 ? (
                                                        receipt.items.map((item, index) => (
                                                            <tr key={index}>
                                                                <td className="px-4 py-3 text-sm text-gray-300">
                                                                    {item.product?.name || `[Desk007] Desk`}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-300 text-right">
                                                                    {item.quantity || 6}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td className="px-4 py-3 text-sm text-gray-300">[Desk007] Desk</td>
                                                            <td className="px-4 py-3 text-sm text-gray-300 text-right">6</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        {receipt.status !== 'done' && (
                                            <button onClick={() => setIsEditMode(true)} className="mt-3 text-sm text-primary-400 hover:text-primary-300">
                                                New Product
                                            </button>
                                        )}
                                    </div>

                                    {/* Notes */}
                                    {receipt.notes && (
                                        <div>
                                            <label className="text-xs text-gray-400">Notes</label>
                                            <p className="text-sm text-gray-300 mt-1">{receipt.notes}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // Edit Mode
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300">Supplier</label>
                                            <input
                                                type="text"
                                                className="input-field mt-1"
                                                value={formData.supplier}
                                                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300">Warehouse</label>
                                            <select
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

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300">Scheduled Date</label>
                                            <input
                                                type="date"
                                                className="input-field mt-1"
                                                value={formData.scheduledDate}
                                                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300">Responsible</label>
                                            <input
                                                type="text"
                                                className="input-field mt-1"
                                                value={formData.responsible}
                                                onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Products Edit */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Products</label>
                                        <div className="border border-dark-300 rounded-lg overflow-hidden">
                                            <table className="min-w-full">
                                                <thead className="bg-dark-200/50">
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
                                                </tbody>
                                            </table>
                                        </div>
                                        <button type="button" onClick={addItem} className="mt-3 text-sm text-primary-400 hover:text-primary-300">
                                            New Product
                                        </button>
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
                                        <button onClick={handleSave} className="btn-primary flex-1">Save</button>
                                        <button onClick={() => setIsEditMode(false)} className="btn-secondary flex-1">Cancel</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
