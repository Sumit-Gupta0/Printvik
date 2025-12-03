/**
 * @file WalletWidget.jsx
 * @module UserDetails
 * @description Displays the user's wallet balance and provides options to add or deduct money.
 * @requires lucide-react
 */

import React from 'react';
import { Package } from 'lucide-react';

/**
 * @component WalletWidget
 * @desc Renders the wallet balance and action buttons.
 * @param {Object} props
 * @param {Object} props.user - The user object containing wallet info.
 * @param {Function} props.setWalletAction - Function to set the wallet action (credit/debit).
 * @param {Function} props.setShowWalletModal - Function to toggle the wallet modal.
 * @returns {JSX.Element} The rendered WalletWidget component.
 */
const WalletWidget = ({ user, setWalletAction, setShowWalletModal }) => {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Package className="text-indigo-600" size={20} />
                Wallet Balance
            </h3>
            <div className="text-3xl font-bold text-slate-800 mb-6">₹{user?.walletBalance || 0}</div>
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => { setWalletAction('credit'); setShowWalletModal(true); }}
                    className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-bold hover:bg-emerald-100 transition-colors"
                >
                    + Add Money
                </button>
                <button
                    onClick={() => { setWalletAction('debit'); setShowWalletModal(true); }}
                    className="px-4 py-2 bg-rose-50 text-rose-700 rounded-xl font-bold hover:bg-rose-100 transition-colors"
                >
                    - Deduct
                </button>
            </div>
        </div>
    );
};

export default WalletWidget;
