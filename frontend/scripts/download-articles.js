const https = require('https')
const { writeFileSync } = require('fs')
const { XMLParser } = require('fast-xml-parser')

const baseUrl = 'https://danwakeem-news-chat-summaries-dev.s3.amazonaws.com'
const getFromUrl = (url) => {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = ''
        res.on('data', (chunk) => {
          data += chunk
        })
        res.on('end', () => {
          resolve(data)
        })
      })
      .on('error', (error) => {
        reject(error)
      })
  })
}

const saveStringToFile = (string, fileName) => {
  const path = `${__dirname}/../data/blog/${fileName}`
  writeFileSync(path, string, { encoding: 'utf8' })
}

;(async () => {
  try {
    const xml = await getFromUrl(baseUrl)
    const parser = new XMLParser()
    const json = parser.parse(xml)
    const blogArticles = json?.ListBucketResult?.Contents || []
    for (const { Key } of blogArticles) {
      const article = await getFromUrl(`${baseUrl}/${Key}`)
      saveStringToFile(article, Key)
      console.log('Downloaded: ', Key)
    }
  } catch (error) {
    console.error(error)
  }
})()
