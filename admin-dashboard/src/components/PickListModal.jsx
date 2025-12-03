import React, { useState } from 'react';
import { X, CheckCircle, Package, MapPin } from 'lucide-react';
import axios from 'axios';

const PickListModal = ({ order, onClose, onUpdateStatus }) => {
    const [checkedItems, setCheckedItems] = useState({});
    const [loading, setLoading] = useState(false);

    const allChecked = order.items.every((item, index) => checkedItems[index]);

    const handleCheck = (index) => {
        setCheckedItems(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const handleConfirmPacking = async () => {
        setLoading(true);
        try {
            // Update order status to 'processing' (Packed)
            await onUpdateStatus(order._id, 'processing');
            onClose();
        } catch (error) {
            console.error('Error confirming packing:', error);
            alert('Failed to update order status');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 m-4">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 font-outfit flex items-center gap-2">
                            <Package className="text-indigo-600" /> Pick List
                        </h3>
                        <p className="text-sm text-slate-500">Order #{order.orderNumber}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-4 mb-8">
                    {order.items.map((item, index) => (
                        <div
                            key={index}
                            className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${checkedItems[index]
                                ? 'bg-emerald-50 border-emerald-200'
                                : 'bg-slate-50 border-slate-200 hover:border-indigo-200'
                                }`}
                            onClick={() => handleCheck(index)}
                        >
                            <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors ${checkedItems[index]
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'bg-white border-slate-300'
                                }`}>
                                {checkedItems[index] && <CheckCircle size={14} />}
                            </div>
                            <div className="flex-1">
                                <h4 className={`font-medium ${checkedItems[index] ? 'text-emerald-900' : 'text-slate-800'}`}>
                                    {item.quantity}x {item.name}
                                </h4>
                                {item.variant && (
                                    <p className="text-sm text-slate-500">Variant: {item.variant.name}</p>
                                )}
                                <div className="flex items-center gap-1 mt-1 text-xs font-medium text-indigo-600 bg-indigo-50 w-fit px-2 py-0.5 rounded">
                                    <MapPin size={10} />
                                    {item.locationInWarehouse || 'Unassigned Location'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirmPacking}
                        disabled={!allChecked || loading}
                        className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${allChecked
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <CheckCircle size={18} />
                                Confirm Packing
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PickListModal;
