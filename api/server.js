import express from 'express'
import { createRequire } from 'module'
import cors from 'cors'
import dotenv from 'dotenv'
import { OpenAI } from 'openai'

dotenv.config()

const require = createRequire(import.meta.url)
const jsonServer = require('json-server')

const app = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))

// ── OpenAI ────────────────────────────────────────────────────
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// ── AI Cover Generation ───────────────────────────────────────
app.post('/api/generate-cover', async (req, res) => {
  try {
    const { model, quality, prompt } = req.body

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: '서버에 OpenAI API Key가 설정되지 않았습니다.' })
    }

    const response = await openai.images.generate({
      model: model === 'dall-e-3' ? 'dall-e-3' : 'dall-e-2',
      prompt: prompt || 'A beautiful book cover illustration',
      n: 1,
      size: '1024x1024',
      quality: quality === 'high' ? 'hd' : 'standard',
      response_format: 'b64_json',
    })

    const base64Image = response.data[0].b64_json
    const imageSrc = `data:image/png;base64,${base64Image}`
    return res.json({ imageSrc })
  } catch (error) {
    console.error('OpenAI Error:', error)
    return res.status(500).json({ error: error.message || '이미지 생성 중 오류가 발생했습니다.' })
  }
})

// ── Bestsellers ───────────────────────────────────────────────
app.get('/api/bestsellers', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default
    const cheerio = (await import('cheerio')).default || (await import('cheerio'))

    const response = await fetch(
      'https://www.kyobobook.co.kr/bestSeller/bestseller.laf?mallGb=KOR&orderClick=LAG',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36',
          'Accept-Language': 'ko-KR,ko;q=0.9',
        },
        timeout: 10000,
      }
    )
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const html = await response.text()
    const $ = cheerio.load(html)
    const books = []

    $('.prod_item').each((i, el) => {
      if (books.length >= 100) return false
      const $el = $(el)
      const isbn = $el.find('[data-barcode]').attr('data-barcode') || ''
      const title = $el.find('.prod_name').text().trim()
      const author = $el.find('.prod_author').text().trim() || ''
      const publisher = $el.find('.prod_publisher').text().trim() || ''
      const price = $el.find('.prod_price').text().trim().replace(/[^\d,]/g, '') || ''
      const cover = $el.find('img').attr('src') || ''
      const kyoboUrl = isbn ? `https://www.kyobobook.co.kr/product/detailViewKor.laf?barcode=${isbn}` : ''
      if (title) books.push({ rank: i + 1, title, author, publisher, price, isbn, cover, kyoboUrl })
    })

    if (books.length === 0) throw new Error('파싱된 도서가 없습니다.')
    res.json({ source: 'live', books })
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
})

// ── json-server (Books CRUD) ──────────────────────────────────
const dbRouter = jsonServer.router('db.json')
const middlewares = jsonServer.defaults({ noCors: false })

// /api/* → /* 변환 후 json-server로
app.use('/api', middlewares, dbRouter)

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`✅ 통합 백엔드 서버가 ${PORT}번 포트에서 가동 중입니다.`)
})