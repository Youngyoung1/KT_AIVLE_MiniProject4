import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function HomePage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const handleSearch = () => {
    const q = query.trim()
    navigate(q ? `/books?q=${encodeURIComponent(q)}` : '/books')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 56px)',
      background: '#fff',
      padding: '24px',
    }}>
      <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '12px', color: '#1a1a1a' }}>
        도서 관리 시스템에 오신 것을 환영합니다!
      </h1>
      <p style={{ fontSize: '15px', color: '#666', marginBottom: '36px' }}>
        이 시스템을 사용하여 도서를 등록하고 관리할 수 있습니다.
      </p>

      {/* ── Search bar ── */}
      <div style={{ display: 'flex', width: '100%', maxWidth: '480px', marginBottom: '16px', boxShadow: '0 2px 12px rgba(0,0,0,.1)', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <svg
            width="17" height="17" viewBox="0 0 24 24" fill="none"
            stroke="#9e9e9e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          >
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="도서 제목 또는 내용 검색..."
            autoFocus
            style={{
              width: '100%',
              padding: '14px 14px 14px 44px',
              border: 'none',
              fontSize: '15px',
              outline: 'none',
            }}
          />
        </div>
        <button
          onClick={handleSearch}
          style={{
            background: '#1976d2',
            color: '#fff',
            border: 'none',
            padding: '0 24px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          검색
        </button>
      </div>

      <button
        onClick={() => navigate('/books')}
        style={{
          background: 'none',
          color: '#1976d2',
          border: 'none',
          fontSize: '14px',
          cursor: 'pointer',
          textDecoration: 'underline',
        }}
      >
        전체 도서 목록 보기
      </button>
    </div>
  )
}