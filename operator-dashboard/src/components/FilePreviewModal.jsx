import { X, Download, ChevronLeft, ChevronRight, Printer } from 'lucide-react';
import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const FilePreviewModal = ({ files, isOpen, onClose }) => {
    const [currentFileIndex, setCurrentFileIndex] = useState(0);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);

    if (!isOpen || !files || files.length === 0) return null;

    const currentFile = files[currentFileIndex];
    const fileExtension = currentFile.filename?.split('.').pop()?.toLowerCase();
    const isPDF = fileExtension === 'pdf';
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setPageNumber(1);
    };

    const handlePrevFile = () => {
        setCurrentFileIndex((prev) => (prev > 0 ? prev - 1 : files.length - 1));
        setPageNumber(1);
    };

    const handleNextFile = () => {
        setCurrentFileIndex((prev) => (prev < files.length - 1 ? prev + 1 : 0));
        setPageNumber(1);
    };

    const handleDownload = () => {
        window.open(currentFile.url, '_blank');
    };

    const handlePrint = () => {
        const printWindow = window.open(currentFile.url, '_blank');
        if (printWindow) {
            printWindow.onload = () => {
                printWindow.print();
            };
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
            {/* Header */}
            <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold">{currentFile.filename}</h2>
                    {files.length > 1 && (
                        <span className="text-sm text-gray-400">
                            {currentFileIndex + 1} of {files.length}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors font-medium"
                        title="Print"
                    >
                        <Printer size={20} />
                        Print
                    </button>
                    <button
                        onClick={handleDownload}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                        title="Download"
                    >
                        <Download size={20} />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                        title="Close"
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
                {isPDF ? (
                    <div className="flex flex-col items-center">
                        <Document
                            file={currentFile.url}
                            onLoadSuccess={onDocumentLoadSuccess}
                            loading={
                                <div className="text-white text-center">
                                    <div className="spinner border-white"></div>
                                    <p className="mt-4">Loading PDF...</p>
                                </div>
                            }
                            error={
                                <div className="text-red-400 text-center">
                                    <p>Failed to load PDF</p>
                                    <button onClick={handleDownload} className="mt-2 text-blue-400 underline">
                                        Download instead
                                    </button>
                                </div>
                            }
                        >
                            <Page
                                pageNumber={pageNumber}
                                renderTextLayer={true}
                                renderAnnotationLayer={true}
                                className="shadow-2xl"
                                width={Math.min(window.innerWidth - 100, 800)}
                            />
                        </Document>
                        {numPages && numPages > 1 && (
                            <div className="mt-4 flex items-center gap-4 bg-gray-800 px-4 py-2 rounded-lg">
                                <button
                                    onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
                                    disabled={pageNumber <= 1}
                                    className="p-2 hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed text-white"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <span className="text-white">
                                    Page {pageNumber} of {numPages}
                                </span>
                                <button
                                    onClick={() => setPageNumber((prev) => Math.min(prev + 1, numPages))}
                                    disabled={pageNumber >= numPages}
                                    className="p-2 hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed text-white"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                ) : isImage ? (
                    <img
                        src={currentFile.url}
                        alt={currentFile.filename}
                        className="max-w-full max-h-full object-contain shadow-2xl"
                    />
                ) : (
                    <div className="text-white text-center">
                        <p className="mb-4">Preview not available for this file type</p>
                        <button
                            onClick={handleDownload}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Download File
                        </button>
                    </div>
                )}
            </div>

            {/* File Navigation */}
            {files.length > 1 && (
                <div className="bg-gray-900 p-4 flex justify-center gap-4">
                    <button
                        onClick={handlePrevFile}
                        className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                        <ChevronLeft size={20} />
                        Previous File
                    </button>
                    <button
                        onClick={handleNextFile}
                        className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                        Next File
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default FilePreviewModal;
