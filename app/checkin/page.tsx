"use client"
import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function CheckinPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center text-slate-500">Loading form...</div>}>
            <CheckinForm />
        </Suspense>
    )
}

function CheckinForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editDate = searchParams.get('date');

    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(editDate || new Date().toISOString().split('T')[0]);
    
    const [severity, setSeverity] = useState<number | null>(null);
    const [agitation, setAgitation] = useState<number | null>(null);
    const [mood, setMood] = useState<number | null>(null);
    const [memory, setMemory] = useState<number | null>(null);
    const [medsTaken, setMedsTaken] = useState(false);
    const [isEmergency, setIsEmergency] = useState(false);

    useEffect(() => {
        if (editDate) {
            async function loadExisting() {
                const { data } = await supabase.from('wellness_logs').select('*').eq('checkin_date', editDate).single();
                if (data) {
                    setSeverity(data.severity_rating);
                    setAgitation(data.agitation_level);
                    setMood(data.mood_rating);
                    setMemory(data.memory_score);
                    setMedsTaken(data.meds_taken);
                    setIsEmergency(data.is_emergency);
                }
            }
            loadExisting();
        }
    }, [editDate]);

    async function handleSave(formData: FormData) {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return alert("Please log in first");

        const entry = {
            user_id: user.id,
            checkin_date: selectedDate,
            wake_time: formData.get('wake_time'),
            nap_count: Number(formData.get('nap_count')),
            exercise_mins: Number(formData.get('exercise_mins')),
            meal_details: formData.get('meal_details'),
            severity_rating: severity || 5,
            agitation_level: agitation || 1,
            mood_rating: mood || 5,
            memory_score: memory || 5,
            meds_taken: medsTaken,
            is_emergency: formData.get('emergency') === 'on',
            notes: formData.get('notes'),
        };

        const { error } = await supabase.from('wellness_logs').upsert(entry, { onConflict: 'user_id, checkin_date' });

        if (!error) {
            router.push('/history');
            router.refresh();
        } else {
            alert("Error: " + error.message);
        }
        setLoading(false);
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 py-10 px-4">
            <header>
                <h1 className="text-3xl font-bold text-slate-900 text-center md:text-left">Daily Wellness Check-in</h1>
                <p className="text-slate-500 text-lg text-center md:text-left">Track your health metrics for today.</p>
            </header>

            <form action={handleSave} className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-8 text-slate-700">
                {/* date, wakeup time, naps */}
                <div className="space-y-6">
                    <div>
                        <label className="block font-semibold mb-2">Check-in Date</label>
                        <input 
                            type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <p className="text-xs text-slate-400 mt-2 text-left">Check-in new or missed entries.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block font-semibold mb-2">Wake up time</label>
                            <input name="wake_time" type="time" className="w-full p-3 border border-slate-200 rounded-xl" />
                        </div>
                        <div>
                            <label className="block font-semibold mb-2">Naps taken today</label>
                            <input name="nap_count" type="number" defaultValue="0" className="w-full p-3 border border-slate-200 rounded-xl" />
                        </div>
                    </div>
                </div>

                {/* metrics */}
                <div className="space-y-10 py-4 border-y border-slate-50">
                    <MetricSelector label="Alzheimer Severity" value={severity} onChange={setSeverity} minLabel="Mild" maxLabel="Severe" />
                    <MetricSelector label="Agitation / Irritability" value={agitation} onChange={setAgitation} minLabel="Calm" maxLabel="Agitated" />
                    <MetricSelector label="Mood Rating" value={mood} onChange={setMood} minLabel="Sad" maxLabel="Happy" reverse />
                    <MetricSelector label="Memory & Clarity" value={memory} onChange={setMemory} minLabel="Confused" maxLabel="Clear" reverse />
                </div>

                {/* qualitative fields & notes */}
                <div className="space-y-6">
                    <div>
                        <label className="block font-semibold mb-2 text-center md:text-left">Exercise (minutes)</label>
                        <input name="exercise_mins" type="number" placeholder="Eg. 30" className="w-full p-3 border border-slate-200 rounded-xl" />
                    </div>

                    <div>
                        <label className="block font-semibold mb-2 text-center md:text-left">Meals & Content</label>
                        <textarea name="meal_details" placeholder="What did you eat today?" className="w-full p-3 border border-slate-200 rounded-xl h-24 text-sm" />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 ${
                            medsTaken ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-slate-50 border-slate-200'
                        }`}>
                            <input 
                                type="checkbox" 
                                checked={medsTaken} 
                                onChange={(e) => setMedsTaken(e.target.checked)} 
                                className="w-5 h-5 accent-emerald-600 cursor-pointer" 
                            />
                            <label className={`font-semibold cursor-pointer ${medsTaken ? 'text-emerald-700' : 'text-slate-500'}`}>
                                All Medications Taken
                            </label>
                        </div>
                        
                        <div className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 ${
                            isEmergency ? 'bg-red-50 border-red-200 shadow-sm' : 'bg-slate-50 border-slate-200'
                        }`}>
                            <input 
                                name="emergency" 
                                type="checkbox" 
                                checked={isEmergency}
                                onChange={(e) => setIsEmergency(e.target.checked)}
                                className="w-5 h-5 accent-red-600 cursor-pointer" 
                            />
                            <label className={`font-bold cursor-pointer ${isEmergency ? 'text-red-700' : 'text-slate-500'}`}>
                                There was a Medical Emergency / Hospitalization
                            </label>
                        </div>
                    </div>

                    <hr className="border-slate-200 my-8" />

                    <div>
                        <label className="block font-semibold mb-2 text-center md:text-left">Daily Notes & Observations</label>
                        <textarea 
                            name="notes" 
                            placeholder="Any specific behaviors, mood changes, or special events today?" 
                            className="w-full p-4 border border-slate-200 rounded-2xl h-32 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                        />
                        <p className="text-xs text-slate-400 mt-2 italic">Eg. Had trouble recognizing the remote control today.</p>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition active:scale-95 disabled:opacity-50 shadow-md shadow-blue-200"
                >
                    {loading ? 'Saving Metrics...' : 'Update Daily Log'}
                </button>
            </form>
        </div>
    )
}

interface MetricSelectorProps {
    label: string;
    value: number | null;
    onChange: (val: number | null) => void;
    minLabel: string;
    maxLabel: string;
    reverse?: boolean;
}

function MetricSelector({ label, value, onChange, minLabel, maxLabel, reverse = false }: MetricSelectorProps) {
    const getBtnColor = (n: number) => {
        if (value !== n) return 'bg-slate-50 text-slate-400 border-slate-100';
        
        const intensity = reverse ? (11 - n) : n; 
        if (intensity <= 3) return 'bg-emerald-500 text-white border-emerald-500 shadow-sm';
        if (intensity <= 7) return 'bg-amber-500 text-white border-amber-500 shadow-sm';
        return 'bg-red-600 text-white border-red-600 shadow-sm';
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4 mb-2">
                <span className="text-sm font-bold text-slate-400 whitespace-nowrap uppercase tracking-widest">{label}</span>
                <div className="h-px bg-slate-100 w-full"></div>
            </div>

            <div className="flex gap-1.5">
                {[...Array(10)].map((_, i) => {
                    const n = i + 1;
                    return (
                        <button
                            key={n} type="button"
                            onClick={() => onChange(value === n ? null : n)}
                            className={`flex-1 py-3 text-sm font-black rounded-lg border transition-all ${getBtnColor(n)}`}
                        >
                            {n}
                        </button>
                    )
                })}
            </div>
            
            <div className="flex justify-between px-1 text-[10px] font-bold text-slate-300 uppercase">
                <span>{minLabel}</span>
                <span>{maxLabel}</span>
            </div>
        </div>
    )
}