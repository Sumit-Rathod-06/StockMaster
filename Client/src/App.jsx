import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Products from './pages/products/Products';
import ProductForm from './pages/products/ProductForm';
import Receipts from './pages/operations/Receipts';
import ReceiptForm from './pages/operations/ReceiptForm';
import Deliveries from './pages/operations/Deliveries';
import DeliveryForm from './pages/operations/DeliveryForm';
import Transfers from './pages/operations/Transfers';
import TransferForm from './pages/operations/TransferForm';
import Adjustments from './pages/operations/Adjustments';
import AdjustmentForm from './pages/operations/AdjustmentForm';
import StockLedger from './pages/operations/StockLedger';
import Warehouses from './pages/settings/Warehouses';
import Profile from './pages/Profile';

function PrivateRoute({ children }) {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" />;
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                    <Route index element={<Dashboard />} />

                    <Route path="products" element={<Products />} />
                    <Route path="products/new" element={<ProductForm />} />
                    <Route path="products/:id" element={<ProductForm />} />

                    <Route path="receipts" element={<Receipts />} />
                    <Route path="receipts/new" element={<ReceiptForm />} />
                    <Route path="receipts/:id" element={<ReceiptForm />} />

                    <Route path="deliveries" element={<Deliveries />} />
                    <Route path="deliveries/new" element={<DeliveryForm />} />
                    <Route path="deliveries/:id" element={<DeliveryForm />} />

                    <Route path="transfers" element={<Transfers />} />
                    <Route path="transfers/new" element={<TransferForm />} />
                    <Route path="transfers/:id" element={<TransferForm />} />

                    <Route path="adjustments" element={<Adjustments />} />
                    <Route path="adjustments/new" element={<AdjustmentForm />} />

                    <Route path="ledger" element={<StockLedger />} />

                    <Route path="warehouses" element={<Warehouses />} />
                    <Route path="profile" element={<Profile />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
