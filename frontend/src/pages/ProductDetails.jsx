import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import { ShoppingBag, Star, Truck } from 'lucide-react';

const ProductDetails = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [activeImage, setActiveImage] = useState('');
    const { addToCart } = useCart();
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const getFullImageUrl = (img) => {
        if (!img) return '';
        return img.startsWith('http') ? img : `${API_URL}${img}`;
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/products/${id}`);
                setProduct(res.data);
                setActiveImage(getFullImageUrl(res.data.image || res.data.images?.[0]));
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        addToCart(product);
        showNotification('Product added to cart!', 'success');
    };

    if (loading) return <div className="text-center" style={{ padding: '5rem' }}>Loading...</div>;
    if (!product) return <div className="text-center" style={{ padding: '5rem' }}>Product not found</div>;

    const isLowStock = product.stock > 0 && product.stock <= 3;
    const isOutOfStock = product.stock === 0;

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {/* Images Section */}
                    <div style={{ flex: '1 1 400px', padding: '2rem', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', background: 'white', borderRadius: '0.5rem' }}>
                            <img src={activeImage} alt={product.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                        </div>
                        {((product.image) || (product.images && product.images.length > 0)) && (
                            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
                                {[product.image, ...(product.images || [])].filter(Boolean).map((img, idx) => {
                                    const fullUrl = getFullImageUrl(img);
                                    return (
                                        <img
                                            key={idx}
                                            src={fullUrl}
                                            alt={`View ${idx}`}
                                            onClick={() => setActiveImage(fullUrl)}
                                            style={{
                                                width: '80px', height: '80px', objectFit: 'cover',
                                                cursor: 'pointer', borderRadius: '0.25rem',
                                                border: activeImage === fullUrl ? '2px solid var(--accent)' : '1px solid #e2e8f0'
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Details Section */}
                    <div style={{ flex: '1 1 400px', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{product.name}</h1>
                            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent)' }}>PKR {product.price}</span>
                        </div>

                        <div className="flex items-center mb-4" style={{ color: '#eab308' }}>
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={20} fill={i < Math.floor(product.rating || 0) ? "currentColor" : "none"} />
                            ))}
                            <span style={{ marginLeft: '0.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>({product.numReviews} reviews)</span>
                        </div>

                        <p style={{ color: '#475569', lineHeight: '1.6', marginBottom: '2rem' }}>{product.description}</p>

                        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                            <div className="flex items-center gap-4 mb-4">
                                <span style={{ color: '#64748b' }}>Category:</span>
                                <span style={{ background: '#f1f5f9', padding: '0.25rem 0.75rem', borderRadius: '999px', fontWeight: 500 }}>
                                    {product.category?.name || 'Uncategorized'}
                                </span>
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                                <span style={{ color: '#64748b' }}>Stock Status:</span>
                                {isOutOfStock ? (
                                    <span className="badge badge-error">Out of Stock</span>
                                ) : isLowStock ? (
                                    <span className="badge badge-warning">Low Stock ({product.stock} left)</span>
                                ) : (
                                    <span className="badge badge-success">In Stock</span>
                                )}
                            </div>

                            {product.deliveryCharges > 0 && (
                                <div className="flex items-center gap-2 mb-8" style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                    <Truck size={18} />
                                    <span>Delivery: PKR {product.deliveryCharges} {product.increaseDeliveryWithQty ? '(per item)' : '(fixed)'}</span>
                                </div>
                            )}

                            <button
                                onClick={handleAddToCart}
                                disabled={isOutOfStock}
                                className={`btn full-width ${isOutOfStock ? '' : 'btn-accent'}`}
                                style={{
                                    padding: '1rem', fontSize: '1.125rem', gap: '0.5rem',
                                    background: isOutOfStock ? '#cbd5e1' : undefined,
                                    cursor: isOutOfStock ? 'not-allowed' : 'pointer'
                                }}
                            >
                                <ShoppingBag size={24} />
                                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
