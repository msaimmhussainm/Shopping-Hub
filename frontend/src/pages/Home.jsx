import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import { ShoppingBag, Search } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const { addToCart } = useCart();
    const { showNotification } = useNotification();

    const fetchData = async () => {
        try {
            const [prodRes, catRes] = await Promise.all([
                axios.get(`${API_URL}/api/products`),
                axios.get(`${API_URL}/api/categories`)
            ]);
            setProducts(prodRes.data);
            setCategories(catRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
        // 5-second polling for real-time stock and product updates
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleAddToCart = (product) => {
        addToCart(product);
        showNotification('Product added to cart!', 'success');
    };

    const filteredProducts = products.filter(p => {
        const matchesCategory = activeCategory === 'all' || (p.category && p.category._id === activeCategory);
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.category?.name && p.category.name.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    return (
        <div>
            <div className="hero">
                <h1>Welcome to Shopping-Hub</h1>
                <p style={{ fontSize: '1.25rem', marginBottom: '2rem', color: '#cbd5e1' }}>Professional Quality, Premium Experience.</p>
                <button
                    onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}
                    className="btn btn-accent"
                    style={{ borderRadius: '9999px', padding: '1rem 2rem' }}
                >
                    Shop Now
                </button>
            </div>

            <h2 id="products" className="text-center mb-8" style={{ fontSize: '2rem', color: 'var(--primary)', fontWeight: 'bold' }}>Featured Products</h2>

            {/* Search & Category Section */}
            <div className="container mb-8">
                <div style={{
                    maxWidth: '600px', margin: '0 auto 2rem auto',
                    position: 'relative', display: 'flex', alignItems: 'center'
                }}>
                    <Search style={{ position: 'absolute', left: '1rem', color: '#64748b' }} size={20} />
                    <input
                        type="text"
                        placeholder="Search products or categories..."
                        className="input-field"
                        style={{ paddingLeft: '3rem', borderRadius: '999px', marginBottom: 0 }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex justify-center gap-4" style={{ flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setActiveCategory('all')}
                        className={`btn ${activeCategory === 'all' ? 'btn-accent' : ''}`}
                        style={{ borderRadius: '999px', background: activeCategory === 'all' ? undefined : 'white', border: '1px solid #e2e8f0' }}
                    >
                        All
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat._id}
                            onClick={() => setActiveCategory(cat._id)}
                            className={`btn ${activeCategory === cat._id ? 'btn-accent' : ''}`}
                            style={{ borderRadius: '999px', background: activeCategory === cat._id ? undefined : 'white', border: '1px solid #e2e8f0' }}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-3">
                {filteredProducts.map(product => (
                    <div key={product._id} className="card" style={{ position: 'relative' }}>
                        {/* Stock Labels */}
                        {product.stock === 0 ? (
                            <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#ef4444', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', zIndex: 10 }}>
                                OUT OF STOCK
                            </div>
                        ) : product.stock <= 5 ? (
                            <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#f59e0b', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', zIndex: 10 }}>
                                LOW IN STOCK
                            </div>
                        ) : null}

                        <div className="product-image-container">
                            <img src={product.image?.startsWith('http') ? product.image : `${API_URL}${product.image}`} alt={product.name} className="product-image" />
                            <div style={{
                                position: 'absolute', inset: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: 'rgba(0,0,0,0.3)', opacity: 0, transition: 'opacity 0.3s'
                            }}
                                className="hover-overlay"
                                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                            >
                                <Link to={`/product/${product._id}`} className="btn" style={{ background: 'white', color: 'var(--primary)', borderRadius: '9999px', padding: '0.5rem 1.5rem', textDecoration: 'none' }}>
                                    View Details
                                </Link>
                            </div>
                        </div>
                        <div className="product-content">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{product.name}</h3>
                                <div className="product-price">PKR {product.price}</div>
                            </div>
                            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem', lineHeight: '1.5', height: '3em', overflow: 'hidden' }}>{product.description}</p>

                            {product.stock <= 0 ? (
                                <button disabled className="btn full-width" style={{ background: '#cbd5e1', cursor: 'not-allowed', color: '#64748b' }}>
                                    Out of Stock
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleAddToCart(product)}
                                    className="btn btn-primary full-width"
                                    style={{ gap: '0.5rem' }}
                                >
                                    <ShoppingBag size={18} />
                                    Add to Cart
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {filteredProducts.length === 0 && (
                <div className="text-center" style={{ padding: '4rem', color: '#64748b' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🛒</div>
                    <h3>Sorry, nothing found!</h3>
                    <p>Try adjusting your search or category filter.</p>
                </div>
            )}
        </div>
    );
};

export default Home;
