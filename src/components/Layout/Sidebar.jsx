import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Mail, Flame, User, Settings, Shield, PlusSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
    const { user } = useAuth();

    const navItems = [
        { icon: Home, label: 'Home', path: '/' },
        // { icon: Search, label: 'Search', path: '/search' }, // Placeholder for now
        { icon: PlusSquare, label: 'Create', path: '/create-post' },
        { icon: Flame, label: 'Wordle', path: '/wordle', highlight: true },
        // { icon: Mail, label: 'Inbox', path: '/inbox' }, // Placeholder
        { icon: User, label: 'Profile', path: '/profile' },
    ];

    if (user?.role === 'admin') {
        navItems.push({ icon: Shield, label: 'Admin', path: '/admin' });
    }

    return (
        <div className="hidden md:flex flex-col w-20 h-[96vh] fixed left-4 top-[2vh] glass-dock rounded-3xl border border-gray-700/50 z-50 items-center py-8 shadow-2xl">
            {/* Minimal Logo */}
            <div className="w-12 h-12 bg-gradient-to-tr from-emerald-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-12 animate-float">
                <span className="text-white font-extrabold text-2xl">K</span>
            </div>

            {/* Navigation Icons */}
            <nav className="flex-1 flex flex-col gap-6 w-full px-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
              relative flex items-center justify-center group w-12 h-12 rounded-2xl transition-all duration-500
              ${isActive
                                ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/40 scale-110'
                                : 'text-gray-400 hover:bg-white/10 hover:text-white hover:scale-105'
                            }
            `}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon
                                    strokeWidth={isActive ? 2.5 : 2}
                                    className={`w-6 h-6 transition-transform group-hover:rotate-6 ${item.highlight ? 'animate-pulse text-amber-300' : ''}`}
                                />

                                {/* Hover Tooltip */}
                                <span className="absolute left-16 px-4 py-2 bg-gray-900 border border-emerald-500/30 text-emerald-400 text-sm font-bold rounded-xl opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-2xl backdrop-blur-md">
                                    {item.label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* User Profile Bubble */}
            {user && (
                <div className="mt-auto relative group px-4">
                    <div className="w-12 h-12 rounded-full border-2 border-emerald-500/30 p-[2px] cursor-pointer hover:border-emerald-400 transition-colors">
                        <img
                            src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=10b981&color=fff`}
                            alt={user.name}
                            className="w-full h-full rounded-full object-cover"
                        />
                    </div>
                    {/* Profile Tooltip */}
                    <div className="absolute left-16 bottom-0 p-4 bg-gray-900 border border-gray-700 text-white rounded-2xl opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 pointer-events-none w-48 shadow-2xl glass-card z-50">
                        <p className="font-bold text-lg truncate bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">@{user.studentId}</p>
                        <div className="mt-2 text-xs text-emerald-500 font-mono">ONLINE / {user.role || 'STUDENT'}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sidebar;
