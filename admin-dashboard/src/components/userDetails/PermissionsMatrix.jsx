/**
 * @file PermissionsMatrix.jsx
 * @module UserDetails
 * @description Renders a matrix of permissions for Admin users, allowing toggleable access control for various system modules.
 * @requires lucide-react
 */

import React from 'react';
import {
    ShieldCheck, UserCheck, Package, Banknote, Settings
} from 'lucide-react';

/**
 * @component PermissionsMatrix
 * @desc Displays and manages the access control matrix for admin users.
 * @returns {JSX.Element} The rendered PermissionsMatrix component.
 */
const PermissionsMatrix = () => {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <ShieldCheck className="text-indigo-600" size={20} />
                    Access Rights & Permissions
                </h3>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700">
                    Save Changes
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="font-outfit text-xs font-bold text-slate-500 uppercase tracking-wider py-3 px-6 text-left">Module</th>
                            <th className="font-outfit text-xs font-bold text-slate-500 uppercase tracking-wider py-3 px-6 text-center">View</th>
                            <th className="font-outfit text-xs font-bold text-slate-500 uppercase tracking-wider py-3 px-6 text-center">Edit</th>
                            <th className="font-outfit text-xs font-bold text-slate-500 uppercase tracking-wider py-3 px-6 text-center">Delete</th>
                            <th className="font-outfit text-xs font-bold text-slate-500 uppercase tracking-wider py-3 px-6 text-center">Export</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {['Dashboard', 'Orders', 'Users', 'Finance', 'Settings'].map((module, idx) => (
                            <tr key={module} className="hover:bg-slate-50/50">
                                <td className="py-4 px-6 font-bold text-slate-700">{module}</td>
                                {['view', 'edit', 'delete', 'export'].map((action) => (
                                    <td key={action} className="py-4 px-6 text-center">
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-primary checkbox-sm"
                                            defaultChecked={module === 'Dashboard' || (module === 'Orders' && action !== 'delete') || (module === 'Users' && action === 'view')}
                                            disabled={module === 'Dashboard' && action === 'view'} // Always visible
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="p-6 border-t border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* User Management */}
                    <div>
                        <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <UserCheck size={18} className="text-indigo-600" /> User Management
                        </h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <span className="text-sm font-medium text-slate-600">View Users</span>
                                <input type="checkbox" className="toggle toggle-success toggle-sm" defaultChecked={true} />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <span className="text-sm font-medium text-slate-600">Edit User Profiles</span>
                                <input type="checkbox" className="toggle toggle-success toggle-sm" defaultChecked={true} />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <span className="text-sm font-medium text-slate-600">Block/Suspend Users</span>
                                <input type="checkbox" className="toggle toggle-success toggle-sm" defaultChecked={true} />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl opacity-50">
                                <span className="text-sm font-medium text-slate-600">Delete Users (Super Admin)</span>
                                <input type="checkbox" className="toggle toggle-sm" disabled />
                            </div>
                        </div>
                    </div>

                    {/* Order Management */}
                    <div>
                        <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <Package size={18} className="text-indigo-600" /> Order Management
                        </h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <span className="text-sm font-medium text-slate-600">View Orders</span>
                                <input type="checkbox" className="toggle toggle-success toggle-sm" defaultChecked={true} />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <span className="text-sm font-medium text-slate-600">Process Refunds</span>
                                <input type="checkbox" className="toggle toggle-success toggle-sm" defaultChecked={false} />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <span className="text-sm font-medium text-slate-600">Manage Disputes</span>
                                <input type="checkbox" className="toggle toggle-success toggle-sm" defaultChecked={true} />
                            </div>
                        </div>
                    </div>

                    {/* Financials */}
                    <div>
                        <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <Banknote size={18} className="text-indigo-600" /> Financial Access
                        </h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <span className="text-sm font-medium text-slate-600">View Revenue Reports</span>
                                <input type="checkbox" className="toggle toggle-success toggle-sm" defaultChecked={false} />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <span className="text-sm font-medium text-slate-600">Approve Payouts</span>
                                <input type="checkbox" className="toggle toggle-success toggle-sm" defaultChecked={false} />
                            </div>
                        </div>
                    </div>

                    {/* System Settings */}
                    <div>
                        <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <Settings size={18} className="text-indigo-600" /> System Config
                        </h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <span className="text-sm font-medium text-slate-600">Manage Delivery Zones</span>
                                <input type="checkbox" className="toggle toggle-success toggle-sm" defaultChecked={true} />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <span className="text-sm font-medium text-slate-600">Edit Global Settings</span>
                                <input type="checkbox" className="toggle toggle-success toggle-sm" defaultChecked={false} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PermissionsMatrix;
