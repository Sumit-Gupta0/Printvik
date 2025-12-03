/**
 * Document Preview Component
 * Preview uploaded documents before ordering
 */

import { useState } from 'react';

function DocumentPreview({ files, onRemove }) {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const handlePreview = (file) => {
        setSelectedFile(file);

        // Create preview URL based on file type
        if (file.type.includes('image')) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        } else if (file.type.includes('pdf')) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const closePreview = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setSelectedFile(null);
    };

    return (
        <div>
            {/* File List */}
            <div style={{ marginTop: 'var(--spacing-md)' }}>
                <p className="text-sm" style={{ fontWeight: 500, marginBottom: 'var(--spacing-sm)' }}>
                    Uploaded Files ({files.length})
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                    {files.map((file, index) => (
                        <div
                            key={index}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: 'var(--spacing-sm)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: 'var(--color-surface)',
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '0.875rem', fontWeight: 500, margin: 0 }}>
                                    📄 {file.name}
                                </p>
                                <p className="text-xs text-tertiary" style={{ margin: 0 }}>
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                                <button
                                    type="button"
                                    onClick={() => handlePreview(file)}
                                    className="btn btn-secondary"
                                    style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                                >
                                    👁️ Preview
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onRemove(index)}
                                    className="btn btn-outline"
                                    style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                                >
                                    🗑️ Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Preview Modal */}
            {previewUrl && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: 'var(--spacing-lg)',
                    }}
                    onClick={closePreview}
                >
                    <div
                        style={{
                            backgroundColor: 'white',
                            borderRadius: 'var(--radius-lg)',
                            maxWidth: '90vw',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            position: 'relative',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={closePreview}
                            style={{
                                position: 'absolute',
                                top: 'var(--spacing-md)',
                                right: 'var(--spacing-md)',
                                backgroundColor: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '2.5rem',
                                height: '2.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: '1.5rem',
                                boxShadow: 'var(--shadow-md)',
                                zIndex: 1001,
                            }}
                        >
                            ✕
                        </button>

                        {/* Preview Content */}
                        <div style={{ padding: 'var(--spacing-lg)' }}>
                            <h3 style={{ marginBottom: 'var(--spacing-md)' }}>{selectedFile?.name}</h3>

                            {selectedFile?.type.includes('image') ? (
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '70vh',
                                        objectFit: 'contain',
                                    }}
                                />
                            ) : selectedFile?.type.includes('pdf') ? (
                                <iframe
                                    src={previewUrl}
                                    style={{
                                        width: '100%',
                                        height: '70vh',
                                        border: 'none',
                                    }}
                                    title="PDF Preview"
                                />
                            ) : (
                                <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
                                    <p className="text-secondary">Preview not available for this file type</p>
                                    <p className="text-sm text-tertiary">File: {selectedFile?.name}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DocumentPreview;
