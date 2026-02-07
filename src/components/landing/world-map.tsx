export function WorldMapSection() {
    return (
        <section className="py-32 bg-zinc-900 text-white relative overflow-hidden flex items-center justify-center">
            {/* Abstract Map Dots */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            
            <div className="relative z-10 text-center px-4">
                <div className="inline-block px-4 py-1 mb-6 rounded-full border border-emerald-500/50 text-emerald-400 bg-emerald-900/20 text-xs font-bold uppercase tracking-widest">
                    Global Sync
                </div>
                <h2 className="text-5xl md:text-8xl font-black tracking-tighter mb-6">
                    YOUR DATA.<br/>ANYWHERE.
                </h2>
                <p className="text-zinc-400 max-w-xl mx-auto text-lg">
                    Synced securely across the cloud using Neon DB. Access your vault, tasks, and logs from any device, anytime.
                </p>
            </div>
        </section>
    )
}