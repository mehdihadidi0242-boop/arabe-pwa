import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Chemins relatifs : l'application doit pouvoir etre servie depuis n'importe
  // quel sous-dossier, et fonctionner hors connexion une fois installee.
  base: './',
  build: {
    target: 'es2022',
    assetsInlineLimit: 0, // les polices restent des fichiers, pour le precache du service worker
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
