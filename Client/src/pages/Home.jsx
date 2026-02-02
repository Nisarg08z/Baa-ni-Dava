import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import { ShoppingCart, FileDown, Check, Search, Filter, Plus, X } from 'lucide-react';
import Loading from '../components/Loading';

import { medicines as initialMedicines, stores as initialStores } from '../data/medicines';

const Home = () => {
    const location = useLocation();

    const [medicines, setMedicines] = useState([]);
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);

    const [cart, setCart] = useState({}); 
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newMedName, setNewMedName] = useState('');
    const [newMedStoreId, setNewMedStoreId] = useState('');

    useEffect(() => {
  
        setTimeout(() => {
            setMedicines(initialMedicines);
            setStores(initialStores);
            setLoading(false);
        }, 500);
    }, []);

    useEffect(() => {
        if (medicines.length > 0 && location.state?.cartItems) {
            const newCart = {};
            location.state.cartItems.forEach(item => {
                let med = medicines.find(m => item.medicineId && m._id === item.medicineId);
                if (!med) {
                    med = medicines.find(m => m.name.toLowerCase() === item.name.toLowerCase());
                }

                if (med) {
                    newCart[med._id] = item.quantity;
                }
            });
            if (Object.keys(newCart).length > 0) {
                setCart(newCart);
                window.history.replaceState({}, document.title);
            }
        }
    }, [medicines, location.state]);

    const addMedicine = (newMed) => {
        setMedicines(prev => [...prev, { ...newMed, _id: Date.now().toString() }]);
    };

    const handleAddMedicine = (e) => {
        e.preventDefault();
        if (!newMedName || !newMedStoreId) return;

        const store = stores.find(s => s._id === newMedStoreId);
        addMedicine({ name: newMedName, store });
        setNewMedName('');
        setNewMedStoreId('');
        setIsModalOpen(false);
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

    // ... generatePDF function ...
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
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search medicines..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary text-white p-3 rounded-xl shadow-md hover:bg-primary/90 transition-colors"
                        title="Add New Medicine"
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Add New Medicine</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleAddMedicine} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                    placeholder="e.g. Dollo 650"
                                    value={newMedName}
                                    onChange={e => setNewMedName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Store</label>
                                <select
                                    required
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white"
                                    value={newMedStoreId}
                                    onChange={e => setNewMedStoreId(e.target.value)}
                                >
                                    <option value="">Select Store</option>
                                    {stores.map(s => (
                                        <option key={s._id} value={s._id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-secondary text-white py-3 rounded-xl font-bold hover:bg-secondary/90 transition-colors mt-2"
                            >
                                Add Medicine
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {loading ? <Loading /> : (
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
