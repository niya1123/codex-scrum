import type { PlaywrightTestConfig } from '@playwright/test'

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000

const config: PlaywrightTestConfig = {
  testDir: 'tests/e2e',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['line']] : [['line'], ['html', { outputFolder: 'out/playwright-report' }]],
  outputDir: 'out/test-results',
  use: {
    baseURL: `http://localhost:${PORT}`
  },
  webServer: {
    command: 'npm run start',
    port: PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
}

export default config
