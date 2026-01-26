import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../api/axios';
import jsPDF from 'jspdf';
import { ShoppingCart, FileDown, Check, Search, Filter } from 'lucide-react';

const Home = () => {
    const location = useLocation();
    const [medicines, setMedicines] = useState([]);
    const [stores, setStores] = useState([]);
    const [cart, setCart] = useState({}); // { [medId]: quantityString }
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [medRes, storeRes] = await Promise.all([
                api.get('/data/medicines'),
                api.get('/data/stores')
            ]);
            setMedicines(medRes.data);
            setStores(storeRes.data);

            // Check for potential re-order from history
            if (location.state?.cartItems) {
                const newCart = {};
                location.state.cartItems.forEach(item => {
                    // Try to find by ID first
                    let med = medRes.data.find(m => item.medicineId && m._id === item.medicineId);
                    // Fallback to name match
                    if (!med) {
                        med = medRes.data.find(m => m.name.toLowerCase() === item.name.toLowerCase());
                    }

                    if (med) {
                        newCart[med._id] = item.quantity;
                    }
                });
                if (Object.keys(newCart).length > 0) {
                    setCart(newCart);
                    // Clear state so refresh doesn't persistence unwantedly? 
                    // Actually react router state persists on refresh usually, but good to keep.
                    window.history.replaceState({}, document.title);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = (medId, quantity) => {
        setCart(prev => ({ ...prev, [medId]: quantity }));
    };

    const toggleSelection = (medId, selected) => {
        setCart(prev => {
            if (!selected) {
                const { [medId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [medId]: "1" };
        });
    };

    const selectedCount = Object.keys(cart).length;

    const generatePDF = async () => {
        if (selectedCount === 0) return;

        // Prepare Data
        const items = [];
        Object.entries(cart).forEach(([medId, qty]) => {
            const med = medicines.find(m => m._id === medId);
            if (med) {
                items.push({
                    medicineId: med._id,
                    name: med.name,
                    store: med.store?.name || 'Unknown',
                    quantity: qty,
                    storeId: med.store?._id
                });
            }
        });

        // Save to History
        try {
            await api.post('/history', {
                items,
                totalItems: items.length
            });
        } catch (err) {
            console.error('Failed to save history', err);
        }

        // PDF Generation
        const doc = new jsPDF();
        const date = new Date().toLocaleDateString();

        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text("Medicine Purchase List", 10, 20);

        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Date: ${date}`, 10, 30);
        doc.text(`Total Items: ${items.length}`, 10, 36);

        let y = 50;

        // Group by Store
        const grouped = {};
        items.forEach(item => {
            if (!grouped[item.store]) grouped[item.store] = [];
            grouped[item.store].push(item);
        });

        Object.keys(grouped).forEach(storeName => {
            if (y > 250) { doc.addPage(); y = 20; }

            // Store Header
            doc.setFillColor(240, 240, 240);
            doc.rect(10, y - 6, 190, 10, 'F');
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 0, 0);
            doc.text(storeName, 12, y);
            y += 10;

            // Items
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            grouped[storeName].forEach(item => {
                if (y > 270) { doc.addPage(); y = 20; }
                doc.text(`• ${item.name}`, 15, y);
                doc.text(`${item.quantity}`, 180, y, { align: 'right' });
                // Dotted line
                doc.setDrawColor(200, 200, 200);
                doc.setLineDash([1, 1], 0);
                doc.line(item.name.length * 2.5 + 20, y, 170, y);
                doc.setLineDash([]); // reset
                y += 8;
            });
            y += 5;
        });

        doc.save(`Medicines_${date.replace(/\//g, '-')}.pdf`);
        setCart({});
    };

    // Grouping for Display
    const filteredMeds = medicines.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.store?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const medsByStore = {};
    filteredMeds.forEach(m => {
        const sName = m.store?.name || 'Uncategorized';
        if (!medsByStore[sName]) medsByStore[sName] = [];
        medsByStore[sName].push(m);
    });

    return (
        <div className="container mx-auto px-4 py-6 max-w-4xl pb-24">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Select Medicines</h1>
                    <p className="text-gray-500">Pick what you need for this month</p>
                </div>
                <div className="relative w-full md:w-auto">
                    <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search medicines..."
                        className="w-full md:w-80 pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? <p>Loading...</p> : (
                <div className="space-y-6">
                    {Object.keys(medsByStore).map(storeName => (
                        <div key={storeName} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-400" />
                                <h2 className="font-bold text-gray-700">{storeName}</h2>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {medsByStore[storeName].map(med => {
                                    const isSelected = Object.prototype.hasOwnProperty.call(cart, med._id);
                                    return (
                                        <div key={med._id}
                                            className={`p-4 flex items-start gap-3 transition-colors cursor-pointer border-b last:border-0 border-gray-50 ${isSelected ? 'bg-brand-blue/30' : 'hover:bg-gray-50'}`}
                                            onClick={(e) => {
                                                if (e.target.tagName !== 'INPUT') {
                                                    toggleSelection(med._id, !isSelected);
                                                }
                                            }}
                                        >
                                            <div className="pt-1">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={(e) => toggleSelection(med._id, e.target.checked)}
                                                    className="w-6 h-6 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer accent-primary"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0 py-1">
                                                <p className={`text-base sm:text-lg font-medium leading-snug break-words ${isSelected ? 'text-primary' : 'text-gray-700'}`}>{med.name}</p>
                                            </div>
                                            {isSelected && (
                                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="text"
                                                        value={cart[med._id]}
                                                        onChange={(e) => updateQuantity(med._id, e.target.value)}
                                                        placeholder="Qty"
                                                        className="w-20 sm:w-24 px-2 py-2 rounded-lg border border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary text-base shadow-sm"
                                                        autoFocus
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                    {Object.keys(medsByStore).length === 0 && (
                        <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                            <p>No medicines found.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Floating Action Button */}
            {selectedCount > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-secondary text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 z-50 hover:scale-105 transition-transform cursor-pointer border-2 border-white ring-2 ring-primary/20" onClick={generatePDF}>
                    <div className="flex flex-col items-start">
                        <span className="text-xs text-brand-blue font-medium">Selected: {selectedCount}</span>
                        <span className="font-bold flex items-center gap-2">Generate PDF <FileDown className="w-4 h-4" /></span>
                    </div>
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-6 h-6" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
