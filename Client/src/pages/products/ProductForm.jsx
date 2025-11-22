import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/api';

export default function ProductForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        description: '',
        categoryId: '',
        unitOfMeasure: 'units',
        minStockLevel: 0,
        reorderQuantity: 0
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
        if (isEdit) fetchProduct();
    }, [id]);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data.data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchProduct = async () => {
        try {
            const res = await api.get(`/products/${id}`);
            setFormData(res.data.data);
        } catch (error) {
            alert('Failed to fetch product');
            navigate('/products');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEdit) {
                await api.put(`/products/${id}`, formData);
            } else {
                await api.post('/products', formData);
            }
            navigate('/products');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
                {isEdit ? 'Edit Product' : 'New Product'}
            </h1>

            <form onSubmit={handleSubmit} className="card space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Product Name</label>
                    <input
                        type="text"
                        required
                        className="input-field mt-1"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">SKU / Code</label>
                    <input
                        type="text"
                        required
                        className="input-field mt-1"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        rows="3"
                        className="input-field mt-1"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                        className="input-field mt-1"
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Unit of Measure</label>
                        <input
                            type="text"
                            required
                            className="input-field mt-1"
                            value={formData.unitOfMeasure}
                            onChange={(e) => setFormData({ ...formData, unitOfMeasure: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Min Stock Level</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            className="input-field mt-1"
                            value={formData.minStockLevel}
                            onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Reorder Quantity</label>
                    <input
                        type="number"
                        step="0.01"
                        required
                        className="input-field mt-1"
                        value={formData.reorderQuantity}
                        onChange={(e) => setFormData({ ...formData, reorderQuantity: e.target.value })}
                    />
                </div>

                <div className="flex gap-4">
                    <button type="submit" disabled={loading} className="btn-primary flex-1">
                        {loading ? 'Saving...' : 'Save Product'}
                    </button>
                    <button type="button" onClick={() => navigate('/products')} className="btn-secondary flex-1">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
