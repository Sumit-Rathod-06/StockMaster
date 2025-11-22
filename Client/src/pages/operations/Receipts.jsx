import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import { FiPlus, FiSearch, FiList, FiGrid } from 'react-icons/fi';
import ReceiptModal from '../../components/ReceiptModal';

export default function Receipts() {
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedReceiptId, setSelectedReceiptId] = useState(null);

    useEffect(() => {
        fetchReceipts();
    }, []);

    const fetchReceipts = async () => {
        try {
            const res = await api.get('/receipts');
            setReceipts(res.data.data);
        } catch (error) {
            console.error('Failed to fetch receipts:', error);
            setReceipts([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredReceipts = receipts.filter(receipt =>
        receipt.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        receipt.supplier_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        receipt.created_by_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groupedByStatus = {
        ready: filteredReceipts.filter(r => r.status?.toLowerCase() === 'ready'),
        waiting: filteredReceipts.filter(r => r.status?.toLowerCase() === 'waiting'),
        done: filteredReceipts.filter(r => r.status?.toLowerCase() === 'done')
    };

    if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

    const lastThreeReceipts = receipts.slice(0, 3);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Receipts</h1>
                    <p className="text-sm text-gray-400 mt-1">Manage incoming stock operations</p>
                </div>
                <Link to="/receipts/new" className="btn-primary flex items-center">
                    <FiPlus className="mr-2" /> New
                </Link>
            </div>

            {/* Last 3 Receipts Summary */}
            {lastThreeReceipts.length > 0 && (
                <div className="magic-bento-card magic-bento-card--border-glow" style={{ aspectRatio: 'auto', minHeight: 'auto' }}>
                    <h3 className="text-lg font-semibold text-white mb-4">Last 3 Receipts</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {lastThreeReceipts.map((receipt) => (
                            <div
                                key={receipt.id}
                                onClick={() => setSelectedReceiptId(receipt.id)}
                                className="p-4 bg-dark-200/50 rounded-lg border border-dark-300 hover:border-primary-600/50 transition-colors cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="text-sm font-medium text-primary-400">{receipt.reference}</div>
                                    <span className={`text-xs px-2 py-1 rounded badge badge-${receipt.status?.toLowerCase() || 'draft'}`}>
                                        {receipt.status || 'Draft'}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-400 space-y-1">
                                    <p><strong>From:</strong> {receipt.supplier_name || 'Vendor'}</p>
                                    <p><strong>To:</strong> {receipt.warehouse_name || 'Warehouse'}</p>
                                    <p><strong>Date:</strong> {receipt.expected_date ? new Date(receipt.expected_date).toLocaleDateString() : new Date().toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Toolbar with Search and View Toggle */}
            <div className="flex items-center justify-between gap-4">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search receipts by reference & contacts"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field pl-10 w-full"
                    />
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-2 bg-dark-100 border border-dark-300 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        title="List View"
                    >
                        <FiList className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => setViewMode('kanban')}
                        className={`p-2 rounded transition-colors ${viewMode === 'kanban' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        title="Kanban View"
                    >
                        <FiGrid className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* List View */}
            {viewMode === 'list' && (
                <div className="magic-bento-card magic-bento-card--border-glow" style={{ aspectRatio: 'auto', minHeight: '400px' }}>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-dark-300">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Reference</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">From</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">To</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Scheduled Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-300">
                                {filteredReceipts.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                            No receipts found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredReceipts.map((receipt) => (
                                        <tr key={receipt.id} onClick={() => setSelectedReceiptId(receipt.id)} className="hover:bg-dark-200/50 transition-colors cursor-pointer">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-medium text-primary-400 hover:text-primary-300">
                                                    {receipt.reference || 'WH/IN/0001'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                {receipt.supplier_name || 'Vendor'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                {receipt.warehouse_name || 'WH/Stock1'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                {receipt.created_by_name || 'User'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                {receipt.expected_date ? new Date(receipt.expected_date).toLocaleDateString() : new Date().toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`badge badge-${receipt.status?.toLowerCase() || 'draft'}`}>
                                                    {receipt.status || 'Draft'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Kanban View */}
            {viewMode === 'kanban' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Ready Column */}
                    <div className="magic-bento-card magic-bento-card--border-glow" style={{ aspectRatio: 'auto', minHeight: '400px' }}>
                        <h3 className="text-lg font-semibold text-white mb-4">Ready ({groupedByStatus.ready.length})</h3>
                        <div className="space-y-3">
                            {groupedByStatus.ready.map((receipt) => (
                                <div
                                    key={receipt.id}
                                    onClick={() => setSelectedReceiptId(receipt.id)}
                                    className="block p-4 bg-dark-200/50 rounded-lg border border-dark-300 hover:border-primary-600/50 transition-colors cursor-pointer"
                                >
                                    <div className="text-sm font-medium text-primary-400">{receipt.reference || 'WH/IN/0001'}</div>
                                    <div className="text-xs text-gray-400 mt-1">{receipt.supplier_name || 'Vendor'}</div>
                                    <div className="text-xs text-gray-500 mt-2">{receipt.expected_date ? new Date(receipt.expected_date).toLocaleDateString() : new Date().toLocaleDateString()}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Waiting Column */}
                    <div className="magic-bento-card magic-bento-card--border-glow" style={{ aspectRatio: 'auto', minHeight: '400px' }}>
                        <h3 className="text-lg font-semibold text-white mb-4">Waiting ({groupedByStatus.waiting.length})</h3>
                        <div className="space-y-3">
                            {groupedByStatus.waiting.map((receipt) => (
                                <div
                                    key={receipt.id}
                                    onClick={() => setSelectedReceiptId(receipt.id)}
                                    className="block p-4 bg-dark-200/50 rounded-lg border border-dark-300 hover:border-yellow-600/50 transition-colors cursor-pointer"
                                >
                                    <div className="text-sm font-medium text-primary-400">{receipt.reference || 'WH/IN/0002'}</div>
                                    <div className="text-xs text-gray-400 mt-1">{receipt.supplier_name || 'Vendor'}</div>
                                    <div className="text-xs text-gray-500 mt-2">{receipt.expected_date ? new Date(receipt.expected_date).toLocaleDateString() : new Date().toLocaleDateString()}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Done Column */}
                    <div className="magic-bento-card magic-bento-card--border-glow" style={{ aspectRatio: 'auto', minHeight: '400px' }}>
                        <h3 className="text-lg font-semibold text-white mb-4">Done ({groupedByStatus.done.length})</h3>
                        <div className="space-y-3">
                            {groupedByStatus.done.map((receipt) => (
                                <div
                                    key={receipt.id}
                                    onClick={() => setSelectedReceiptId(receipt.id)}
                                    className="block p-4 bg-dark-200/50 rounded-lg border border-dark-300 hover:border-green-600/50 transition-colors cursor-pointer"
                                >
                                    <div className="text-sm font-medium text-primary-400">{receipt.reference || 'WH/IN/0003'}</div>
                                    <div className="text-xs text-gray-400 mt-1">{receipt.supplier_name || 'Vendor'}</div>
                                    <div className="text-xs text-gray-500 mt-2">{receipt.expected_date ? new Date(receipt.expected_date).toLocaleDateString() : new Date().toLocaleDateString()}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Receipt Detail Modal */}
            {selectedReceiptId && (
                <ReceiptModal
                    receiptId={selectedReceiptId}
                    onClose={() => setSelectedReceiptId(null)}
                    onUpdate={fetchReceipts}
                />
            )}
        </div>
    );
}
