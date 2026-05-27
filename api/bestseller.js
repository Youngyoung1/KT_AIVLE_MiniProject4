const path = require('path')
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') })

const express = require('express')
const cors    = require('cors')
const fetch   = require('node-fetch')

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// ── AI Cover Generation ───────────────────────────────────────
app.post('/api/generate-cover', async (req, res) => {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: '서버에 OPENAI_API_KEY가 설정되지 않았습니다.' })
  }

  try {
    const { model, quality, prompt } = req.body

    const body = {
      model: model === 'dall-e-3' ? 'dall-e-3' : 'gpt-image-1',
      prompt: prompt || 'A beautiful book cover illustration',
      n: 1,
      size: model === 'dall-e-3' ? '1024x1792' : '1024x1536',
    }
    if (model === 'gpt-image-1') { body.output_format = 'png'; body.quality = quality }
    if (model === 'dall-e-3')    { body.response_format = 'b64_json'; body.quality = quality === 'high' ? 'hd' : 'standard' }

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error?.message || '이미지 생성 중 오류가 발생했습니다.')
    }

    const data = await response.json()
    const b64 = data.data[0].b64_json
    if (!b64) throw new Error('이미지 데이터를 찾을 수 없습니다.')
    const imageSrc = `data:image/png;base64,${b64}`
    return res.json({ imageSrc })
  } catch (error) {
    console.error('[generate-cover error]', error.message)
    return res.status(500).json({ error: error.message })
  }
})

// ── Bestsellers (알라딘 API) ──────────────────────────────────
app.get('/api/bestsellers', async (req, res) => {
  const API_KEY = process.env.ALADIN_API_KEY
  if (!API_KEY) {
    return res.status(500).json({ error: '.env에 ALADIN_API_KEY가 없습니다.' })
  }

  try {
    const url = `http://www.aladin.co.kr/ttb/api/ItemList.aspx` +
      `?ttbkey=${API_KEY}` +
      `&QueryType=Bestseller` +
      `&MaxResults=100` +
      `&start=1` +
      `&SearchTarget=Book` +
      `&output=js` +
      `&Version=20131101` +
      `&Cover=Big`

    const response = await fetch(url)
    const text = await response.text()

    if (!response.ok) throw new Error(`알라딘 API 응답 오류: HTTP ${response.status}`)

    const data = JSON.parse(text)
    if (!data.item || data.item.length === 0) throw new Error('베스트셀러 데이터가 없습니다.')

    const books = data.item.map((item, i) => ({
      rank:      i + 1,
      title:     item.title,
      author:    item.author,
      publisher: item.publisher,
      price:     String(item.priceSales).replace(/\B(?=(\d{3})+(?!\d))/g, ','),
      isbn:      item.isbn13 || item.isbn,
      cover:     item.cover,
      kyoboUrl:  `https://www.kyobobook.co.kr/product/detailViewKor.laf?barcode=${item.isbn13 || item.isbn}`,
      aladinUrl: item.link,
      pubDate:   item.pubDate,
    }))

    res.json({ source: 'aladin', books })
  } catch (err) {
    console.error('[bestseller error]', err.message)
    res.status(502).json({ error: err.message })
  }
})

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.BESTSELLER_PORT || 3001
app.listen(PORT, () => {
  console.log(`✅ Bestseller server → http://localhost:${PORT}`)
  console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ 있음' : '❌ 없음')
  console.log('ALADIN_API_KEY:', process.env.ALADIN_API_KEY ? '✅ 있음' : '❌ 없음')
})