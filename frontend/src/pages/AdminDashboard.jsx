import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, LogOut, Plus, Trash2, Eye, Grid, X, Edit, Clock } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('products');
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    // Modal States
    const [showProductModal, setShowProductModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Form States
    const [productForm, setProductForm] = useState({
        name: '', description: '', price: '', stock: '', category: '',
        deliveryCharges: '', increaseDeliveryWithQty: false, sku: ''
    });
    // State for image uploads
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [categoryName, setCategoryName] = useState('');

    useEffect(() => {
        const token = sessionStorage.getItem('adminToken');
        if (!token) navigate('/admin');
        else {
            fetchData();
            // Polling for live updates every 5 seconds
            const interval = setInterval(fetchData, 5000);
            return () => clearInterval(interval);
        }
    }, [navigate]);

    const fetchData = async () => {
        try {
            const [prodRes, catRes, ordRes] = await Promise.all([
                axios.get(`${API_URL}/api/products`),
                axios.get(`${API_URL}/api/categories`),
                axios.get(`${API_URL}/api/orders`)
            ]);
            setProducts(prodRes.data);
            setCategories(catRes.data);
            setOrders(ordRes.data);
        } catch (err) {
            console.error(err);
            showNotification('Failed to fetch data', 'error');
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('adminToken');
        navigate('/admin');
    };

    // --- Image Handling ---
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(files);

        // Generate Previews
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(newPreviews);
    };

    // --- Product Handlers ---
    const resetProductForm = () => {
        setProductForm({
            name: '', description: '', price: '', stock: '', category: '',
            deliveryCharges: '', increaseDeliveryWithQty: false, sku: ''
        });
        setSelectedFiles([]);
        setPreviews([]);
        setIsEditing(false);
        setEditingId(null);
    };

    const openEditModal = (product) => {
        setProductForm({
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            category: product.category?._id || '',
            deliveryCharges: product.deliveryCharges || 0,
            increaseDeliveryWithQty: product.increaseDeliveryWithQty || false,
            sku: product.sku || ''
        });
        setEditingId(product._id);
        setIsEditing(true);
        setSelectedFiles([]);
        setPreviews(product.images || (product.image ? [product.image] : []));
        setShowProductModal(true);
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();

        // Append all text fields
        Object.keys(productForm).forEach(key => {
            formData.append(key, productForm[key]);
        });

        // Append Images
        selectedFiles.forEach((file) => {
            formData.append('images', file);
        });

        try {
            if (isEditing) {
                await axios.put(`${API_URL}/api/products/${editingId}`, formData);
                showNotification('Product updated successfully');
            } else {
                await axios.post(`${API_URL}/api/products`, formData);
                showNotification('Product added successfully');
            }
            fetchData();
            setShowProductModal(false);
            resetProductForm();
        } catch (err) {
            showNotification(err.response?.data?.message || 'Failed to save product', 'error');
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await axios.delete(`${API_URL}/api/products/${id}`);
            showNotification('Product deleted');
            fetchData();
        } catch (err) {
            showNotification('Failed to delete product', 'error');
        }
    };

    // --- Category Handlers ---
    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!categoryName) return;
        try {
            await axios.post(`${API_URL}/api/categories`, { name: categoryName });
            showNotification('Category added');
            setCategoryName('');
            fetchData();
        } catch (err) {
            showNotification(err.response?.data?.message || 'Failed to add category', 'error');
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Delete this category? Products in this category will become uncategorized.')) return;
        try {
            await axios.delete(`${API_URL}/api/categories/${id}`);
            showNotification('Category deleted');
            fetchData();
        } catch (err) {
            showNotification('Failed to delete category', 'error');
        }
    };

    // --- Order Handlers ---
    const updateOrderStatus = async (id, status) => {
        try {
            await axios.put(`${API_URL}/api/orders/${id}`, { status });
            showNotification('Order status updated');
            fetchData();
        } catch (err) {
            showNotification('Failed to update status', 'error');
        }
    };

    const handleDeleteOrder = async (id) => {
        if (!window.confirm('Delete this order record?')) return;
        try {
            await axios.delete(`${API_URL}/api/orders/${id}`);
            showNotification('Order record deleted');
            fetchData();
        } catch (err) {
            showNotification('Failed to delete order', 'error');
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <div className="sidebar" style={{ width: '260px', background: '#1e293b', color: 'white', position: 'fixed', height: '100vh' }}>
                <div style={{ padding: '2rem', fontSize: '1.5rem', fontWeight: 'bold', borderBottom: '1px solid #334155' }}>
                    Shopping Hub
                </div>
                <div style={{ padding: '1rem' }}>
                    <button onClick={() => setActiveTab('products')} className={`sidebar-btn ${activeTab === 'products' ? 'active' : ''}`}>
                        <Package size={20} /> Products
                    </button>
                    <button onClick={() => setActiveTab('categories')} className={`sidebar-btn ${activeTab === 'categories' ? 'active' : ''}`}>
                        <Grid size={20} /> Categories
                    </button>
                    <button onClick={() => setActiveTab('orders')} className={`sidebar-btn ${activeTab === 'orders' ? 'active' : ''}`}>
                        <ShoppingCart size={20} /> Orders
                    </button>

                    <button onClick={handleLogout} className="sidebar-btn" style={{ marginTop: '2rem', color: '#f87171' }}>
                        <LogOut size={20} /> Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content" style={{ marginLeft: '260px', flex: 1, padding: '2rem', background: '#f8fafc' }}>

                {/* --- PRODUCTS TAB --- */}
                {activeTab === 'products' && (
                    <>
                        <header className="flex justify-between items-center mb-8">
                            <div>
                                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#0f172a' }}>Products</h1>
                                <p style={{ color: '#64748b' }}>Manage your inventory and product listings</p>
                            </div>
                            <button onClick={() => { resetProductForm(); setShowProductModal(true); }} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Plus size={20} /> Add Product
                            </button>
                        </header>

                        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ background: '#f1f5f9' }}>
                                    <tr>
                                        <th style={{ padding: '1rem' }}>Product</th>
                                        <th style={{ padding: '1rem' }}>Category</th>
                                        <th style={{ padding: '1rem' }}>Price</th>
                                        <th style={{ padding: '1rem' }}>Stock</th>
                                        <th style={{ padding: '1rem' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(product => (
                                        <tr key={product._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                            <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <img
                                                    src={product.image?.startsWith('http') ? product.image : `${API_URL}${product.image}`}
                                                    alt={product.name}
                                                    style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                                                />
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{product.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>SKU: {product.sku || 'N/A'}</div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{ padding: '0.25rem 0.5rem', background: '#f1f5f9', borderRadius: '4px', fontSize: '0.875rem' }}>
                                                    {product.category?.name || 'Uncategorized'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', fontWeight: 600 }}>PKR {product.price}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.875rem',
                                                    background: product.stock <= 5 ? '#fee2e2' : '#dcfce7',
                                                    color: product.stock <= 5 ? '#dc2626' : '#16a34a'
                                                }}>
                                                    {product.stock} in stock
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button onClick={() => openEditModal(product)} className="btn" style={{ padding: '0.5rem', background: '#f1f5f9' }}>
                                                        <Edit size={18} />
                                                    </button>
                                                    <button onClick={() => handleDeleteProduct(product._id)} className="btn" style={{ padding: '0.5rem', background: '#fee2e2', color: '#dc2626' }}>
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* --- CATEGORIES TAB --- */}
                {activeTab === 'categories' && (
                    <>
                        <header className="mb-8">
                            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#0f172a' }}>Categories</h1>
                            <p style={{ color: '#64748b' }}>Organize your products with categories</p>
                        </header>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                            <div className="card" style={{ height: 'fit-content' }}>
                                <h3 style={{ marginBottom: '1.5rem' }}>Add Category</h3>
                                <form onSubmit={handleAddCategory}>
                                    <div className="mb-4">
                                        <label className="label">Category Name</label>
                                        <input
                                            value={categoryName}
                                            onChange={e => setCategoryName(e.target.value)}
                                            className="input-field"
                                            placeholder="e.g. Electronics"
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary full-width">Add Category</button>
                                </form>
                            </div>
                            <div className="card" style={{ padding: '0' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead style={{ background: '#f1f5f9' }}>
                                        <tr>
                                            <th style={{ padding: '1rem' }}>Name</th>
                                            <th style={{ padding: '1rem' }}>Slug</th>
                                            <th style={{ padding: '1rem' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categories.map(cat => (
                                            <tr key={cat._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                                <td style={{ padding: '1rem', fontWeight: 500 }}>{cat.name}</td>
                                                <td style={{ padding: '1rem', color: '#64748b' }}>{cat.slug}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <button onClick={() => handleDeleteCategory(cat._id)} className="btn" style={{ padding: '0.5rem', background: '#fee2e2', color: '#dc2626' }}>
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* --- ORDERS TAB --- */}
                {activeTab === 'orders' && (
                    <>
                        <header className="mb-8">
                            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#0f172a' }}>Orders</h1>
                            <p style={{ color: '#64748b' }}>Track and manage customer orders</p>
                        </header>
                        <div className="card" style={{ padding: '0' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ background: '#f1f5f9' }}>
                                    <tr>
                                        <th style={{ padding: '1rem' }}>Order ID</th>
                                        <th style={{ padding: '1rem' }}>Customer</th>
                                        <th style={{ padding: '1rem' }}>Total</th>
                                        <th style={{ padding: '1rem' }}>Status</th>
                                        <th style={{ padding: '1rem' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => (
                                        <tr key={order._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                            <td style={{ padding: '1rem', fontFamily: 'monospace' }}>#{order._id.slice(-6).toUpperCase()}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ fontWeight: 500 }}>{order.customerName}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{order.phone}</div>
                                            </td>
                                            <td style={{ padding: '1rem', fontWeight: 600 }}>PKR {order.totalAmount}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <select
                                                    value={order.status}
                                                    onChange={e => updateOrderStatus(order._id, e.target.value)}
                                                    className="input-field"
                                                    style={{ padding: '0.25rem', marginBottom: '0' }}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Processing">Processing</option>
                                                    <option value="Shipped">Shipped</option>
                                                    <option value="Delivered">Delivered</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button onClick={() => { setSelectedOrder(order); setShowOrderModal(true); }} className="btn" style={{ padding: '0.5rem', background: '#f1f5f9' }}>
                                                        <Eye size={18} />
                                                    </button>
                                                    <button onClick={() => handleDeleteOrder(order._id)} className="btn" style={{ padding: '0.5rem', background: '#fee2e2', color: '#dc2626' }}>
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

            {/* --- PRODUCT MODAL --- */}
            {showProductModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                    <div className="card" style={{ width: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '2.5rem', position: 'relative' }}>
                        <button onClick={() => setShowProductModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                            <X size={24} />
                        </button>
                        <h2 style={{ marginBottom: '2rem' }}>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
                        <form onSubmit={handleProductSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label className="label">Product Name</label>
                                    <input required className="input-field" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label">SKU</label>
                                    <input className="input-field" value={productForm.sku} onChange={e => setProductForm({ ...productForm, sku: e.target.value })} />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="label">Description</label>
                                <textarea required className="input-field" style={{ minHeight: '100px' }} value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label className="label">Price (PKR)</label>
                                    <input type="number" required className="input-field" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label">Stock Quantity</label>
                                    <input type="number" required className="input-field" value={productForm.stock} onChange={e => setProductForm({ ...productForm, stock: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label">Category</label>
                                    <select required className="input-field" value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })}>
                                        <option value="">Select Category</option>
                                        {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div>
                                    <label className="label">Delivery Charges</label>
                                    <input type="number" className="input-field" value={productForm.deliveryCharges} onChange={e => setProductForm({ ...productForm, deliveryCharges: e.target.value })} />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
                                    <input
                                        type="checkbox"
                                        id="incDC"
                                        checked={productForm.increaseDeliveryWithQty}
                                        onChange={e => setProductForm({ ...productForm, increaseDeliveryWithQty: e.target.checked })}
                                        style={{ width: '20px', height: '20px' }}
                                    />
                                    <label htmlFor="incDC" style={{ fontSize: '0.875rem' }}>Increase delivery with quantity?</label>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="label">Product Images (Select one or more)</label>
                                <div style={{ border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                        id="product-images-upload"
                                    />
                                    <label htmlFor="product-images-upload" className="btn" style={{ background: '#f1f5f9', display: 'inline-block', marginBottom: '1rem', cursor: 'pointer' }}>
                                        Choose Images
                                    </label>

                                    {previews.length > 0 && (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                                            {previews.map((src, index) => (
                                                <div key={index} style={{ position: 'relative', aspectRatio: '1/1' }}>
                                                    <img
                                                        src={src.startsWith('http') || src.startsWith('/uploads') ? (src.startsWith('http') ? src : `${API_URL}${src}`) : src}
                                                        alt="preview"
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
                                        {selectedFiles.length > 0 ? `${selectedFiles.length} new images selected` : 'The first image will be used as the main thumbnail'}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>{isEditing ? 'Update Product' : 'Create Product'}</button>
                                <button type="button" onClick={() => setShowProductModal(false)} className="btn" style={{ flex: 1, background: '#f1f5f9' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- ORDER DETAILS MODAL --- */}
            {showOrderModal && selectedOrder && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                    <div className="card" style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '2.5rem', position: 'relative' }}>
                        <button onClick={() => setShowOrderModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                            <X size={24} />
                        </button>
                        <h2 style={{ marginBottom: '1.5rem' }}>Order Details</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div>
                                <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Customer Information</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#64748b' }}>Customer Full Name:</span>
                                        <span style={{ fontWeight: 600 }}>{selectedOrder.customerName}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#64748b' }}>Customer Phone No:</span>
                                        <span style={{ fontWeight: 600 }}>{selectedOrder.phone}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#64748b' }}>Customer Email:</span>
                                        <span style={{ fontWeight: 600 }}>{selectedOrder.email || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Shipping Address</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#64748b' }}>Address:</span>
                                        <span style={{ fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{selectedOrder.address}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#64748b' }}>City / Province:</span>
                                        <span style={{ fontWeight: 500 }}>{selectedOrder.city}, {selectedOrder.province}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#64748b' }}>Postal Code:</span>
                                        <span style={{ fontWeight: 500 }}>{selectedOrder.postalCode || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                            <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', marginBottom: '1rem' }}>Order Items</h4>
                            {selectedOrder.items.map((item, i) => (
                                <div key={i} className="flex justify-between" style={{ padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                                    <span style={{ fontSize: '0.875rem' }}>{item.product?.name || 'Deleted Product'} <span style={{ color: '#64748b' }}>x{item.quantity}</span></span>
                                    <span style={{ fontWeight: 500 }}>PKR {item.price * item.quantity}</span>
                                </div>
                            ))}
                            <div className="flex justify-between" style={{ marginTop: '1rem' }}>
                                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Delivery Charges</span>
                                <span style={{ fontSize: '0.875rem' }}>PKR {selectedOrder.deliveryCharges || 0}</span>
                            </div>
                            <div className="flex justify-between" style={{ marginTop: '0.5rem', fontWeight: 'bold', fontSize: '1.125rem' }}>
                                <span>Grand Total</span>
                                <span style={{ color: '#0f172a' }}>PKR {selectedOrder.totalAmount}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <label className="label" style={{ marginBottom: 0 }}>Update Status:</label>
                            <select
                                value={selectedOrder.status}
                                onChange={e => updateOrderStatus(selectedOrder._id, e.target.value)}
                                className="input-field"
                                style={{ flex: 1, marginBottom: 0 }}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
