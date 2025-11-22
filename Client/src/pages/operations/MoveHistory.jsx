import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/api';
import { FiSearch, FiList, FiGrid, FiFilter } from 'react-icons/fi';

export default function MoveHistory() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [moves, setMoves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBy, setFilterBy] = useState('');

    useEffect(() => {
        fetchMoveHistory();
    }, []);

    const fetchMoveHistory = async () => {
        try {
            const res = await api.get('/move-history');
            setMoves(res.data.data || []);
        } catch (error) {
            console.error('Failed to fetch move history:', error);
            setMoves([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value) => {
        setSearchTerm(value);
        if (value) {
            setSearchParams({ search: value });
        } else {
            setSearchParams({});
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'ready':
            case 'completed':
                return 'text-green-400';
            case 'pending':
                return 'text-yellow-400';
            case 'cancelled':
                return 'text-red-400';
            default:
                return 'text-gray-400';
        }
    };

    const filteredMoves = moves.filter((move) => {
        const matchesSearch = !searchTerm ||
            move.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            move.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            move.from?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            move.to?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSearch;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Move History</h1>
                    <p className="text-sm text-gray-400 mt-1">
                        By default land on List View
                    </p>
                </div>
                <button className="btn-primary">
                    NEW
                </button>
            </div>

            {/* Search and Filters Bar */}
            <div className="card">
                <div className="flex items-center gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Allow user to search Delivery based on reference & contacts"
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="input-field w-full pl-10"
                        />
                    </div>

                    {/* View Toggle Buttons */}
                    <div className="flex gap-2 border border-dark-300 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded transition-colors ${viewMode === 'list'
                                    ? 'bg-primary-600 text-white'
                                    : 'text-gray-400 hover:text-gray-200'
                                }`}
                            title="List View"
                        >
                            <FiList className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`p-2 rounded transition-colors ${viewMode === 'kanban'
                                    ? 'bg-primary-600 text-white'
                                    : 'text-gray-400 hover:text-gray-200'
                                }`}
                            title="Kanban View"
                        >
                            <FiGrid className="h-5 w-5" />
                        </button>
                        <button
                            className="p-2 rounded text-gray-400 hover:text-gray-200 transition-colors"
                            title="Filter"
                        >
                            <FiFilter className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Info Text */}
            <div className="text-sm text-gray-400 space-y-2">
                <p>Provides all moves done between the From - To location & inventory</p>
                <p>if single reference has multiple products display it in multiple rows.</p>
                <p className="text-green-400">In event should be display in green</p>
                <p className="text-red-400">Out moves should be display in red</p>
            </div>

            {/* Table View */}
            {viewMode === 'list' && (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-dark-200 border-b border-dark-300">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Reference
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        From
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        To
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Quantity
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-300">
                                {filteredMoves.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                            No move history found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredMoves.map((move) => (
                                        <tr
                                            key={move.id}
                                            className="hover:bg-dark-200/50 transition-colors cursor-pointer"
                                            onClick={() => navigate(`/move-history/${move.id}`)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                                                {move.reference}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                                {new Date(move.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                                {move.user}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                                {move.from}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                                {move.to}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                                                {move.quantity}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`text-sm font-medium ${getStatusColor(move.status)}`}>
                                                    {move.status}
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
                <div className="text-center py-12 text-gray-500">
                    Kanban view coming soon...
                </div>
            )}
        </div>
    );
}
