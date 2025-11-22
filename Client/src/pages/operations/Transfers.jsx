// Transfers listing
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import { FiPlus, FiEye, FiCheck } from 'react-icons/fi';

export default function Transfers() {
    const [transfers, setTransfers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransfers();
    }, []);

    const fetchTransfers = async () => {
        try {
            const res = await api.get('/transfers');
            setTransfers(res.data.data);
        } catch (error) {
            console.error('Failed to fetch transfers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleValidate = async (id) => {
        if (!confirm('Validate this transfer? Stock will be moved.')) return;
        try {
            await api.post(`/transfers/${id}/validate`);
            fetchTransfers();
        } catch (error) {
            alert('Failed to validate transfer');
        }
    };

    if (loading) return <div className="text-center py-12">Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Internal Transfers</h1>
                <Link to="/transfers/new" className="btn-primary flex items-center">
                    <FiPlus className="mr-2" /> New Transfer
                </Link>
            </div>

            <div className="card overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transfer #</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {transfers.map((transfer) => (
                            <tr key={transfer.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{transfer.transferNumber}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{transfer.fromWarehouse?.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{transfer.toWarehouse?.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`badge badge-${transfer.status}`}>{transfer.status}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {new Date(transfer.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    <Link to={`/transfers/${transfer.id}`} className="text-primary-600 hover:text-primary-900 mr-4">
                                        <FiEye className="inline h-4 w-4" />
                                    </Link>
                                    {transfer.status !== 'done' && (
                                        <button onClick={() => handleValidate(transfer.id)} className="text-green-600 hover:text-green-900">
                                            <FiCheck className="inline h-4 w-4" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
