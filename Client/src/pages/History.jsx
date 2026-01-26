import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import jsPDF from 'jspdf';
import { Download, Calendar, Package, Clock, RefreshCw } from 'lucide-react';
import Loading from '../components/Loading';

import { useData } from '../context/DataContext';

const History = () => {
    const navigate = useNavigate();
    const { history, fetchHistory, loadingHistory } = useData();
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    }

    const handleReuse = (record) => {
        navigate('/', { state: { cartItems: record.items } });
    };

    const downloadPDF = (record) => {
        const doc = new jsPDF();
        const date = new Date(record.date).toLocaleDateString();

        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text("Medicine Purchase List", 10, 20);

        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Date: ${date}`, 10, 30);
        doc.text(`Total Items: ${record.totalItems}`, 10, 36);

        let y = 50;

        // Group by Store
        const grouped = {};
        record.items.forEach(item => {
            if (!grouped[item.store]) grouped[item.store] = [];
            grouped[item.store].push(item);
        });

        Object.keys(grouped).forEach(storeName => {
            if (y > 250) { doc.addPage(); y = 20; }

            doc.setFillColor(240, 240, 240);
            doc.rect(10, y - 6, 190, 10, 'F');
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 0, 0);
            doc.text(storeName, 12, y);
            y += 10;

            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            grouped[storeName].forEach(item => {
                if (y > 270) { doc.addPage(); y = 20; }
                doc.text(`• ${item.name}`, 15, y);
                doc.text(`${item.quantity}`, 180, y, { align: 'right' });

                doc.setDrawColor(200, 200, 200);
                doc.setLineDash([1, 1], 0);
                doc.line(item.name.length * 2.5 + 20, y, 170, y);
                doc.setLineDash([]);
                y += 8;
            });
            y += 5;
        });

        doc.save(`History_${date.replace(/\//g, '-')}.pdf`);
    };

    return (
        <div className="container mx-auto px-4 py-6 max-w-4xl">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-2">
                <Clock className="w-8 h-8" /> Purchase History
            </h1>

            {loadingHistory ? <Loading /> : (
                <div className="space-y-4">
                    {history.map((record) => (
                        <div key={record._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div
                                className="p-6 flex flex-col md:flex-row justify-between items-center cursor-pointer"
                                onClick={() => toggleExpand(record._id)}
                            >
                                <div className="mb-4 md:mb-0 w-full md:w-auto">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-brand-blue/30 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                            Purchase List
                                        </span>
                                        <span className="text-gray-400 text-sm flex items-center gap-1">
                                            <Calendar className="w-4 h-4" /> {new Date(record.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 flex items-center gap-2">
                                        <Package className="w-5 h-5 text-gray-400" />
                                        {record.totalItems} medicines purchased
                                    </p>
                                </div>

                                <div className="flex gap-2 items-center w-full md:w-auto mt-2 md:mt-0">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleReuse(record); }}
                                        className="bg-white text-secondary border border-secondary/20 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 font-medium hover:bg-gray-50 transition-colors text-sm"
                                        title="Reuse this list"
                                    >
                                        <RefreshCw className="w-4 h-4" /> Reuse
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); downloadPDF(record); }}
                                        className="flex-1 md:flex-none bg-secondary text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 font-medium hover:bg-secondary/90 transition-colors shadow-lg shadow-secondary/20 text-sm"
                                    >
                                        <Download className="w-4 h-4" /> PDF
                                    </button>
                                </div>
                            </div>

                            {expandedId === record._id && (
                                <div className="px-6 pb-6 bg-gray-50/50 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider py-4">Items in this list</h3>
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        {record.items.map((item, idx) => (
                                            <div key={idx} className="bg-white p-3 rounded-lg border border-gray-100 flex justify-between items-center text-sm shadow-sm">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-800">{item.name}</span>
                                                    <span className="text-xs text-gray-400">{item.store}</span>
                                                </div>
                                                <span className="font-bold text-secondary bg-brand-blue/20 px-2 py-1 rounded-md">{item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {history.length === 0 && (
                        <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                            <p>No history found.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default History;
