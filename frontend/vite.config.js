import { defineConfig } from 'vite'

export default defineConfig({
  // no plugin required; Vite will handle JSX via React automatic runtime in React 17+/18
  server: {
    port: 5173
  }
})
