import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getBooks, deleteBook } from '../services/api'
import {
  page, headerRow, title, countText, primaryButton,
  searchWrapper, searchIcon, searchInput, clearButton,
  filterBar, sortSelect, filterToggle, resetButton,
  errorBox, emptyState, emptyIcon, emptyHeading, emptyDescription, emptyButton, noResultButton,
  grid, card, cardNormal, cardHovered,
  coverWrapper, coverImg, placeholderWrapper, placeholderIcon, placeholderText,
  infoWrapper, infoTitle, infoDesc, infoFooter, dateText, badgePrimary, badgeSecondary,
  overlay, overlayBtn,
} from '../styles/bookListPageStyles'

// ── Highlight matched keyword ─────────────────────────────────
function Highlight({ text = '', query = '' }) {
  if (!query.trim()) return <>{text}</>
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part)
          ? <mark key={i} style={{ background: '#fff176', color: '#1a1a1a', borderRadius: '2px', padding: '0 1px' }}>{part}</mark>
          : part
      )}
    </>
  )
}

// ── Placeholder when no cover image ───────────────────────────
function CoverPlaceholder({ title }) {
  const colors = ['#bbdefb','#c8e6c9','#ffe0b2','#f8bbd0','#e1bee7','#b2ebf2']
  const bg = colors[title.charCodeAt(0) % colors.length]
  return (
    <div style={{ ...placeholderWrapper, background: bg }}>
      <span style={placeholderIcon}>📚</span>
      <span style={placeholderText}>{title}</span>
    </div>
  )
}

// ── Grid card ─────────────────────────────────────────────────
function BookCard({ book, query, onDelete }) {
  const navigate  = useNavigate()
  const [hovered, setHovered] = useState(false)

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!confirm(`"${book.title}" 을(를) 삭제하시겠습니까?`)) return
    await onDelete(book.id)
  }

  return (
    <div
      onClick={() => navigate(`/books/${book.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ ...card, ...(hovered ? cardHovered : cardNormal) }}
    >
      <div style={coverWrapper}>
        {book.coverImageUrl
          ? <img src={book.coverImageUrl} alt={book.title} style={coverImg} />
          : <CoverPlaceholder title={book.title} />
        }
        {hovered && (
          <div style={overlay}>
            <button onClick={e => { e.stopPropagation(); navigate(`/books/${book.id}/edit`) }} style={overlayBtn('#43a047')}>수정</button>
            <button onClick={handleDelete} style={overlayBtn('#e53935')}>삭제</button>
          </div>
        )}
      </div>

      <div style={infoWrapper}>
        <div>
          <div style={infoTitle}>
            <Highlight text={book.title} query={query} />
          </div>
          <div style={infoDesc}>
            <Highlight text={book.description || '내용 없음'} query={query} />
          </div>
        </div>
        <div style={infoFooter}>
          <span style={dateText}>{new Date(book.createdAt).toLocaleDateString('ko-KR')}</span>
          {book.coverImageUrl
            ? <span style={badgePrimary}>AI 표지</span>
            : <span style={badgeSecondary}>표지 없음</span>
          }
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────
export default function BookListPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [books,   setBooks]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const [query,    setQuery]    = useState(() => searchParams.get('q') || '')
  const [sortBy,   setSortBy]   = useState('newest')
  const [filterAI, setFilterAI] = useState(false)
  const searchRef = useRef(null)

  useEffect(() => { load() }, [])

  // Ctrl+K / ⌘K → focus search
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  async function load() {
    try {
      setLoading(true); setError(null)
      setBooks(await getBooks())
    } catch {
      setError('도서 목록을 불러오지 못했습니다. json-server가 실행 중인지 확인하세요.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    try {
      await deleteBook(id)
      setBooks(prev => prev.filter(b => b.id !== String(id)))
    } catch {
      alert('삭제에 실패했습니다.')
    }
  }

  // Filter + sort (client-side, instant)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let result = books
    if (q) result = result.filter(b =>
      b.title.toLowerCase().includes(q) ||
      (b.description || '').toLowerCase().includes(q)
    )
    if (filterAI) result = result.filter(b => !!b.coverImageUrl)
    return [...result].sort((a, b) => {
      if (sortBy === 'title')  return a.title.localeCompare(b.title, 'ko')
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
  }, [books, query, sortBy, filterAI])

  const hasActiveFilter = query.trim() || filterAI || sortBy !== 'newest'
  const resetAll = () => { setQuery(''); setSortBy('newest'); setFilterAI(false) }

  if (loading) return <div className="spinner" />

  return (
    <div className="page" style={page}>

      {/* ── Header row ── */}
      <div style={headerRow}>
        <div>
          <h2 style={title}>도서 목록</h2>
          <p style={countText}>
            {query.trim()
              ? <><strong style={{ color: '#1565c0' }}>{filtered.length}</strong>건 검색됨 / 전체 {books.length}권</>
              : `총 ${books.length}권`
            }
          </p>
        </div>
        <button onClick={() => navigate('/books/new')} style={primaryButton}>
          + 새 도서 등록
        </button>
      </div>

      {/* ── Search bar ── */}
      <div style={searchWrapper}>
        <svg
          width="17" height="17" viewBox="0 0 24 24" fill="none"
          stroke="#9e9e9e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
          style={searchIcon}
        >
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={searchRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="제목 또는 내용으로 검색... (Ctrl+K)"
          style={searchInput(!!query)}
          onFocus={e  => (e.target.style.borderColor = '#1976d2')}
          onBlur={e   => (e.target.style.borderColor = query ? '#1976d2' : '#e0e0e0')}
        />
        {query && (
          <button onClick={() => { setQuery(''); searchRef.current?.focus() }} style={clearButton}>×</button>
        )}
      </div>

      {/* ── Filter bar ── */}
      <div style={filterBar}>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={sortSelect}>
          <option value="newest">최신순</option>
          <option value="oldest">오래된순</option>
          <option value="title">제목순</option>
        </select>
        <button onClick={() => setFilterAI(p => !p)} style={filterToggle(filterAI)}>
          🎨 AI 표지만 보기
        </button>
        {hasActiveFilter && (
          <button onClick={resetAll} style={resetButton}>초기화</button>
        )}
      </div>

      {/* ── Error ── */}
      {error && <div style={errorBox}>{error}</div>}

      {/* ── Empty: no books at all ── */}
      {!error && books.length === 0 && (
        <div style={emptyState}>
          <div style={emptyIcon}>📚</div>
          <p style={emptyHeading}>등록된 도서가 없습니다.</p>
          <p style={emptyDescription}>첫 번째 도서를 등록해보세요!</p>
          <button onClick={() => navigate('/books/new')} style={emptyButton}>도서 등록하기</button>
        </div>
      )}

      {/* ── Empty: no search results ── */}
      {books.length > 0 && filtered.length === 0 && (
        <div style={emptyState}>
          <div style={emptyIcon}>🔍</div>
          <p style={emptyHeading}>
            "<strong style={{ color: '#1a1a1a' }}>{query}</strong>" 검색 결과가 없습니다.
          </p>
          <p style={emptyDescription}>제목이나 내용을 다시 확인해보세요.</p>
          <button onClick={resetAll} style={noResultButton}>검색 초기화</button>
        </div>
      )}

      {/* ── Grid ── */}
      {filtered.length > 0 && (
        <div style={grid}>
          {filtered.map(book => (
            <BookCard key={book.id} book={book} query={query} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}