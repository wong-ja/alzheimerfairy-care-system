"use client"
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function CheckinPage() {
    const [loading, setLoading] = useState(false)

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

                <div>
                    <label className="block font-semibold mb-2 text-blue-700">Alzheimer Severity (1-10)</label>
                    <input name="severity" type="range" min="1" max="10" className="w-full h-3 bg-blue-100 rounded-lg appearance-none cursor-pointer" />
                    <div className="flex justify-between text-xs text-slate-400 mt-2">
                        <span>Mild</span><span>Moderate</span><span>Severe</span>
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