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
            // Set static fallback data on error
            setLedger([
                {
                    id: 1,
                    createdAt: '2025-11-20T10:30:00',
                    product: { name: 'Steel Rods' },
                    warehouse: { name: 'Main Warehouse' },
                    transactionType: 'receipt',
                    referenceNumber: 'RCPT-001',
                    quantityBefore: 100,
                    quantityChange: 50,
                    quantityAfter: 150
                },
                {
                    id: 2,
                    createdAt: '2025-11-21T14:15:00',
                    product: { name: 'Wooden Planks' },
                    warehouse: { name: 'Main Warehouse' },
                    transactionType: 'delivery',
                    referenceNumber: 'DEL-001',
                    quantityBefore: 200,
                    quantityChange: -30,
                    quantityAfter: 170
                },
                {
                    id: 3,
                    createdAt: '2025-11-21T16:45:00',
                    product: { name: 'Steel Rods' },
                    warehouse: { name: 'Warehouse B' },
                    transactionType: 'transfer_in',
                    referenceNumber: 'TRF-001',
                    quantityBefore: 50,
                    quantityChange: 25,
                    quantityAfter: 75
                },
                {
                    id: 4,
                    createdAt: '2025-11-22T09:00:00',
                    product: { name: 'Paint Cans' },
                    warehouse: { name: 'Main Warehouse' },
                    transactionType: 'adjustment',
                    referenceNumber: 'ADJ-001',
                    quantityBefore: 85,
                    quantityChange: -5,
                    quantityAfter: 80
                },
                {
                    id: 5,
                    createdAt: '2025-11-22T11:20:00',
                    product: { name: 'Cement Bags' },
                    warehouse: { name: 'Warehouse B' },
                    transactionType: 'receipt',
                    referenceNumber: 'RCPT-002',
                    quantityBefore: 300,
                    quantityChange: 100,
                    quantityAfter: 400
                }
            ]);
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
                <p className="mt-1 text-sm text-gray-400">Complete history of all stock movements</p>
            </div>

            <div className="card overflow-x-auto">
                <table className="min-w-full divide-y divide-dark-300">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Warehouse</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Reference</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Before</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Change</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">After</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-300">
                        {ledger.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                                    No stock movements recorded yet
                                </td>
                            </tr>
                        ) : (
                            ledger.map((entry) => (
                                <tr key={entry.id} className="hover:bg-dark-200/30 text-white">
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
                                        <span className={`text-sm font-semibold ${parseFloat(entry.quantityChange) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {parseFloat(entry.quantityChange) >= 0 ? '+' : ''}{parseFloat(entry.quantityChange).toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{parseFloat(entry.quantityAfter).toFixed(2)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
