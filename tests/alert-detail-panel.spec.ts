import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/alerts')
  await page.locator('[data-severity]').first().click()
})

test('detail panel shows signal context reference line with threshold info', async ({ page }) => {
  const signalCtx = page.locator('[data-testid="signal-context"]')
  await expect(signalCtx).toBeVisible()
  await expect(signalCtx).toContainText('threshold')
})

test('shows acted timestamp after marking an alert as acted', async ({ page }) => {
  await page.getByRole('button', { name: 'Acknowledge' }).click()
  await page.getByRole('button', { name: 'Mark Acted' }).click()

  const confirmation = page.locator('[data-testid="acted-timestamp"]')
  await expect(confirmation).toBeVisible()
  await expect(confirmation).toContainText('Logged')
})
