import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'https://raw.githubusercontent.com/aura-historia/backend/refs/heads/develop/docs/swagger.yaml',
  output: 'src/client',
  plugins: [
    '@tanstack/react-query',
  ],
});
