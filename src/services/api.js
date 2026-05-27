// All API calls use /api/* which is:
//  - Local dev : proxied by Vite to http://localhost:3001 (api/server.js)
//  - Vercel    : handled by api/server.js serverless function

const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}`
  : '/api'


async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }
  const text = await res.text()
  return text ? JSON.parse(text) : {}
}

// ─── Books CRUD ────────────────────────────────────────────
export const getBooks = () => request(`${BASE}/books`)

export const getBook = (id) => request(`${BASE}/books/${id}`)

export const createBook = (data) =>
  request(`${BASE}/books`, {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      favorite: false,
      coverImageUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
  })

export const updateBook = (id, data) =>
  request(`${BASE}/books/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ ...data, updatedAt: new Date().toISOString() }),
  })

export const deleteBook = (id) =>
  request(`${BASE}/books/${id}`, { method: 'DELETE' })

// ─── AI Cover Generation ────────────────────────────────────
// Flow:
//  ① caller sets loading = true (컴포넌트 단에서 처리)
//  ② POST to 우리 백엔드 서버 (/api/generate-cover) 
//  ③ 백엔드가 Vercel Env에서 키를 꺼내 OpenAI와 통신 후 가공된 b64_json(Data URL) 응답
//  ④ bookId가 주어지면 json-server의 해당 도서에 coverImageUrl만 PATCH
//  (returned string is the Data URL)

// 💡 이제 파라미터에서 apiKey가 완전히 제외되었습니다!
export async function generateCover({ model, quality, title, description, bookId }) {
  const prompt =
    `A professional, artistic book cover for a book titled "${title}".` +
    (description ? ` The book is about: ${description}.` : '') +
    ' Style: high-quality publisher design, visually striking, elegant typography.'

  const responseData = await request(`${BASE}/generate-cover`, {
    method: 'POST',
    body: JSON.stringify({ model, quality, prompt }),
  })

  const imageSrc = responseData.imageSrc
  if (!imageSrc) throw new Error('서버 응답에서 이미지 데이터를 찾을 수 없습니다.')

  if (bookId) {
    await request(`${BASE}/books/${bookId}`, {
      method: 'PATCH',
      body: JSON.stringify({ coverImageUrl: imageSrc, updatedAt: new Date().toISOString() }),
    })
  }

  return imageSrc
}