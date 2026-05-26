import { useState, useEffect, useMemo, useRef } from 'react'
import {
  page, headerRow, titleRow, titleText, topBadge, countText, countHighlight,
  kyoboButton, searchBar, searchWrapper, searchIcon, searchInput, clearButton,
  sortSelect, errorBox, emptyState, emptyIcon, emptyHeading, emptyResetButton,
  grid, footer, footerText, footerLink,
  card, rankBadge, coverWrapper, coverImg, coverPlaceholder,
  placeholderIcon, placeholderTitle, cardInfo, cardTitle, cardAuthor,
  cardPublisher, priceRow, priceText, kyoboCardButton, highlight,
} from '../styles/BestSellerPageStyles'

// 💡 알라딘 공식 웹 사이트 베스트셀러 주소로 변경
const ALADIN_BEST = 'https://www.aladin.co.kr/shop/common/wbest.aspx?BranchType=1'

// ── Keyword highlight ─────────────────────────────────────────
function Highlight({ text = '', query = '' }) {
  if (!query.trim()) return <>{text}</>
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  return (
    <>
      {parts.map((p, i) =>
        regex.test(p) ? <mark key={i} style={highlight}>{p}</mark> : p
      )}
    </>
  )
}

// ── Book Card ─────────────────────────────────────────────────
function BookCard({ book, query }) {
  const [imgErr,  setImgErr]  = useState(false)
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={card(hovered)}
    >
      {/* Rank badge */}
      <div style={rankBadge(book.rank)}>{book.rank}</div>

      {/* Cover */}
      <div style={coverWrapper}>
        {!imgErr && book.cover
          ? <img
              src={book.cover}
              alt={book.title}
              onError={() => setImgErr(true)}
              style={coverImg}
              referrerPolicy="no-referrer"
            />
          : <div style={coverPlaceholder(book.rank)}>
              <span style={placeholderIcon}>📚</span>
              <span style={placeholderTitle}>{book.title}</span>
            </div>
        }
      </div>

      {/* Info */}
      <div style={cardInfo}>
        <div>
          <div style={cardTitle}>
            <Highlight text={book.title} query={query} />
          </div>
          <div style={cardAuthor}>
            <Highlight text={book.author} query={query} />
          </div>
          {book.publisher && (
            <div style={cardPublisher}>{book.publisher}</div>
          )}
        </div>

        <div style={priceRow}>
          <span style={priceText}>{book.price ? `${book.price}원` : ''}</span>
        </div>

        {/* 💡 텍스트 문구 및 경로 매핑 변경 (스타일 변수명은 유지) */}
        <a
          href={book.aladinUrl} // 백엔드에서 알라딘 링크를 여기에 매핑해 주었으므로 그대로 사용합니다.
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          style={kyoboCardButton(hovered)}
        >
          알라딘에서 보기 →
        </a>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────
export default function BestsellerPage() {
  const [books,   setBooks]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [query,   setQuery]   = useState('')
  const [sortBy,  setSortBy]  = useState('rank')
  const searchRef = useRef(null)

  useEffect(() => {
    fetch('/api/bestsellers')
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(d => setBooks(d.books || []))
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false))
  }, [])

  // Ctrl+K
  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let r = q
      ? books.filter(b =>
          b.title.toLowerCase().includes(q) ||
          (b.author || '').toLowerCase().includes(q) ||
          (b.publisher || '').toLowerCase().includes(q)
        )
      : [...books]

    if (sortBy === 'title') {
      r.sort((a, b) => a.title.localeCompare(b.title, 'ko'))
    } else if (sortBy === 'price-asc' || sortBy === 'price-desc') {
      // 💡 콤마(,)를 완전히 제거하고 숫자로 파싱하여 비교 (NaN 방지)
      r.sort((a, b) => {
        const priceA = parseInt(String(a.price).replace(/[^0-9]/g, '')) || 0
        const priceB = parseInt(String(b.price).replace(/[^0-9]/g, '')) || 0
        return sortBy === 'price-asc' ? priceA - priceB : priceB - priceA
      })
    } else {
      r.sort((a, b) => a.rank - b.rank)
    }

    return r
  }, [books, query, sortBy])

  return (
    <div style={page}>

      {/* ── Header ── */}
      <div style={headerRow}>
        <div>
          <div style={titleRow}>
            <h2 style={titleText}>📚 베스트셀러</h2>
            <span style={topBadge}>TOP {books.length}</span>
          </div>
          <p style={countText}>
            {query.trim()
              ? <><strong style={countHighlight}>{filtered.length}</strong>건 검색됨 / 전체 {books.length}권</>
              : `알라딘 베스트셀러 ${books.length}권` // 💡 텍스트 교체
            }
          </p>
        </div>

        {/* 💡 버튼 링크 및 텍스트 교체 */}
        <a href={ALADIN_BEST} target="_blank" rel="noopener noreferrer" style={kyoboButton}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          알라딘 바로가기
        </a>
      </div>

      {/* ── Search + Sort ── */}
      <div style={searchBar}>
        <div style={searchWrapper}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={searchIcon}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="제목, 저자, 출판사로 검색... (Ctrl+K)"
            style={searchInput(!!query)}
          />
          {query && (
            <button onClick={() => setQuery('')} style={clearButton}>×</button>
          )}
        </div>

        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={sortSelect}>
          <option value="rank">순위순</option>
          <option value="title">제목순</option>
          <option value="price-asc">가격 낮은순</option>
          <option value="price-desc">가격 높은순</option>
        </select>
      </div>

      {/* ── States ── */}
      {loading && <div className="spinner" />}

      {error && (
        <div style={errorBox}>베스트셀러를 불러오지 못했습니다: {error}</div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div style={emptyState}>
          <div style={emptyIcon}>🔍</div>
          <p style={emptyHeading}>
            "<strong style={{ color: '#1a1a1a' }}>{query}</strong>" 검색 결과가 없습니다.
          </p>
          <button onClick={() => setQuery('')} style={emptyResetButton}>초기화</button>
        </div>
      )}

      {/* ── Grid ── */}
      {!loading && !error && filtered.length > 0 && (
        <div style={grid}>
          {filtered.map(book => (
            <BookCard key={book.rank} book={book} query={query} />
          ))}
        </div>
      )}

      {/* ── Footer ── */}
      {/* 💡 하단 카피라이트 출처 교체 */}
      {!loading && books.length > 0 && (
        <div style={footer}>
          <p style={footerText}>데이터 출처: 알라딘 베스트셀러 API</p>
          <a href={ALADIN_BEST} target="_blank" rel="noopener noreferrer" style={footerLink}>
            알라딘 전체 베스트셀러 보기 →
          </a>
        </div>
      )}
    </div>
  )
}