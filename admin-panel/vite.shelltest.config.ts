import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const STUBS = '/var/folders/mn/b0jrtn0j443c2x6m_0lf60sm0000gn/T/opencode/shelltest';

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  resolve: {
    alias: {
      'firebase/app': `${STUBS}/firebase-app.ts`,
      'firebase/auth': `${STUBS}/firebase-auth.ts`,
      'firebase/firestore': `${STUBS}/firebase-firestore.ts`,
      'firebase/functions': `${STUBS}/firebase-functions.ts`,
      'firebase/storage': `${STUBS}/firebase-storage.ts`,
    },
  },
  server: {
    port: 5199,
    strictPort: true,
    fs: {
      allow: [__dirname, STUBS],
    },
  },
});
