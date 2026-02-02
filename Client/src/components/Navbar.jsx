import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {

    return (
        <nav className="bg-white text-secondary shadow-md sticky top-0 z-50 border-b-4 border-accent">
            <div className="container mx-auto px-4 py-2 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2">
                    <img src="/logo.png" alt="Baa ni Dava" className="h-14 w-auto object-contain" />
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;
