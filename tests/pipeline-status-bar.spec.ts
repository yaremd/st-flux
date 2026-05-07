import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('morning brief shows pipeline run status before action queue', async ({ page }) => {
  const statusBar = page.locator('[data-testid="pipeline-status-bar"]')
  await expect(statusBar).toBeVisible()
  await expect(statusBar).toContainText('THEMES RAN')

  const actionRequired = page.locator('[data-testid="action-required"]')
  await expect(actionRequired).toBeVisible()

  const statusY = (await statusBar.boundingBox())!.y
  const actionY = (await actionRequired.boundingBox())!.y
  expect(statusY).toBeLessThan(actionY)
})

test('pipeline status bar shows warning when a theme has issues', async ({ page }) => {
  const statusBar = page.locator('[data-testid="pipeline-status-bar"]')
  await expect(statusBar).not.toContainText('6/6 THEMES RAN')
})
