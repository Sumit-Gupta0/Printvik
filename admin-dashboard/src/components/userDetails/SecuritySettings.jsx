/**
 * @file SecuritySettings.jsx
 * @module UserDetails
 * @description Displays and manages security settings for admin users, including 2FA, password policies, and active sessions.
 * @requires lucide-react
 */

import React from 'react';
import { Shield, Globe } from 'lucide-react';

/**
 * @component SecuritySettings
 * @desc Renders the security settings panel and active sessions list.
 * @returns {JSX.Element} The rendered SecuritySettings component.
 */
const SecuritySettings = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Admin Security Settings */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Shield className="text-indigo-600" size={20} />
                    Admin Security Settings
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="font-medium text-slate-700">Two-Factor Authentication</span>
                        <div className="form-control">
                            <input type="checkbox" className="toggle toggle-success toggle-sm" defaultChecked={true} />
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="font-medium text-slate-700">Require Password Change (90 days)</span>
                        <div className="form-control">
                            <input type="checkbox" className="toggle toggle-success toggle-sm" defaultChecked={false} />
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="font-medium text-slate-700">IP Whitelisting Enabled</span>
                        <div className="form-control">
                            <input type="checkbox" className="toggle toggle-success toggle-sm" defaultChecked={true} />
                        </div>
                    </div>
                </div>
                <button className="mt-6 w-full px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                    Update Security Settings
                </button>
            </div>

            {/* Active Sessions */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Globe className="text-indigo-600" size={20} />
                    Active Sessions
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                            <p className="font-medium text-slate-700">Chrome on Windows</p>
                            <p className="text-xs text-slate-500">192.168.1.45 - Current Session</p>
                        </div>
                        <button className="px-3 py-1 bg-rose-50 text-rose-700 rounded-lg text-xs font-bold hover:bg-rose-100">Logout</button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                            <p className="font-medium text-slate-700">Safari on macOS</p>
                            <p className="text-xs text-slate-500">10.0.0.12 - 2 days ago</p>
                        </div>
                        <button className="px-3 py-1 bg-rose-50 text-rose-700 rounded-lg text-xs font-bold hover:bg-rose-100">Logout</button>
                    </div>
                </div>
                <button className="mt-6 w-full px-4 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-colors">
                    Logout All Other Sessions
                </button>
            </div>
        </div>
    );
};

export default SecuritySettings;
