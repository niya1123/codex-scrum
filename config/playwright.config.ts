const PORT = process.env.PORT ? Number(process.env.PORT) : 3000

const config = {
  // Note: Paths in config are resolved from the config file directory (config/)
  testDir: '../tests/e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  // Retry on CI to auto-deflake transient issues
  retries: process.env.CI ? 2 : 0,
  // Exclude explicitly quarantined tests on CI (title contains @flaky)
  grepInvert: process.env.CI ? /@flaky/ : undefined,
  // Reduce parallelism a bit on CI to avoid resource-induced flakes
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['line']] : [['line'], ['html', { outputFolder: '../out/playwright-report' }]],
  outputDir: '../out/test-results',
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Stabilize runs and aid debugging
    timezoneId: 'UTC',
    locale: 'ja-JP',
    headless: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    testIdAttribute: 'data-testid'
  },
  webServer: {
    command: 'npm run start',
    port: PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { TZ: 'UTC' }
  }
}

export default config
