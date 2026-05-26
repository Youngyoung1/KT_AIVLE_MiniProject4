import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBooks, deleteBook, updateBook } from '../services/api'
import {
  page,
  headerRow,
  title,
  countText,
  primaryButton,
  errorBox,
  emptyState,
  emptyIcon,
  emptyHeading,
  emptyDescription,
  emptyButton,
  grid,
  card,
  cardNormal,
  cardHovered,
  coverWrapper,
  coverImg,
  placeholderWrapper,
  placeholderIcon,
  placeholderText,
  infoWrapper,
  infoTitle,
  infoDesc,
  infoFooter,
  dateText,
  badgePrimary,
  badgeSecondary,
  overlay,
  overlayBtn,
} from '../styles/bookListPageStyles'

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

// ── Grid card (vertical book-cover style) ─────────────────────
function BookCard({ book, onDelete, onToggleFavorite }) {
  const navigate  = useNavigate()
  const [hovered, setHovered] = useState(false)

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!confirm(`"${book.title}" 을(를) 삭제하시겠습니까?`)) return
    await onDelete(book.id)
  }

  const handleFavorite = async (e) => {
    e.stopPropagation();
    await onToggleFavorite(book)
  }

  return (
    <div
      onClick={() => navigate(`/books/${book.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ ...card, ...(hovered ? cardHovered : cardNormal) }}
    >
      {/* ── Thumbnail (tall book-cover ratio) ── */}
      <div style={coverWrapper}>
        {book.coverImageUrl
          ? <img
              src={book.coverImageUrl}
              alt={book.title}
              style={coverImg}
            />
          : <CoverPlaceholder title={book.title} />
        }

        {/* Hover overlay with action buttons */}
        {hovered && (
          <div style={overlay}>
            <button
              onClick={e => { e.stopPropagation(); navigate(`/books/${book.id}/edit`) }}
              style={overlayBtn('#43a047')}
            >수정</button>
            <button onClick={handleDelete} style={overlayBtn('#e53935')}>삭제</button>
          </div>
        )}
      </div>

      {/* ── Card info ── */}
      <div style={infoWrapper}>
        <button onClick={handleFavorite}
            style={{
                alignSelf: 'flex-end',
                border: 'none',
                background: 'transparent',
                fontSize: '22px',
                cursor: 'pointer',
                marginBottom: '4px',
            }}
        >{book.favorite ? '❤️' : '🤍'}</button>

        <div>
          <div style={infoTitle}>
            {book.title}
          </div>
          <div style={infoDesc}>
            {book.description || '내용 없음'}
          </div>
        </div>

        <div style={infoFooter}>
          <span style={dateText}>
            {new Date(book.createdAt).toLocaleDateString('ko-KR')}
          </span>
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
  const [books,   setBooks]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => { load() }, [])

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

  async function handleToggleFavorite(book){
    try {
      const nextFavorite = !book.favorite
        
        await updateBook(book.id, {
          favorite: nextFavorite,
        })

        setBooks(prev => prev.map(b =>
          b.id === book.id
          ? {...b, favorite: nextFavorite}
          : b
        ))
    } catch {
        alert('즐겨찾기 변경에 실패했습니다.')
    }
  }

  if (loading) return <div className="spinner" />

  return (
    <div className="page" style={page}>
      {/* Header row */}
      <div style={headerRow}>
        <div>
          <h2 style={title}>도서 목록</h2>
          {books.length > 0 && (
            <p style={countText}>총 {books.length}권</p>
          )}
        </div>
        <button
          onClick={() => navigate('/books/new')}
          style={primaryButton}
        >
          + 새 도서 등록
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={errorBox}>
          {error}
        </div>
      )}

      {/* Empty state */}
      {!error && books.length === 0 && (
        <div style={emptyState}>
          <div style={emptyIcon}>📚</div>
          <p style={emptyHeading}>등록된 도서가 없습니다.</p>
          <p style={emptyDescription}>첫 번째 도서를 등록해보세요!</p>
          <button
            onClick={() => navigate('/books/new')}
            style={emptyButton}
          >
            도서 등록하기
          </button>
        </div>
      )}

      {/* ── Grid ── */}
      <div style={grid}>
        {books.map(book => (
          <BookCard key={book.id} book={book} onDelete={handleDelete} onToggleFavorite={handleToggleFavorite} />
        ))}
      </div>
    </div>
  )
}