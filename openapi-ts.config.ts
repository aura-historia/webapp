import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'https://raw.githubusercontent.com/aura-historia/internal-api/refs/heads/master/swagger.yaml',
  output: 'src/client',
  plugins: [
    '@tanstack/react-query',
  ],
});