import { createClient } from '@/utils/supabase/server';
import Link from 'next/link'
import { format } from 'date-fns';
import { StickyNote, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';

function getSeverityStyles(score: number) {
    if (score <= 3) return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
    if (score <= 7) return 'bg-amber-50 text-amber-700 border border-amber-100';
    return 'bg-red-50 text-red-700 border border-red-100';
}

export default async function HistoryPage() {
    const supabase = await createClient();
    const { data: logs } = await supabase
        .from('wellness_logs')
        .select('*')
        .order('checkin_date', { ascending: false });

    return (
            <div className="max-w-3xl mx-auto py-12 px-4">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Health History</h1>
                        <p className="text-slate-500 mt-2">Review patterns and daily caregiver notes.</p>
                    </div>
                    <div className="text-right">
                        <span className="text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                            {logs?.length || 0} Total Entries
                        </span>
                    </div>
                </div>

            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {logs?.map((log) => (
                    <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                        
                        {/* timeline entry */}
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 
                            ${log.is_emergency ? 'bg-red-500 text-white' : 'bg-white text-slate-400'}`}>
                            {log.is_emergency ? <AlertCircle size={18} /> : <CalendarIcon size={18} />}
                        </div>

                        <Link href={`/checkin?date=${log.checkin_date}`} className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] block group/card">
                            <div className="relative bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all hover:scale-[1.01]">
                                <div className="absolute top-2 right-4 text-blue-500 opacity-0 group-hover/card:opacity-100 text-[10px] font-black uppercase tracking-tighter transition-opacity">
                                    Edit ✏️
                                </div>

                                {/* card content */}
                                <div className="flex items-center justify-between mb-3">
                                    <time className="font-black text-slate-900">
                                        {format(new Date(log.checkin_date), 'MMM dd, yyyy')}
                                    </time>
                                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getSeverityStyles(log.severity_rating)}`}>
                                        Severity: {log.severity_rating}
                                    </span>
                                </div>

                                {log.notes && (
                                    <div className="bg-slate-50 rounded-2xl p-4 mb-4 border-l-4 border-blue-500">
                                        <div className="flex gap-2 text-blue-600 mb-1">
                                            <StickyNote size={14} />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Note Recorded</span>
                                        </div>
                                        <p className="text-slate-600 text-sm italic leading-relaxed text-pretty">
                                            &ldquo;{log.notes}&rdquo;
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="bg-slate-50 rounded-xl p-2">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Sleep</p>
                                        <p className="text-sm font-bold">{log.nap_count} naps</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-2">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Active</p>
                                        <p className="text-sm font-bold">{log.exercise_mins}m</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-2">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Meals</p>
                                        <p className="text-sm font-bold">{log.meal_count}</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}