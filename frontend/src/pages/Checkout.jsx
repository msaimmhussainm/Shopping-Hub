import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Checkout = () => {
    const { cart, clearCart, total } = useCart();
    const { showNotification } = useNotification();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        customerName: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        province: '',
        postalCode: ''
    });

    if (cart.length === 0) {
        return <div className="container text-center" style={{ padding: '5rem' }}>Your cart is empty</div>;
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/api/orders`, {
                ...formData,
                items: cart.map(item => ({
                    product: item._id,
                    quantity: item.quantity,
                    price: item.price
                })),
                totalAmount: total,
                deliveryCharges: 0 // Logic to be improved based on product rules
            });
            clearCart();
            showNotification('Order placed successfully!', 'success');
            navigate('/');
        } catch (err) {
            console.error(err);
            showNotification(err.response?.data?.message || 'Failed to place order', 'error');
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem', fontWeight: 'bold' }}>Checkout</h1>
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="card" style={{ padding: '2rem' }}>
                    <h2 className="mb-4" style={{ fontSize: '1.25rem', fontWeight: 600 }}>Shipping Information</h2>
                    <form id="checkout-form" onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="label">Full Name *</label>
                            <input name="customerName" required className="input-field" onChange={handleChange} />
                        </div>
                        <div className="mb-4">
                            <label className="label">Phone Number *</label>
                            <input name="phone" required className="input-field" onChange={handleChange} />
                        </div>
                        <div className="mb-4">
                            <label className="label">Email (Optional)</label>
                            <input name="email" type="email" className="input-field" onChange={handleChange} />
                        </div>
                        <div className="mb-4">
                            <label className="label">Full Address *</label>
                            <textarea name="address" required className="input-field" onChange={handleChange} />
                        </div>
                        <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                            <div>
                                <label className="label">City *</label>
                                <input name="city" required className="input-field" onChange={handleChange} />
                            </div>
                            <div>
                                <label className="label">Province *</label>
                                <input name="province" required className="input-field" onChange={handleChange} />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="label">Postal Code (Optional)</label>
                            <input name="postalCode" className="input-field" onChange={handleChange} />
                        </div>
                    </form>
                </div>

                <div className="card" style={{ padding: '2rem', height: 'fit-content' }}>
                    <h2 className="mb-4" style={{ fontSize: '1.25rem', fontWeight: 600 }}>Order Summary</h2>
                    {cart.map(item => (
                        <div key={item._id} className="flex justify-between mb-2" style={{ fontSize: '0.9rem' }}>
                            <span>{item.name} x {item.quantity}</span>
                            <span>PKR {item.price * item.quantity}</span>
                        </div>
                    ))}
                    <div className="flex justify-between mb-2" style={{ fontSize: '0.9rem' }}>
                        <span>Subtotal</span>
                        <span>PKR {total}</span>
                    </div>
                    <div className="flex justify-between mb-2" style={{ fontSize: '0.9rem' }}>
                        <span>Delivery Charges</span>
                        <span>PKR {cart.reduce((acc, item) => {
                            if (item.deliveryCharges) {
                                return acc + (item.increaseDeliveryWithQty ? item.deliveryCharges * item.quantity : item.deliveryCharges);
                            }
                            return acc;
                        }, 0)}</span>
                    </div>
                    <div className="flex justify-between mt-4 pt-4" style={{ borderTop: '1px solid #e2e8f0', fontWeight: 'bold', fontSize: '1.1rem' }}>
                        <span>Total</span>
                        <span>PKR {total + cart.reduce((acc, item) => {
                            if (item.deliveryCharges) {
                                return acc + (item.increaseDeliveryWithQty ? item.deliveryCharges * item.quantity : item.deliveryCharges);
                            }
                            return acc;
                        }, 0)}</span>
                    </div>
                    <button form="checkout-form" type="submit" className="btn btn-primary full-width mt-4">
                        Place Order (Cash on Delivery)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
