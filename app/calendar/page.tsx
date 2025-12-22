import { createClient } from '@/utils/supabase/server';
import { ChevronLeft, ChevronRight, AlertCircle, Pill, MessageSquare } from 'lucide-react';

function getStatusStyles(severity: number | null) {
    if (severity === null) return 'bg-slate-100 scale-75 opacity-20';
    if (severity <= 3) return 'bg-emerald-500 scale-90 rounded-full'; 
    if (severity <= 7) return 'bg-amber-500 scale-95 rounded-xl';
    return 'bg-red-500 scale-105 rounded-lg shadow-lg shadow-red-200 animate-pulse';
}

export default async function CalendarPage() {
    const supabase = await createClient();

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthName = now.toLocaleString('default', { month: 'long' });
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const { data: logs } = await supabase
        .from('wellness_logs')
        .select('checkin_date, severity_rating, is_emergency, meds_taken, notes, meal_details')
        .order('checkin_date', { ascending: true });

    const getLogForDay = (day: number) => {
        const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        return logs?.find(l => l.checkin_date === dateStr);
    };

    const calendarGrid = Array.from({ length: firstDayOfMonth + daysInMonth }, (_, i) => {
        return i < firstDayOfMonth ? null : i - firstDayOfMonth + 1;
    });

    return (
        <div className="max-w-4xl mx-auto py-10 px-6 mb-20">
            <header className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Care Calendar</h1>
                    <p className="text-slate-500 font-medium text-sm">{monthName} {currentYear}</p>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><ChevronLeft /></button>
                    <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><ChevronRight /></button>
                </div>
            </header>

            <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-4xl overflow-hidden shadow-sm">
                {/* week */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="bg-slate-50 p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {day}
                    </div>
                ))}

                {calendarGrid.map((day, idx) => {
                    if (day === null) return <div key={`empty-${idx}`} className="bg-slate-50/50" />;
                    
                    const log = getLogForDay(day);
                    return (
                        <div key={day} className="bg-white min-h-32 p-4 relative hover:bg-slate-50 transition-all group cursor-pointer overflow-visible">
                            <span className="text-sm font-bold text-slate-400 group-hover:text-slate-900 transition-colors">
                                {day}
                            </span>
                            
                            {log && (
                                <div className="mt-2 space-y-2">
                                    {/* status */}
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-3 h-3 transition-all duration-300 ${getStatusStyles(log.severity_rating)}`} />
                                        <span className="text-[10px] font-black text-slate-700 uppercase">
                                            SEV: {log.severity_rating}
                                        </span>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-1">
                                        {/* emergency flag */}
                                        {log.is_emergency && (
                                            <div className="flex items-center gap-1 text-red-600">
                                                <AlertCircle size={12} strokeWidth={3} />
                                                <span className="text-[9px] font-black uppercase">Incident</span>
                                            </div>
                                        )}

                                        {/* meds flag */}
                                        {log.meds_taken && (
                                            <div className="flex items-center gap-1 text-emerald-600">
                                                <Pill size={11} strokeWidth={3} />
                                                <span className="text-[9px] font-black uppercase">Meds Taken</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* PEEK DETAIL POPUP */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-900 text-white rounded-2xl text-xs z-50 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-xl">
                                        <div className="flex items-center gap-2 mb-2 border-b border-slate-700 pb-1">
                                            <MessageSquare size={12} className="text-blue-400" />
                                            <span className="font-bold text-[10px] uppercase">
                                                Daily Observation
                                            </span>
                                        </div>
                                        <p className="italic text-slate-300 line-clamp-3">
                                            {log.notes || "No notes for this day."}
                                        </p>
                                        {log.meal_details && (
                                            <p className="mt-2 text-[10px] text-blue-300">
                                                🍎 {log.meal_details}
                                            </p>
                                        )}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* legend */}
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> Stable
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-xl bg-amber-500" /> Warning
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-lg bg-red-500 shadow-sm" /> High Risk
                </div>
                <div className="flex items-center gap-2">
                    <Pill size={12} className="text-emerald-500" /> Meds Taken
                </div>
                <div className="flex items-center gap-2">
                    <AlertCircle size={12} className="text-red-500" /> Incident
                </div>
            </div>
        </div>
    );
}