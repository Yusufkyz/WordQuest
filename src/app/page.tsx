import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <div className="wq-glow-bg" />

      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        {/* Logo */}
        <div className="inline-flex items-center gap-3 mb-8 px-4 py-2 rounded-full"
          style={{ background: 'var(--wq-surface)', border: '1px solid var(--wq-border)' }}>
          <span className="text-2xl">⚡</span>
          <span className="font-bold tracking-widest text-sm uppercase"
            style={{ color: 'var(--wq-text-muted)' }}>WordQuest</span>
        </div>

        {/* Hero */}
        <h1 className="text-6xl md:text-8xl font-extrabold leading-none mb-6 wq-animate-in"
          style={{
            background: 'linear-gradient(135deg, var(--wq-text) 0%, var(--wq-primary) 50%, var(--wq-accent) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
          İngilizce<br />Kelime Ustası
        </h1>

        <p className="text-lg md:text-xl mb-12 leading-relaxed"
          style={{ color: 'var(--wq-text-muted)', animationDelay: '0.1s' }}
          className="wq-animate-in">
          Bilimsel aralıklı tekrar yöntemiyle 1000+ kelimeyi<br />
          kalıcı olarak hafızana işle.
        </p>

        {/* Stats row */}
        <div className="flex items-center justify-center gap-8 mb-12 text-sm"
          style={{ color: 'var(--wq-text-faint)' }}>
          {[
            ['1000+', 'Kelime'],
            ['5', 'CEFR Seviyesi'],
            ['7×', 'Tekrar Sistemi'],
          ].map(([val, label]) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-bold" style={{ color: 'var(--wq-accent)' }}>{val}</div>
              <div>{label}</div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/signup"
            className="px-8 py-4 rounded-xl text-white font-semibold text-lg transition-all duration-200 hover:scale-105 hover:shadow-lg"
            style={{
              background: 'linear-gradient(135deg, var(--wq-primary), var(--wq-primary-dim))',
              boxShadow: '0 4px 24px var(--wq-primary-glow)',
            }}>
            Ücretsiz Başla →
          </Link>
          <Link href="/auth/login"
            className="px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-105"
            style={{
              border: '1px solid var(--wq-border)',
              color: 'var(--wq-text-muted)',
              background: 'var(--wq-surface)',
            }}>
            Giriş Yap
          </Link>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-20">
          {[
            { icon: '🧠', title: 'Spaced Repetition', desc: 'SM-2 algoritmasıyla akıllı tekrar planlaması' },
            { icon: '🎯', title: '5 Pratik Modu', desc: 'Quiz, yazım, telaffuz, boşluk doldurma' },
            { icon: '🏆', title: 'Seviye Sınavları', desc: 'A1\'den C1\'e doğru ilerle, rozetler kazan' },
          ].map(f => (
            <div key={f.title} className="p-6 rounded-2xl text-left"
              style={{ background: 'var(--wq-surface)', border: '1px solid var(--wq-border)' }}>
              <div className="text-3xl mb-3">{f.icon}</div>
              <div className="font-semibold mb-1">{f.title}</div>
              <div className="text-sm" style={{ color: 'var(--wq-text-muted)' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
