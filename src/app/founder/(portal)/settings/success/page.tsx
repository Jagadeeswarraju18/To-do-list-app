import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ChevronRight } from 'lucide-react';

export default function SuccessPage() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md w-full p-10 border border-white/10 rounded-2xl bg-zinc-900/30">
                <div className="mb-6 flex justify-center">
                    <CheckCircle2 className="w-14 h-14 text-emerald-500" />
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">
                    Payment Successful
                </h1>
                <p className="text-zinc-400 mb-8 leading-relaxed">
                    Your account has been upgraded. You now have full access to your new plan features.
                </p>

                <Link 
                    href="/founder/dashboard"
                    className="w-full py-4 bg-white text-black font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all"
                >
                    Go to Dashboard
                    <ChevronRight className="w-5 h-5" />
                </Link>

                <p className="mt-8 text-[10px] text-zinc-600 uppercase tracking-widest font-medium">
                    Subscription Active
                </p>
            </div>
        </div>
    );
}
