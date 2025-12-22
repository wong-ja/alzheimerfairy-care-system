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
                .limit(14);
            
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
    const avgSeverity = logsToProcess.length > 0 
        ? (logsToProcess.reduce((acc, l) => acc + (l.severity_rating || 0), 0) / logsToProcess.length).toFixed(1) 
        : "0.0";
    const incidents = logsToProcess.filter(l => l.is_emergency).length;
    const avgSleep = logsToProcess.length > 0
        ? (logsToProcess.reduce((acc, l) => acc + Number(l.sleep_hours || 0), 0) / logsToProcess.length).toFixed(1)
        : "0.0";
    const startDate = logsToProcess.length > 0 ? logsToProcess[logsToProcess.length - 1].checkin_date : null;

    return (
        <>
            <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-t border-slate-200 md:relative md:w-64 md:h-screen md:border-r md:border-t-0 p-4 flex md:flex-col justify-around md:justify-start gap-2">
                <div className="hidden md:flex items-center gap-2 px-3 py-6 mb-4">
                    <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black shadow-lg">H</div>
                    <span className="text-xl font-black text-slate-900 tracking-tight">AlzheimerFairy <span className="text-blue-600">AI</span></span>
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
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Physician Summary</h2>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Last 14 Days Analysis</p>
                            </div>
                            <button onClick={() => setIsReportOpen(false)} className="p-2 hover:bg-white rounded-full shadow-sm border border-slate-200 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-8 overflow-y-auto">
                            <div className="flex justify-between items-start mb-10 pb-6 border-b border-slate-100">
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Clinical Summary</h3>
                                    <p className="text-sm font-bold text-blue-600">
                                        Observation Period: {startDate ? formatDate(startDate) : '---'} — {formatDate(new Date())}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="inline-block px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase text-slate-500">
                                        Generated {formatDate()}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6 mb-10">
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Severity</p>
                                    <p className="text-3xl font-black text-slate-900">{avgSeverity}</p>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Incidents</p>
                                    <p className={`text-3xl font-black ${incidents > 0 ? 'text-red-600' : 'text-slate-900'}`}>{incidents}</p>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Sleep</p>
                                    <p className="text-3xl font-black text-slate-900">{avgSleep}h</p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-100 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="p-4 text-[10px] font-black text-slate-500 uppercase">Date</th>
                                            <th className="p-4 text-[10px] font-black text-slate-500 uppercase">Severity</th>
                                            <th className="p-4 text-[10px] font-black text-slate-500 uppercase">Sleep</th>
                                            <th className="p-4 text-[10px] font-black text-slate-500 uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {logsToProcess.map((log) => (
                                            <tr key={log.id}>
                                                <td className="p-4 text-xs font-bold text-slate-900">{formatDate(log.checkin_date)}</td>
                                                <td className={`p-4 text-xs font-bold ${log.severity_rating > 7 ? 'text-red-600' : 'text-slate-600'}`}>
                                                    {log.severity_rating} / 10
                                                </td>
                                                <td className="p-4 text-xs font-bold text-slate-600">{log.sleep_hours} hrs</td>
                                                <td className="p-4 uppercase text-[10px]">
                                                    {log.is_emergency ? <span className="text-red-600 font-black italic">Incident Report</span> : <span className="text-emerald-600 font-black">Stable</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-3 mt-auto">
                            <button className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl hover:opacity-90 transition-opacity">
                                Download PDF Report
                            </button>
                            <button onClick={() => window.print()} className="px-6 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-50 transition-colors">
                                Print
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}