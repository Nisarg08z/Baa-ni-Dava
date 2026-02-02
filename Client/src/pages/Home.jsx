import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import { FileDown, Check, Search, Filter } from 'lucide-react';
import Loading from '../components/Loading';

import { medicines as initialMedicines, stores as initialStores } from '../data/medicines';

const Home = () => {
    const location = useLocation();

    const [medicines, setMedicines] = useState([]);
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);

    const [cart, setCart] = useState({});
    const [searchTerm, setSearchTerm] = useState('');

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
        // if (selectedCount === 0) return; // Generating all now

        // Prepare Data
        // Prepare Data
        // We want to list ALL medicines now
        const items = medicines.map(med => {
            const decision = cart[med._id]; // { status: 'yes'|'no', quantity: '' }
            let qtyString = "";
            const isHomeopathy = med.store?.name?.toLowerCase().includes("homeopathy");

            if (decision?.status === 'yes') {
                if (isHomeopathy) {
                    qtyString = `${decision.quantity || ''} Levani`;
                } else {
                    qtyString = `${decision.quantity || ''} Chhe`;
                }
            } else if (decision?.status === 'no') {
                qtyString = "Nathi Levani";
            } else {
                // If no decision made, what to do? User instructions imply we ask for everything.
                // If skipped, maybe treating as Nathi Levani or leave blank?
                // Let's assume pending or empty, strictly follows cart.
                // But for now let's default to "Nathi Levani" if explicitly No, or maybe just empty if untouched?
                // Request says "give all medicin... give two option".
                // Let's assume unchecked = Nathi Levani for safety? Or just skip?
                // Let's list it as " - " or empty if untouched.
                qtyString = " - ";
            }

            return {
                medicineId: med._id,
                name: med.name,
                store: med.store?.name || 'Unknown',
                quantity: qtyString,
                storeId: med.store?._id
            };
        });

        // PDF Generation
        const doc = new jsPDF();
        const date = new Date().toLocaleDateString();

        // Group by Store
        const grouped = {};
        items.forEach(item => {
            if (!grouped[item.store]) grouped[item.store] = [];
            grouped[item.store].push(item);
        });

        let y = 20;

        Object.keys(grouped).forEach(storeName => {
            if (y > 250) { doc.addPage(); y = 20; }

            // Store Header 
            doc.setFillColor(240, 240, 240);
            doc.setDrawColor(200, 200, 200);
            doc.rect(10, y, 190, 10, 'F'); // Header background
            doc.rect(10, y, 190, 10, 'S'); // Header border

            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 0, 0);
            doc.text(storeName, 15, y + 7);
            y += 10;

            // Table Columns Header
            doc.setFillColor(250, 250, 250);
            // Col 1 headers - Total width 95 (Start 10)
            doc.rect(10, y, 60, 8, 'F');  // Name w=60
            doc.rect(70, y, 35, 8, 'F');  // Amt w=35
            doc.rect(10, y, 60, 8, 'S');
            doc.rect(70, y, 35, 8, 'S');

            // Col 2 headers - Total width 95 (Start 105)
            doc.rect(105, y, 60, 8, 'F'); // Name w=60
            doc.rect(165, y, 35, 8, 'F'); // Amt w=35
            doc.rect(105, y, 60, 8, 'S');
            doc.rect(165, y, 35, 8, 'S');

            doc.setFontSize(10);
            doc.text("Medicine Name", 12, y + 5);
            doc.text("Amt", 72, y + 5);
            doc.text("Medicine Name", 107, y + 5);
            doc.text("Amt", 167, y + 5);
            y += 8;

            // Items in 4 columns (2 columns of items)
            doc.setFontSize(9); // Slightly smaller font to fit names in narrower column
            doc.setFont("helvetica", "normal");

            const storeItems = grouped[storeName];
            for (let i = 0; i < storeItems.length; i += 2) {
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }

                // Item 1 (Left Side)
                const item1 = storeItems[i];
                doc.rect(10, y, 60, 10, 'S'); // Name box
                doc.rect(70, y, 35, 10, 'S'); // Qty box

                // Truncate or fit text if too long? jsPDF text doesn't auto wrap in rect easily unless splitTextToSize
                // For now, let's assume names fit or we might need a smaller font. I set size 9 above.
                doc.text(item1.name, 12, y + 7);
                doc.text(String(item1.quantity), 72, y + 7);

                // Item 2 (Right Side) - if exists
                if (i + 1 < storeItems.length) {
                    const item2 = storeItems[i + 1];
                    doc.rect(105, y, 60, 10, 'S'); // Name box
                    doc.rect(165, y, 35, 10, 'S'); // Qty box
                    doc.text(item2.name, 107, y + 7);
                    doc.text(String(item2.quantity), 167, y + 7);
                }

                y += 10;
            }
            y += 10; // Space between stores
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
                </div>
            </div>

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
                                    const decision = cart[med._id] || {}; // { status: 'yes'|'no', quantity: '' }
                                    const isYes = decision.status === 'yes';
                                    const isNo = decision.status === 'no';

                                    return (
                                        <div key={med._id} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-base sm:text-lg font-medium text-gray-800 break-words leading-tight">{med.name}</p>
                                            </div>

                                            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                                                <div className="flex bg-gray-100 rounded-lg p-1 shrink-0">
                                                    <button
                                                        onClick={() => {
                                                            setCart(prev => ({
                                                                ...prev,
                                                                [med._id]: { status: 'yes', quantity: prev[med._id]?.quantity || '' }
                                                            }));
                                                        }}
                                                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-sm font-bold transition-all ${isYes ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                                    >
                                                        Levani
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setCart(prev => ({
                                                                ...prev,
                                                                [med._id]: { status: 'no', quantity: '' }
                                                            }));
                                                        }}
                                                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-sm font-bold transition-all ${isNo ? 'bg-red-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                                    >
                                                        Nathi
                                                    </button>
                                                </div>

                                                {isYes && (
                                                    <input
                                                        type="text"
                                                        value={decision.quantity || ''}
                                                        onChange={(e) => {
                                                            setCart(prev => ({
                                                                ...prev,
                                                                [med._id]: { ...prev[med._id], quantity: e.target.value }
                                                            }));
                                                        }}
                                                        placeholder="Qty"
                                                        className="w-16 sm:w-24 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg border border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 font-bold text-center text-sm sm:text-base"
                                                        autoFocus
                                                    />
                                                )}
                                            </div>
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
            {medicines.length > 0 && (
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
