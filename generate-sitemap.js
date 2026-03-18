import { SitemapStream, streamToPromise } from 'sitemap'
import { writeFileSync, existsSync, mkdirSync } from 'fs'

const hostname = 'https://playful-custard-95a74a.netlify.app'

// ✅ Pages structure (SEO optimized)
const pages = [
    // Core pages
    { url: '/', priority: 1.0, changefreq: 'weekly' },
    { url: '/contact', priority: 0.6, changefreq: 'yearly' },
    { url: '/book-online', priority: 0.9, changefreq: 'weekly' },

    // Country-level SEO page
    { url: '/caravan-storage-australia', priority: 0.9, changefreq: 'weekly' },

    // State-level pages (Australia)
    { url: '/caravan-storage-nsw', priority: 0.8, changefreq: 'weekly' },
    { url: '/caravan-storage-queensland', priority: 0.8, changefreq: 'weekly' },
    { url: '/caravan-storage-victoria', priority: 0.8, changefreq: 'weekly' },
    { url: '/caravan-storage-western-australia', priority: 0.8, changefreq: 'weekly' }
]

async function generateSitemap() {
    const sitemap = new SitemapStream({ hostname })
    const lastModDate = new Date().toISOString()

    pages.forEach(page => {
        sitemap.write({
            url: page.url,
            lastmod: lastModDate,
            changefreq: page.changefreq,
            priority: page.priority
        })
    })

    sitemap.end()

    try {
        const data = await streamToPromise(sitemap)

        if (!existsSync('./public')) {
            mkdirSync('./public')
        }

        writeFileSync('./public/sitemap.xml', data.toString())
        console.log('🚀 Sitemap generated successfully (Australia SEO ready)')
    } catch (err) {
        console.error('❌ Error generating sitemap:', err)
    }
}

generateSitemap()