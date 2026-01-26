import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Pill, Settings, History, Home } from 'lucide-react';

const Navbar = () => {
    const location = useLocation();

    const links = [
        { path: '/', name: 'Home', icon: Home },
        { path: '/manage', name: 'Manage', icon: Settings },
        { path: '/history', name: 'History', icon: History },
    ];

    return (
        <nav className="bg-white text-secondary shadow-md sticky top-0 z-50 border-b-4 border-accent">
            <div className="container mx-auto px-4 py-2 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2">
                    <img src="/logo.png" alt="Baa ni Dava" className="h-14 w-auto object-contain" />
                </Link>

                <div className="flex gap-2">
                    {links.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full transition-all font-semibold ${location.pathname === link.path
                                ? 'bg-primary/10 text-primary border border-primary/20'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-primary'
                                }`}
                        >
                            <link.icon className={`h-5 w-5 ${location.pathname === link.path ? 'text-primary' : 'text-gray-400'}`} />
                            <span className={`text-xs sm:text-base ${location.pathname === link.path ? '' : 'hidden sm:inline'}`}>{link.name}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
