import React from 'react';
import EventCalendar from '../components/EventCalendar';

const CalendarPage = () => {
    return (
        <div className="min-h-[calc(100vh-9rem)] flex flex-col items-center justify-center px-3 md:px-4 md:max-w-lg md:mx-auto md:py-0">
            <h1 className="text-2xl md:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-5 md:mb-6 text-center tracking-tight">
                Event Calendar
            </h1>
            <div className="w-full">
                <EventCalendar />
            </div>
        </div>
    );
};

export default CalendarPage;

