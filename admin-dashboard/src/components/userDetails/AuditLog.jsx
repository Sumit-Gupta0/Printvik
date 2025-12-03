/**
 * @file AuditLog.jsx
 * @module UserDetails
 * @description Displays a timeline of user activities and system actions for auditing purposes.
 * @requires lucide-react
 */

import React from 'react';
import { List, Globe, Edit, Eye, Database } from 'lucide-react';

/**
 * @component AuditLog
 * @desc Renders the activity audit log timeline.
 * @returns {JSX.Element} The rendered AuditLog component.
 */
const AuditLog = () => {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <List className="text-indigo-600" size={20} />
                Activity Audit Log
            </h3>
            <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                {[
                    { action: 'LOGIN', time: '10:00 AM', details: 'Logged in from IP 192.168.1.45', icon: Globe, color: 'text-blue-600', bg: 'bg-blue-100' },
                    { action: 'UPDATE_ORDER', time: '10:15 AM', details: 'Updated Order #ORD-123 status to Shipped', icon: Edit, color: 'text-amber-600', bg: 'bg-amber-100' },
                    { action: 'VIEW_USER', time: '10:30 AM', details: 'Viewed profile of Priya Verma', icon: Eye, color: 'text-emerald-600', bg: 'bg-emerald-100' },
                    { action: 'EXPORT_DATA', time: '11:00 AM', details: 'Exported Monthly Sales Report', icon: Database, color: 'text-purple-600', bg: 'bg-purple-100' }
                ].map((log, idx) => (
                    <div key={idx} className="relative pl-8">
                        <div className={`absolute left-0 top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ${log.bg}`}></div>
                        <div className="flex justify-between items-start mb-1">
                            <span className={`font-bold text-xs ${log.color} px-2 py-0.5 rounded bg-slate-50 border border-slate-100`}>{log.action}</span>
                            <span className="text-xs text-slate-400 font-medium">{log.time}</span>
                        </div>
                        <p className="text-sm text-slate-600">{log.details}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AuditLog;
