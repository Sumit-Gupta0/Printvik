import { X, Download, Printer } from 'lucide-react';
import { QRCodeSVG } from 'react-qr-code';
import { useRef } from 'react';
import useAuthStore from '../store/authStore';

const QRModal = ({ isOpen, onClose }) => {
    const { user } = useAuthStore();
    const printRef = useRef();

    if (!isOpen) return null;

    const shopUrl = `https://printvik.app/shop/${user?._id}?mode=walkin`;
    const shopName = user?.shopName || user?.name || 'PrintVik Shop';

    const handleDownload = () => {
        const svg = document.getElementById('shop-qr-code');
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL('image/png');

            const downloadLink = document.createElement('a');
            downloadLink.download = `${shopName}-QR.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    };

    const handlePrint = () => {
        const printContent = printRef.current;
        const windowPrint = window.open('', '', 'width=800,height=600');
        windowPrint.document.write(`
            <html>
                <head>
                    <title>Print QR Standee</title>
                    <style>
                        @page { size: A4; margin: 0; }
                        body { 
                            margin: 0; 
                            padding: 0;
                            font-family: 'Inter', sans-serif;
                        }
                        .standee {
                            width: 210mm;
                            height: 297mm;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 40px;
                            box-sizing: border-box;
                        }
                        .qr-container {
                            background: white;
                            padding: 30px;
                            border-radius: 20px;
                            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                            margin: 20px 0;
                        }
                        h1 {
                            font-size: 48px;
                            font-weight: 700;
                            margin: 0 0 20px 0;
                            text-align: center;
                            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
                        }
                        .instruction {
                            font-size: 24px;
                            margin: 20px 0;
                            text-align: center;
                            font-weight: 500;
                        }
                        .powered-by {
                            margin-top: 30px;
                            font-size: 18px;
                            opacity: 0.9;
                        }
                        .logo {
                            font-size: 32px;
                            font-weight: 700;
                            margin-top: 10px;
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
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 font-outfit">Shop QR Code</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X size={24} className="text-gray-500" />
                        </button>
                    </div>

                    {/* QR Code Display */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="bg-white p-6 rounded-xl border-2 border-indigo-200 shadow-lg">
                            <QRCodeSVG
                                id="shop-qr-code"
                                value={shopUrl}
                                size={200}
                                level="H"
                                includeMargin={true}
                            />
                        </div>
                        <p className="text-sm text-gray-600 mt-4 text-center">
                            Customers can scan this QR to upload files directly to your shop
                        </p>
                        <p className="text-xs text-gray-400 mt-2 font-mono break-all">
                            {shopUrl}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleDownload}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                        >
                            <Download size={20} />
                            Download QR
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                        >
                            <Printer size={20} />
                            Print Standee
                        </button>
                    </div>
                </div>
            </div>

            {/* Hidden Print Content */}
            <div ref={printRef} style={{ display: 'none' }}>
                <div className="standee">
                    <h1>{shopName}</h1>
                    <div className="instruction">📱 Scan to Upload & Print</div>
                    <div className="qr-container">
                        <QRCodeSVG
                            value={shopUrl}
                            size={300}
                            level="H"
                            includeMargin={true}
                        />
                    </div>
                    <div className="instruction">Instant Printing Service</div>
                    <div className="powered-by">Powered by</div>
                    <div className="logo">PrintVik</div>
                </div>
            </div>
        </>
    );
};

export default QRModal;
