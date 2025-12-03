/**
 * @file StaffNotes.jsx
 * @module UserDetails
 * @description Displays a timeline of staff notes and allows adding new notes. Supports filtering by type (All, Transactions, Staff Chats).
 * @requires lucide-react
 */

import React from 'react';
import { FileText, ArrowLeft } from 'lucide-react';

/**
 * @component StaffNotes
 * @desc Renders the staff notes timeline and input form.
 * @param {Object} props
 * @param {Object} props.user - The user object containing adminNotes.
 * @param {string} props.notesFilter - Current filter state ('all', 'transactions', 'staff').
 * @param {Function} props.setNotesFilter - Function to update filter state.
 * @param {string} props.noteText - Current input text for new note.
 * @param {Function} props.setNoteText - Function to update input text.
 * @param {Function} props.handleAddNote - Function to handle note submission.
 * @returns {JSX.Element} The rendered StaffNotes component.
 */
const StaffNotes = ({ user, notesFilter, setNotesFilter, noteText, setNoteText, handleAddNote }) => {
    return (
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[500px]">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="text-indigo-600" size={20} />
                    Staff Notes & Timeline
                </h3>

                {/* Filter Tabs */}
                <div className="flex bg-slate-100 rounded-lg p-1">
                    <button
                        onClick={() => setNotesFilter('all')}
                        className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${notesFilter === 'all' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-600 hover:text-slate-800'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setNotesFilter('transactions')}
                        className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${notesFilter === 'transactions' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-600 hover:text-slate-800'}`}
                    >
                        Transactions
                    </button>
                    <button
                        onClick={() => setNotesFilter('staff')}
                        className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${notesFilter === 'staff' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-600 hover:text-slate-800'}`}
                    >
                        Staff Chats
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 custom-scrollbar">
                {!user?.adminNotes || user.adminNotes.length === 0 ? (
                    <div className="text-center text-slate-400 py-12">No notes yet</div>
                ) : (
                    user.adminNotes.slice().reverse()
                        .filter(note => {
                            // Step 1: Filter logic based on note content/type
                            if (notesFilter === 'transactions') {
                                return note?.type === 'wallet' || note?.text?.toLowerCase().includes('wallet') || note?.text?.toLowerCase().includes('₹');
                            }
                            if (notesFilter === 'staff') {
                                return note?.type !== 'wallet' && !note?.text?.toLowerCase().includes('wallet');
                            }
                            return true; // 'all'
                        })
                        .map((note, idx) => (
                            <div key={idx} className={`p-4 rounded-xl border ${note?.type === 'wallet' ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                                <p className="text-slate-700 text-sm mb-2">{note?.text || ''}</p>
                                <div className="flex justify-between items-center text-xs text-slate-400">
                                    <span className="font-medium text-indigo-600">{note?.author || 'Unknown'}</span>
                                    <span>{note?.date ? new Date(note.date).toLocaleString() : 'N/A'}</span>
                                </div>
                            </div>
                        ))
                )}
            </div>

            <form onSubmit={handleAddNote} className="relative">
                <input
                    type="text"
                    placeholder="Add a note (e.g., Customer called regarding delay...)"
                    className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                />
                <button
                    type="submit"
                    disabled={!noteText.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ArrowLeft size={16} className="rotate-180" />
                </button>
            </form>
        </div>
    );
};

export default StaffNotes;
