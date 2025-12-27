import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Flame, PlusSquare, User, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const MobileHeader = () => {
    const { user } = useAuth();

    return (
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 glass-card border-b border-gray-700/50 px-4 py-3">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-tr from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">K</span>
                    </div>
                    <span className="text-xl font-bold text-white">Forum</span>
                </div>

                {/* Profile Avatar (Top Right) */}
                <NavLink to="/profile" className="relative">
                    <img
                        src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=10b981&color=fff`}
                        alt="Profile"
                        className="w-9 h-9 rounded-full border border-emerald-500/50"
                    />
                </NavLink>
            </div>

            {/* Grid Navigation */}
            <nav className="grid grid-cols-5 gap-2">
                <NavLink to="/" className={({ isActive }) => `flex flex-col items-center justify-center p-2 rounded-xl transition-all ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400'}`}>
                    <Home className="w-5 h-5 mb-1" />
                    <span className="text-[10px]">Home</span>
                </NavLink>

                <NavLink to="/wordle" className={({ isActive }) => `flex flex-col items-center justify-center p-2 rounded-xl transition-all ${isActive ? 'bg-amber-500/20 text-amber-400' : 'text-gray-400'}`}>
                    <Flame className="w-5 h-5 mb-1" />
                    <span className="text-[10px]">Wordle</span>
                </NavLink>

                <NavLink to="/create-post" className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 transform -translate-y-2">
                    <PlusSquare className="w-6 h-6" />
                </NavLink>

                <NavLink to="/search" className={({ isActive }) => `flex flex-col items-center justify-center p-2 rounded-xl transition-all ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400'}`}>
                    <Search className="w-5 h-5 mb-1" />
                    <span className="text-[10px]">Search</span>
                </NavLink>

                <NavLink to="/profile" className={({ isActive }) => `flex flex-col items-center justify-center p-2 rounded-xl transition-all ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400'}`}>
                    <User className="w-5 h-5 mb-1" />
                    <span className="text-[10px]">Profile</span>
                </NavLink>
            </nav>
        </div>
    );
};

export default MobileHeader;
