import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    FiHome, FiPackage, FiTruck, FiSend, FiRepeat,
    FiEdit, FiBook, FiSettings, FiUser, FiLogOut, FiMenu, FiX, FiClock
} from 'react-icons/fi';
import { useState } from 'react';
import Squares from './Squares';

export default function Layout() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigation = [
        { name: 'Dashboard', href: '/', icon: FiHome },
        { name: 'Products', href: '/products', icon: FiPackage },
        {
            name: 'Operations',
            icon: FiTruck,
            children: [
                { name: 'Receipts', href: '/receipts', icon: FiTruck },
                { name: 'Deliveries', href: '/deliveries', icon: FiSend },
                { name: 'Stock Ledger', href: '/ledger', icon: FiBook },
                { name: 'Move History', href: '/move-history', icon: FiClock },
            ]
        },
        {
            name: 'Settings',
            icon: FiSettings,
            children: [
                { name: 'Warehouses', href: '/warehouses', icon: FiSettings },
                { name: 'Locations', href: '/locations', icon: FiSettings },
            ]
        },
    ];

    const isActive = (href) => {
        if (href === '/') return location.pathname === '/';
        return location.pathname.startsWith(href);
    };

    return (
        <div className="min-h-screen bg-dark-50">
            {/* Sidebar for desktop */}
            <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col z-20">
                <div className="flex flex-col flex-grow pt-5 bg-dark-100 border-r border-dark-200 overflow-y-auto">
                    <div className="flex items-center flex-shrink-0 px-4">
                        <h1 className="text-2xl font-bold text-white">StockMaster</h1>
                    </div>

                    <div className="mt-8 flex-1 flex flex-col">
                        <nav className="flex-1 px-2 pb-4 space-y-1">
                            {navigation.map((item) => (
                                <div key={item.name}>
                                    {item.children ? (
                                        <div>
                                            <div className="flex items-center px-2 py-2 text-sm font-medium text-gray-400">
                                                <item.icon className="mr-3 h-5 w-5" />
                                                {item.name}
                                            </div>
                                            <div className="ml-8 space-y-1">
                                                {item.children.map((child) => (
                                                    <Link
                                                        key={child.name}
                                                        to={child.href}
                                                        className={`${isActive(child.href)
                                                            ? 'bg-primary-600/20 text-primary-300 border-l-2 border-primary-500'
                                                            : 'text-gray-300 hover:bg-dark-200 hover:text-gray-100'
                                                            } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all`}
                                                    >
                                                        <child.icon className="mr-3 h-4 w-4" />
                                                        {child.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <Link
                                            to={item.href}
                                            className={`${isActive(item.href)
                                                ? 'bg-primary-600/20 text-primary-300 border-l-2 border-primary-500'
                                                : 'text-gray-300 hover:bg-dark-200 hover:text-gray-100'
                                                } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all`}
                                        >
                                            <item.icon className="mr-3 h-5 w-5" />
                                            {item.name}
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </nav>

                        <div className="px-2 pb-4 space-y-1 border-t border-dark-200 pt-4">
                            <Link
                                to="/profile"
                                className={`${isActive('/profile')
                                    ? 'bg-primary-600/20 text-primary-300 border-l-2 border-primary-500'
                                    : 'text-gray-300 hover:bg-dark-200 hover:text-gray-100'
                                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all`}
                            >
                                <FiUser className="mr-3 h-5 w-5" />
                                Profile
                            </Link>
                            <button
                                onClick={logout}
                                className="w-full text-gray-300 hover:bg-dark-200 hover:text-gray-100 group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all"
                            >
                                <FiLogOut className="mr-3 h-5 w-5" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile sidebar */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div className="fixed inset-0 bg-black bg-opacity-75" onClick={() => setSidebarOpen(false)} />
                    <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-dark-100 border-r border-dark-200">
                        <div className="flex items-center justify-between px-4 pt-5">
                            <h1 className="text-2xl font-bold text-white">StockMaster</h1>
                            <button onClick={() => setSidebarOpen(false)} className="text-gray-300 hover:text-gray-100">
                                <FiX className="h-6 w-6" />
                            </button>
                        </div>
                        {/* Same navigation as desktop */}
                        <div className="mt-8 flex-1 flex flex-col overflow-y-auto">
                            <nav className="flex-1 px-2 pb-4 space-y-1">
                                {navigation.map((item) => (
                                    <div key={item.name}>
                                        {item.children ? (
                                            <div>
                                                <div className="flex items-center px-2 py-2 text-sm font-medium text-primary-100">
                                                    <item.icon className="mr-3 h-5 w-5" />
                                                    {item.name}
                                                </div>
                                                <div className="ml-8 space-y-1">
                                                    {item.children.map((child) => (
                                                        <Link
                                                            key={child.name}
                                                            to={child.href}
                                                            onClick={() => setSidebarOpen(false)}
                                                            className={`${isActive(child.href)
                                                                ? 'bg-gradient-to-r from-primary-600/20 to-accent-600/20 text-primary-300 border-l-2 border-primary-500'
                                                                : 'text-gray-300 hover:bg-dark-200 hover:text-gray-100'
                                                                } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all`}
                                                        >
                                                            <child.icon className="mr-3 h-4 w-4" />
                                                            {child.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <Link
                                                to={item.href}
                                                onClick={() => setSidebarOpen(false)}
                                                className={`${isActive(item.href)
                                                    ? 'bg-gradient-to-r from-primary-600/20 to-accent-600/20 text-primary-300 border-l-2 border-primary-500'
                                                    : 'text-gray-300 hover:bg-dark-200 hover:text-gray-100'
                                                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all`}
                                            >
                                                <item.icon className="mr-3 h-5 w-5" />
                                                {item.name}
                                            </Link>
                                        )}
                                    </div>
                                ))}
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            {/* Main content */}
            <div className="md:pl-64 flex flex-col flex-1 relative">
                {/* Animated Background */}
                <div className="fixed inset-0 md:left-64 pointer-events-none" style={{ zIndex: 0 }}>
                    <Squares
                        speed={0.5}
                        squareSize={40}
                        direction='diagonal'
                        borderColor='rgba(255, 255, 255, 0.15)'
                        hoverFillColor='rgba(255, 255, 255, 0.05)'
                    />
                </div>

                <div className="sticky top-0 z-10 md:hidden flex items-center justify-between bg-dark-100 border-b border-dark-200 shadow-lg px-4 py-3">
                    <button onClick={() => setSidebarOpen(true)} className="text-gray-300">
                        <FiMenu className="h-6 w-6" />
                    </button>
                    <h1 className="text-xl font-bold text-white">StockMaster</h1>
                    <div className="w-6" />
                </div>

                <main className="flex-1 relative" style={{ zIndex: 10 }}>
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            <Outlet />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
