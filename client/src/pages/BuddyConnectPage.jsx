import React from 'react';
import BuddyConnect from '../components/BuddyConnect';

const BuddyConnectPage = () => {
    return (
        <div className="pb-8 pt-2 px-2 md:px-4 max-w-4xl mx-auto min-h-[calc(100vh-140px)] flex flex-col">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-4 text-center">
                Find Buddies
            </h1>
            <div className="[&>div]:mt-0 flex-1 flex flex-col">
                <BuddyConnect />
            </div>
        </div>
    );
};

export default BuddyConnectPage;
