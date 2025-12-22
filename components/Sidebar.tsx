"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, PlusCircle, History, Share2, X } from 'lucide-react';
import { WellnessLog } from '../types/database';
import { createClient } from '../lib/supabase';

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'History', href: '/history', icon: History },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Check-in', href: '/checkin', icon: PlusCircle },
];

export default function Sidebar() {
    const pathname = usePathname();
    const supabase = createClient();
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [logs, setLogs] = useState<WellnessLog[]>([]);

    useEffect(() => {
        const fetchLogs = async () => {
            const { data, error } = await supabase
                .from('wellness_logs')
                .select('*')
                .order('checkin_date', { ascending: false })
                .limit(30);
            
            if (data && !error) {
                setLogs(data as WellnessLog[]);
            }
        };
        fetchLogs();
    }, [supabase]);

    const formatDate = (dateInput?: Date | string) => {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : (dateInput || new Date());
        return new Intl.DateTimeFormat('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: '2-digit'
        }).format(date);
    };

    const logsToProcess = logs;
    const stats = {
        avgSeverity: logsToProcess.length > 0 
            ? (logsToProcess.reduce((acc, l) => acc + Number(l.severity_rating || 0), 0) / logsToProcess.length).toFixed(1) : "0",
        avgAgitation: logsToProcess.length > 0 
            ? (logsToProcess.reduce((acc, l) => acc + Number(l.agitation_level || 0), 0) / logsToProcess.length).toFixed(1) : "0",
        avgMood: logsToProcess.length > 0 
            ? (logsToProcess.reduce((acc, l) => acc + Number(l.mood_rating || 0), 0) / logsToProcess.length).toFixed(1) : "0",
        avgMemory: logsToProcess.length > 0 
            ? (logsToProcess.reduce((acc, l) => acc + Number(l.memory_score || 0), 0) / logsToProcess.length).toFixed(1) : "0",
        totalExercise: logsToProcess.reduce((acc, l) => acc + Number(l.exercise_mins || 0), 0),
        medCompliance: logsToProcess.length > 0 
            ? Math.round((logsToProcess.filter(l => l.meds_taken).length / logsToProcess.length) * 100) : 0
    };
    console.log(stats);
    const getTrend = (key: keyof WellnessLog) => {
        if (logsToProcess.length < 2) return { status: 'stable', label: 'Neutral' };
        const recent = Number(logsToProcess[0][key] || 0);
        const oldest = Number(logsToProcess[logsToProcess.length - 1][key] || 0);
        const diff = recent - oldest;

        if (key === 'memory_score' || key === 'mood_rating') {
            if (diff > 0) return { status: 'up', label: 'Improving' };
            if (diff < 0) return { status: 'down', label: 'Declining' };
        } else {
            if (diff < 0) return { status: 'up', label: 'Improving' };
            if (diff > 0) return { status: 'down', label: 'Worsening' };
        }
        return { status: 'stable', label: 'Stable' };
    };


    return (
        <>
            <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-t border-slate-200 md:relative md:w-64 md:h-screen md:border-r md:border-t-0 p-4 flex md:flex-col justify-around md:justify-start gap-2">
                <div className="hidden md:flex items-center gap-2 px-3 py-6 mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center text-white font-black shadow-lg">
                        🛡️
                    </div>
                    <span className="text-xl font-black text-slate-900 tracking-tight">
                        AlzheimerFairy <span className="text-blue-600">Care System</span>
                    </span>
                </div>

                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${isActive ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            <item.icon size={20} />
                            <span className="text-sm font-bold md:block hidden">{item.name}</span>
                        </Link>
                    );
                })}

                <div className="hidden md:block mt-auto pb-4">
                    <button 
                        onClick={() => setIsReportOpen(true)}
                        className="w-full flex items-center gap-3 px-4 py-4 bg-blue-50 text-blue-600 rounded-2xl font-bold text-sm hover:bg-blue-100 transition-all active:scale-95"
                    >
                        <Share2 size={18} />
                        Physician Report
                    </button>
                </div>
            </nav>

            {/* THE REPORT MODAL OVERLAY */}
            {isReportOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                    <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Physician Summary</h2>
                                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-1">30-Day Clinical Analysis</p>
                            </div>
                            <button onClick={() => setIsReportOpen(false)} className="p-3 hover:bg-white rounded-full shadow-sm border border-slate-200 transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-4 gap-4 mb-8">
                                {[
                                    { label: 'Severity', key: 'severity_rating' },
                                    { label: 'Agitation', key: 'agitation_level' },
                                    { label: 'Mood', key: 'mood_rating' },
                                    { label: 'Cognition', key: 'memory_score' }
                                ].map((item) => {
                                    const trend = getTrend(item.key as keyof WellnessLog);
                                    return (
                                        <div key={item.label} className="p-4 rounded-3xl bg-slate-50 border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{item.label}</p>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                                                    trend.status === 'up' ? 'bg-emerald-100 text-emerald-700' : 
                                                    trend.status === 'down' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-600'
                                                }`}>
                                                    {trend.label}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="rounded-4xl border border-slate-100 overflow-hidden shadow-sm">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-900 text-white">
                                        <tr>
                                            <th className="p-5 text-[10px] font-black uppercase">Date</th>
                                            <th className="p-5 text-[10px] font-black uppercase">Metrics (Sev/Agi/Mem)</th>
                                            <th className="p-5 text-[10px] font-black uppercase">Nutrition & Meds</th>
                                            <th className="p-5 text-[10px] font-black uppercase">Observations</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {logsToProcess.map((log) => (
                                            <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="p-5">
                                                    <p className="text-xs font-black text-slate-900">{formatDate(log.checkin_date)}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold">{log.wake_time || 'No Wake Time'}</p>
                                                </td>
                                                <td className="p-5">
                                                    <div className="flex gap-2">
                                                        <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded-lg">Severity: {log.severity_rating}</span>
                                                        <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded-lg">Agitation: {log.agitation_level}</span>
                                                        <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded-lg">Memory: {log.memory_score}</span>
                                                    </div>
                                                </td>
                                                <td className="p-5">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className={`text-[10px] font-black uppercase`}>
                                                            Meds: 
                                                                <span className={`text-[10px] font-black uppercase ${log.meds_taken ? 'text-emerald-600' : 'text-red-600'}`}>
                                                                    &nbsp;{log.meds_taken ? 'Taken' : 'Missed'}
                                                                </span>
                                                        </p>
                                                    </div>
                                                    <p className="text-[11px] mt-2 font-medium text-slate-600 truncate max-w-37.5">{log.meal_details || 'No meal data'}</p>
                                                </td>
                                                <td className="p-5">
                                                    <p className={`text-[10px] font-black uppercase`}>
                                                        Incident: 
                                                            <span className={`text-[10px] font-black uppercase ${log.is_emergency ? 'text-red-600' : 'text-emerald-600'}`}>
                                                                &nbsp;{log.is_emergency  ? '⚠️ CRITICAL INCIDENT' : 'None reported'}
                                                            </span>
                                                    </p>
                                                    <p className="text-[11px] mt-2 text-slate-500 italic line-clamp-2">
                                                        {log.notes ? `"${log.notes}"` : 'No clinical notes recorded.'}
                                                    </p>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4 mt-auto">
                            <button className="flex-1 px-6 py-5 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl hover:scale-[1.02] transition-all">
                                Download PDF
                            </button>
                            <button onClick={() => window.print()} className="flex-1 px-6 py-5 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all">
                                Print
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* PRINT REPORT */}
            <div id="clinical-print-section" className="hidden print:block p-12 bg-white text-black font-serif">
                <div className="border-b-4 border-black pb-6 mb-10">
                    <h1 className="text-3xl font-bold uppercase tracking-tighter">Clinical Patient Observation Log</h1>
                    <div className="flex justify-between mt-4 text-sm font-bold">
                        <p>Report Period: 30 Days History</p>
                        <p>AlzheimerFairy Care System</p>
                        <p>Printed: {new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                {/* trend analysis */}
                <div className="mb-10 p-6 border-2 border-black">
                    <h2 className="text-lg font-bold underline mb-4 uppercase">30-Day Trend Analysis</h2>
                    <div className="grid grid-cols-4 gap-8">
                        {['severity_rating', 'agitation_level', 'mood_rating', 'memory_score'].map(key => (
                            <div key={key}>
                                <p className="text-[10px] font-bold uppercase">{key.replace('_', ' ')}</p>
                                <p className="text-lg font-bold italic">{getTrend(key as keyof WellnessLog).label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* detailed logs/metrics */}
                {logsToProcess.map((log) => (
                    <div key={log.id} className="mb-8 border-b border-gray-300 pb-6 page-break-inside-avoid">
                        <div className="flex justify-between font-bold mb-2">
                            <p className="text-lg">{new Date(log.checkin_date).toLocaleDateString('en-US', { dateStyle: 'full' })}</p>
                            <p>Status: {log.is_emergency ? '⚠️ CRITICAL INCIDENT' : 'Stable'}</p>
                        </div>
                        <div className="grid grid-cols-5 gap-2 text-xs uppercase font-bold mb-4 bg-gray-100 p-2">
                            <p>Severity: {log.severity_rating}/10</p>
                            <p>Agitation: {log.agitation_level}/10</p>
                            <p>Mood: {log.mood_rating}/10</p>
                            <p>Memory: {log.memory_score}/10</p>
                            <p>Meds Taken: {log.meds_taken ? 'Yes' : 'NO'}</p>
                        </div>
                        <div className="text-sm space-y-2">
                            <p><strong>Emergency or Incident?</strong> {log.is_emergency  ? 'Medical Emergency or Incident Reported on this Date' : 'None reported'}</p>
                            <p><strong>Nutrition:</strong> {log.meal_details || 'None recorded'}</p>
                            <p><strong>Caregiver Notes:</strong> <span className="italic">{log.notes || 'No qualitative observations recorded for this date.'}</span></p>
                        </div>
                    </div>
                ))}
            </div>

        </>
    );
}