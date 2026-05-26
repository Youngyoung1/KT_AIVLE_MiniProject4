require('dotenv').config()
const jsonServer = require('json-server')
const express    = require('express')
const fetch      = require('node-fetch')
const cheerio    = require('cheerio')

// ── json-server (Books CRUD) ──────────────────────────────────
const initialData = {
  books: [
    {
      id: "1",
      title: "상록수",
      description: "이야기를 9기의 수강생이 이전의 과정에서 살습자료로 발표한 '상록수'의 내용을 표지에 담고 싶어.",
      coverImageUrl: null,
      createdAt: "2026-04-24T00:00:00.000Z",
      updatedAt: "2026-05-13T00:00:00.000Z"
    }
  ]
}

const app        = jsonServer.create()
const router     = jsonServer.router(initialData)
const middlewares = jsonServer.defaults({ noCors: false })

// Strip /api prefix forwarded by Vite proxy and Vercel rewrite
app.use((req, _res, next) => {
  req.url = req.url.replace(/^\/api/, '') || '/'
  next()
})

app.use(middlewares)

// ── Bestsellers: 매 요청마다 교보문고에서 실시간 스크래핑 ─────
// 저장 없음 — 항상 fresh fetch
app.get('/bestsellers', async (req, res) => {
  try {
    const response = await fetch(
      'https://www.kyobobook.co.kr/bestSeller/bestseller.laf?mallGb=KOR&orderClick=LAG',
      {
        headers: {
          'User-Agent':      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept-Language': 'ko-KR,ko;q=0.9',
          'Referer':         'https://www.kyobobook.co.kr/',
        },
        timeout: 10000,
      }
    )

    if (!response.ok) throw new Error(`교보문고 응답 오류: HTTP ${response.status}`)

    const html  = await response.text()
    const $     = cheerio.load(html)
    const books = []

    $('.prod_item').each((i, el) => {
      if (books.length >= 100) return false
      const $el       = $(el)
      const isbn      = $el.find('[data-barcode]').attr('data-barcode') || ''
      const title     = $el.find('.prod_name').text().trim() || $el.find('.title').text().trim()
      const author    = $el.find('.prod_author').text().trim()    || ''
      const publisher = $el.find('.prod_publisher').text().trim() || ''
      const price     = $el.find('.prod_price').text().trim().replace(/[^\d,]/g, '') || ''
      const cover     = $el.find('img').attr('src') || ''
      const kyoboUrl  = isbn
        ? `https://www.kyobobook.co.kr/product/detailViewKor.laf?barcode=${isbn}`
        : ''

      if (title) books.push({ rank: i + 1, title, author, publisher, price, isbn, cover, kyoboUrl })
    })

    if (books.length === 0) throw new Error('파싱된 도서가 없습니다. 교보문고 HTML 구조가 변경되었을 수 있습니다.')

    res.json({ source: 'live', books })
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
})

// json-server 라우터는 맨 마지막에
app.use(router)

// Local dev
if (require.main === module) {
  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => console.log(`✅  Server → http://localhost:${PORT}`))
}

module.exports = app