import React, { useState } from 'react';
import { X, User, MapPin, CreditCard, FileText, Calendar, Package, Truck, Phone, Mail, Clock, AlertTriangle, RefreshCw, Ban, Eye, DollarSign, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up PDF.js worker
// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const OrderDetailsModal = ({ order, onClose, onUpdate }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [actionLoading, setActionLoading] = useState(false);
    const [showNetSplit, setShowNetSplit] = useState(false);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);

    // Reassign form state
    const [reassignShopId, setReassignShopId] = useState('');
    const [reassignReason, setReassignReason] = useState('');

    // Refund form state
    const [refundAmount, setRefundAmount] = useState('');
    const [refundType, setRefundType] = useState('FULL');
    const [refundReason, setRefundReason] = useState('');

    if (!order) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'processing': return 'bg-blue-100 text-blue-700';
            case 'printed': return 'bg-indigo-100 text-indigo-700';
            case 'out_for_delivery': return 'bg-purple-100 text-purple-700';
            case 'delivered': return 'bg-green-100 text-green-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const handleVerifyFile = async () => {
        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/admin/orders/${order._id}/verify-file`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(response.data.message);
            onUpdate && onUpdate();
        } catch (error) {
            console.error('Error verifying file:', error);
            alert(error.response?.data?.message || 'Failed to verify file');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReassign = async () => {
        if (!reassignShopId || !reassignReason) {
            alert('Please select a shop and provide a reason');
            return;
        }
        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/admin/orders/${order._id}/reassign`, {
                newOperatorId: reassignShopId,
                reason: reassignReason
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Order reassigned successfully');
            setReassignShopId('');
            setReassignReason('');
            onUpdate && onUpdate();
        } catch (error) {
            console.error('Error reassigning order:', error);
            alert(error.response?.data?.message || 'Failed to reassign order');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRefund = async () => {
        if (!refundReason) {
            alert('Please provide a reason for the refund');
            return;
        }
        if (refundType === 'PARTIAL' && (!refundAmount || refundAmount <= 0)) {
            alert('Please enter a valid refund amount');
            return;
        }
        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/admin/orders/${order._id}/refund`, {
                amount: refundType === 'PARTIAL' ? parseFloat(refundAmount) : undefined,
                type: refundType,
                reason: refundReason
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Refund processed successfully');
            setRefundAmount('');
            setRefundReason('');
            onUpdate && onUpdate();
        } catch (error) {
            console.error('Error processing refund:', error);
            alert(error.response?.data?.message || 'Failed to process refund');
        } finally {
            setActionLoading(false);
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: FileText },
        { id: 'journey', label: 'Order Journey', icon: Package },
        { id: 'timeline', label: 'Audit Trail', icon: Clock },
        { id: 'financials', label: 'Financials', icon: CreditCard },
        { id: 'actions', label: 'Actions', icon: AlertTriangle },
    ];

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-2xl font-bold text-slate-800">Order #{order.orderNumber}</h2>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(order.orderStatus)}`}>
                                {order.orderStatus.replace(/_/g, ' ')}
                            </span>
                            {order.pageCount?.isMismatch && (
                                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-rose-100 text-rose-700 animate-pulse">
                                    ⚠️ Page Mismatch
                                </span>
                            )}
                        </div>
                        <p className="text-slate-500 text-sm flex items-center gap-2">
                            <Calendar size={14} />
                            Placed on {formatDate(order.createdAt)}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500 hover:text-slate-700"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100 px-6">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">

                    {/* TAB: OVERVIEW */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6 animate-fade-in">
                            {/* PDF Viewer + Page Count Verification */}
                            {order.documents?.[0]?.url && (
                                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                            <FileText size={16} className="text-indigo-600" /> Document Preview
                                        </h3>
                                        <button
                                            onClick={handleVerifyFile}
                                            disabled={actionLoading}
                                            className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                                        >
                                            <Eye size={14} />
                                            {actionLoading ? 'Verifying...' : 'Verify Page Count'}
                                        </button>
                                    </div>

                                    {/* Page Count Status */}
                                    {order.pageCount && (
                                        <div className={`px-6 py-3 border-b ${order.pageCount.isMismatch ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {order.pageCount.isMismatch ? (
                                                        <AlertCircle className="text-rose-600" size={20} />
                                                    ) : (
                                                        <CheckCircle className="text-emerald-600" size={20} />
                                                    )}
                                                    <div>
                                                        <p className={`text-sm font-bold ${order.pageCount.isMismatch ? 'text-rose-700' : 'text-emerald-700'}`}>
                                                            {order.pageCount.isMismatch ? 'Page Count Mismatch Detected!' : 'Page Count Verified'}
                                                        </p>
                                                        <p className="text-xs text-slate-600 mt-0.5">
                                                            User Claimed: <span className="font-bold">{order.pageCount.userClaimed}</span> pages |
                                                            System Detected: <span className="font-bold">{order.pageCount.systemVerified}</span> pages
                                                            {order.pageCount.isMismatch && (
                                                                <span className="text-rose-600 font-bold"> (Difference: {order.pageCount.systemVerified - order.pageCount.userClaimed})</span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                {order.pageCount.verifiedAt && (
                                                    <p className="text-xs text-slate-500">Verified {formatDate(order.pageCount.verifiedAt)}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* PDF Viewer */}
                                    <div className="p-6 bg-slate-100 flex flex-col items-center">
                                        <Document
                                            file={order.documents[0].url}
                                            onLoadSuccess={onDocumentLoadSuccess}
                                            loading={<div className="text-slate-500">Loading PDF...</div>}
                                            error={<div className="text-rose-500">Failed to load PDF</div>}
                                        >
                                            <Page
                                                pageNumber={pageNumber}
                                                width={600}
                                                renderTextLayer={false}
                                                renderAnnotationLayer={false}
                                            />
                                        </Document>
                                        {numPages && (
                                            <div className="mt-4 flex items-center gap-4">
                                                <button
                                                    onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                                                    disabled={pageNumber <= 1}
                                                    className="px-3 py-1 bg-white border border-slate-200 rounded text-sm disabled:opacity-50"
                                                >
                                                    Previous
                                                </button>
                                                <p className="text-sm text-slate-600">
                                                    Page {pageNumber} of {numPages}
                                                </p>
                                                <button
                                                    onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                                                    disabled={pageNumber >= numPages}
                                                    className="px-3 py-1 bg-white border border-slate-200 rounded text-sm disabled:opacity-50"
                                                >
                                                    Next
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Customer & Delivery Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <User size={14} /> Customer Details
                                    </h3>
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                                            {order.userId?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{order.userId?.name || 'Unknown User'}</p>
                                            <p className="text-slate-500 text-sm flex items-center gap-1.5 mt-1">
                                                <Mail size={12} /> {order.userId?.email}
                                            </p>
                                            <p className="text-slate-500 text-sm flex items-center gap-1.5 mt-1">
                                                <Phone size={12} /> {order.userId?.phone}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <MapPin size={14} /> Delivery Address
                                    </h3>
                                    {order.deliveryAddress ? (
                                        <div className="text-slate-700 space-y-1 text-sm">
                                            <p className="font-semibold text-slate-800">{order.deliveryAddress.name || order.userId?.name}</p>
                                            <p>{order.deliveryAddress.addressLine1}</p>
                                            {order.deliveryAddress.addressLine2 && <p>{order.deliveryAddress.addressLine2}</p>}
                                            <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}</p>
                                            <p className="text-slate-500 mt-2 flex items-center gap-1"><Phone size={12} /> {order.deliveryAddress.phone}</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-24 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                            <Package size={24} className="mb-2 opacity-50" />
                                            <span className="text-sm">Store Pickup Order</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Print Specifications (Only for Service Orders) */}
                            {order.orderType !== 'product' && (
                                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <FileText size={14} /> Print Specifications
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="p-3 bg-slate-50 rounded-lg">
                                            <p className="text-xs text-slate-500 mb-1">Color Mode</p>
                                            <p className="font-bold text-slate-800 capitalize">
                                                {order.specifications?.colorType === 'bw' ? 'Black & White' : 'Color'}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg">
                                            <p className="text-xs text-slate-500 mb-1">Paper Size</p>
                                            <p className="font-bold text-slate-800">
                                                {order.specifications?.paperSize || 'A4'}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg">
                                            <p className="text-xs text-slate-500 mb-1">Copies</p>
                                            <p className="font-bold text-slate-800">
                                                {order.specifications?.copies || 1}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg">
                                            <p className="text-xs text-slate-500 mb-1">Binding</p>
                                            <p className="font-bold text-slate-800 capitalize">
                                                {order.specifications?.binding || 'None'}
                                            </p>
                                        </div>
                                    </div>
                                    {order.instructions && (
                                        <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                                            <p className="text-xs font-bold text-amber-700 mb-1">Special Instructions:</p>
                                            <p className="text-sm text-amber-800">{order.instructions}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: ORDER JOURNEY */}
                    {activeTab === 'journey' && (
                        <div className="space-y-6 animate-fade-in">
                            {/* Order Journey Timeline (Visual Status Progression) */}
                            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                        <Package size={16} className="text-indigo-600" /> Complete Order Journey
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1">Track the order from placement to delivery</p>
                                </div>
                                <div className="p-6">
                                    <div className="relative">
                                        {/* Timeline Line */}
                                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>

                                        {/* Timeline Steps */}
                                        <div className="space-y-6">
                                            {/* Step 1: Order Placed */}
                                            <div className="relative flex items-start gap-4">
                                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center z-10 ${order.createdAt ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                                    <CheckCircle size={16} />
                                                </div>
                                                <div className="flex-1 pt-1">
                                                    <p className="font-bold text-slate-800 text-sm">Order Placed</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">{formatDate(order.createdAt)}</p>
                                                </div>
                                            </div>

                                            {/* Step 2: Shop Accepted */}
                                            <div className="relative flex items-start gap-4">
                                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center z-10 ${order.orderStatus !== 'pending' ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                                    <CheckCircle size={16} />
                                                </div>
                                                <div className="flex-1 pt-1">
                                                    <p className="font-bold text-slate-800 text-sm">Shop Accepted</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        {order.orderStatus !== 'pending' ? 'Accepted by operator' : 'Waiting for acceptance'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Step 3: Printing */}
                                            <div className="relative flex items-start gap-4">
                                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center z-10 ${['printing', 'printed', 'ready', 'assigned-for-delivery', 'picked-up', 'in-transit', 'delivered'].includes(order.orderStatus) ? 'bg-green-500 text-white' : order.orderStatus === 'processing' ? 'bg-blue-500 text-white animate-pulse' : 'bg-slate-200 text-slate-400'}`}>
                                                    {['printing', 'printed', 'ready', 'assigned-for-delivery', 'picked-up', 'in-transit', 'delivered'].includes(order.orderStatus) ? <CheckCircle size={16} /> : <Clock size={16} />}
                                                </div>
                                                <div className="flex-1 pt-1">
                                                    <p className="font-bold text-slate-800 text-sm">Printing</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        {order.orderStatus === 'printing' ? 'Currently printing...' :
                                                            ['printed', 'ready', 'assigned-for-delivery', 'picked-up', 'in-transit', 'delivered'].includes(order.orderStatus) ? 'Printing completed' : 'Not started'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Step 4: Quality Check */}
                                            <div className="relative flex items-start gap-4">
                                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center z-10 ${['ready', 'assigned-for-delivery', 'picked-up', 'in-transit', 'delivered'].includes(order.orderStatus) ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                                    <CheckCircle size={16} />
                                                </div>
                                                <div className="flex-1 pt-1">
                                                    <p className="font-bold text-slate-800 text-sm">Quality Check</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        {['ready', 'assigned-for-delivery', 'picked-up', 'in-transit', 'delivered'].includes(order.orderStatus) ? 'Verified and ready' : 'Pending'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Step 5: Ready for Pickup */}
                                            <div className="relative flex items-start gap-4">
                                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center z-10 ${['assigned-for-delivery', 'picked-up', 'in-transit', 'delivered'].includes(order.orderStatus) ? 'bg-green-500 text-white' : order.orderStatus === 'ready' ? 'bg-amber-500 text-white animate-pulse' : 'bg-slate-200 text-slate-400'}`}>
                                                    {['assigned-for-delivery', 'picked-up', 'in-transit', 'delivered'].includes(order.orderStatus) ? <CheckCircle size={16} /> : <Package size={16} />}
                                                </div>
                                                <div className="flex-1 pt-1">
                                                    <p className="font-bold text-slate-800 text-sm">Ready for Pickup</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        {order.orderStatus === 'ready' ? 'Waiting for rider assignment' :
                                                            ['assigned-for-delivery', 'picked-up', 'in-transit', 'delivered'].includes(order.orderStatus) ? 'Rider assigned' : 'Not ready'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Step 6: Out for Delivery */}
                                            <div className="relative flex items-start gap-4">
                                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center z-10 ${['in-transit', 'delivered'].includes(order.orderStatus) ? 'bg-green-500 text-white' : ['assigned-for-delivery', 'picked-up'].includes(order.orderStatus) ? 'bg-purple-500 text-white animate-pulse' : 'bg-slate-200 text-slate-400'}`}>
                                                    {['in-transit', 'delivered'].includes(order.orderStatus) ? <CheckCircle size={16} /> : <Truck size={16} />}
                                                </div>
                                                <div className="flex-1 pt-1">
                                                    <p className="font-bold text-slate-800 text-sm">Out for Delivery</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        {order.orderStatus === 'in-transit' ? 'On the way to customer' :
                                                            order.orderStatus === 'delivered' ? 'Delivered successfully' :
                                                                order.orderStatus === 'picked-up' ? 'Picked up from shop' : 'Not dispatched'}
                                                    </p>
                                                    {order.assignedDeliveryPerson && (
                                                        <p className="text-xs text-indigo-600 mt-1 font-medium">
                                                            Rider: {order.assignedDeliveryPerson.name || 'Assigned'}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Step 7: Delivered */}
                                            <div className="relative flex items-start gap-4">
                                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center z-10 ${order.orderStatus === 'delivered' ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                                    <CheckCircle size={16} />
                                                </div>
                                                <div className="flex-1 pt-1">
                                                    <p className="font-bold text-slate-800 text-sm">Delivered</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        {order.orderStatus === 'delivered' ? formatDate(order.deliveryTime || order.actualDelivery) : 'Not delivered yet'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: AUDIT TRAIL */}
                    {activeTab === 'timeline' && (
                        <div className="space-y-6 animate-fade-in">
                            {/* Audit Logs (Admin Actions) */}
                            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                        <Clock size={16} className="text-indigo-600" /> Admin Actions & Audit Trail
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1">All manual interventions and system changes</p>
                                </div>
                                <div className="p-6">
                                    {order.auditLog && order.auditLog.length > 0 ? (
                                        <div className="space-y-4">
                                            {order.auditLog.slice().reverse().map((log, index) => (
                                                <div key={index} className="flex gap-4 pb-4 border-b border-slate-100 last:border-0">
                                                    <div className="flex-shrink-0">
                                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                            <Clock size={16} />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <p className="font-bold text-slate-800 text-sm">{log.action || 'Action'}</p>
                                                                <p className="text-slate-600 text-sm mt-1">{log.details}</p>
                                                                {log.performedByName && (
                                                                    <p className="text-xs text-indigo-600 mt-1 font-medium">
                                                                        By: {log.performedByName}
                                                                    </p>
                                                                )}
                                                                {log.reason && (
                                                                    <p className="text-xs text-slate-500 mt-1 italic">
                                                                        Reason: {log.reason}
                                                                    </p>
                                                                )}
                                                                {(log.previousValue || log.newValue) && (
                                                                    <p className="text-xs text-slate-500 mt-1">
                                                                        Changed from: <span className="font-mono bg-slate-100 px-1 rounded">{log.previousValue || 'N/A'}</span> → <span className="font-mono bg-slate-100 px-1 rounded">{log.newValue || 'N/A'}</span>
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <span className="text-xs text-slate-400 whitespace-nowrap ml-4">
                                                                {formatDate(log.timestamp)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-center text-slate-400 py-8">No admin actions recorded yet</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: FINANCIALS */}
                    {activeTab === 'financials' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                        <DollarSign size={16} className="text-indigo-600" /> Financial Breakdown
                                    </h3>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={showNetSplit}
                                            onChange={(e) => setShowNetSplit(e.target.checked)}
                                            className="w-4 h-4 text-indigo-600 rounded"
                                        />
                                        <span className="text-sm font-medium text-slate-600">Show Net Split</span>
                                    </label>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                        <span className="text-slate-600">Order Value</span>
                                        <span className="font-bold text-slate-800 text-lg">₹{order.totalAmount?.toFixed(2)}</span>
                                    </div>

                                    {showNetSplit && (
                                        <div className="bg-indigo-50 rounded-lg p-4 space-y-4 border border-indigo-100">
                                            <div className="flex justify-between items-center">
                                                <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Revenue Split</p>
                                                <p className="text-xs text-slate-500 italic">Admin configurable</p>
                                            </div>

                                            {/* Shop Payout */}
                                            <div className="bg-white rounded-lg p-3 border border-slate-200">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-medium text-slate-700">Shop Payout</span>
                                                    <span className="font-bold text-slate-800">
                                                        ₹{(order.financials?.shopPayout || (order.totalAmount * 0.8)).toFixed(2)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500">
                                                    {order.financials?.shopPayout
                                                        ? `${((order.financials.shopPayout / order.totalAmount) * 100).toFixed(1)}% of order value`
                                                        : '80% of order value (default)'}
                                                </p>
                                            </div>

                                            {/* Platform Commission */}
                                            <div className="bg-white rounded-lg p-3 border border-slate-200">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-medium text-slate-700">Platform Commission</span>
                                                    <span className="font-bold text-emerald-600">
                                                        ₹{(order.financials?.platformCommission || (order.totalAmount * 0.2)).toFixed(2)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500">
                                                    {order.financials?.platformCommission
                                                        ? `${((order.financials.platformCommission / order.totalAmount) * 100).toFixed(1)}% of order value`
                                                        : '20% of order value (default)'}
                                                </p>
                                            </div>

                                            {/* Delivery Fee */}
                                            <div className="bg-white rounded-lg p-3 border border-slate-200">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-medium text-slate-700">Delivery Fee</span>
                                                    <span className="font-bold text-slate-800">
                                                        ₹{(order.deliveryCharge || 0).toFixed(2)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500">
                                                    {order.financials?.deliveryFee
                                                        ? 'Admin configured'
                                                        : 'Based on distance/zone'}
                                                </p>
                                            </div>

                                            {/* Net Revenue */}
                                            <div className="bg-indigo-100 rounded-lg p-3 border-2 border-indigo-300">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-bold text-indigo-800">Net Revenue (Platform)</span>
                                                    <span className="font-bold text-indigo-700 text-lg">
                                                        ₹{(order.financials?.netRevenue || (order.totalAmount * 0.2)).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Note */}
                                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                                <p className="text-xs text-amber-700">
                                                    <strong>Note:</strong> These values are set during order creation based on system configuration.
                                                    Contact super admin to modify revenue split percentages.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center py-3">
                                        <span className="text-slate-600">Payment Method</span>
                                        <span className="font-medium text-slate-800 uppercase">{order.paymentMethod}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3">
                                        <span className="text-slate-600">Payment Status</span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${order.paymentStatus === 'completed' ? 'bg-green-100 text-green-700' : order.paymentStatus === 'refunded' ? 'bg-rose-100 text-rose-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {order.paymentStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: ACTIONS */}
                    {activeTab === 'actions' && (
                        <div className="space-y-6 animate-fade-in">
                            {/* Check if actions are allowed */}
                            {['delivered', 'cancelled', 'out_for_delivery', 'in-transit', 'picked-up'].includes(order.orderStatus) ? (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
                                    <AlertCircle size={48} className="mx-auto text-amber-500 mb-4" />
                                    <h3 className="text-lg font-bold text-amber-800 mb-2">Actions Not Available</h3>
                                    <p className="text-sm text-amber-700">
                                        {order.orderStatus === 'delivered' && 'This order has been delivered. No further actions can be taken.'}
                                        {order.orderStatus === 'cancelled' && 'This order has been cancelled. No further actions can be taken.'}
                                        {['out_for_delivery', 'in-transit', 'picked-up'].includes(order.orderStatus) && 'Order is out for delivery. Cannot reassign at this stage. Contact delivery partner if needed.'}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Reassign Shop */}
                                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                                <RefreshCw size={16} className="text-indigo-600" /> Reassign Shop
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-1">Transfer order to a different operator/shop</p>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">New Shop ID</label>
                                                <input
                                                    type="text"
                                                    value={reassignShopId}
                                                    onChange={(e) => setReassignShopId(e.target.value)}
                                                    placeholder="Enter operator/shop ID"
                                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                                <p className="text-xs text-slate-500 mt-1">
                                                    💡 Tip: Get operator IDs from the Operators page
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">Reason <span className="text-rose-500">*</span></label>
                                                <textarea
                                                    value={reassignReason}
                                                    onChange={(e) => setReassignReason(e.target.value)}
                                                    placeholder="e.g., Shop A printer broken, Shop A rejected order"
                                                    rows={3}
                                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>
                                            <button
                                                onClick={handleReassign}
                                                disabled={actionLoading || !reassignShopId || !reassignReason}
                                                className="w-full px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {actionLoading ? 'Reassigning...' : 'Reassign Order'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Refund Manager */}
                                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                                <DollarSign size={16} className="text-rose-600" /> Issue Refund
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-1">Refund amount to user's wallet</p>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            {order.paymentStatus === 'refunded' ? (
                                                <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 text-center">
                                                    <XCircle size={24} className="mx-auto text-rose-500 mb-2" />
                                                    <p className="text-sm font-medium text-rose-700">This order has already been refunded</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-2">Refund Type</label>
                                                        <div className="flex gap-4">
                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    value="FULL"
                                                                    checked={refundType === 'FULL'}
                                                                    onChange={(e) => setRefundType(e.target.value)}
                                                                    className="w-4 h-4 text-indigo-600"
                                                                />
                                                                <span className="text-sm text-slate-700">Full Refund</span>
                                                            </label>
                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    value="PARTIAL"
                                                                    checked={refundType === 'PARTIAL'}
                                                                    onChange={(e) => setRefundType(e.target.value)}
                                                                    className="w-4 h-4 text-indigo-600"
                                                                />
                                                                <span className="text-sm text-slate-700">Partial Refund</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                    {refundType === 'PARTIAL' && (
                                                        <div>
                                                            <label className="block text-sm font-medium text-slate-700 mb-2">Amount (₹)</label>
                                                            <input
                                                                type="number"
                                                                value={refundAmount}
                                                                onChange={(e) => setRefundAmount(e.target.value)}
                                                                placeholder="Enter amount"
                                                                max={order.totalAmount}
                                                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                            />
                                                            <p className="text-xs text-slate-500 mt-1">
                                                                Max: ₹{order.totalAmount?.toFixed(2)}
                                                            </p>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-2">Reason <span className="text-rose-500">*</span></label>
                                                        <textarea
                                                            value={refundReason}
                                                            onChange={(e) => setRefundReason(e.target.value)}
                                                            placeholder="e.g., Poor binding quality, Pages missing, Customer complaint"
                                                            rows={3}
                                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={handleRefund}
                                                        disabled={actionLoading || !refundReason || (refundType === 'PARTIAL' && !refundAmount)}
                                                        className="w-full px-4 py-2 bg-rose-600 text-white font-medium rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {actionLoading ? 'Processing...' : `Issue ${refundType} Refund`}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;
