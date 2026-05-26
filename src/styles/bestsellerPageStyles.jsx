// ── Page layout ───────────────────────────────────────────────
export const page = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '32px 24px',
}

export const headerRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '24px',
  flexWrap: 'wrap',
  gap: '12px',
}

export const titleRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '4px',
}

export const titleText = {
  fontSize: '22px',
  fontWeight: 800,
  margin: 0,
}

export const topBadge = {
  background: '#FFF3E0',
  color: '#e65100',
  fontSize: '12px',
  fontWeight: 700,
  padding: '3px 10px',
  borderRadius: '20px',
}

export const countText = {
  fontSize: '13px',
  color: '#999',
  margin: 0,
}

export const countHighlight = {
  color: '#1565c0',
}

export const kyoboButton = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  background: '#ff6f00',
  color: '#fff',
  padding: '10px 20px',
  borderRadius: '8px',
  fontWeight: 700,
  fontSize: '14px',
  textDecoration: 'none',
  boxShadow: '0 2px 8px rgba(255,111,0,.35)',
}

// ── Search + Sort bar ─────────────────────────────────────────
export const searchBar = {
  display: 'flex',
  gap: '10px',
  marginBottom: '24px',
  flexWrap: 'wrap',
}

export const searchWrapper = {
  position: 'relative',
  flex: 1,
  minWidth: '220px',
}

export const searchIcon = {
  position: 'absolute',
  left: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  pointerEvents: 'none',
}

export const searchInput = (active) => ({
  width: '100%',
  padding: '11px 36px 11px 38px',
  border: `1.5px solid ${active ? '#ff6f00' : '#e0e0e0'}`,
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none',
  boxShadow: active ? '0 0 0 3px rgba(255,111,0,.12)' : 'none',
  transition: 'all .18s',
})

export const clearButton = {
  position: 'absolute',
  right: '10px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#9e9e9e',
  fontSize: '18px',
  padding: '2px',
}

export const sortSelect = {
  padding: '11px 14px',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  fontSize: '14px',
  background: '#fff',
  cursor: 'pointer',
  minWidth: '130px',
}

// ── Error ─────────────────────────────────────────────────────
export const errorBox = {
  background: '#ffebee',
  border: '1px solid #ef9a9a',
  borderRadius: '8px',
  padding: '16px',
  color: '#c62828',
  fontSize: '14px',
  marginBottom: '24px',
}

// ── Empty / No results ────────────────────────────────────────
export const emptyState = {
  textAlign: 'center',
  padding: '60px 0',
  color: '#9e9e9e',
}

export const emptyIcon        = { fontSize: '48px', marginBottom: '12px' }
export const emptyHeading     = { fontSize: '16px', fontWeight: 600, marginBottom: '6px' }
export const emptyResetButton = {
  marginTop: '12px',
  background: '#f5f5f5',
  border: 'none',
  padding: '8px 18px',
  borderRadius: '6px',
  cursor: 'pointer',
  color: '#555',
  fontWeight: 600,
}

// ── Grid ──────────────────────────────────────────────────────
export const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap: '20px',
}

// ── Footer ────────────────────────────────────────────────────
export const footer = {
  textAlign: 'center',
  marginTop: '48px',
  paddingTop: '24px',
  borderTop: '1px solid #eee',
}

export const footerText = {
  fontSize: '13px',
  color: '#bbb',
  marginBottom: '12px',
}

export const footerLink = {
  color: '#ff6f00',
  fontWeight: 700,
  fontSize: '14px',
  textDecoration: 'none',
}

// ── Card ──────────────────────────────────────────────────────
export const card = (hovered) => ({
  background: '#fff',
  borderRadius: '10px',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: hovered ? '0 10px 28px rgba(0,0,0,.14)' : '0 2px 8px rgba(0,0,0,.08)',
  transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
  transition: 'all .22s',
  position: 'relative',
})

export const rankBadge = (rank) => ({
  position: 'absolute',
  top: '10px',
  left: '10px',
  zIndex: 2,
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  background: rank === 1 ? '#FFF8E1' : rank === 2 ? '#F5F5F5' : rank === 3 ? '#FBE9E7' : '#E3F2FD',
  color:      rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : rank === 3 ? '#CD7F32' : '#1565c0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 800,
  fontSize: '13px',
  boxShadow: '0 2px 6px rgba(0,0,0,.15)',
})

export const coverWrapper = {
  width: '100%',
  aspectRatio: '3/4',
  background: '#f5f5f5',
  overflow: 'hidden',
  flexShrink: 0,
}

export const coverImg = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
}

export const coverPlaceholder = (rank) => ({
  width: '100%',
  height: '100%',
  background: `hsl(${(rank * 37) % 360}, 50%, 85%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  gap: '8px',
})

export const placeholderIcon  = { fontSize: '32px' }
export const placeholderTitle = {
  fontSize: '11px',
  fontWeight: 700,
  color: '#555',
  textAlign: 'center',
  padding: '0 8px',
}

export const cardInfo = {
  padding: '12px',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  gap: '8px',
}

export const cardTitle = {
  fontWeight: 700,
  fontSize: '13px',
  color: '#1a1a1a',
  lineHeight: 1.4,
  marginBottom: '4px',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
}

export const cardAuthor = {
  fontSize: '11px',
  color: '#888',
  display: '-webkit-box',
  WebkitLineClamp: 1,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
}

export const cardPublisher = {
  fontSize: '11px',
  color: '#bbb',
  marginTop: '2px',
}

export const priceRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}

export const priceText = {
  fontSize: '13px',
  fontWeight: 700,
  color: '#e53935',
}

export const kyoboCardButton = (hovered) => ({
  display: 'block',
  textAlign: 'center',
  background: hovered ? '#e65100' : '#ff6f00',
  color: '#fff',
  borderRadius: '6px',
  padding: '7px 0',
  fontSize: '12px',
  fontWeight: 700,
  textDecoration: 'none',
  transition: 'background .15s',
})

export const highlight = {
  background: '#fff176',
  borderRadius: '2px',
  padding: '0 1px',
}