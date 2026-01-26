import React from 'react';
import { motion } from 'framer-motion';

const WelcomeScreen = ({ onComplete }) => {
    return (
        <motion.div
            className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-4"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            onAnimationComplete={() => {
                // Keep visible for a bit then fade out handled by parent or internal logic?
                // Actually parent controls removal usually, but here we can just animate in and wait.
            }}
        >
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "backOut" }}
                className="flex flex-col items-center"
            >
                <img
                    src="/logo.png"
                    alt="Baa ni Dava"
                    className="w-64 md:w-80 object-contain mb-8"
                />

                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.5, duration: 1.5, ease: "easeInOut" }}
                    className="h-1 bg-gradient-to-r from-accent to-secondary rounded-full w-48"
                />

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className="mt-4 text-secondary font-medium text-lg"
                >
                    Loading your medicines...
                </motion.p>
            </motion.div>
        </motion.div>
    );
};

export default WelcomeScreen;
