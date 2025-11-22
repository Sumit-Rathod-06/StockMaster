import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import { FiPlus, FiEdit, FiTrash2, FiPackage } from 'react-icons/fi';

export default function Products() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
        fetchData();
    }, [search, selectedCategory]);

    const fetchData = async () => {
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                api.get(`/products?search=${search}&categoryId=${selectedCategory}`),
                api.get('/categories')
            ]);
            setProducts(productsRes.data.data);
            setCategories(categoriesRes.data.data);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await api.delete(`/products/${id}`);
            fetchData();
        } catch (error) {
            alert('Failed to delete product');
        }
    };

    const getTotalStock = (stocks) => {
        return stocks.reduce((sum, stock) => sum + parseFloat(stock.quantity), 0);
    };

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Products</h1>
                    <p className="mt-1 text-sm text-gray-400">Manage your product inventory</p>
                </div>
                <Link to="/products/new" className="btn-primary flex items-center">
                    <FiPlus className="mr-2" /> Add Product
                </Link>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="Search products by name or SKU..."
                        className="input-field"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select
                        className="input-field"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Products Table */}
            <div className="card overflow-x-auto">
                {products.length === 0 ? (
                    <div className="text-center py-12">
                        <FiPackage className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400">No products found</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-dark-300">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Product
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    SKU
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Total Stock
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Unit
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-300">
                            {products.map((product) => {
                                const totalStock = getTotalStock(product.stocks || []);
                                const isLowStock = totalStock <= parseFloat(product.minStockLevel);

                                return (
                                    <tr key={product.id} className="hover:bg-dark-200/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <FiPackage className="h-5 w-5 text-gray-400 mr-2" />
                                                <div className="text-sm font-medium text-white">{product.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {product.sku}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {product.category_name || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`text-sm font-semibold ${isLowStock ? 'text-red-400' : 'text-white'}`}>
                                                {totalStock.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {product.uom}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link to={`/products/${product.id}`} className="text-primary-600 hover:text-primary-900 mr-4">
                                                <FiEdit className="inline h-4 w-4" />
                                            </Link>
                                            <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900">
                                                <FiTrash2 className="inline h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
