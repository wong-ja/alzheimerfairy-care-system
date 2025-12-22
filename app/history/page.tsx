import { createClient } from '@/utils/supabase/server';
import Link from 'next/link'
import { format } from 'date-fns';
import { StickyNote, AlertCircle, Calendar as CalendarIcon, Activity, Brain, Smile } from 'lucide-react';

function getSeverityStyles(score: number) {
    if (score <= 3) return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
    if (score <= 7) return 'bg-amber-50 text-amber-700 border border-amber-100';
    return 'bg-red-50 text-red-700 border border-red-100';
}

function formatStandardTime(militaryTime: string | null) {
    if (!militaryTime) return '--';    
    const [hours, minutes] = militaryTime.split(':');
    let h = parseInt(hours);
    const m = minutes;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;

    return `${h}:${m} ${ampm}`;
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
                    <p className="text-slate-500 mt-2 font-medium">Review patterns and daily caregiver notes.</p>
                </div>
                <div className="text-right">
                    <span className="text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                        {logs?.length || 0} Total Entries
                    </span>
                </div>
            </div>

            {/* timeline */}
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200">
                {logs?.map((log) => (
                    <div key={log.id} className="relative flex items-start group">
                        
                        {/* timeline entry icon */}
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-50 shadow-sm shrink-0 z-10 transition-transform group-hover:scale-110
                            ${log.is_emergency ? 'bg-red-500 text-white' : 'bg-white text-slate-400 border-white'}`}>
                            {log.is_emergency ? <AlertCircle size={18} /> : <CalendarIcon size={18} />}
                        </div>

                        <Link href={`/checkin?date=${log.checkin_date}`} className="ml-6 w-full block group/card">
                            <div className="relative bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
                                <div className="absolute top-2 right-4 text-blue-500 opacity-0 group-hover/card:opacity-100 text-[10px] font-black uppercase tracking-tighter transition-opacity">
                                    Edit ✏️
                                </div>

                                {/* card content */}
                                <div className="flex items-center justify-between mb-4">
                                    <time className="font-black text-slate-900 text-lg">
                                        {format(new Date(log.checkin_date), 'MMMM dd, yyyy')}
                                    </time>
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getSeverityStyles(log.severity_rating)}`}>
                                        Severity: {log.severity_rating}
                                    </span>
                                </div>

                                {/* metrics */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                                        <div className="flex items-center gap-1.5 mb-1 text-slate-400">
                                            <Activity size={12} />
                                            <p className="text-[9px] font-black uppercase">Agitation</p>
                                        </div>
                                        <p className="text-sm font-bold text-slate-700">{log.agitation_level}/10</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                                        <div className="flex items-center gap-1.5 mb-1 text-slate-400">
                                            <Smile size={12} />
                                            <p className="text-[9px] font-black uppercase">Mood</p>
                                        </div>
                                        <p className="text-sm font-bold text-slate-700">{log.mood_rating}/10</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                                        <div className="flex items-center gap-1.5 mb-1 text-slate-400">
                                            <Brain size={12} />
                                            <p className="text-[9px] font-black uppercase">Memory</p>
                                        </div>
                                        <p className="text-sm font-bold text-slate-700">{log.memory_score}/10</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                                        <p className="text-[9px] text-slate-400 font-black uppercase mb-1">Meds</p>
                                        <p className={`text-sm font-bold ${log.meds_taken ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {log.meds_taken ? 'Taken' : 'Missed'}
                                        </p>
                                    </div>
                                </div>

                                {log.notes && (
                                    <div className="bg-blue-50/50 rounded-2xl p-4 mb-4 border-l-4 border-blue-400">
                                        <div className="flex gap-2 text-blue-600 mb-1">
                                            <StickyNote size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-wider">Clinical Note</span>
                                        </div>
                                        <p className="text-slate-700 text-sm italic leading-relaxed">
                                            &ldquo;{log.notes}&rdquo;
                                        </p>
                                    </div>
                                )}

                                {/* physical: exercise, naps */}
                                <div className="flex gap-4 border-t border-slate-100 pt-4 mt-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                                        <p className="text-xs font-bold text-slate-500">
                                            Wake-Up Time: <span className="text-slate-900">{formatStandardTime(log.wake_time)}</span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                                        <p className="text-xs font-bold text-slate-500">Exercise: <span className="text-slate-900">{log.exercise_mins} min</span></p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                                        <p className="text-xs font-bold text-slate-500">Naps: <span className="text-slate-900">{log.nap_count}</span></p>
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