interface Props {
  onLogin: () => void
}

export default function LoginPage({ onLogin }: Props) {
  return (
    <div style={{ minHeight: '100vh', background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#1f2937', padding: '32px', borderRadius: '8px', width: '384px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#fbbf24', textAlign: 'center', marginBottom: '32px' }}>MU Idle</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input type="text" placeholder="Usuario" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#374151', border: '1px solid #4b5563', color: 'white' }} />
          <input type="password" placeholder="Senha" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#374151', border: '1px solid #4b5563', color: 'white' }} />
          <button onClick={onLogin} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#6b21a8', color: 'white', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>ENTRAR</button>
          <button style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#374151', color: 'white', border: 'none', cursor: 'pointer' }}>CRIAR CONTA</button>
        </div>
      </div>
    </div>
  )
}