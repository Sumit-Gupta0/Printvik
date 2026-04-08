/**
 * New Order Page
 * Create print order with document upload
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI, paymentAPI } from '../services/api';
import { io } from 'socket.io-client';
import DocumentPreview from '../components/DocumentPreview';
import useAuthStore from '../store/authStore';


function NewOrder() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [serverDocuments, setServerDocuments] = useState([]);
    const [draftOrderId, setDraftOrderId] = useState(null);
    const [botNumber, setBotNumber] = useState('');
    const currentUser = useAuthStore((state) => state.user);

    const [formData, setFormData] = useState({
        documents: [],
        colorType: 'bw',
        paperSize: 'A4',
        copies: 1,
        pages: 1,
        binding: 'none',
        instructions: '',
        deliveryOption: 'delivery',
        paymentMethod: 'online',
    });

    const [priceEstimate, setPriceEstimate] = useState(0);

    useEffect(() => {
        const fetchDraft = async () => {
            try {
                const res = await orderAPI.getDraft();
                if (res.data && res.data._id) {
                    setDraftOrderId(res.data._id);
                    setServerDocuments(res.data.documents || []);
                }
            } catch (error) {
                // Ignore, just means no draft exists
            }
        };
        fetchDraft();

        const API_URL = import.meta.env.VITE_API_URL || 'http://10.135.245.131:5001/api';
        
        let envNumber = import.meta.env.VITE_WHATSAPP_NUMBER;
        // Strip any + or spaces
        if (envNumber) {
            envNumber = envNumber.replace(/[^0-9]/g, '');
            setBotNumber(envNumber);
        }

        const socketUri = API_URL.replace('/api', '');
        const socket = io(socketUri, { transports: ['websocket', 'polling'] });

        socket.on('whatsapp_file_received', (data) => {
            if (currentUser && data.userId === currentUser._id) {
                setServerDocuments(prev => [...prev, data.document]);
                setDraftOrderId(data.orderId);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [currentUser]);

    // Calculate price estimate
    const calculatePrice = () => {
        const basePrice = formData.colorType === 'color' ? 5 : 2;
        const total = basePrice * formData.pages * formData.copies;
        const binding = formData.binding !== 'none' ? 20 : 0;
        const delivery = formData.deliveryOption === 'delivery' ? 30 : 0;

        setPriceEstimate(total + binding + delivery);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setTimeout(calculatePrice, 100);
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, documents: Array.from(e.target.files) });
    };

    const handleRemoveFile = (index) => {
        const newDocuments = formData.documents.filter((_, i) => i !== index);
        setFormData({ ...formData, documents: newDocuments });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Create FormData for file upload
            const data = new FormData();
            formData.documents.forEach((file) => {
                data.append('documents', file);
            });

            data.append('specifications', JSON.stringify({
                colorType: formData.colorType,
                paperSize: formData.paperSize,
                copies: parseInt(formData.copies),
                pages: parseInt(formData.pages),
                binding: formData.binding,
            }));

            if (draftOrderId) {
                data.append('draftOrderId', draftOrderId);
            }

            data.append('instructions', formData.instructions);
            data.append('totalAmount', priceEstimate);
            data.append('paymentMethod', formData.paymentMethod);
            data.append('deliveryOption', formData.deliveryOption);

            // Create order
            const orderResponse = await orderAPI.create(data);
            const order = orderResponse.data.order;

            // Handle payment
            if (formData.paymentMethod === 'online') {
                // Razorpay integration would go here
                alert('Payment integration coming soon! Order created successfully.');
                navigate(`/orders/${order._id}`);
            } else {
                // COD
                await paymentAPI.confirmCOD({ orderId: order._id, amount: priceEstimate });
                navigate(`/orders/${order._id}`);
            }
        } catch (err) {
            setError(err.message || 'Error creating order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '600px', marginTop: 'var(--spacing-2xl)', marginBottom: 'var(--spacing-2xl)' }}>
            <h1>Create New Order</h1>
            <p className="text-secondary mb-xl">Upload your documents and configure print settings</p>

            {error && (
                <div style={{
                    padding: 'var(--spacing-md)',
                    backgroundColor: '#FEE2E2',
                    color: '#991B1B',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--spacing-md)',
                }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="card mb-lg">
                    <h3>Upload Documents</h3>
                    <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        required
                        style={{
                            width: '100%',
                            padding: 'var(--spacing-md)',
                            border: '2px dashed var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                        }}
                    />
                    <p className="text-xs text-tertiary mt-sm">
                        Accepted formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                    </p>

                    <div style={{ marginTop: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }}></div>
                        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>OR</span>
                        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }}></div>
                    </div>

                    <div style={{ marginTop: 'var(--spacing-md)', textAlign: 'center' }}>
                        <a 
                            href={`https://wa.me/${botNumber}?text=Hello Printvik,%20I%20want%20to%20send%20some%20files%20for%20my%20order.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn"
                            style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                backgroundColor: '#25D366', 
                                color: 'white',
                                borderColor: '#25D366',
                                textDecoration: 'none',
                                fontWeight: 600
                             }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            Share via WhatsApp
                        </a>
                        <p className="text-xs text-tertiary mt-sm">Tap above, attach your files in WhatsApp, and they will pop up here instantly!</p>
                    </div>

                    {/* Document Preview Component */}
                    {formData.documents.length > 0 && (
                        <DocumentPreview
                            files={formData.documents}
                            onRemove={handleRemoveFile}
                        />
                    )}

                    {serverDocuments.length > 0 && (
                        <div style={{
                            marginTop: 'var(--spacing-md)',
                            padding: 'var(--spacing-md)',
                            backgroundColor: '#F0FDF4',
                            border: '1px solid #BBF7D0',
                            borderRadius: 'var(--radius-md)'
                        }}>
                            <h4 style={{ color: '#166534', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 var(--spacing-sm) 0' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                Files from WhatsApp
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {serverDocuments.map((doc, index) => (
                                    <div key={index} style={{ 
                                        backgroundColor: 'white', 
                                        padding: '8px 12px', 
                                        borderRadius: 'var(--radius-sm)',
                                        border: '1px solid #DCFCE7',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>📄 {doc.filename}</span>
                                        <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#166534', textDecoration: 'underline' }}>View</a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="card mb-lg">
                    <h3>Print Specifications</h3>

                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontSize: '0.875rem', fontWeight: 500 }}>
                            Print Type
                        </label>
                        <select name="colorType" value={formData.colorType} onChange={handleChange} className="input">
                            <option value="bw">Black & White (₹2/page)</option>
                            <option value="color">Color (₹5/page)</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontSize: '0.875rem', fontWeight: 500 }}>
                            Paper Size
                        </label>
                        <select name="paperSize" value={formData.paperSize} onChange={handleChange} className="input">
                            <option value="A4">A4</option>
                            <option value="A3">A3</option>
                            <option value="Letter">Letter</option>
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontSize: '0.875rem', fontWeight: 500 }}>
                                Pages
                            </label>
                            <input
                                type="number"
                                name="pages"
                                min="1"
                                value={formData.pages}
                                onChange={handleChange}
                                className="input"
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontSize: '0.875rem', fontWeight: 500 }}>
                                Copies
                            </label>
                            <input
                                type="number"
                                name="copies"
                                min="1"
                                value={formData.copies}
                                onChange={handleChange}
                                className="input"
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontSize: '0.875rem', fontWeight: 500 }}>
                            Binding
                        </label>
                        <select name="binding" value={formData.binding} onChange={handleChange} className="input">
                            <option value="none">No Binding</option>
                            <option value="staple">Staple (+₹20)</option>
                            <option value="spiral">Spiral (+₹20)</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontSize: '0.875rem', fontWeight: 500 }}>
                            Special Instructions (Optional)
                        </label>
                        <textarea
                            name="instructions"
                            value={formData.instructions}
                            onChange={handleChange}
                            className="input"
                            rows="3"
                            placeholder="Any special requirements..."
                        />
                    </div>
                </div>

                <div className="card mb-lg">
                    <h3>Delivery & Payment</h3>

                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontSize: '0.875rem', fontWeight: 500 }}>
                            Delivery Option
                        </label>
                        <select name="deliveryOption" value={formData.deliveryOption} onChange={handleChange} className="input">
                            <option value="delivery">Home Delivery (+₹30)</option>
                            <option value="pickup">Pickup from Operator (Free)</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontSize: '0.875rem', fontWeight: 500 }}>
                            Payment Method
                        </label>
                        <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="input">
                            <option value="online">Pay Online</option>
                            <option value="cod">Cash on Delivery</option>
                        </select>
                    </div>
                </div>

                <div className="card" style={{ backgroundColor: 'var(--color-surface)' }}>
                    <div className="flex justify-between items-center">
                        <span style={{ fontSize: '1.125rem', fontWeight: 600 }}>Estimated Total</span>
                        <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                            ₹{priceEstimate}
                        </span>
                    </div>
                </div>

                <div className="flex gap-md mt-lg">
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="btn btn-secondary"
                        style={{ flex: 1 }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                        disabled={loading || (formData.documents.length === 0 && serverDocuments.length === 0)}
                    >
                        {loading ? 'Creating Order...' : 'Place Order'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default NewOrder;
