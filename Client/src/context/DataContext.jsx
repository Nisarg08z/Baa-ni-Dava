import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axios';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const [medicines, setMedicines] = useState(null);
    const [stores, setStores] = useState(null);
    const [history, setHistory] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const fetchData = useCallback(async (force = false) => {
        if (!force && medicines && stores) return;

        setLoading(true);
        try {
            const [medRes, storeRes] = await Promise.all([
                api.get('/data/medicines'),
                api.get('/data/stores')
            ]);
            setMedicines(medRes.data);
            setStores(storeRes.data);
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    }, [medicines, stores]);

    const fetchHistory = useCallback(async (force = false) => {
        if (!force && history) return;

        setLoadingHistory(true);
        try {
            const res = await api.get('/history');
            setHistory(res.data);
        } catch (err) {
            console.error("Error fetching history:", err);
        } finally {
            setLoadingHistory(false);
        }
    }, [history]);

    const refreshData = async () => {
        await fetchData(true);
    };

    const invalidateHistory = () => {
        setHistory(null);
    };

    const value = {
        medicines: medicines || [],
        stores: stores || [],
        history: history || [],
        loading: loading || (!medicines && !stores), // Loading if explicit loading true OR data not yet valid
        loadingHistory: loadingHistory,
        fetchData,
        fetchHistory,
        refreshData,
        invalidateHistory
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};
