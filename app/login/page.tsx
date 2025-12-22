import { login, signup } from '../login/actions'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string; message?: string }>
}) {
    const { error } = await searchParams;

    return (
        <div className="flex min-h-[80vh] items-center justify-center">
            <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-200 bg-white p-10 shadow-xl">

        {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium">
                {error}
            </div>
        )}

            <div className="text-center">
                <h1 className="text-3xl font-extrabold text-blue-600">AlzheimerFairy <span className="text-blue-600">AI</span></h1>
                <p className="mt-2 text-slate-500">Track the wellbeing of your loved ones.</p>
            </div>

                <form className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="mt-1 block w-full rounded-lg border border-slate-400 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="mt-1 block w-full rounded-lg border border-slate-400 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button formAction={login} className="w-full rounded-lg bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700">
                            Log In
                        </button>
                        <button formAction={signup} className="w-full rounded-lg border border-slate-400 px-4 py-3 font-bold text-slate-700 transition hover:bg-slate-50">
                            Sign Up
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}