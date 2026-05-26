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
// ── Bestsellers: 알라딘 공식 API 활용 (안정성 100%) ─────
app.get('/bestsellers', async (req, res) => {
  try {
    // 💡 상위 폴더 .env에 있는 API 키 가져오기
    const apiKey = process.env.ALADIN_API_KEY;
    
    if (!apiKey) {
      throw new Error("서버 환경 변수에 ALADIN_API_KEY가 설정되지 않았습니다.");
    }

    // 알라딘 공식 상품 리스트 API URL (QueryType=Bestseller)
    const aladinApiUrl = `http://www.aladin.co.kr/ttb/api/ItemList.aspx?ttbkey=${apiKey}&QueryType=Bestseller&MaxResults=30&start=1&SearchTarget=Book&output=js&Version=20131101`;

    const response = await fetch(aladinApiUrl, { timeout: 10000 });

    if (!response.ok) {
      throw new Error(`알라딘 API 응답 오류: HTTP ${response.status}`);
    }

    const data = await response.json();
    
    // 알라딘 결과 데이터가 없거나 에러가 반환된 경우 처리
    if (!data.item || data.errorMessage) {
      throw new Error(data.errorMessage || "알라딘에서 도서 정보를 가져오지 못했습니다.");
    }

    // 💡 기존 프론트엔드 데이터 형식과 동일하게 매핑
    const books = data.item.map((book, i) => ({
      rank: i + 1,
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      price: book.priceStandard ? String(book.priceStandard) : '',
      isbn: book.isbn13 || book.isbn || '',
      cover: book.cover, // 도서 표지 이미지 URL
      kyoboUrl: book.link // 프론트엔드 변수명(kyoboUrl)에 알라딘 상세 페이지 링크 매핑
    }));

    res.json({ source: 'aladin_api', books });

  } catch (err) {
    console.error("Aladin API Error: ", err.message);
    // Vercel 배포 환경에서 프론트엔드가 멈추지 않도록 200 상태코드와 빈 배열 반환
    res.status(200).json({ source: 'error_fallback', books: [], message: err.message });
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