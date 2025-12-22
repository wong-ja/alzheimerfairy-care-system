"use client"
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';


export default function CheckinPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editDate = searchParams.get('date');
    const [loading, setLoading] = useState(false);
    const [severity, setSeverity] = useState(5);

    const getGlowColor = (val: number) => {
        if (val <= 3) return 'accent-emerald-500';
        if (val <= 7) return 'accent-amber-500';
        return 'accent-red-600';
    };

    const getColorClass = (val: number) => {
        if (val <= 3) return 'text-emerald-500';
        if (val <= 7) return 'text-amber-500';
        return 'text-red-600';
    };

    useEffect(() => {
        if (editDate) {
            async function loadExisting() {
                const { data } = await supabase
                .from('wellness_logs')
                .select('*')
                .eq('checkin_date', editDate)
                .single();
                if (data) {
                    setSeverity(data.severity_rating);
                }
            }
            loadExisting();
        }
    }, [editDate]);


    async function handleSave(formData: FormData) {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return alert("Please log in first")

        const entry = {
            user_id: user.id,
            checkin_date: formData.get('checkin_date'),
            wake_time: formData.get('wake_time'),
            nap_count: Number(formData.get('nap_count')),
            exercise_mins: Number(formData.get('exercise_mins')),
            meal_count: Number(formData.get('meal_count')),
            meal_details: formData.get('meal_details'),
            severity_rating: Number(formData.get('severity')),
            is_emergency: formData.get('emergency') === 'on',
            notes: formData.get('notes'),
        }

        const { error } = await supabase
            .from('wellness_logs')
            .upsert(entry, { onConflict: 'user_id, checkin_date' })

        if (!error) {
            router.push('/history');
            router.refresh();
        }

        setLoading(false)
        alert(error ? "Error: " + error.message : "Daily check-in updated!")
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 py-10">
            <header>
                <h1 className="text-3xl font-bold text-slate-900">Daily Wellness Check-in</h1>
                <p className="text-slate-500 text-lg">Track your health metrics for today.</p>
            </header>

            <form action={handleSave} className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
                <div>
                <label className="block font-semibold mb-2 text-slate-700">Check-in Date</label>
                <input 
                    name="checkin_date" 
                    type="date" 
                    defaultValue={new Date().toISOString().split('T')[0]} 
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <p className="text-xs text-slate-400 mt-2">Check-in new or missed entries.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block font-semibold mb-2">Wake up time</label>
                        <input name="wake_time" type="time" className="w-full p-3 border rounded-xl" />
                    </div>
                    <div>
                        <label className="block font-semibold mb-2">Naps taken today</label>
                        <input name="nap_count" type="number" defaultValue="0" className="w-full p-3 border rounded-xl" />
                    </div>
                </div>

                <div>
                    <label className="block font-semibold mb-2">Exercise (minutes)</label>
                    <input name="exercise_mins" type="number" placeholder="Eg. 30" className="w-full p-3 border rounded-xl" />
                </div>

                <div>
                    <label className="block font-semibold mb-2">Meals & Content</label>
                    <textarea name="meal_details" placeholder="What did you eat today?" className="w-full p-3 border rounded-xl h-24" />
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <label className="block font-bold text-slate-700 text-lg">Alzheimer Severity</label>
                        <span className={`text-3xl font-black transition-colors duration-300 drop-shadow-sm ${getColorClass(severity)}`}>
                            {severity}
                        </span>
                    </div>
                    <input 
                        name="severity" 
                        type="range" 
                        min="1" 
                        max="10" 
                        value={severity}
                        onChange={(e) => setSeverity(parseInt(e.target.value))}
                        className={`w-full h-3 rounded-lg appearance-none cursor-pointer bg-slate-200 ${getGlowColor(severity)}`} 
                    />
                    <div className="grid grid-cols-10 px-1 text-[10px] font-bold text-slate-400">
                        {[...Array(10)].map((_, i) => (
                            <span key={i} className="text-center">{i + 1}</span>
                        ))}
                    </div>
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">
                        <span className="text-emerald-500">Mild</span>
                        <span className="text-amber-500">Moderate</span>
                        <span className="text-red-600">Severe</span>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                    <input name="emergency" type="checkbox" className="w-5 h-5 accent-red-600" />
                    <label className="text-red-700 font-bold">There was a Medical Emergency / Hospitalization</label>
                </div>

                <div>
                <label className="block font-semibold mb-2">Daily Notes & Observations</label>
                <textarea 
                    name="notes" 
                    placeholder="Any specific behaviors, mood changes, or special events today?" 
                    className="w-full p-4 border rounded-2xl h-32 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
                <p className="text-xs text-slate-400 mt-2 italic">Eg. Had trouble recognizing the remote control today.</p>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
                >
                    {loading ? 'Saving Metrics...' : 'Update Daily Log'}
                </button>
            </form>
        </div>
    )
}