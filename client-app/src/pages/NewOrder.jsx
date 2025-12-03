/**
 * New Order Page
 * Create print order with document upload
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI, paymentAPI } from '../services/api';
import DocumentPreview from '../components/DocumentPreview';


function NewOrder() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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

                    {/* Document Preview Component */}
                    {formData.documents.length > 0 && (
                        <DocumentPreview
                            files={formData.documents}
                            onRemove={handleRemoveFile}
                        />
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
                        disabled={loading || formData.documents.length === 0}
                    >
                        {loading ? 'Creating Order...' : 'Place Order'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default NewOrder;
