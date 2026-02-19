import React from 'react';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
    const { cart, removeFromCart, addToCart, total } = useCart();
    const navigate = useNavigate();

    const updateQuantity = (item, delta) => {
        if (delta > 0 && item.quantity >= item.stock) {
            alert(`Sorry, only ${item.stock} items available in stock`);
            return;
        }
        if (delta < 0 && item.quantity <= 1) return;

        // We use addToCart logic to update quantity
        // Ideally we should have a specific updateQuantity method in context, 
        // but addToCart with specific logic works too if implemented correctly.
        // For now, let's assume addToCart handles addition. 
        // To handle subtraction properly without adding a new context method implies 
        // addToCart needs to handle negative or we add updateQuantity to context.
        // Let's refactor Context later, for now we will trick it or add a method.
        // Actually, let's use a specialized method in the context for this.
        // Wait, I can't easily change context without rewriting it.
        // Let's try to just call addToCart with 1 or -1 if the context supports it?
        // deeper look at context: 
        // addToCart adds quantity. It doesn't set it. 
        // So addToCart(item, 1) adds 1. addToCart(item, -1) would subtract 1.
        addToCart(item, delta);
    };

    if (cart.length === 0) return (
        <div className="container text-center" style={{ padding: '5rem' }}>
            <h2>Your cart is empty</h2>
            <p style={{ marginTop: '1rem', color: '#64748b' }}>Add some products to get started.</p>
        </div>
    );

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem', fontWeight: 'bold' }}>Shopping Cart</h1>
            <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                <div className="card" style={{ padding: '1.5rem', height: 'fit-content' }}>
                    {cart.map((item, index) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <img src={item.image} alt={item.name} style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '0.5rem' }} />
                                <div>
                                    <h3 style={{ fontWeight: 600 }}>{item.name}</h3>
                                    <p style={{ color: 'var(--accent)', fontWeight: 600 }}>PKR {item.price}</p>
                                    <p style={{ fontSize: '0.8rem', color: item.stock <= 3 ? 'red' : 'green' }}>
                                        {item.stock <= 3 ? `Only ${item.stock} left!` : 'In Stock'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center" style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
                                    <button
                                        onClick={() => updateQuantity(item, -1)}
                                        className="btn"
                                        style={{ padding: '0.5rem' }}
                                        disabled={item.quantity <= 1}
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span style={{ padding: '0 1rem', fontWeight: 600 }}>{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item, 1)}
                                        className="btn"
                                        style={{ padding: '0.5rem' }}
                                        disabled={item.quantity >= item.stock}
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <button onClick={() => removeFromCart(item._id)} className="btn btn-danger">
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="card" style={{ padding: '1.5rem', height: 'fit-content' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 600 }}>Order Summary</h2>
                    <div className="flex justify-between mb-2">
                        <span>Subtotal</span>
                        <span>PKR {total}</span>
                    </div>
                    <div className="flex justify-between mb-4" style={{ color: '#64748b' }}>
                        <span>Delivery</span>
                        <span>Calculated at checkout</span>
                    </div>
                    <div className="flex justify-between pt-4 mb-6" style={{ borderTop: '1px solid #e2e8f0', fontWeight: 'bold', fontSize: '1.25rem' }}>
                        <span>Total</span>
                        <span>PKR {total}</span>
                    </div>
                    <button
                        onClick={() => navigate('/checkout')}
                        className="btn btn-primary full-width"
                    >
                        Proceed to Checkout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
