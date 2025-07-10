// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/reddit": {
        target: "https://www.reddit.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/reddit/, "")
      },
      "/api/hn": {
        target: "https://hn.algolia.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/hn/, "")
      },
      "/api/wikipedia": {
        target: "https://en.wikipedia.org",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/wikipedia/, "")
      },
      "/api/sportsdb": {
        target: "https://www.thesportsdb.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/sportsdb/, "")
      },
      "/api/openliga": {
        target: "https://api.openligadb.de",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/openliga/, "")
      },
      "/api/arxiv": {
        target: "https://export.arxiv.org",
        changeOrigin: true,
        timeout: 6e4,
        rewrite: (path) => path.replace(/^\/api\/arxiv/, "")
      },
      "/api/mit-news": {
        target: "https://news.mit.edu",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/mit-news/, "")
      },
      "/api/stanford-hai": {
        target: "https://hai.stanford.edu",
        changeOrigin: true,
        timeout: 6e4,
        rewrite: (path) => path.replace(/^\/api\/stanford-hai/, "")
      },
      "/api/github": {
        target: "https://api.github.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/github/, "")
      },
      "/api/stackoverflow": {
        target: "https://api.stackexchange.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/stackoverflow/, "")
      },
      "/api/pubmed": {
        target: "https://eutils.ncbi.nlm.nih.gov",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/pubmed/, "")
      },
      "/api/crossref": {
        target: "https://api.crossref.org",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/crossref/, "")
      },
      "/api/youtube": {
        target: "https://www.googleapis.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/youtube/, "")
      },
      "/api/medium": {
        target: "https://medium.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/medium/, "")
      },
      "/api/coursera": {
        target: "https://www.coursera.org",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/coursera/, "")
      },
      "/api/khan": {
        target: "https://www.khanacademy.org",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/khan/, "")
      },
      "/api/ted": {
        target: "https://www.ted.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ted/, "")
      },
      "/api/producthunt": {
        target: "https://api.producthunt.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/producthunt/, "")
      }
    }
  },
  optimizeDeps: {
    exclude: ["lucide-react"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gIHNlcnZlcjoge1xuICAgIHByb3h5OiB7XG4gICAgICAnL2FwaS9yZWRkaXQnOiB7XG4gICAgICAgIHRhcmdldDogJ2h0dHBzOi8vd3d3LnJlZGRpdC5jb20nLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGlcXC9yZWRkaXQvLCAnJylcbiAgICAgIH0sXG4gICAgICAnL2FwaS9obic6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cHM6Ly9obi5hbGdvbGlhLmNvbScsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgcmV3cml0ZTogKHBhdGgpID0+IHBhdGgucmVwbGFjZSgvXlxcL2FwaVxcL2huLywgJycpXG4gICAgICB9LFxuICAgICAgJy9hcGkvd2lraXBlZGlhJzoge1xuICAgICAgICB0YXJnZXQ6ICdodHRwczovL2VuLndpa2lwZWRpYS5vcmcnLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGlcXC93aWtpcGVkaWEvLCAnJylcbiAgICAgIH0sXG4gICAgICAnL2FwaS9zcG9ydHNkYic6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cHM6Ly93d3cudGhlc3BvcnRzZGIuY29tJyxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBpXFwvc3BvcnRzZGIvLCAnJylcbiAgICAgIH0sXG4gICAgICAnL2FwaS9vcGVubGlnYSc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cHM6Ly9hcGkub3BlbmxpZ2FkYi5kZScsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgcmV3cml0ZTogKHBhdGgpID0+IHBhdGgucmVwbGFjZSgvXlxcL2FwaVxcL29wZW5saWdhLywgJycpXG4gICAgICB9LFxuICAgICAgJy9hcGkvYXJ4aXYnOiB7XG4gICAgICAgIHRhcmdldDogJ2h0dHBzOi8vZXhwb3J0LmFyeGl2Lm9yZycsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgdGltZW91dDogNjAwMDAsXG4gICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGlcXC9hcnhpdi8sICcnKVxuICAgICAgfSxcbiAgICAgICcvYXBpL21pdC1uZXdzJzoge1xuICAgICAgICB0YXJnZXQ6ICdodHRwczovL25ld3MubWl0LmVkdScsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgcmV3cml0ZTogKHBhdGgpID0+IHBhdGgucmVwbGFjZSgvXlxcL2FwaVxcL21pdC1uZXdzLywgJycpXG4gICAgICB9LFxuICAgICAgJy9hcGkvc3RhbmZvcmQtaGFpJzoge1xuICAgICAgICB0YXJnZXQ6ICdodHRwczovL2hhaS5zdGFuZm9yZC5lZHUnLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIHRpbWVvdXQ6IDYwMDAwLFxuICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBpXFwvc3RhbmZvcmQtaGFpLywgJycpXG4gICAgICB9LFxuICAgICAgJy9hcGkvZ2l0aHViJzoge1xuICAgICAgICB0YXJnZXQ6ICdodHRwczovL2FwaS5naXRodWIuY29tJyxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBpXFwvZ2l0aHViLywgJycpXG4gICAgICB9LFxuICAgICAgJy9hcGkvc3RhY2tvdmVyZmxvdyc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cHM6Ly9hcGkuc3RhY2tleGNoYW5nZS5jb20nLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGlcXC9zdGFja292ZXJmbG93LywgJycpXG4gICAgICB9LFxuICAgICAgJy9hcGkvcHVibWVkJzoge1xuICAgICAgICB0YXJnZXQ6ICdodHRwczovL2V1dGlscy5uY2JpLm5sbS5uaWguZ292JyxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBpXFwvcHVibWVkLywgJycpXG4gICAgICB9LFxuICAgICAgJy9hcGkvY3Jvc3NyZWYnOiB7XG4gICAgICAgIHRhcmdldDogJ2h0dHBzOi8vYXBpLmNyb3NzcmVmLm9yZycsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgcmV3cml0ZTogKHBhdGgpID0+IHBhdGgucmVwbGFjZSgvXlxcL2FwaVxcL2Nyb3NzcmVmLywgJycpXG4gICAgICB9LFxuICAgICAgJy9hcGkveW91dHViZSc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20nLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGlcXC95b3V0dWJlLywgJycpXG4gICAgICB9LFxuICAgICAgJy9hcGkvbWVkaXVtJzoge1xuICAgICAgICB0YXJnZXQ6ICdodHRwczovL21lZGl1bS5jb20nLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGlcXC9tZWRpdW0vLCAnJylcbiAgICAgIH0sXG4gICAgICAnL2FwaS9jb3Vyc2VyYSc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cHM6Ly93d3cuY291cnNlcmEub3JnJyxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBpXFwvY291cnNlcmEvLCAnJylcbiAgICAgIH0sXG4gICAgICAnL2FwaS9raGFuJzoge1xuICAgICAgICB0YXJnZXQ6ICdodHRwczovL3d3dy5raGFuYWNhZGVteS5vcmcnLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGlcXC9raGFuLywgJycpXG4gICAgICB9LFxuICAgICAgJy9hcGkvdGVkJzoge1xuICAgICAgICB0YXJnZXQ6ICdodHRwczovL3d3dy50ZWQuY29tJyxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBpXFwvdGVkLywgJycpXG4gICAgICB9LFxuICAgICAgJy9hcGkvcHJvZHVjdGh1bnQnOiB7XG4gICAgICAgIHRhcmdldDogJ2h0dHBzOi8vYXBpLnByb2R1Y3RodW50LmNvbScsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgcmV3cml0ZTogKHBhdGgpID0+IHBhdGgucmVwbGFjZSgvXlxcL2FwaVxcL3Byb2R1Y3RodW50LywgJycpXG4gICAgICB9XG4gICAgfVxuICB9LFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBleGNsdWRlOiBbJ2x1Y2lkZS1yZWFjdCddLFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXlOLFNBQVMsb0JBQW9CO0FBQ3RQLE9BQU8sV0FBVztBQUdsQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsRUFDakIsUUFBUTtBQUFBLElBQ04sT0FBTztBQUFBLE1BQ0wsZUFBZTtBQUFBLFFBQ2IsUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsU0FBUyxDQUFDLFNBQVMsS0FBSyxRQUFRLGtCQUFrQixFQUFFO0FBQUEsTUFDdEQ7QUFBQSxNQUNBLFdBQVc7QUFBQSxRQUNULFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLFNBQVMsQ0FBQyxTQUFTLEtBQUssUUFBUSxjQUFjLEVBQUU7QUFBQSxNQUNsRDtBQUFBLE1BQ0Esa0JBQWtCO0FBQUEsUUFDaEIsUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsU0FBUyxDQUFDLFNBQVMsS0FBSyxRQUFRLHFCQUFxQixFQUFFO0FBQUEsTUFDekQ7QUFBQSxNQUNBLGlCQUFpQjtBQUFBLFFBQ2YsUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsU0FBUyxDQUFDLFNBQVMsS0FBSyxRQUFRLG9CQUFvQixFQUFFO0FBQUEsTUFDeEQ7QUFBQSxNQUNBLGlCQUFpQjtBQUFBLFFBQ2YsUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsU0FBUyxDQUFDLFNBQVMsS0FBSyxRQUFRLG9CQUFvQixFQUFFO0FBQUEsTUFDeEQ7QUFBQSxNQUNBLGNBQWM7QUFBQSxRQUNaLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLFNBQVM7QUFBQSxRQUNULFNBQVMsQ0FBQyxTQUFTLEtBQUssUUFBUSxpQkFBaUIsRUFBRTtBQUFBLE1BQ3JEO0FBQUEsTUFDQSxpQkFBaUI7QUFBQSxRQUNmLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLFNBQVMsQ0FBQyxTQUFTLEtBQUssUUFBUSxvQkFBb0IsRUFBRTtBQUFBLE1BQ3hEO0FBQUEsTUFDQSxxQkFBcUI7QUFBQSxRQUNuQixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxTQUFTO0FBQUEsUUFDVCxTQUFTLENBQUMsU0FBUyxLQUFLLFFBQVEsd0JBQXdCLEVBQUU7QUFBQSxNQUM1RDtBQUFBLE1BQ0EsZUFBZTtBQUFBLFFBQ2IsUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsU0FBUyxDQUFDLFNBQVMsS0FBSyxRQUFRLGtCQUFrQixFQUFFO0FBQUEsTUFDdEQ7QUFBQSxNQUNBLHNCQUFzQjtBQUFBLFFBQ3BCLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLFNBQVMsQ0FBQyxTQUFTLEtBQUssUUFBUSx5QkFBeUIsRUFBRTtBQUFBLE1BQzdEO0FBQUEsTUFDQSxlQUFlO0FBQUEsUUFDYixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxTQUFTLENBQUMsU0FBUyxLQUFLLFFBQVEsa0JBQWtCLEVBQUU7QUFBQSxNQUN0RDtBQUFBLE1BQ0EsaUJBQWlCO0FBQUEsUUFDZixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxTQUFTLENBQUMsU0FBUyxLQUFLLFFBQVEsb0JBQW9CLEVBQUU7QUFBQSxNQUN4RDtBQUFBLE1BQ0EsZ0JBQWdCO0FBQUEsUUFDZCxRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxTQUFTLENBQUMsU0FBUyxLQUFLLFFBQVEsbUJBQW1CLEVBQUU7QUFBQSxNQUN2RDtBQUFBLE1BQ0EsZUFBZTtBQUFBLFFBQ2IsUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsU0FBUyxDQUFDLFNBQVMsS0FBSyxRQUFRLGtCQUFrQixFQUFFO0FBQUEsTUFDdEQ7QUFBQSxNQUNBLGlCQUFpQjtBQUFBLFFBQ2YsUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsU0FBUyxDQUFDLFNBQVMsS0FBSyxRQUFRLG9CQUFvQixFQUFFO0FBQUEsTUFDeEQ7QUFBQSxNQUNBLGFBQWE7QUFBQSxRQUNYLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLFNBQVMsQ0FBQyxTQUFTLEtBQUssUUFBUSxnQkFBZ0IsRUFBRTtBQUFBLE1BQ3BEO0FBQUEsTUFDQSxZQUFZO0FBQUEsUUFDVixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxTQUFTLENBQUMsU0FBUyxLQUFLLFFBQVEsZUFBZSxFQUFFO0FBQUEsTUFDbkQ7QUFBQSxNQUNBLG9CQUFvQjtBQUFBLFFBQ2xCLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLFNBQVMsQ0FBQyxTQUFTLEtBQUssUUFBUSx1QkFBdUIsRUFBRTtBQUFBLE1BQzNEO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxjQUFjO0FBQUEsRUFDMUI7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
