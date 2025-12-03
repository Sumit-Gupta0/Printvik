import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Store, Wallet, ShieldCheck, Check, AlertTriangle, FileText, ExternalLink } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function OperatorModal({ isOpen, onClose, operator, onUpdate }) {
    if (!isOpen || !operator) return null;

    const [activeTab, setActiveTab] = useState('details');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        shopDetails: {
            shopName: '',
            ownerName: '',
            address: '',
            openingTime: '',
            closingTime: ''
        },
        financials: {
            commissionRate: 10,
            bankDetails: {
                accountName: '',
                accountNumber: '',
                ifsc: '',
                bankName: ''
            }
        },
        status: {
            isOnline: false,
            isBlocked: false
        }
    });

    useEffect(() => {
        if (operator) {
            setFormData({
                shopDetails: {
                    shopName: operator.shopDetails?.shopName || operator.name || '',
                    ownerName: operator.shopDetails?.ownerName || operator.name || '',
                    address: operator.shopDetails?.address || operator.address?.city || '',
                    openingTime: operator.shopDetails?.openingTime || '09:00',
                    closingTime: operator.shopDetails?.closingTime || '21:00'
                },
                financials: {
                    commissionRate: operator.financials?.commissionRate || 10,
                    bankDetails: {
                        accountName: operator.financials?.bankDetails?.accountName || '',
                        accountNumber: operator.financials?.bankDetails?.accountNumber || '',
                        ifsc: operator.financials?.bankDetails?.ifsc || '',
                        bankName: operator.financials?.bankDetails?.bankName || ''
                    }
                },
                status: {
                    isOnline: operator.status?.isOnline || false,
                    isBlocked: operator.status?.isBlocked || false
                }
            });
        }
    }, [operator]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${API_URL}/admin/users/${operator._id}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                onUpdate(response.data.data.user);
                onClose();
            }
        } catch (error) {
            console.error('Error updating operator:', error);
            alert('Failed to update operator');
        } finally {
            setLoading(false);
        }
    };

    const handleKYCAction = async (status, reason = '') => {
        if (!confirm(`Are you sure you want to ${status} this operator's KYC?`)) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/admin/users/${operator._id}/kyc-verify`,
                { status, rejectionReason: reason },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                onUpdate(response.data.data.user);
                // Don't close modal, just refresh data
            }
        } catch (error) {
            console.error('Error verifying KYC:', error);
            alert('Failed to verify KYC');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Business Configuration</h2>
                        <p className="text-sm text-slate-500">Manage settings for {operator.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100 px-6">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'details' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Store size={18} /> Shop Details
                    </button>
                    <button
                        onClick={() => setActiveTab('financials')}
                        className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'financials' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Wallet size={18} /> Financial Settings
                    </button>
                    <button
                        onClick={() => setActiveTab('kyc')}
                        className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'kyc' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <ShieldCheck size={18} /> KYC & Documents
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'details' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Basic Info</h3>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Shop Name</label>
                                    <input
                                        type="text"
                                        value={formData.shopDetails.shopName}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            shopDetails: { ...formData.shopDetails, shopName: e.target.value }
                                        })}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Owner Name</label>
                                    <input
                                        type="text"
                                        value={formData.shopDetails.ownerName}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            shopDetails: { ...formData.shopDetails, ownerName: e.target.value }
                                        })}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                                    <textarea
                                        value={formData.shopDetails.address}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            shopDetails: { ...formData.shopDetails, address: e.target.value }
                                        })}
                                        rows="3"
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Timings</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Opening Time</label>
                                        <input
                                            type="time"
                                            value={formData.shopDetails.openingTime}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                shopDetails: { ...formData.shopDetails, openingTime: e.target.value }
                                            })}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Closing Time</label>
                                        <input
                                            type="time"
                                            value={formData.shopDetails.closingTime}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                shopDetails: { ...formData.shopDetails, closingTime: e.target.value }
                                            })}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'financials' && (
                        <div className="space-y-6">
                            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-indigo-600 font-medium">Pending Payout</p>
                                    <p className="text-2xl font-bold text-indigo-900">₹{operator.financials?.pendingPayout?.toLocaleString() || '0'}</p>
                                </div>
                                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                                    Process Payout
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Commercials</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Commission Rate (%)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={formData.financials.commissionRate}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    financials: { ...formData.financials, commissionRate: parseFloat(e.target.value) }
                                                })}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">%</span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">Platform fee charged on every order.</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Bank Details</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Account Number</label>
                                        <input
                                            type="text"
                                            value={formData.financials.bankDetails.accountNumber}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                financials: { ...formData.financials, bankDetails: { ...formData.financials.bankDetails, accountNumber: e.target.value } }
                                            })}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">IFSC Code</label>
                                        <input
                                            type="text"
                                            value={formData.financials.bankDetails.ifsc}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                financials: { ...formData.financials, bankDetails: { ...formData.financials.bankDetails, ifsc: e.target.value } }
                                            })}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-mono uppercase"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'kyc' && (
                        <div className="space-y-6">
                            <div className={`p-4 rounded-xl border ${operator.kyc?.isVerified
                                ? 'bg-emerald-50 border-emerald-100'
                                : operator.kyc?.rejectionReason
                                    ? 'bg-rose-50 border-rose-100'
                                    : 'bg-amber-50 border-amber-100'
                                }`}>
                                <div className="flex items-center gap-3">
                                    {operator.kyc?.isVerified ? (
                                        <Check className="text-emerald-600" size={24} />
                                    ) : operator.kyc?.rejectionReason ? (
                                        <AlertTriangle className="text-rose-600" size={24} />
                                    ) : (
                                        <AlertTriangle className="text-amber-600" size={24} />
                                    )}
                                    <div>
                                        <p className={`font-bold ${operator.kyc?.isVerified ? 'text-emerald-800' : operator.kyc?.rejectionReason ? 'text-rose-800' : 'text-amber-800'
                                            }`}>
                                            {operator.kyc?.isVerified ? 'KYC Verified' : operator.kyc?.rejectionReason ? 'KYC Rejected' : 'KYC Pending'}
                                        </p>
                                        {operator.kyc?.rejectionReason && (
                                            <p className="text-sm text-rose-600 mt-1">Reason: {operator.kyc.rejectionReason}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { key: 'aadhaarUrl', label: 'Aadhaar', required: true },
                                    { key: 'panUrl', label: 'PAN', required: true },
                                    { key: 'gstUrl', label: 'GST', required: false }
                                ].map((doc) => (
                                    <div key={doc.key} className="border border-slate-200 rounded-xl p-4 hover:border-indigo-200 transition-colors">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-slate-700 capitalize">{doc.label}</span>
                                                {!doc.required && (
                                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">Optional</span>
                                                )}
                                            </div>
                                            {operator.kyc?.[doc.key] ? (
                                                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md font-medium">Uploaded</span>
                                            ) : (
                                                <span className={`text-xs px-2 py-1 rounded-md font-medium ${doc.required ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                                                    {doc.required ? 'Missing' : 'Not uploaded'}
                                                </span>
                                            )}
                                        </div>
                                        {operator.kyc?.[doc.key] ? (
                                            <a
                                                href={operator.kyc[doc.key]}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center h-32 bg-slate-50 rounded-lg border border-dashed border-slate-300 hover:bg-slate-100 transition-colors group"
                                            >
                                                <div className="text-center">
                                                    <FileText className="mx-auto text-slate-400 mb-2 group-hover:text-indigo-500 transition-colors" size={24} />
                                                    <span className="text-xs text-slate-500 group-hover:text-indigo-600 flex items-center gap-1">
                                                        View Document <ExternalLink size={10} />
                                                    </span>
                                                </div>
                                            </a>
                                        ) : (
                                            <div className="flex items-center justify-center h-32 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                                                <span className="text-xs text-slate-400">No document</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {!operator.kyc?.isVerified && (
                                <div className="flex gap-3 pt-4 border-t border-slate-100">
                                    <button
                                        onClick={() => handleKYCAction('approved')}
                                        className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                                    >
                                        Approve KYC
                                    </button>
                                    <button
                                        onClick={() => {
                                            const reason = prompt('Enter rejection reason:');
                                            if (reason) handleKYCAction('rejected', reason);
                                        }}
                                        className="flex-1 py-3 bg-white border border-rose-200 text-rose-600 rounded-xl font-bold hover:bg-rose-50 transition-colors"
                                    >
                                        Reject KYC
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}
