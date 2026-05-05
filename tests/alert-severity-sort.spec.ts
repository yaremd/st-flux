import { test, expect } from '@playwright/test'

const SEVERITY_ORDER: Record<string, number> = { critical: 0, warning: 1, info: 2 }

test('alerts sorted by severity within Today group: critical before warning before info', async ({ page }) => {
  await page.goto('/alerts')
  await page.getByRole('button', { name: 'All' }).click()

  const todayGroup = page.locator('[data-group="Today"]')
  await expect(todayGroup).toBeVisible()

  const rows = todayGroup.locator('[data-severity]')
  const severities = await rows.evaluateAll(
    (els) => els.map((el) => el.getAttribute('data-severity'))
  )

  for (let i = 1; i < severities.length; i++) {
    const prev = severities[i - 1]!
    const curr = severities[i]!
    expect(SEVERITY_ORDER).toHaveProperty(prev)
    expect(SEVERITY_ORDER).toHaveProperty(curr)
    expect(SEVERITY_ORDER[prev]).toBeLessThanOrEqual(SEVERITY_ORDER[curr])
  }
})
