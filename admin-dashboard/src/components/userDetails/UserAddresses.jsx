/**
 * @file UserAddresses.jsx
 * @module UserDetails
 * @description Displays user addresses, vehicle details (for delivery partners), and shop configuration (for operators).
 * @requires lucide-react
 */

import React from 'react';
import {
    Bike, FileCheck, Store, Printer, BookOpen, Layers, CheckCircle, Plus, Edit, Trash2, MapPin, Phone
} from 'lucide-react';

/**
 * @component UserAddresses
 * @desc Renders the addresses tab content based on user role.
 * @param {Object} props
 * @param {Object} props.user - The user object containing role, fleetInfo, shopDetails, and addresses.
 * @param {Function} props.handleDeleteAddress - Function to delete an address.
 * @returns {JSX.Element} The rendered UserAddresses component.
 */
const UserAddresses = ({ user, handleDeleteAddress }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {user?.role === 'delivery' ? (
                /* Vehicle & Docs for Delivery Partners */
                <>
                    {/* Vehicle Info */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Bike className="text-indigo-600" size={20} />
                            Vehicle Details
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Vehicle Model</p>
                                <p className="font-bold text-slate-800">{user?.fleetInfo?.vehicleModel || 'Hero Splendor Plus'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Plate Number</p>
                                <p className="font-bold text-slate-800">{user?.fleetInfo?.plateNumber || 'DL-5S-1234'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">License Number</p>
                                <p className="font-bold text-slate-800">{user?.fleetInfo?.licenseNumber || 'DL1234567890'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Documents */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <FileCheck className="text-indigo-600" size={20} />
                            Documents Verification
                        </h3>
                        <div className="space-y-3">
                            {['Driving License', 'Aadhaar Card', 'RC Book'].map((doc, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="font-medium text-slate-700">{doc}</span>
                                    <div className="flex gap-2">
                                        <button className="px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50">View</button>
                                        <button className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-100">Verify</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            ) : user?.role === 'operator' ? (
                /* Shop Config for Operators */
                <>
                    {/* Storefront Preview */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Store className="text-indigo-600" size={20} />
                            Storefront Preview
                        </h3>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-20 h-20 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                                <Store size={32} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-lg">{user?.shopDetails?.shopName || 'Print Hub'}</h4>
                                <p className="text-sm text-slate-500">{user?.shopDetails?.address || '123, Market Road, Delhi'}</p>
                                <button className="text-indigo-600 text-sm font-bold mt-1 hover:underline">Edit Details</button>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h4 className="font-bold text-slate-700 text-sm">Service Toggles</h4>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-2">
                                    <Printer size={16} className="text-indigo-600" />
                                    <span className="font-medium text-slate-700">Color Printing</span>
                                </div>
                                <div className="form-control">
                                    <input type="checkbox" className="toggle toggle-success toggle-sm" defaultChecked={true} />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-2">
                                    <BookOpen size={16} className="text-indigo-600" />
                                    <span className="font-medium text-slate-700">Binding Services</span>
                                </div>
                                <div className="form-control">
                                    <input type="checkbox" className="toggle toggle-success toggle-sm" defaultChecked={true} />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-2">
                                    <Layers size={16} className="text-indigo-600" />
                                    <span className="font-medium text-slate-700">Lamination</span>
                                </div>
                                <div className="form-control">
                                    <input type="checkbox" className="toggle toggle-sm" defaultChecked={false} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* KYC Documents */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <FileCheck className="text-indigo-600" size={20} />
                            KYC & Compliance
                        </h3>
                        <div className="space-y-3">
                            {['GST Certificate', 'Aadhaar Card', 'Shop License'].map((doc, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="font-medium text-slate-700">{doc}</span>
                                    <div className="flex gap-2">
                                        <button className="px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50">View</button>
                                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold flex items-center gap-1">
                                            <CheckCircle size={10} /> Verified
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                /* Standard Addresses for Users */
                <>
                    {/* ADD ADDRESS BUTTON */}
                    <button
                        onClick={() => alert('Add Manual Address feature - Coming soon')}
                        className="bg-white p-8 rounded-2xl border-2 border-dashed border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all group"
                    >
                        <div className="text-center">
                            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-200 transition-colors">
                                <Plus className="text-indigo-600" size={24} />
                            </div>
                            <p className="font-bold text-indigo-600">+ Add Manual Address</p>
                            <p className="text-xs text-slate-500 mt-1">For phone orders</p>
                        </div>
                    </button>

                    {!user?.addresses || user.addresses.length === 0 ? (
                        <div className="col-span-2 md:col-span-1 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center text-slate-400">
                            No addresses found
                        </div>
                    ) : (
                        user.addresses.map((addr, index) => (
                            <div key={index} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm group relative">
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    <button onClick={() => alert('Edit Address functionality')} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                                        <Edit size={16} />
                                    </button>
                                    <button onClick={() => handleDeleteAddress(addr._id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="text-indigo-600" size={20} />
                                        <h4 className="font-bold text-slate-800">{addr?.name || 'Address'}</h4>
                                    </div>
                                    {addr?.isDefault && <span className="badge badge-info">Default</span>}
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    {addr?.addressLine1 || ''}<br />
                                    {addr?.addressLine2 && <>{addr.addressLine2}<br /></>}
                                    {addr?.city || ''}, {addr?.state || ''} - {addr?.pincode || ''}
                                </p>
                                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center text-sm text-slate-500">
                                    <Phone size={14} className="mr-2" /> {addr?.phone || 'N/A'}
                                </div>
                            </div>
                        ))
                    )}
                </>
            )}
        </div>
    );
};

export default UserAddresses;
