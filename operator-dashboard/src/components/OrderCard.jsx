import { Eye, Printer, CheckCircle, FileText, Clock, AlertCircle } from 'lucide-react';
import { useState, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import PrintLabel from './PrintLabel';
import FilePreviewModal from './FilePreviewModal';

const OrderCard = ({ order, onAccept, onReject, onDownload, onMarkReady, onComplete }) => {
    const [otpInput, setOtpInput] = useState(['', '', '', '']);
    const [showPrintLabel, setShowPrintLabel] = useState(false);
    const [showFilePreview, setShowFilePreview] = useState(false);
    const otpRefs = [useRef(), useRef(), useRef(), useRef()];

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
            case 'assigned':
                return 'border-l-rose-500';
            case 'processing':
            case 'printing':
                return 'border-l-amber-500';
            case 'printed':
            case 'ready':
                return 'border-l-emerald-500';
            default:
                return 'border-l-gray-300';
        }
    };

    const getUrgencyColor = (date) => {
        const diffMinutes = Math.floor((new Date() - new Date(date)) / 60000);
        if (diffMinutes > 30) return 'text-red-600 font-bold';
        if (diffMinutes > 15) return 'text-orange-600 font-semibold';
        return 'text-gray-500';
    };

    const isUrgent = (date) => {
        const diffMinutes = Math.floor((new Date() - new Date(date)) / 60000);
        return diffMinutes > 30;
    };

    const handleOTPChange = (index, value) => {
        if (value.length > 1) value = value[0];
        const newOtp = [...otpInput];
        newOtp[index] = value;
        setOtpInput(newOtp);

        // Auto-focus next input
        if (value && index < 3) {
            otpRefs[index + 1].current?.focus();
        }

        // Auto-submit when complete
        if (index === 3 && value) {
            const fullOtp = newOtp.join('');
            if (fullOtp.length === 4) {
                onComplete(order._id, fullOtp);
                setOtpInput(['', '', '', '']);
            }
        }
    };

    const handleOTPKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpInput[index] && index > 0) {
            otpRefs[index - 1].current?.focus();
        }
    };

    return (
        <div
            className={`bg-white rounded-lg border-l-4 ${getStatusColor(order.orderStatus)} shadow-sm hover:shadow-md transition-all duration-200 p-4 ${isUrgent(order.createdAt) ? 'ring-2 ring-red-200' : ''
                }`}
        >
            {/* Delivery Type Badge - Only for Ready/Printed orders */}
            {(order.orderStatus === 'printed' || order.orderStatus === 'ready') && (
                <div className="mb-3">
                    {order.deliveryType === 'DELIVERY' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                            🚚 DELIVERY ORDER
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
                            🚶 SELF PICKUP
                        </span>
                    )}
                </div>
            )}

            {/* Header Row */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-900">{order.userId?.name || 'Guest User'}</h3>
                        {isUrgent(order.createdAt) && (
                            <AlertCircle size={16} className="text-red-600 animate-pulse" />
                        )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-400 font-mono">{order.orderNumber}</span>
                        <span className={`text-xs flex items-center gap-1 ${getUrgencyColor(order.createdAt)}`}>
                            <Clock size={12} />
                            {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                        </span>
                    </div>
                </div>
            </div>

            {/* Smart Badges */}
            <div className="flex flex-wrap gap-2 mb-3">
                {/* Critical: Binding */}
                {order.specifications?.binding && order.specifications.binding !== 'none' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-indigo-600 text-white">
                        {order.specifications.binding}
                    </span>
                )}

                {/* Critical: Color Mode */}
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${order.specifications?.colorType === 'color'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                    : 'bg-slate-800 text-white'
                    }`}>
                    {order.specifications?.colorType === 'color' ? 'COLOR' : 'B&W'}
                </span>

                {/* Standard: Pages */}
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-50 text-gray-500 border border-gray-100">
                    {order.specifications?.pages || 0} pages
                </span>

                {/* Standard: Copies */}
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-50 text-gray-500 border border-gray-100">
                    {order.specifications?.copies || 1}x
                </span>

                {/* Standard: Paper Size */}
                {order.specifications?.paperSize && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-50 text-gray-500 border border-gray-100">
                        {order.specifications.paperSize}
                    </span>
                )}
            </div>

            {/* Divider */}
            <hr className="border-gray-100 my-3" />

            {/* Action Footer */}
            <div className="space-y-2">
                {(order.orderStatus === 'pending' || order.orderStatus === 'assigned') && (
                    <>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowPrintLabel(true)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors"
                                title="Print Label"
                            >
                                <Printer size={18} />
                            </button>
                        </div>
                        <button
                            onClick={() => onMarkReady(order._id)}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-medium shadow-sm transition-colors"
                        >
                            Start Job
                        </button>
                    </>
                )}

                {(order.orderStatus === 'processing' || order.orderStatus === 'printing') && (
                    <>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowFilePreview(true)}
                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                title="Preview Files"
                            >
                                <Eye size={18} />
                            </button>
                            <button
                                onClick={() => setShowPrintLabel(true)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors"
                                title="Print Label"
                            >
                                <Printer size={18} />
                            </button>
                        </div>
                        <button
                            onClick={() => onMarkReady(order._id)}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-medium shadow-sm transition-colors"
                        >
                            Mark Ready
                        </button>
                    </>
                )}

                {/* Ready for Pickup - OTP Verification */}
                {(order.orderStatus === 'printed' || order.orderStatus === 'ready') && (
                    <div className="space-y-3">
                        {/* Cash Collection Warning - Only for Self-Pickup COD */}
                        {order.deliveryType !== 'DELIVERY' && order.paymentMethod === 'COD' && (
                            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <AlertCircle size={18} className="text-yellow-700" />
                                    <span className="text-sm font-bold text-yellow-900 uppercase">Collect Cash</span>
                                </div>
                                <p className="text-2xl font-black text-yellow-900">₹{order.totalAmount}</p>
                                <p className="text-xs text-yellow-700 mt-1">Cash on Delivery - Collect from customer</p>
                            </div>
                        )}

                        {/* Payment Status - For Online Payments */}
                        {order.paymentMethod === 'ONLINE' && (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={16} className="text-emerald-600" />
                                    <span className="text-sm font-semibold text-emerald-700">✅ Paid Online</span>
                                </div>
                            </div>
                        )}

                        {/* Rider Info - Only for Delivery Orders */}
                        {order.deliveryType === 'DELIVERY' && order.riderId && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-xs font-semibold text-blue-700 uppercase mb-1">Delivery Rider</p>
                                <p className="text-sm font-bold text-blue-900">{order.riderId?.name || 'Rider'}</p>
                                {order.riderId?.vehicleNumber && (
                                    <p className="text-xs text-blue-600 font-mono mt-0.5">{order.riderId.vehicleNumber}</p>
                                )}
                            </div>
                        )}

                        {/* OTP Verification - ONLY for Delivery Orders */}
                        {order.deliveryType === 'DELIVERY' ? (
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-2">
                                    🚚 Ask Rider for OTP
                                </label>
                                <div className="flex gap-2 mb-3">
                                    {[0, 1, 2, 3].map((index) => (
                                        <input
                                            key={index}
                                            ref={otpRefs[index]}
                                            type="text"
                                            maxLength="1"
                                            value={otpInput[index]}
                                            onChange={(e) => handleOTPChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOTPKeyDown(index, e)}
                                            className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${otpInput[index]
                                                    ? 'border-emerald-500 bg-emerald-50'
                                                    : 'border-gray-300 bg-white'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <button
                                    onClick={() => {
                                        onComplete(order._id, otpInput.join(''));
                                        setOtpInput(['', '', '', '']); // Clear OTP after dispatch
                                    }}
                                    disabled={otpInput.some(digit => !digit)}
                                    className={`w-full py-3 rounded-lg font-bold transition-all ${otpInput.every(digit => digit)
                                            ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    ✓ Handover to Rider
                                </button>
                            </div>
                        ) : (
                            // Self-Pickup - Direct Handover (No OTP)
                            <button
                                onClick={() => onComplete(order._id, 'WALK_IN')}
                                className="w-full py-3 rounded-lg font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md transition-all"
                            >
                                👤 Handover to Customer
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            <PrintLabel order={order} isOpen={showPrintLabel} onClose={() => setShowPrintLabel(false)} />
            <FilePreviewModal files={order.documents} isOpen={showFilePreview} onClose={() => setShowFilePreview(false)} />
        </div>
    );
};

export default OrderCard;
