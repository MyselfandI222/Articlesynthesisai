import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/reddit': {
        target: 'https://www.reddit.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/reddit/, '')
      },
      '/api/hn': {
        target: 'https://hn.algolia.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/hn/, '')
      },
      '/api/wikipedia': {
        target: 'https://en.wikipedia.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/wikipedia/, '')
      },
      '/api/sportsdb': {
        target: 'https://www.thesportsdb.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/sportsdb/, '')
      },
      '/api/openliga': {
        target: 'https://api.openligadb.de',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/openliga/, '')
      },
      '/api/arxiv': {
        target: 'https://export.arxiv.org',
        changeOrigin: true,
        timeout: 60000,
        rewrite: (path) => path.replace(/^\/api\/arxiv/, '')
      },
      '/api/mit-news': {
        target: 'https://news.mit.edu',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/mit-news/, '')
      },
      '/api/stanford-hai': {
        target: 'https://hai.stanford.edu',
        changeOrigin: true,
        timeout: 60000,
        rewrite: (path) => path.replace(/^\/api\/stanford-hai/, '')
      },
      '/api/github': {
        target: 'https://api.github.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/github/, '')
      },
      '/api/stackoverflow': {
        target: 'https://api.stackexchange.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/stackoverflow/, '')
      },
      '/api/pubmed': {
        target: 'https://eutils.ncbi.nlm.nih.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/pubmed/, '')
      },
      '/api/crossref': {
        target: 'https://api.crossref.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/crossref/, '')
      },
      '/api/youtube': {
        target: 'https://www.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/youtube/, '')
      },
      '/api/medium': {
        target: 'https://medium.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/medium/, '')
      },
      '/api/coursera': {
        target: 'https://www.coursera.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/coursera/, '')
      },
      '/api/khan': {
        target: 'https://www.khanacademy.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/khan/, '')
      },
      '/api/ted': {
        target: 'https://www.ted.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ted/, '')
      },
      '/api/producthunt': {
        target: 'https://api.producthunt.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/producthunt/, '')
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
