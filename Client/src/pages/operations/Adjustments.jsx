// Adjustments list
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import { FiPlus } from 'react-icons/fi';

export default function Adjustments() {
    const [adjustments, setAdjustments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdjustments();
    }, []);

    const fetchAdjustments = async () => {
        try {
            const res = await api.get('/adjustments');
            setAdjustments(res.data.data);
        } catch (error) {
            console.error('Failed to fetch adjustments:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-12">Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Stock Adjustments</h1>
                <Link to="/adjustments/new" className="btn-primary flex items-center">
                    <FiPlus className="mr-2" /> New Adjustment
                </Link>
            </div>

            <div className="card overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adjustment #</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warehouse</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recorded</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Counted</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Difference</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {adjustments.map((adj) => (
                            <tr key={adj.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{adj.adjustmentNumber}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{adj.product?.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{adj.warehouse?.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{parseFloat(adj.recordedQuantity).toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{parseFloat(adj.countedQuantity).toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`text-sm font-semibold ${parseFloat(adj.difference) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {parseFloat(adj.difference) >= 0 ? '+' : ''}{parseFloat(adj.difference).toFixed(2)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {new Date(adj.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
