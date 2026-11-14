export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col justify-between p-6 sm:p-12 md:p-16 max-w-5xl mx-auto">
      {/* Header */}
      <header className="space-y-4 pt-4 sm:pt-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          NASA Space Apps Challenge 2026 • Colombo
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white">
          TriOrbit <span className="text-cyan-400">Lunar Survival</span> Simulator
        </h1>
        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed">
          Junior Astronaut Mission Trainer: Keep your three-person crew alive for 5 simulated lunar days. Balance critical life-support vitals against space weather and habitat anomalies.
        </p>
      </header>

      {/* Mission Architecture Grid */}
      <section className="my-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-label="Mission Architecture">
        <article className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
          <div className="text-xs font-mono uppercase text-slate-500 mb-1">Subsystem 01</div>
          <h2 className="text-base font-semibold text-slate-200">5-Day Survival Loop</h2>
          <p className="text-sm text-slate-400 mt-2">
            Sequential day progression with a budget of 2 maintenance decisions per day before day settlement.
          </p>
        </article>

        <article className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
          <div className="text-xs font-mono uppercase text-slate-500 mb-1">Subsystem 02</div>
          <h2 className="text-base font-semibold text-slate-200">4 Base Modules</h2>
          <p className="text-sm text-slate-400 mt-2">
            Life Support Habitat, Solar Array Station, Hydroponics Bay, and Shielded Lunar Bunker.
          </p>
        </article>

        <article className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
          <div className="text-xs font-mono uppercase text-slate-500 mb-1">Subsystem 03</div>
          <h2 className="text-base font-semibold text-slate-200">5 Normalized Vitals</h2>
          <p className="text-sm text-slate-400 mt-2">
            Oxygen, Power, Water, Food, and Radiation Risk tracked as educational normalized game units (0–100).
          </p>
        </article>

        <article className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
          <div className="text-xs font-mono uppercase text-slate-500 mb-1">Subsystem 04</div>
          <h2 className="text-base font-semibold text-slate-200">NASA DONKI Telemetry</h2>
          <p className="text-sm text-slate-400 mt-2">
            Live and offline fallback space weather events with transparent source provenance and scientific honesty disclosures.
          </p>
        </article>

        <article className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
          <div className="text-xs font-mono uppercase text-slate-500 mb-1">Subsystem 05</div>
          <h2 className="text-base font-semibold text-slate-200">Pure Simulation Engine</h2>
          <p className="text-sm text-slate-400 mt-2">
            Deterministic state transitions, difficulty balancing, and reproducible win/loss outcomes.
          </p>
        </article>

        <article className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
          <div className="text-xs font-mono uppercase text-slate-500 mb-1">Status</div>
          <div className="inline-flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-sm font-semibold text-emerald-400">Scaffold Active (TRI-006)</span>
          </div>
          <p className="text-sm text-slate-400 mt-2">
            Foundation verified. Parallel lanes for UI, Engine, and NASA Science are ready to build.
          </p>
        </article>
      </section>

      {/* Footer */}
      <footer className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
        <div>Project TriOrbit • NASA Space Apps 2026</div>
        <div className="flex items-center gap-4">
          <span>Next.js App Router</span>
          <span>TypeScript</span>
          <span>Tailwind CSS</span>
        </div>
      </footer>
    </main>
  );
}
