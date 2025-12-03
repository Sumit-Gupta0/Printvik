/**
 * Job Detail Page
 * View and update job status
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function JobDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchJob();
    }, [id]);

    const fetchJob = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/orders/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJob(response.data.data.order);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/orders/${id}/status`, { orderStatus: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchJob();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    if (loading) return <div className="container flex justify-center" style={{ marginTop: 'var(--spacing-2xl)' }}><div className="spinner"></div></div>;
    if (!job) return <div className="container" style={{ marginTop: 'var(--spacing-2xl)' }}><div className="card text-center"><p>Job not found</p></div></div>;

    return (
        <div className="container" style={{ maxWidth: '800px', marginTop: 'var(--spacing-2xl)', marginBottom: 'var(--spacing-2xl)' }}>
            <button onClick={() => navigate('/')} className="btn btn-secondary mb-lg">← Back to Queue</button>

            <div className="card mb-lg">
                <h2>Job {job.orderNumber}</h2>
                <p className="text-sm text-secondary">Customer: {job.userId?.name} • {job.userId?.phone}</p>

                <div style={{ marginTop: 'var(--spacing-lg)' }}>
                    <h3>Print Specifications</h3>
                    <div style={{ marginTop: 'var(--spacing-md)' }}>
                        <div className="flex justify-between mb-sm">
                            <span className="text-secondary">Print Type</span>
                            <span style={{ fontWeight: 500 }}>{job.specifications.colorType === 'color' ? 'Color' : 'Black & White'}</span>
                        </div>
                        <div className="flex justify-between mb-sm">
                            <span className="text-secondary">Paper Size</span>
                            <span style={{ fontWeight: 500 }}>{job.specifications.paperSize}</span>
                        </div>
                        <div className="flex justify-between mb-sm">
                            <span className="text-secondary">Pages</span>
                            <span style={{ fontWeight: 500 }}>{job.specifications.pages}</span>
                        </div>
                        <div className="flex justify-between mb-sm">
                            <span className="text-secondary">Copies</span>
                            <span style={{ fontWeight: 500 }}>{job.specifications.copies}</span>
                        </div>
                        {job.instructions && (
                            <div style={{ marginTop: 'var(--spacing-md)', padding: 'var(--spacing-md)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)' }}>
                                <p className="text-sm" style={{ fontWeight: 500, marginBottom: 'var(--spacing-xs)' }}>Special Instructions:</p>
                                <p className="text-sm text-secondary">{job.instructions}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="card">
                <h3>Update Status</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)' }}>
                    <button onClick={() => updateStatus('printing')} className="btn btn-primary">Start Printing</button>
                    <button onClick={() => updateStatus('printed')} className="btn btn-primary">Mark Printed</button>
                    <button onClick={() => updateStatus('quality-check')} className="btn btn-secondary">Quality Check</button>
                    <button onClick={() => updateStatus('ready')} className="btn btn-primary">Mark Ready</button>
                </div>
            </div>
        </div>
    );
}

export default JobDetail;
