/**
 * Admin Orders Page with CRUD + Bulk Operations + Export + Live Auto-Refresh
 */

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, ChevronDown, Eye, Edit, Trash2, CheckSquare, Square, X, Printer, Package, Truck, Download, FileText, Briefcase, RefreshCw, Users, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import OrderDetailsModal from '../components/OrderDetailsModal';
import PickListModal from '../components/PickListModal';
import { io } from 'socket.io-client';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [liveRefreshEnabled, setLiveRefreshEnabled] = useState(true);


    // New Filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [sortBy, setSortBy] = useState('latest'); // latest, oldest, amount-high, amount-low

    // Bulk Selection
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    // Action states
    const [editingOrder, setEditingOrder] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPickListModal, setShowPickListModal] = useState(false);
    const [selectedPickListOrder, setSelectedPickListOrder] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Bulk Assign states
    const [showBulkAssignOperator, setShowBulkAssignOperator] = useState(false);
    const [showBulkAssignRider, setShowBulkAssignRider] = useState(false);
    const [bulkAssignOperatorId, setBulkAssignOperatorId] = useState('');
    const [bulkAssignRiderId, setBulkAssignRiderId] = useState('');

    // Dropdown lists
    const [operators, setOperators] = useState([]);
    const [riders, setRiders] = useState([]);

    useEffect(() => {
        fetchOrders();
        fetchOperators();
        fetchRiders();

        // Socket.io Live Auto-Refresh
        if (liveRefreshEnabled) {
            const socket = io(SOCKET_URL, {
                transports: ['websocket', 'polling']
            });

            socket.on('connect', () => {
                console.log('✅ Connected to live order updates');
            });

            socket.on('order:created', (newOrder) => {
                console.log('🆕 New order received:', newOrder.orderNumber);
                setOrders(prevOrders => [newOrder, ...prevOrders]);
            });

            socket.on('order:updated', (updatedOrder) => {
                console.log('🔄 Order updated:', updatedOrder.orderNumber);
                setOrders(prevOrders =>
                    prevOrders.map(order =>
                        order._id === updatedOrder._id ? updatedOrder : order
                    )
                );
            });

            socket.on('disconnect', () => {
                console.log('❌ Disconnected from live updates');
            });

            return () => {
                socket.disconnect();
            };
        }
    }, [liveRefreshEnabled]);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/admin/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(response.data.data.orders);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOperators = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/admin/users?role=operator`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOperators(response.data.data?.users || []);
        } catch (error) {
            console.error('Error fetching operators:', error);
        }
    };

    const fetchRiders = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/admin/users?role=delivery_boy`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRiders(response.data.data?.users || []);
        } catch (error) {
            console.error('Error fetching riders:', error);
        }
    };

    const handleEdit = (order) => {
        setEditingOrder({ ...order });
        setShowEditModal(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            // We use the status update endpoint for status changes, or the general update for other details
            // For simplicity, we'll use the general update endpoint we just created
            const response = await axios.put(`${API_URL}/admin/orders/${editingOrder._id}`, editingOrder, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update local state with server response
            const updatedOrder = response.data.data.order;
            setOrders(orders.map(o => o._id === updatedOrder._id ? updatedOrder : o));
            setShowEditModal(false);
            setEditingOrder(null);
        } catch (error) {
            console.error('Error updating order:', error);
            alert('Failed to update order');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (orderId) => {
        if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;

        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/admin/orders/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Remove from local state
            setOrders(orders.filter(o => o._id !== orderId));
        } catch (error) {
            console.error('Error deleting order:', error);
            alert('Failed to delete order');
        } finally {
            setActionLoading(false);
        }
    };

    // Bulk Selection Handlers
    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedOrders([]);
            setSelectAll(false);
        } else {
            setSelectedOrders(filteredOrders.map(o => o._id));
            setSelectAll(true);
        }
    };

    const handleToggleSelect = (orderId) => {
        if (selectedOrders.includes(orderId)) {
            setSelectedOrders(selectedOrders.filter(id => id !== orderId));
        } else {
            setSelectedOrders([...selectedOrders, orderId]);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedOrders.length === 0) {
            alert('Please select orders to delete');
            return;
        }

        if (!window.confirm(`Are you sure you want to delete ${selectedOrders.length} orders? This action cannot be undone.`)) return;

        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            await Promise.all(
                selectedOrders.map(orderId =>
                    axios.delete(`${API_URL}/admin/orders/${orderId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                )
            );

            // Remove from local state
            setOrders(orders.filter(o => !selectedOrders.includes(o._id)));
            setSelectedOrders([]);
            setSelectAll(false);
            alert(`Successfully deleted ${selectedOrders.length} orders`);
        } catch (error) {
            console.error('Error bulk deleting orders:', error);
            alert('Failed to delete some orders');
        } finally {
            setActionLoading(false);
        }
    };

    // Bulk Assign to Operator
    const handleBulkAssignOperator = async () => {
        if (!bulkAssignOperatorId) {
            alert('Please enter operator ID');
            return;
        }

        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            await Promise.all(
                selectedOrders.map(orderId =>
                    axios.put(`${API_URL}/admin/orders/${orderId}`, {
                        assignedOperator: bulkAssignOperatorId,
                        shopStatus: 'assigned'
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                )
            );

            alert(`Successfully assigned ${selectedOrders.length} orders to operator`);
            setShowBulkAssignOperator(false);
            setBulkAssignOperatorId('');
            setSelectedOrders([]);
            setSelectAll(false);
            fetchOrders(); // Refresh list
        } catch (error) {
            console.error('Error bulk assigning to operator:', error);
            alert('Failed to assign some orders');
        } finally {
            setActionLoading(false);
        }
    };

    // Bulk Assign to Delivery Boy
    const handleBulkAssignRider = async () => {
        if (!bulkAssignRiderId) {
            alert('Please enter rider ID');
            return;
        }

        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            await Promise.all(
                selectedOrders.map(orderId =>
                    axios.post(`${API_URL}/admin/assign-delivery`, {
                        orderId,
                        riderId: bulkAssignRiderId
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                )
            );

            alert(`Successfully assigned ${selectedOrders.length} orders to delivery boy`);
            setShowBulkAssignRider(false);
            setBulkAssignRiderId('');
            setSelectedOrders([]);
            setSelectAll(false);
            fetchOrders(); // Refresh list
        } catch (error) {
            console.error('Error bulk assigning to rider:', error);
            alert('Failed to assign some orders');
        } finally {
            setActionLoading(false);
        }
    };

    // Export Functions
    const prepareCSVData = () => {
        const ordersToExport = selectedOrders.length > 0
            ? filteredOrders.filter(o => selectedOrders.includes(o._id))
            : filteredOrders;

        return ordersToExport.map(order => ({
            'Order Number': order.orderNumber,
            'Customer Name': order.userId?.name || 'Unknown',
            'Customer Email': order.userId?.email || '',
            'Customer Phone': order.userId?.phone || '',
            'Order Status': order.orderStatus,
            'Delivery Status': order.deliveryStatus || 'N/A',
            'Delivery Option': order.deliveryOption,
            'Payment Method': order.paymentMethod,
            'Payment Status': order.paymentStatus,
            'Total Amount': order.totalAmount,
            'Created Date': new Date(order.createdAt).toLocaleString(),
            'Delivery Address': order.deliveryAddress ?
                `${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.pincode}` :
                'N/A'
        }));
    };

    const exportToPDF = () => {
        const ordersToExport = selectedOrders.length > 0
            ? filteredOrders.filter(o => selectedOrders.includes(o._id))
            : filteredOrders;

        const doc = new jsPDF();

        // Title
        doc.setFontSize(18);
        doc.text('Orders Report', 14, 22);

        // Metadata
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
        doc.text(`Total Orders: ${ordersToExport.length}`, 14, 36);

        // Table
        const tableData = ordersToExport.map(order => [
            order.orderNumber,
            order.userId?.name || 'Unknown',
            order.orderStatus,
            order.paymentMethod,
            order.paymentStatus,
            `₹${order.totalAmount}`,
            new Date(order.createdAt).toLocaleDateString()
        ]);

        doc.autoTable({
            head: [['Order #', 'Customer', 'Status', 'Payment', 'Pay Status', 'Amount', 'Date']],
            body: tableData,
            startY: 42,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [79, 70, 229] }
        });

        doc.save(`orders-${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const generateShippingLabel = (order) => {
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'in',
            format: [4, 6]
        });

        // Border
        doc.setLineWidth(0.02);
        doc.rect(0.1, 0.1, 5.8, 3.8);

        // Header
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('PRINTVIK EXPRESS', 0.3, 0.5);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Order #${order.orderNumber}`, 4.0, 0.5);

        doc.line(0.1, 0.7, 5.9, 0.7);

        // From Address
        doc.setFontSize(8);
        doc.text('FROM:', 0.3, 1.0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('PrintVik Warehouse', 0.3, 1.2);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text('123, Industrial Area, Phase 1', 0.3, 1.4);
        doc.text('New Delhi, 110020', 0.3, 1.55);
        doc.text('Phone: +91 98765 43210', 0.3, 1.7);

        // To Address
        doc.setFontSize(8);
        doc.text('TO:', 3.0, 1.0);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(order.userId?.name || 'Customer', 3.0, 1.2);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        // Handle delivery address safely
        if (order.deliveryAddress) {
            doc.text(order.deliveryAddress.addressLine1 || '', 3.0, 1.4);
            doc.text(`${order.deliveryAddress.city || ''}, ${order.deliveryAddress.state || ''}`, 3.0, 1.55);
            doc.text(`PIN: ${order.deliveryAddress.pincode || ''}`, 3.0, 1.7);
            doc.text(`Phone: ${order.deliveryAddress.phone || order.userId?.phone || ''}`, 3.0, 1.85);
        } else {
            doc.text('Pickup Order - No Address', 3.0, 1.4);
        }

        doc.line(0.1, 2.1, 5.9, 2.1);

        // Order Details
        doc.setFontSize(9);
        doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 0.3, 2.4);
        doc.text(`Payment: ${order.paymentMethod.toUpperCase()}`, 2.0, 2.4);
        doc.text(`Weight: 0.5 kg (Approx)`, 4.0, 2.4);

        // Barcode Placeholder (just a rectangle for now)
        doc.rect(0.3, 2.7, 5.4, 0.8);
        doc.setFontSize(12);
        doc.text(order.orderNumber, 2.2, 3.2);

        // Open in new tab for printing
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');
    };

    const generateJobCard = (order) => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('PRINT JOB CARD', 105, 20, null, null, 'center');

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Order #${order.orderNumber}`, 105, 30, null, null, 'center');
        doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`, 105, 38, null, null, 'center');

        doc.line(14, 45, 196, 45);

        // Customer Info
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Customer Details:', 14, 55);
        doc.setFont('helvetica', 'normal');
        doc.text(`Name: ${order.userId?.name || 'Unknown'}`, 14, 62);
        doc.text(`Phone: ${order.userId?.phone || 'N/A'}`, 14, 69);

        // Job Specs
        doc.setFont('helvetica', 'bold');
        doc.text('Job Specifications:', 14, 85);
        doc.setFont('helvetica', 'normal');

        const specs = order.specifications || {};
        const details = [
            `Color Mode: ${specs.colorType === 'bw' ? 'Black & White' : 'Color'}`,
            `Paper Size: ${specs.paperSize || 'A4'}`,
            `Copies: ${specs.copies || 1}`,
            `Binding: ${specs.binding || 'None'}`,
            `Total Pages: ${specs.pages || 'Auto-calc'}`
        ];

        let y = 92;
        details.forEach(detail => {
            doc.text(`• ${detail}`, 20, y);
            y += 7;
        });

        // Files
        doc.setFont('helvetica', 'bold');
        doc.text('Files to Print:', 14, y + 10);
        doc.setFont('helvetica', 'normal');

        y += 17;
        if (order.documents && order.documents.length > 0) {
            order.documents.forEach((docFile, index) => {
                doc.text(`${index + 1}. ${docFile.filename || 'Untitled'} (${docFile.pageCount || '?'} pages)`, 20, y);
                y += 7;
            });
        } else {
            doc.text('No files attached', 20, y);
        }

        // Instructions
        if (order.instructions) {
            y += 10;
            doc.setFont('helvetica', 'bold');
            doc.text('Special Instructions:', 14, y);
            doc.setFont('helvetica', 'normal');
            doc.text(order.instructions, 14, y + 7, { maxWidth: 180 });
        }

        // Footer
        doc.setFontSize(10);
        doc.text('Operator Signature: ___________________', 14, 280);
        doc.text('QC Checked: ___________________', 120, 280);

        // Open in new tab
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');
    };

    const handleDownloadFiles = (order) => {
        if (!order.documents || order.documents.length === 0) {
            alert('No files to download');
            return;
        }

        // Download each file
        order.documents.forEach(doc => {
            const link = document.createElement('a');
            link.href = doc.url;
            link.download = doc.filename || `order-${order.orderNumber}-file`;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    };

    const [orderType, setOrderType] = useState('service');

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'badge-warning',
            processing: 'badge-info',
            printed: 'badge-info',
            delivered: 'badge-success',
            cancelled: 'badge-error'
        };
        return <span className={`badge ${styles[status] || 'badge-secondary'}`}>{status}</span>;
    };

    // Filter by Type first
    const filteredByType = orders.filter(order => {
        if (orderType === 'service') {
            // Show if explicit service type OR (legacy: has documents AND no items)
            return order.orderType === 'service' ||
                (order.orderType === 'mixed') ||
                (!order.orderType && order.documents?.length > 0);
        }
        if (orderType === 'product') {
            // Show if explicit product type OR (legacy: has items)
            return order.orderType === 'product' ||
                (order.orderType === 'mixed') ||
                (order.items?.length > 0);
        }
        return true;
    });

    const filteredOrders = filteredByType.filter(order => {
        const matchesStatus = filter === 'all' || order.orderStatus === filter;
        const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase());

        // Date Filter
        let matchesDate = true;
        if (startDate) {
            matchesDate = matchesDate && new Date(order.createdAt) >= new Date(startDate);
        }
        if (endDate) {
            // Set end date to end of day
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            matchesDate = matchesDate && new Date(order.createdAt) <= end;
        }

        // Payment Filter
        const matchesPayment = paymentFilter === 'all' || order.paymentMethod === paymentFilter;

        return matchesStatus && matchesSearch && matchesDate && matchesPayment;
    }).sort((a, b) => {
        // Apply sorting
        switch (sortBy) {
            case 'latest':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'oldest':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'amount-high':
                return b.totalAmount - a.totalAmount;
            case 'amount-low':
                return a.totalAmount - b.totalAmount;
            default:
                return new Date(b.createdAt) - new Date(a.createdAt);
        }
    });

    return (
        <>
            {/* Filters & Actions */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-6 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96 group">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search orders by ID or customer..."
                            className="input pl-11 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        {/* Live Refresh Toggle */}
                        <button
                            onClick={() => setLiveRefreshEnabled(!liveRefreshEnabled)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${liveRefreshEnabled
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}
                            title={liveRefreshEnabled ? 'Live refresh enabled' : 'Live refresh disabled'}
                        >
                            <RefreshCw size={18} className={liveRefreshEnabled ? 'animate-spin-slow' : ''} />
                            <span className="text-sm">{liveRefreshEnabled ? 'Live' : 'Manual'}</span>
                        </button>

                        {/* Bulk Actions - Show when items selected */}
                        {selectedOrders.length > 0 && (
                            <div className="flex items-center gap-3 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-xl">
                                <span className="text-sm font-medium text-indigo-700">
                                    {selectedOrders.length} selected
                                </span>

                                {/* Bulk Assign to Operator */}
                                <button
                                    onClick={() => setShowBulkAssignOperator(true)}
                                    className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center gap-1.5"
                                >
                                    <Users size={16} />
                                    Assign to Operator
                                </button>

                                {/* Bulk Assign to Delivery Boy */}
                                <button
                                    onClick={() => setShowBulkAssignRider(true)}
                                    className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors flex items-center gap-1.5"
                                >
                                    <Truck size={16} />
                                    Assign to Rider
                                </button>

                                <button
                                    onClick={handleBulkDelete}
                                    className="px-3 py-1.5 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600 transition-colors"
                                >
                                    Delete Selected
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedOrders([]);
                                        setSelectAll(false);
                                    }}
                                    className="text-slate-500 hover:text-slate-700"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        )}

                        {/* Export Dropdown */}
                        <div className="relative group">
                            <button className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all">
                                <Download size={18} />
                                Export
                            </button>

                            {/* Dropdown Menu */}
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                <CSVLink
                                    data={prepareCSVData()}
                                    filename={`orders-${new Date().toISOString().split('T')[0]}.csv`}
                                    className="flex items-center gap-2 px-4 py-3 hover:bg-slate-50 transition-colors text-slate-700 rounded-t-xl"
                                >
                                    <FileText size={16} />
                                    <span className="text-sm font-medium">Export as CSV</span>
                                </CSVLink>
                                <button
                                    onClick={exportToPDF}
                                    className="w-full flex items-center gap-2 px-4 py-3 hover:bg-slate-50 transition-colors text-slate-700 rounded-b-xl"
                                >
                                    <Download size={16} />
                                    <span className="text-sm font-medium">Export as PDF</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Advanced Filters */}
                <div className="flex flex-wrap gap-4 items-center pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-600">Sort By:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                        >
                            <option value="latest">Latest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="amount-high">Highest Amount</option>
                            <option value="amount-low">Lowest Amount</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-600">Date Range:</span>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                        />
                        <span className="text-slate-400">-</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-600">Payment:</span>
                        <select
                            value={paymentFilter}
                            onChange={(e) => setPaymentFilter(e.target.value)}
                            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                        >
                            <option value="all">All Methods</option>
                            <option value="online">Online</option>
                            <option value="cod">COD</option>
                        </select>
                    </div>

                    {(startDate || endDate || paymentFilter !== 'all' || sortBy !== 'latest') && (
                        <button
                            onClick={() => {
                                setStartDate('');
                                setEndDate('');
                                setPaymentFilter('all');
                                setSortBy('latest');
                            }}
                            className="text-sm text-rose-500 hover:text-rose-700 font-medium"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Type Tabs */}
            <div className="flex gap-4 border-b border-slate-200 mb-6">
                <button
                    onClick={() => setOrderType('service')}
                    className={`pb-3 px-1 font-medium text-sm transition-colors relative ${orderType === 'service' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Print Services
                    {orderType === 'service' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></div>
                    )}
                </button>
                <button
                    onClick={() => setOrderType('product')}
                    className={`pb-3 px-1 font-medium text-sm transition-colors relative ${orderType === 'product' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Store Products
                    {orderType === 'product' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></div>
                    )}
                </button>
            </div>

            {/* Status Tabs */}
            <div className="flex overflow-x-auto pb-2 mb-4 gap-2 no-scrollbar">
                {['all', 'pending', 'processing', 'printed', 'delivered', 'cancelled'].map((status) => {
                    const count = status === 'all'
                        ? filteredByType.length
                        : filteredByType.filter(o => o.orderStatus === status).length;

                    return (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all flex items-center gap-2 border ${filter === status
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                            <span className={`px-2 py-0.5 rounded-full text-xs ${filter === status ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                                }`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="table-container">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="font-outfit text-[10px] font-bold text-slate-500 uppercase tracking-wider py-2 px-2 text-left w-10">
                                    <button
                                        onClick={handleSelectAll}
                                        className="p-1 hover:bg-slate-200 rounded transition-colors"
                                    >
                                        {selectAll ? <CheckSquare size={16} className="text-indigo-600" /> : <Square size={16} />}
                                    </button>
                                </th>
                                <th className="font-outfit text-[10px] font-bold text-slate-500 uppercase tracking-wider py-2 px-2 text-left">Order ID</th>
                                <th className="font-outfit text-[10px] font-bold text-slate-500 uppercase tracking-wider py-2 px-2 text-left">Customer</th>
                                {orderType === 'product' ? (
                                    <th className="font-outfit text-[10px] font-bold text-slate-500 uppercase tracking-wider py-2 px-2 text-left">Items Summary</th>
                                ) : (
                                    <th className="font-outfit text-[10px] font-bold text-slate-500 uppercase tracking-wider py-2 px-2 text-left">Job Details</th>
                                )}
                                <th className="font-outfit text-[10px] font-bold text-slate-500 uppercase tracking-wider py-2 px-2 text-left">
                                    {orderType === 'product' ? 'Fulfillment' : 'Status'}
                                </th>
                                <th className="font-outfit text-[10px] font-bold text-slate-500 uppercase tracking-wider py-2 px-2 text-left">Payment</th>
                                <th className="font-outfit text-[10px] font-bold text-slate-500 uppercase tracking-wider py-2 px-2 text-left">Amount</th>
                                <th className="font-outfit text-[10px] font-bold text-slate-500 uppercase tracking-wider py-2 px-2 text-left">Date</th>
                                <th className="font-outfit text-[10px] font-bold text-slate-500 uppercase tracking-wider py-2 px-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="11" className="text-center py-12 text-slate-500"><div className="flex justify-center"><div className="spinner"></div></div></td></tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr><td colSpan="11" className="text-center py-12 text-slate-500">No orders found matching your criteria</td></tr>
                            ) : (
                                filteredOrders.map(order => {
                                    // Timer Logic: Check if order is > 4 hours old and not delivered/cancelled
                                    const isDelayed = ['pending', 'processing', 'printed'].includes(order.orderStatus) &&
                                        (new Date() - new Date(order.createdAt) > 4 * 60 * 60 * 1000);

                                    return (
                                        <tr key={order._id} className={`transition-colors group ${isDelayed ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-slate-50/80'}`}>
                                            <td className="py-2 px-2">
                                                <button
                                                    onClick={() => handleToggleSelect(order._id)}
                                                    className="p-1 hover:bg-slate-200 rounded transition-colors"
                                                >
                                                    {selectedOrders.includes(order._id) ?
                                                        <CheckSquare size={16} className="text-indigo-600" /> :
                                                        <Square size={16} className="text-slate-400" />
                                                    }
                                                </button>
                                            </td>
                                            <td className="py-2 px-2 text-xs font-medium text-indigo-600">
                                                #{order.orderNumber}
                                                {isDelayed && <span className="ml-1 text-[10px] font-bold text-red-600 animate-pulse">⚠️</span>}
                                            </td>
                                            <td className="py-2 px-2">
                                                <div className="text-xs font-semibold text-slate-800">{order.userId?.name || 'Unknown'}</div>
                                                <div className="text-[10px] text-slate-500">{order.userId?.phone || order.userId?.email}</div>
                                            </td>

                                            {/* Dynamic Column: Items Summary vs Job Details */}
                                            {orderType === 'product' ? (
                                                <td className="py-2 px-2">
                                                    <div className="text-xs text-slate-700 font-medium">
                                                        {order.items?.length || 0} Items
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 truncate max-w-[150px]">
                                                        {order.items?.map(i => i.name).join(', ')}
                                                    </div>
                                                </td>
                                            ) : (
                                                <td className="py-2 px-2">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-xs font-medium text-slate-700">
                                                            {order.documents?.length || 0} Files
                                                        </span>
                                                        <span className="text-[10px] text-slate-500">
                                                            {order.specifications?.colorType === 'bw' ? 'B&W' : 'Color'} • {order.specifications?.copies || 1} Copies
                                                        </span>
                                                    </div>
                                                </td>
                                            )}

                                            <td className="py-2 px-2">
                                                {orderType === 'product' ? (
                                                    order.deliveryOption === 'pickup' ? (
                                                        <span className="badge badge-sm badge-neutral bg-slate-100 text-slate-600 border-slate-200 text-[10px]">
                                                            Pickup
                                                        </span>
                                                    ) : (
                                                        <span className={`badge badge-sm text-[10px] ${order.deliveryStatus === 'delivered' ? 'badge-success' :
                                                            order.deliveryStatus === 'in-transit' ? 'badge-info' :
                                                                order.deliveryStatus === 'picked-up' ? 'badge-warning' :
                                                                    'badge-ghost bg-slate-100 text-slate-500'
                                                            }`}>
                                                            {order.deliveryStatus ? order.deliveryStatus.replace('-', ' ') : 'Pending'}
                                                        </span>
                                                    )
                                                ) : (
                                                    getStatusBadge(order.orderStatus)
                                                )}
                                            </td>
                                            <td className="py-2 px-2">
                                                <div className="text-[10px] font-medium text-slate-700 uppercase">{order.paymentMethod}</div>
                                                <div className={`text-[10px] ${order.paymentStatus === 'completed' ? 'text-emerald-600' :
                                                    order.paymentStatus === 'pending' ? 'text-amber-600' :
                                                        'text-rose-600'
                                                    }`}>
                                                    {order.paymentStatus}
                                                </div>
                                            </td>
                                            <td className="py-2 px-2 text-xs font-bold text-slate-700">₹{order.totalAmount}</td>
                                            <td className="py-2 px-2 text-[10px] text-slate-500">
                                                <div>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit' })}</div>
                                                <div className="text-[9px] text-slate-400">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </td>
                                            <td className="py-2 px-2 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {orderType === 'product' && (
                                                        <>
                                                            <button
                                                                onClick={() => generateShippingLabel(order)}
                                                                className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                                title="Print Shipping Label"
                                                            >
                                                                <Printer size={14} />
                                                            </button>

                                                            {/* Show Pack button only if pending */}
                                                            {order.orderStatus === 'pending' && (
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedPickListOrder(order);
                                                                        setShowPickListModal(true);
                                                                    }}
                                                                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                                    title="Pack Order"
                                                                >
                                                                    <Package size={14} />
                                                                </button>
                                                            )}

                                                            {/* Show Dispatch button only if packed (processing) */}
                                                            {order.orderStatus === 'processing' && (
                                                                <button
                                                                    onClick={() => {
                                                                        setBulkAssignRiderId(''); // Reset selection
                                                                        setSelectedOrders([order._id]); // Select just this order for assignment logic
                                                                        setShowBulkAssignRider(true); // Reuse bulk assign modal
                                                                    }}
                                                                    className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                                    title="Dispatch Order"
                                                                >
                                                                    <Truck size={14} />
                                                                </button>
                                                            )}
                                                        </>
                                                    )}

                                                    {orderType === 'service' && (
                                                        <>
                                                            {/* Assign Shop (if pending) */}
                                                            {order.orderStatus === 'pending' && (
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedOrder(order);
                                                                    }}
                                                                    className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                                    title="Assign/Reassign Shop"
                                                                >
                                                                    <Briefcase size={14} />
                                                                </button>
                                                            )}

                                                            {/* Dispatch (if printed/ready) */}
                                                            {['printed', 'ready'].includes(order.orderStatus) && (
                                                                <button
                                                                    onClick={() => {
                                                                        setBulkAssignRiderId('');
                                                                        setSelectedOrders([order._id]);
                                                                        setShowBulkAssignRider(true);
                                                                    }}
                                                                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                                    title="Dispatch (Assign Rider)"
                                                                >
                                                                    <Truck size={14} />
                                                                </button>
                                                            )}

                                                            <button
                                                                onClick={() => generateJobCard(order)}
                                                                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                                title="Print Job Card"
                                                            >
                                                                <FileText size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDownloadFiles(order)}
                                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Download Files"
                                                            >
                                                                <Download size={14} />
                                                            </button>
                                                        </>
                                                    )}

                                                    <button
                                                        onClick={() => setSelectedOrder(order)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(order)}
                                                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                        title="Edit Order"
                                                    >
                                                        <Edit size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(order._id)}
                                                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                        title="Delete Order"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                    <p className="text-sm text-slate-500">Showing <span className="font-semibold text-slate-800">{filteredOrders.length}</span> results</p>
                    <div className="flex gap-2">
                        <button className="p-2 border border-slate-200 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-50 transition-all" disabled>
                            <ChevronLeft size={18} className="text-slate-500" />
                        </button>
                        <button className="w-9 h-9 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-sm font-bold shadow-md shadow-indigo-200">1</button>
                        <button className="w-9 h-9 border border-slate-200 rounded-lg flex items-center justify-center text-sm font-medium hover:bg-white hover:text-indigo-600 hover:border-indigo-200 transition-all">2</button>
                        <button className="p-2 border border-slate-200 rounded-lg hover:bg-white hover:shadow-sm transition-all">
                            <ChevronRight size={18} className="text-slate-500" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Pick List Modal */}
            {showPickListModal && selectedPickListOrder && (
                <PickListModal
                    order={selectedPickListOrder}
                    onClose={() => {
                        setShowPickListModal(false);
                        setSelectedPickListOrder(null);
                    }}
                    onUpdateStatus={async (orderId, status) => {
                        try {
                            const token = localStorage.getItem('token');
                            await axios.put(`${API_URL}/admin/orders/${orderId}`, {
                                orderStatus: status
                            }, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            // Update local state
                            setOrders(orders.map(o => o._id === orderId ? { ...o, orderStatus: status } : o));
                        } catch (error) {
                            console.error('Error updating status:', error);
                            throw error;
                        }
                    }}
                />
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 m-4">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800 font-outfit">Edit Order</h3>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Order Status */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Order Status</label>
                                    <select
                                        value={editingOrder.orderStatus}
                                        onChange={(e) => setEditingOrder({ ...editingOrder, orderStatus: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="printed">Printed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>

                                {/* Delivery Status */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Status</label>
                                    <select
                                        value={editingOrder.deliveryStatus || 'pending'}
                                        onChange={(e) => setEditingOrder({ ...editingOrder, deliveryStatus: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                    >
                                        <option value="pending">Processing (Pending)</option>
                                        <option value="picked-up">Picked Up</option>
                                        <option value="in-transit">Out for Delivery</option>
                                        <option value="delivered">Delivered</option>
                                    </select>
                                </div>

                                {/* Payment Status */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Payment Status</label>
                                    <select
                                        value={editingOrder.paymentStatus || 'pending'}
                                        onChange={(e) => setEditingOrder({ ...editingOrder, paymentStatus: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="completed">Completed</option>
                                        <option value="failed">Failed</option>
                                        <option value="refunded">Refunded</option>
                                    </select>
                                </div>

                                {/* Payment Method */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
                                    <select
                                        value={editingOrder.paymentMethod || 'online'}
                                        onChange={(e) => setEditingOrder({ ...editingOrder, paymentMethod: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                    >
                                        <option value="online">Online (Razorpay)</option>
                                        <option value="cod">Cash on Delivery</option>
                                        <option value="wallet">Wallet</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Check size={18} />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Bulk Assign to Operator Modal */}
            {showBulkAssignOperator && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 m-4">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800 font-outfit flex items-center gap-2">
                                <Users size={24} className="text-blue-600" />
                                Bulk Assign to Operator
                            </h3>
                            <button
                                onClick={() => setShowBulkAssignOperator(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-700">
                                    <strong>{selectedOrders.length} orders</strong> will be assigned to the selected operator
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Select Operator</label>
                                <select
                                    value={bulkAssignOperatorId}
                                    onChange={(e) => setBulkAssignOperatorId(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                >
                                    <option value="">-- Select Operator --</option>
                                    {operators.map(op => (
                                        <option key={op._id} value={op._id}>
                                            {op.name} ({op.email})
                                        </option>
                                    ))}
                                </select>
                                {operators.length === 0 && (
                                    <p className="text-xs text-amber-600 mt-1">
                                        ⚠️ No operators found. Add operators first.
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowBulkAssignOperator(false)}
                                    className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBulkAssignOperator}
                                    disabled={actionLoading || !bulkAssignOperatorId}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {actionLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Check size={18} />}
                                    Assign Orders
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Assign to Rider Modal */}
            {showBulkAssignRider && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 m-4">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800 font-outfit flex items-center gap-2">
                                <Truck size={24} className="text-emerald-600" />
                                Bulk Assign to Delivery Boy
                            </h3>
                            <button
                                onClick={() => setShowBulkAssignRider(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                                <p className="text-sm text-emerald-700">
                                    <strong>{selectedOrders.length} orders</strong> will be assigned to the selected delivery boy
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Select Delivery Boy</label>
                                <select
                                    value={bulkAssignRiderId}
                                    onChange={(e) => setBulkAssignRiderId(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                >
                                    <option value="">-- Select Delivery Boy --</option>
                                    {riders.map(rider => (
                                        <option key={rider._id} value={rider._id}>
                                            {rider.name} ({rider.phone || rider.email})
                                        </option>
                                    ))}
                                </select>
                                {riders.length === 0 && (
                                    <p className="text-xs text-amber-600 mt-1">
                                        ⚠️ No delivery boys found. Add riders first.
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowBulkAssignRider(false)}
                                    className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBulkAssignRider}
                                    disabled={actionLoading || !bulkAssignRiderId}
                                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {actionLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Check size={18} />}
                                    Assign Orders
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Details Modal */}
            {selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onUpdate={fetchOrders}
                />
            )}
        </>
    );
}

export default Orders;
