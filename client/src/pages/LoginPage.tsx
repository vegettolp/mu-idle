import { useState } from 'react'

interface Props {
  onLogin: (token: string) => void
}

export default function LoginPage({ onLogin }: Props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!username || !password) { setError('Preencha usuario e senha'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || 'Erro ao logar'); return }
      onLogin(data.token || '')
    } catch {
      setError('Erro de conexao com o servidor')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!username || !password) { setError('Preencha usuario e senha'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || 'Erro ao criar conta'); return }
      setError('Conta criada! Faca login.')
    } catch {
      setError('Erro de conexao com o servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#1f2937', padding: '32px', borderRadius: '8px', width: '384px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#fbbf24', textAlign: 'center', marginBottom: '32px' }}>MU Idle</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input type="text" placeholder="Email" value={username} onChange={e => setUsername(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#374151', border: '1px solid #4b5563', color: 'white', boxSizing: 'border-box' }} />
          <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#374151', border: '1px solid #4b5563', color: 'white', boxSizing: 'border-box' }} />
          {error && <div style={{ color: '#ef4444', fontSize: '13px', textAlign: 'center' }}>{error}</div>}
          <button onClick={handleLogin} disabled={loading}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: loading ? '#4a1a8a' : '#6b21a8', color: 'white', fontWeight: 'bold', border: 'none', cursor: loading ? 'default' : 'pointer' }}>
            {loading ? 'ENTRANDO...' : 'ENTRAR'}
          </button>
          <button onClick={handleRegister} disabled={loading}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#374151', color: 'white', border: 'none', cursor: loading ? 'default' : 'pointer' }}>
            CRIAR CONTA
          </button>
        </div>
      </div>
    </div>
  )
}