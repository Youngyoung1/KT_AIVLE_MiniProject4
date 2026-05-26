require('dotenv').config()
const express = require('express')
const cors    = require('cors')
const fetch   = require('node-fetch')

const app = express()
app.use(cors())
app.use(express.json())

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
    if (!response.ok) throw new Error(`알라딘 API 응답 오류: HTTP ${response.status}`)

    const data = await response.json()

    if (!data.item || data.item.length === 0) {
      throw new Error('베스트셀러 데이터가 없습니다.')
    }

    const books = data.item.map((item, i) => ({
      rank:      i + 1,
      title:     item.title,
      author:    item.author,
      publisher: item.publisher,
      price:     String(item.priceSales).replace(/\B(?=(\d{3})+(?!\d))/g, ','),
      isbn:      item.isbn13 || item.isbn,
      cover:     item.cover,
      aladinUrl: item.link,
      pubDate:   item.pubDate,
    }))

    res.json({ source: 'aladin', books })
  } catch (err) {
    console.error('[bestseller error]', err.message)
    res.status(502).json({ error: err.message })
  }
})

const PORT = process.env.BESTSELLER_PORT || 3001
app.listen(PORT, () => console.log(`✅ Bestseller server → http://localhost:${PORT}`))