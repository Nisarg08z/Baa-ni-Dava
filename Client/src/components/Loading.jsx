import React from 'react';
import { motion } from 'framer-motion';

const Loading = () => {
    return (
        <div className="flex flex-col items-center justify-center w-full min-h-[400px]">
            <div className="relative">
                <motion.div
                    className="w-16 h-16 border-4 border-gray-200 border-t-primary rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                    className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-b-secondary rounded-full"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
            </div>
            <p className="mt-6 text-gray-500 font-medium animate-pulse">Loading...</p>
        </div>
    );
};

export default Loading;
