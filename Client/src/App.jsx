import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import WelcomeScreen from './components/WelcomeScreen';

function App() {
    const [showWelcome, setShowWelcome] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowWelcome(false);
        }, 2500); // Show for 2.5 seconds
        return () => clearTimeout(timer);
    }, []);

    return (
        <Router>
            <AnimatePresence>
                {showWelcome && <WelcomeScreen key="welcome" />}
            </AnimatePresence>

            <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-10">
                <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="*" element={<Home />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
