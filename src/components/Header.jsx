import { Link, useNavigate, useLocation } from 'react-router-dom'

const S = {
  header: {
    background: '#1565c0', color: '#fff', height: '56px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 28px', boxShadow: '0 2px 6px rgba(0,0,0,.25)',
    position: 'sticky', top: 0, zIndex: 100,
  },
  brand: { color: '#fff', fontWeight: 700, fontSize: '18px' },
  nav:   { display: 'flex', alignItems: 'center', gap: '20px' },
}

const navLink = (active) => ({
  color: '#fff', fontSize: '15px', opacity: active ? 1 : .82,
  fontWeight: active ? 600 : 400, textDecoration: 'none',
  borderBottom: active ? '2px solid #fff' : '2px solid transparent',
  paddingBottom: '2px',
})

export default function Header() {
  const navigate     = useNavigate()
  const { pathname } = useLocation()

  return (
    <header style={S.header}>
      <Link to="/" style={S.brand}>도서관리</Link>
      <nav style={S.nav}>
        <Link to="/"            style={navLink(pathname === '/')}>홈</Link>
        <Link to="/books"       style={navLink(pathname === '/books')}>도서 목록</Link>
        <Link to="/bestsellers" style={navLink(pathname === '/bestsellers')}>베스트셀러</Link>
        <button
          onClick={() => navigate('/books/new')}
          style={{ background: '#e91e63', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '4px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
        >
          새 도서 등록
        </button>
      </nav>
    </header>
  )
}