import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getBook, updateBook, deleteBook, generateCover } from '../services/api'
import { label, greenBtn, redBtn, blueBtn, backBtnStyle, panel, selectStyle, dateStyle } from '../styles/bookDetailPageStyles'

// ─── Constants ──────────────────────────────────────────────
const MODELS = [
  { value: 'gpt-image-1', label: 'GPT Image 1 (1024×1536)' },
  { value: 'dall-e-3', label: 'DALL-E 3 (1024×1792)' },
]

const QUALITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

// ─── Toast ───────────────────────────────────────────────────
function Toast({ msg, type }) {
  if (!msg) return null
  return <div className={`toast ${type}`}>{msg}</div>
}

// ─── Main component ──────────────────────────────────────────
export default function BookDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState(null)

  // AI generation state (💡 apiKey 관련 state와 로컬 스토리지 Fetch 이펙트는 통째로 삭제했습니다)
  const [model, setModel] = useState('gpt-image-1')
  const [quality, setQuality] = useState('low')
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState(null)

  // Toast
  const [toast, setToast] = useState({ msg: '', type: 'success' })
  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast({ msg: '', type }), 3000)
  }, [])

  // ── Fetch book ───────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
      ; (async () => {
        try {
          setLoading(true)
          const data = await getBook(id)
          if (!cancelled) setBook(data)
        } catch {
          if (!cancelled) setPageError('도서 정보를 불러오지 못했습니다.')
        } finally {
          if (!cancelled) setLoading(false)
        }
      })()
    return () => { cancelled = true }
  }, [id])

  // ── Delete ───────────────────────────────────────────────
  async function handleDelete() {
    if (!confirm(`"${book.title}" 을(를) 정말 삭제하시겠습니까?`)) return
    try {
      await deleteBook(id)
      navigate('/books')
    } catch {
      showToast('삭제에 실패했습니다.', 'error')
    }
  }

  // ── AI Cover Generation ──────────────────────────────────
  async function handleGenerateCover() {
    // 💡 프런트엔드단 키 검증 로직 삭제 (백엔드에서 처리)
    setGenError(null)
    setGenerating(true)

    try {
      // 💡 인자에서 apiKey를 완전히 제거했습니다.
      const imageUrl = await generateCover({
        model,
        quality,
        title: book.title,
        description: book.description,
        bookId:id,
      })

      await updateBook(id, { coverImageUrl: imageUrl })
      setBook(prev => ({ ...prev, coverImageUrl: imageUrl }))
      showToast('표지가 생성되었습니다! 🎨')
    } catch (err) {
      setGenError(err.message)
      showToast('표지 생성에 실패했습니다.', 'error')
    } finally {
      setGenerating(false)
    }
  }

  // ── Render states ────────────────────────────────────────
  if (loading) return <div className="spinner" />
  if (pageError) return (
    <div className="page" style={{ color: '#c62828' }}>
      <p>{pageError}</p>
      <button onClick={() => navigate('/books')} style={backBtnStyle}>← 목록으로</button>
    </div>
  )
  if (!book) return null

  return (
    <div className="page">
      <Toast msg={toast.msg} type={toast.type} />

      {/* ── Title + Edit / Delete ─────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700 }}>{book.title}</h1>
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button onClick={() => navigate(`/books/${id}/edit`)} style={greenBtn}>수정</button>
          <button onClick={handleDelete} style={redBtn}>삭제</button>
        </div>
      </div>

      {/* ── AI 표지 생성 panel ────────────────────────────── */}
      <section style={panel}>
        <h3 style={{ textAlign: 'center', marginBottom: '18px', fontSize: '17px', fontWeight: 700 }}>
          AI 표지 생성
        </h3>

        {/* 💡 OpenAI API Key Input 폼 영역 및 비용 안내 문구 전체 삭제 */}

        {/* Model + Quality row */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '18px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <div>
            {label('생성 모델:')}
            <select value={model} onChange={e => setModel(e.target.value)} style={selectStyle}>
              {MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            {label('품질:')}
            <select value={quality} onChange={e => setQuality(e.target.value)} style={selectStyle}>
              {QUALITY_OPTIONS.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}
            </select>
          </div>
        </div>

        {/* Error */}
        {genError && (
          <p style={{ color: '#c62828', fontSize: '13px', textAlign: 'center', marginBottom: '12px' }}>
            ⚠ {genError}
          </p>
        )}

        {/* Generate button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleGenerateCover}
            disabled={generating}
            style={{ ...blueBtn, opacity: generating ? .65 : 1, cursor: generating ? 'not-allowed' : 'pointer', minWidth: '140px' }}
          >
            {generating ? '생성 중...' : 'AI 표지생성'}
          </button>
        </div>

        {/* Loading bar */}
        {generating && (
          <div style={{ marginTop: '14px', height: '3px', background: '#bbdefb', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '40%', background: '#1976d2', borderRadius: '3px', animation: 'slide 1.4s ease-in-out infinite' }} />
          </div>
        )}
        <style>{`@keyframes slide { 0%{margin-left:-40%} 100%{margin-left:100%} }`}</style>
      </section>

      {/* ── Content: cover image + description ───────────── */}
      <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start', marginBottom: '32px' }}>
        {/* Cover */}
        {book.coverImageUrl && (
          <img
            src={book.coverImageUrl}
            alt={`${book.title} 표지`}
            style={{
              width: '180px',
              flexShrink: 0,
              borderRadius: '6px',
              boxShadow: '0 6px 20px rgba(0,0,0,.22)',
              objectFit: 'cover',
            }}
          />
        )}

        {/* Description + dates */}
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '10px' }}>책 내용</h3>
          <p style={{ fontSize: '14px', lineHeight: 1.9, color: '#444', whiteSpace: 'pre-wrap' }}>
            {book.description || '등록된 내용이 없습니다.'}
          </p>

          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={dateStyle}>생성일: {fmt(book.createdAt)}</span>
            <span style={dateStyle}>수정일: {fmt(book.updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* ── Back button ───────────────────────────────────── */}
      <button onClick={() => navigate('/books')} style={backBtnStyle}>
        도서 목록으로 돌아가기
      </button>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────
const fmt = (iso) =>
  new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })