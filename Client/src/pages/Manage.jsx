import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Trash2, ShoppingBag, Pill } from 'lucide-react';
import Loading from '../components/Loading';

import { useData } from '../context/DataContext';

const Manage = () => {
    const { stores, medicines, fetchData, refreshData, loading } = useData();
    const [activeTab, setActiveTab] = useState('stores');

    // Form States
    const [newStoreName, setNewStoreName] = useState('');
    const [newMedName, setNewMedName] = useState('');
    const [selectedStore, setSelectedStore] = useState('');

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (stores.length > 0 && !selectedStore) {
            setSelectedStore(stores[0]._id);
        }
    }, [stores, selectedStore]);

    const addStore = async (e) => {
        e.preventDefault();
        if (!newStoreName) return;
        try {
            await api.post('/data/stores', { name: newStoreName });
            setNewStoreName('');
            refreshData();
        } catch (err) {
            alert('Error adding store: ' + err.response?.data?.message);
        }
    };

    const deleteStore = async (id) => {
        if (!window.confirm('Are you sure? This will delete all medicines in this store too.')) return;
        try {
            await api.delete(`/data/stores/${id}`);
            refreshData();
        } catch (err) {
            console.error(err);
        }
    };

    const addMedicine = async (e) => {
        e.preventDefault();
        if (!newMedName || !selectedStore) return;
        try {
            await api.post('/data/medicines', { name: newMedName, storeId: selectedStore });
            setNewMedName('');
            refreshData();
        } catch (err) {
            alert('Error adding medicine');
        }
    };

    const deleteMedicine = async (id) => {
        try {
            await api.delete(`/data/medicines/${id}`);
            refreshData();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="container mx-auto px-4 py-6 max-w-4xl">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <SettingsIcon /> Manage Data
            </h1>

            <div className="flex gap-4 mb-6 sticky top-20 z-40 bg-gray-50 p-2 rounded-xl shadow-sm">
                <button
                    onClick={() => setActiveTab('stores')}
                    className={`flex-1 py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${activeTab === 'stores'
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <ShoppingBag className="w-5 h-5" /> Stores
                </button>
                <button
                    onClick={() => setActiveTab('medicines')}
                    className={`flex-1 py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${activeTab === 'medicines'
                        ? 'bg-accent text-white shadow-md'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <Pill className="w-5 h-5" /> Medicines
                </button>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                {loading ? <Loading /> : activeTab === 'stores' ? (
                    <div>
                        <form onSubmit={addStore} className="flex flex-col sm:flex-row gap-3 mb-6">
                            <input
                                type="text"
                                value={newStoreName}
                                onChange={(e) => setNewStoreName(e.target.value)}
                                placeholder="Enter new store name (e.g. Apollo)"
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                            />
                            <button
                                type="submit"
                                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-medium shadow-sm active:scale-95 transition-all w-full sm:w-auto"
                            >
                                <Plus className="w-5 h-5" /> Add
                            </button>
                        </form>

                        <ul className="grid gap-3">
                            {stores.map((store) => (
                                <li key={store._id} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100 group">
                                    <span className="font-medium text-lg text-gray-700 truncate pr-4">{store.name}</span>
                                    <button
                                        onClick={() => deleteStore(store._id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-100 lg:opacity-0 group-hover:opacity-100 focus:opacity-100"
                                        aria-label="Delete store"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </li>
                            ))}
                            {stores.length === 0 && <p className="text-center text-gray-400 py-4">No stores added yet.</p>}
                        </ul>
                    </div>
                ) : (
                    <div>
                        <form onSubmit={addMedicine} className="flex flex-col md:flex-row gap-3 mb-6">
                            <select
                                value={selectedStore}
                                onChange={(e) => setSelectedStore(e.target.value)}
                                className="w-full md:w-48 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent bg-white shadow-sm"
                            >
                                <option value="" disabled>Select Store</option>
                                {stores.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                            </select>
                            <input
                                type="text"
                                value={newMedName}
                                onChange={(e) => setNewMedName(e.target.value)}
                                placeholder="Medicine Name (e.g. Dolo 650)"
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent shadow-sm"
                            />
                            <button
                                type="submit"
                                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-medium shadow-sm active:scale-95 transition-all w-full md:w-auto"
                            >
                                <Plus className="w-5 h-5" /> Add
                            </button>
                        </form>

                        <div className="space-y-4">
                            {stores.map(store => {
                                const storeMeds = medicines.filter(m => m.store && m.store._id === store._id);
                                if (storeMeds.length === 0) return null;
                                return (
                                    <div key={store._id} className="bg-gray-50 rounded-xl p-4">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">{store.name}</h3>
                                        <div className="grid gap-2">
                                            {storeMeds.map((med) => (
                                                <div key={med._id} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm group border border-transparent hover:border-gray-100 transition-all">
                                                    <span className="font-medium text-gray-700 truncate pr-4">{med.name}</span>
                                                    <button
                                                        onClick={() => deleteMedicine(med._id)}
                                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-100 lg:opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                        aria-label="Delete medicine"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                            {medicines.length === 0 && <p className="text-center text-gray-400 py-4">No medicines added.</p>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings-2"><path d="M20 7h-9" /><path d="M14 17H5" /><circle cx="17" cy="17" r="3" /><circle cx="7" cy="7" r="3" /></svg>
)

export default Manage;
