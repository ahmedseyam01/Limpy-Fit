import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Runs the Vercel functions in /api inside the dev server, so `npm run dev` works end to end.
 * Without SYNC_STORE_URL it uses an in-memory store, so local testing never touches real data.
 */
function devApi(mode: string): Plugin {
  return {
    name: 'limby-dev-api',
    apply: 'serve',
    configureServer(server) {
      const env = loadEnv(mode, process.cwd(), '');
      for (const key of ['AUTH_SECRET', 'COACH_EMAIL', 'COACH_PASSWORD', 'SYNC_STORE_URL']) {
        if (env[key] && !process.env[key]) process.env[key] = env[key];
      }
      if (!process.env.SYNC_STORE_URL) process.env.SYNC_STORE_MEMORY = '1';

      server.middlewares.use(async (req, res, next) => {
        const route = req.url?.match(/^\/api\/([\w-]+)(?:[?#]|$)/)?.[1];
        if (!route) return next();
        try {
          const mod = await server.ssrLoadModule(`/api/${route}.ts`);
          await mod.default(req, res);
        } catch (err) {
          server.config.logger.error(String(err));
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Dev API error' }));
        }
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), devApi(mode)],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
}));
