import Link from 'next/link'
import { Heart, Activity, Brain, ShieldCheck } from 'lucide-react'

export default function WelcomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900">
      {/* hero/landing */}
      <section className="px-6 py-20 text-center space-y-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-bold border border-blue-100 mb-4">
          <Brain className="w-4 h-4 mr-2" /> AI-Powered Wellness Care for Alzheimer&apos;s
        </div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight">
          AlzheimerFairy <span className="text-blue-600">Care System</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          This simple, daily tracker uses machine learning to bridge the gap between caregivers, patients, and better health outcomes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link href="/login" className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
            Get Started Free
          </Link>
          <Link href="#how-it-works" className="px-8 py-4 bg-white border border-slate-200 hover:border-slate-400 font-bold rounded-2xl hover:bg-slate-50 transition-all">
            Learn How It Works
          </Link>
        </div>
      </section>

      {/* features */}
      <section id="how-it-works" className="bg-slate-50 py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
          <FeatureCard 
            icon={<Heart className="w-8 h-8 text-red-500" />}
            title="Daily Wellness Checks"
            desc="Track meals, sleep, and activity in 60 seconds. Editable entries ensure data accuracy even on long and busy days."
          />
          <FeatureCard 
            icon={<Activity className="w-8 h-8 text-blue-500" />}
            title="Condition Prediction"
            desc="AlzheimerFairy&apos;s ML models analyze patterns to help predict severity spikes before they become emergencies."
          />
          <FeatureCard 
            icon={<ShieldCheck className="w-8 h-8 text-green-500" />}
            title="Secure History"
            desc="Encrypted entrie and logs can be shared with medical professionals to provide a clearer clinical picture."
          />
        </div>
      </section>

      {/* summary */}
      <section className="py-20 text-center border-t border-slate-100">
        <h2 className="text-2xl font-bold italic text-slate-400">Consistency is Key. Your Health Comes First!</h2>
        <p className="mt-4 text-slate-500 max-w-lg mx-auto">
          Missed a day? Don&apos;t worry. AlzheimerFairy is designed to handle missing entries and still provide meaningful insights.
        </p>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-6">{icon}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{desc}</p>
    </div>
  )
}