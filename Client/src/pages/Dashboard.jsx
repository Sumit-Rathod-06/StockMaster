import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import {
    FiPackage, FiAlertTriangle, FiTruck, FiSend,
    FiRepeat, FiTrendingUp, FiArrowRight
} from 'react-icons/fi';
import MagicBento from '../components/MagicBento';
import { gsap } from 'gsap';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [lowStockItems, setLowStockItems] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const lowerGridRef = useRef(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Add spotlight and tilt effects to lower grid cards
    useEffect(() => {
        if (!lowerGridRef.current) return;

        const cards = lowerGridRef.current.querySelectorAll('.magic-bento-card');

        cards.forEach(card => {
            const handleMouseMove = (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((y - centerY) / centerY) * -5;
                const rotateY = ((x - centerX) / centerX) * 5;

                gsap.to(card, {
                    rotateX,
                    rotateY,
                    duration: 0.3,
                    ease: 'power2.out',
                    transformPerspective: 1000
                });

                // Update glow properties
                const relativeX = (x / rect.width) * 100;
                const relativeY = (y / rect.height) * 100;
                card.style.setProperty('--glow-x', `${relativeX}%`);
                card.style.setProperty('--glow-y', `${relativeY}%`);
                card.style.setProperty('--glow-intensity', '1');
            };

            const handleMouseLeave = () => {
                gsap.to(card, {
                    rotateX: 0,
                    rotateY: 0,
                    duration: 0.3,
                    ease: 'power2.out'
                });
                card.style.setProperty('--glow-intensity', '0');
            };

            card.addEventListener('mousemove', handleMouseMove);
            card.addEventListener('mouseleave', handleMouseLeave);

            return () => {
                card.removeEventListener('mousemove', handleMouseMove);
                card.removeEventListener('mouseleave', handleMouseLeave);
            };
        });
    }, [loading]);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, lowStockRes, activitiesRes] = await Promise.all([
                api.get('/dashboard/stats'),
                api.get('/dashboard/low-stock'),
                api.get('/dashboard/activities?limit=5')
            ]);

            setStats(statsRes.data.data);
            setLowStockItems(lowStockRes.data.data);
            setActivities(activitiesRes.data.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            // Set empty data on error so page still renders
            setStats({});
            setLowStockItems([]);
            setActivities([]);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon: Icon, color, link }) => (
        <Link to={link} className="card hover:shadow-2xl transition-all hover:border-primary-500/30 group">
            <div className="flex items-center">
                <div className={`p-3 rounded-lg ${color} bg-opacity-20 mr-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-8 w-8 ${color.replace('bg-', 'text-')}`} />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-400">{title}</p>
                    <p className="text-2xl font-bold text-gray-100">{value}</p>
                </div>
            </div>
        </Link>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    // Prepare cards data for MagicBento
    const bentoCards = [
        {
            color: '#060010',
            label: 'Receipt',
            title: '+ to receive',
            description: 'Receive operations',
            content: (
                <Link to="/receipts" className="w-full h-full flex flex-col justify-between">
                    <div className="magic-bento-card__header">
                        <div className="magic-bento-card__label">Receipt</div>
                    </div>
                    <div className="magic-bento-card__content">
                        <h2 className="magic-bento-card__title text-2xl">+ to receive</h2>
                        <div className="text-sm text-gray-400 space-y-1 mt-4">
                            <p>{stats?.pendingReceipts || 0} Late</p>
                            <p>{stats?.pendingReceipts || 0} operations</p>
                        </div>
                    </div>
                </Link>
            )
        },
        {
            color: '#060010',
            label: 'Delivery',
            title: '+ to Deliver',
            description: 'Delivery operations',
            content: (
                <Link to="/deliveries" className="w-full h-full flex flex-col justify-between">
                    <div className="magic-bento-card__header">
                        <div className="magic-bento-card__label">Delivery</div>
                    </div>
                    <div className="magic-bento-card__content">
                        <h2 className="magic-bento-card__title text-2xl">+ to Deliver</h2>
                        <div className="text-sm text-gray-400 space-y-1 mt-4">
                            <p>{stats?.pendingDeliveries || 0} Late</p>
                            <p>{stats?.pendingDeliveries || 0} waiting</p>
                            <p>{stats?.pendingDeliveries || 0} operations</p>
                        </div>
                    </div>
                </Link>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="mt-1 text-sm text-gray-400">Overview of your inventory operations</p>
            </div>

            {/* Magic Bento Grid */}
            <MagicBento
                cards={bentoCards}
                textAutoHide={true}
                enableStars={true}
                enableSpotlight={true}
                enableBorderGlow={true}
                enableTilt={true}
                enableMagnetism={false}
                clickEffect={true}
                spotlightRadius={300}
                particleCount={12}
                glowColor="255, 255, 255"
            />

            <div className="card-grid bento-section" ref={lowerGridRef}>
                {/* Low Stock Alerts */}
                <div className="magic-bento-card magic-bento-card--border-glow particle-container" style={{ aspectRatio: 'auto', minHeight: '300px' }}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-100">Low Stock Alerts</h2>
                        <Link to="/products?filter=low-stock" className="text-sm text-accent-400 hover:text-accent-300 flex items-center transition-colors">
                            View all <FiArrowRight className="ml-1" />
                        </Link>
                    </div>

                    {lowStockItems.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No low stock items</p>
                    ) : (
                        <div className="space-y-3">
                            {lowStockItems.slice(0, 5).map((stock) => (
                                <div key={stock.id} className="flex items-center justify-between p-3 bg-dark-200/50 rounded-lg border border-dark-300 hover:border-yellow-600/30 transition-colors">
                                    <div>
                                        <p className="font-medium text-gray-100">{stock.product.name}</p>
                                        <p className="text-sm text-gray-400">{stock.warehouse.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-yellow-400">{parseFloat(stock.quantity).toFixed(2)}</p>
                                        <p className="text-xs text-gray-500">Min: {parseFloat(stock.product.minStockLevel).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Activities */}
                <div className="magic-bento-card magic-bento-card--border-glow particle-container" style={{ aspectRatio: 'auto', minHeight: '300px' }}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-100">Recent Activities</h2>
                    </div>

                    {activities.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No recent activities</p>
                    ) : (
                        <div className="space-y-3">
                            {activities.map((activity, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-dark-200/50 rounded-lg border border-dark-300 hover:border-primary-600/30 transition-colors">
                                    <div className="flex items-center">
                                        {activity.type === 'receipt' && <FiTruck className="h-5 w-5 text-green-400 mr-3" />}
                                        {activity.type === 'delivery' && <FiSend className="h-5 w-5 text-purple-400 mr-3" />}
                                        {activity.type === 'transfer' && <FiRepeat className="h-5 w-5 text-accent-400 mr-3" />}
                                        <div>
                                            <p className="font-medium text-gray-100">
                                                {activity.receiptNumber || activity.deliveryNumber || activity.transferNumber}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(activity.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`badge badge-${activity.status}`}>
                                        {activity.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="magic-bento-card magic-bento-card--border-glow" style={{ aspectRatio: 'auto', minHeight: '200px', maxWidth: '100%' }}>
                <h2 className="text-lg font-semibold text-gray-100 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link to="/receipts/new" className="btn-primary text-center">
                        New Receipt
                    </Link>
                    <Link to="/deliveries/new" className="btn-primary text-center">
                        New Delivery
                    </Link>
                    <Link to="/transfers/new" className="btn-primary text-center">
                        New Transfer
                    </Link>
                    <Link to="/adjustments/new" className="btn-primary text-center">
                        Stock Adjustment
                    </Link>
                </div>
            </div>
        </div>
    );
}
