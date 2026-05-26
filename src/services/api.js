// All API calls use /api/* which is:
//  - Local dev : proxied by Vite to http://localhost:3000 (json-server)
//  - Vercel    : handled by api/server.js serverless function

const BASE = '/api'

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }
  // DELETE returns {} from json-server
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
//  ① validate apiKey
//  ② caller sets loading = true
//  ③ POST to OpenAI → b64_json
//  ④ convert to Data URL
//  ⑤ caller PATCHes coverImageUrl to json-server
//  (returned string is the Data URL)

export async function generateCover({ apiKey, model, quality, title, description, bookId }) {
  const modelConfig = {
    'gpt-image-1': { size: '1024x1536' },
    'dall-e-3':    { size: '1024x1792' },
  }

  const prompt =
    `A professional, artistic book cover for a book titled "${title}".` +
    (description ? ` The book is about: ${description}.` : '') +
    ' Style: high-quality publisher design, visually striking, elegant typography.'

  const body = {
    model,
    prompt,
    n: 1,
    size: modelConfig[model]?.size ?? '1024x1536',
    output_format: 'png',
  }

  // dall-e-3 uses 'standard'/'hd' quality; gpt-image-1 uses 'low'/'medium'/'high'
  if (model === 'gpt-image-1') body.quality = quality
  if (model === 'dall-e-3')    body.quality = quality === 'high' ? 'hd' : 'standard'

  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  // 첫 시도: 기존 DALL·E 엔드포인트
  let data
  if (!res.ok) {
    // 상세한 응답 읽기
    let errBody
    try { errBody = await res.json() } catch { errBody = await res.text() }
    const errMsg = errBody?.error?.message || String(errBody)

    // 일부 환경에서 메서드 오류가 발생하면 대체 엔드포인트로 재시도
    if (res.status === 405 || /Invalid method/i.test(errMsg)) {
      const altRes = await fetch('https://api.openai.com/v1/images/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!altRes.ok) {
        let altErr
        try { altErr = await altRes.json() } catch { altErr = await altRes.text() }
        throw new Error(altErr?.error?.message || String(altErr) || 'OpenAI API 오류가 발생했습니다.')
      }

      data = await altRes.json()
    } else {
      throw new Error(errMsg || 'OpenAI API 오류가 발생했습니다.')
    }
  } else {
    data = await res.json()
  }
  // ④ b64_json → Data URL
  const b64Json = data.data?.[0]?.b64_json
  if (!b64Json) throw new Error('이미지 응답에서 b64_json을 찾을 수 없습니다.')
  const imageSrc = `data:image/png;base64,${b64Json}`

  // ⑤ bookId가 주어지면 json-server의 해당 도서에 coverImageUrl만 PATCH
  if (bookId) {
    await request(`${BASE}/books/${bookId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        coverImageUrl: imageSrc,
        updatedAt: new Date().toISOString(),
      }),
    })
  }

  return imageSrc
}
