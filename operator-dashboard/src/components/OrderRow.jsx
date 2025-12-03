import { User, Printer } from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import PrintLabel from './PrintLabel';
import FilePreviewModal from './FilePreviewModal';

const OrderRow = ({ order, onMarkReady }) => {
    const [showPrintLabel, setShowPrintLabel] = useState(false);
    const [showFilePreview, setShowFilePreview] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);

    const getUrgencyColor = (date) => {
        const diffMinutes = Math.floor((new Date() - new Date(date)) / 60000);
        if (diffMinutes > 30) return 'text-red-600';
        if (diffMinutes > 15) return 'text-orange-600';
        return 'text-gray-500';
    };

    const isUrgent = (date) => {
        const diffMinutes = Math.floor((new Date() - new Date(date)) / 60000);
        return diffMinutes > 30;
    };

    // TEMPORARY: Demo instructions for testing
    const demoInstructions = order.instructions ||
        (Math.random() > 0.5 ? "Please staple all pages in the top-left corner and use double-sided printing" : null);

    return (
        <>
            <div className={`bg-white border-b border-gray-100 py-4 px-6 flex items-center justify-between hover:bg-gray-50 transition-colors ${isUrgent(order.createdAt) ? 'bg-red-50' : ''
                }`}>
                {/* Left: Identity */}
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{order.userId?.name || 'Guest User'}</div>
                    <div className="text-xs text-gray-400 font-mono mt-0.5">{order.orderNumber}</div>
                    <div className={`text-xs mt-1 ${getUrgencyColor(order.createdAt)}`}>
                        {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                    </div>
                </div>

                {/* Middle: Specs */}
                <div className="flex items-center gap-2 flex-1">
                    {/* Color Mode */}
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-sm font-medium">
                        {order.specifications?.colorType === 'color' ? 'Color' : 'B&W'}
                    </span>

                    {/* Pages */}
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-sm font-medium">
                        {order.specifications?.pages || 0} pages
                    </span>

                    {/* Copies */}
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-sm font-medium">
                        {order.specifications?.copies || 1}x
                    </span>

                    {/* Paper Size */}
                    {order.specifications?.paperSize && (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-sm font-medium">
                            {order.specifications.paperSize}
                        </span>
                    )}

                    {/* Binding */}
                    {order.specifications?.binding && order.specifications.binding !== 'none' && (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-sm font-medium uppercase">
                            {order.specifications.binding}
                        </span>
                    )}
                </div>

                {/* Instructions Column */}
                <div className="w-48">
                    {demoInstructions && (
                        <button
                            onClick={() => setShowInstructions(true)}
                            className="flex items-start gap-1.5 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-sm hover:bg-blue-100 transition-colors cursor-pointer w-full"
                        >
                            <span className="text-blue-600 text-xs mt-0.5">📝</span>
                            <span className="text-blue-700 text-xs font-medium truncate">
                                Click to view
                            </span>
                        </button>
                    )}
                </div>

                {/* Right: Actions */}
                <div className="w-32 flex items-center justify-end gap-2">
                    {/* Icon Actions */}
                    <button
                        onClick={() => setShowFilePreview(true)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        title="View Files"
                    >
                        <Printer size={16} />
                    </button>
                    <button
                        onClick={() => setShowPrintLabel(true)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        title="Print Label"
                    >
                        <User size={16} />
                    </button>

                    {/* Primary Action */}
                    <button
                        onClick={() => onMarkReady(order._id)}
                        className="bg-black text-white text-xs px-4 py-2 rounded hover:bg-gray-800 transition-colors font-medium"
                    >
                        Mark Ready
                    </button>
                </div>
            </div>

            {/* Modals */}
            <PrintLabel order={order} isOpen={showPrintLabel} onClose={() => setShowPrintLabel(false)} />
            <FilePreviewModal files={order.documents} isOpen={showFilePreview} onClose={() => setShowFilePreview(false)} />

            {/* Instructions Modal */}
            {showInstructions && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowInstructions(false)}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl max-w-md w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">📝</span>
                                    <h3 className="text-lg font-semibold text-gray-900">Customer Instructions</h3>
                                </div>
                                <button
                                    onClick={() => setShowInstructions(false)}
                                    className="text-gray-400 hover:text-gray-600 text-xl"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                                    {demoInstructions}
                                </p>
                            </div>

                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={() => setShowInstructions(false)}
                                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    Got it
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default OrderRow;
