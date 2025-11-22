// Stock Ledger - complete history
import { useState, useEffect } from 'react';
import api from '../../api/api';

export default function StockLedger() {
    const [ledger, setLedger] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLedger();
    }, []);

    const fetchLedger = async () => {
        try {
            const res = await api.get('/adjustments/ledger');
            setLedger(res.data.data);
        } catch (error) {
            console.error('Failed to fetch ledger:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTransactionTypeLabel = (type) => {
        const labels = {
            receipt: 'Receipt',
            delivery: 'Delivery',
            transfer_in: 'Transfer In',
            transfer_out: 'Transfer Out',
            adjustment: 'Adjustment'
        };
        return labels[type] || type;
    };

    if (loading) return <div className="text-center py-12">Loading...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Stock Ledger</h1>
                <p className="mt-1 text-sm text-gray-600">Complete history of all stock movements</p>
            </div>

            <div className="card overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warehouse</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Before</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Change</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">After</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {ledger.map((entry) => (
                            <tr key={entry.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {new Date(entry.createdAt).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{entry.product?.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{entry.warehouse?.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="badge badge-ready">
                                        {getTransactionTypeLabel(entry.transactionType)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{entry.referenceNumber}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{parseFloat(entry.quantityBefore).toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`text-sm font-semibold ${parseFloat(entry.quantityChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {parseFloat(entry.quantityChange) >= 0 ? '+' : ''}{parseFloat(entry.quantityChange).toFixed(2)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{parseFloat(entry.quantityAfter).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
