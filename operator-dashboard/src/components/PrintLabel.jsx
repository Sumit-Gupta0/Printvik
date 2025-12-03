import { Printer, X } from 'lucide-react';
import { useRef } from 'react';

const PrintLabel = ({ order, isOpen, onClose }) => {
    const printRef = useRef();

    if (!isOpen || !order) return null;

    const handlePrint = () => {
        const printContent = printRef.current;
        const windowPrint = window.open('', '', 'width=300,height=400');
        windowPrint.document.write(`
            <html>
                <head>
                    <title>Print Label - ${order.orderNumber}</title>
                    <style>
                        @page { 
                            size: 58mm auto; 
                            margin: 0; 
                        }
                        body { 
                            margin: 0; 
                            padding: 8mm;
                            font-family: 'Courier New', monospace;
                            width: 58mm;
                        }
                        .label {
                            text-align: center;
                        }
                        .order-number {
                            font-size: 18px;
                            font-weight: bold;
                            margin: 8px 0;
                            border-top: 2px dashed #000;
                            border-bottom: 2px dashed #000;
                            padding: 8px 0;
                        }
                        .customer {
                            font-size: 14px;
                            font-weight: bold;
                            margin: 8px 0;
                        }
                        .address {
                            font-size: 11px;
                            margin: 4px 0;
                            color: #333;
                        }
                        .payment {
                            font-size: 12px;
                            margin: 8px 0;
                            font-weight: bold;
                            text-transform: uppercase;
                        }
                        .specs {
                            font-size: 12px;
                            margin: 4px 0;
                            text-align: left;
                        }
                        .timestamp {
                            font-size: 10px;
                            margin-top: 12px;
                            border-top: 1px dashed #000;
                            padding-top: 8px;
                        }
                        .divider {
                            border-top: 1px dashed #000;
                            margin: 8px 0;
                        }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                </body>
            </html>
        `);
        windowPrint.document.close();
        windowPrint.focus();
        setTimeout(() => {
            windowPrint.print();
            windowPrint.close();
        }, 250);
    };

    return (
        <>
            {/* Modal Overlay */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
                <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 font-outfit">Print Label</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X size={24} className="text-gray-500" />
                        </button>
                    </div>

                    {/* Label Preview */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-6 border-2 border-dashed border-gray-300">
                        <div ref={printRef} className="label bg-white p-4">
                            <div className="order-number">
                                ORDER #{order.orderNumber}
                            </div>

                            <div className="customer">
                                {order.userId?.name || 'Guest User'}
                            </div>

                            {order.deliveryAddress && (
                                <div className="address">
                                    {order.deliveryAddress.street}, {order.deliveryAddress.city}
                                </div>
                            )}

                            <div className="payment">
                                {order.paymentMethod === 'ONLINE' ? '💳 PAID' : '💵 COD'}
                            </div>

                            <div className="divider"></div>

                            <div className="specs">
                                <div>Pages: {order.specifications?.pages || 0}</div>
                                <div>Copies: {order.specifications?.copies || 1}</div>
                                <div>Type: {order.specifications?.colorType === 'color' ? 'Color' : 'B&W'}</div>
                                {order.specifications?.binding && order.specifications.binding !== 'none' && (
                                    <div>Binding: {order.specifications.binding}</div>
                                )}
                            </div>

                            <div className="timestamp">
                                {new Date(order.createdAt).toLocaleString('en-IN', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Print Button */}
                    <button
                        onClick={handlePrint}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-bold shadow-md hover:shadow-lg"
                    >
                        <Printer size={20} />
                        Print Label
                    </button>
                </div>
            </div>
        </>
    );
};

export default PrintLabel;
