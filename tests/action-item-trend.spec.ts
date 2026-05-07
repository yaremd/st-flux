import { test, expect } from '@playwright/test'

// RED: action items in morning brief do not yet show trend tags
test('morning brief action items show trend context tags', async ({ page }) => {
  await page.goto('/')

  const actionRequired = page.locator('[data-testid="action-required"]')
  await expect(actionRequired).toBeVisible()

  // Each action item should have a trend tag
  const trendTags = actionRequired.locator('[data-testid="trend-tag"]')
  await expect(trendTags.first()).toBeVisible()
})
