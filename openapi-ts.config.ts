import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'docs/api-migration/swagger.integrated.yaml',
  output: 'src/client',
  plugins: [
    '@tanstack/react-query',
  ],
});
