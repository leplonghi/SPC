import path from 'path';
import { defineConfig, loadEnv, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import { cloudflare } from '@cloudflare/vite-plugin';
import { sites } from '@openai/sites-vite-plugin';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const deployTarget = process.env.VITE_DEPLOY_TARGET || env.VITE_DEPLOY_TARGET || (mode === 'cloudflare' ? 'cloudflare' : 'firebase');
  const isCloudflareTarget = deployTarget === 'cloudflare';

  const plugins: PluginOption[] = [react()];

  // Isola os plugins do Cloudflare Workers apenas quando explicitamente solicitado,
  // garantindo que o build padrão gere dist/index.html diretamente para o Firebase Hosting.
  if (isCloudflareTarget) {
    plugins.push(
      sites(),
      cloudflare({
        viteEnvironment: {
          name: 'server'
        }
      })
    );
  }

  return {
    server: {
      port: 3001,
      host: false,
    },
    plugins,
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './'),
      }
    }
  };
});
