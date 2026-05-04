'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const supabase = createClient()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [success, setSuccess]   = useState(false)
  const [loading, setLoading]   = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'var(--wq-bg)' }}>
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">📬</div>
          <h2 className="text-2xl font-bold mb-3">E-postanı kontrol et!</h2>
          <p style={{ color: 'var(--wq-text-muted)' }}>
            <strong>{email}</strong> adresine doğrulama e-postası gönderdik.
            Linke tıklayarak hesabını aktifleştir.
          </p>
          <Link href="/auth/login" className="inline-block mt-6 text-sm font-semibold"
            style={{ color: 'var(--wq-primary)' }}>← Giriş sayfasına dön</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--wq-bg)' }}>
      <div className="wq-glow-bg" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block text-3xl mb-4">⚡</Link>
          <h1 className="text-2xl font-bold">Yolculuğa başla</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--wq-text-muted)' }}>
            Ücretsiz hesap oluştur
          </p>
        </div>

        <div className="rounded-2xl p-8"
          style={{ background: 'var(--wq-surface)', border: '1px solid var(--wq-border)' }}>
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2"
                style={{ color: 'var(--wq-text-muted)' }}>Ad Soyad</label>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                required placeholder="Adın Soyadın"
                className="w-full px-4 py-3 rounded-xl outline-none"
                style={{
                  background: 'var(--wq-surface-2)', border: '1px solid var(--wq-border)',
                  color: 'var(--wq-text)',
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2"
                style={{ color: 'var(--wq-text-muted)' }}>E-posta</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="sen@ornek.com"
                className="w-full px-4 py-3 rounded-xl outline-none"
                style={{
                  background: 'var(--wq-surface-2)', border: '1px solid var(--wq-border)',
                  color: 'var(--wq-text)',
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2"
                style={{ color: 'var(--wq-text-muted)' }}>Şifre</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                required minLength={6} placeholder="En az 6 karakter"
                className="w-full px-4 py-3 rounded-xl outline-none"
                style={{
                  background: 'var(--wq-surface-2)', border: '1px solid var(--wq-border)',
                  color: 'var(--wq-text)',
                }}
              />
            </div>

            {error && (
              <p className="text-sm px-4 py-3 rounded-xl"
                style={{ background: 'var(--wq-warn-dim)', color: 'var(--wq-warn)' }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-semibold transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--wq-primary)', color: '#fff' }}>
              {loading ? 'Hesap oluşturuluyor…' : 'Kayıt Ol'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm" style={{ color: 'var(--wq-text-muted)' }}>
          Zaten hesabın var mı?{' '}
          <Link href="/auth/login" className="font-semibold"
            style={{ color: 'var(--wq-primary)' }}>Giriş yap</Link>
        </p>
      </div>
    </div>
  )
}
