import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function expectNoHorizontalOverflow(page) {
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
}

async function expectNoSeriousAccessibilityViolations(page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const serious = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact));
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
}

test('sales site is responsive, interactive and accessible', async ({ page, isMobile }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/mystore/');
  await expect(page.locator('main h1')).toBeVisible();
  await expectNoHorizontalOverflow(page);

  if (isMobile) {
    const menuButton = page.locator('#menuButton');
    await menuButton.click();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#mobileMenu')).toBeVisible();
  } else {
    await page.locator('#demoSpinButton').click({ force: true });
    await expect(page.locator('#demoResult')).not.toContainText("ÇEVİR'e basın");
  }

  await expectNoSeriousAccessibilityViolations(page);
});

test('panel login supports keyboard navigation and has no layout overflow', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/mystore/panel');
  await expect(page.locator('#authTitle')).toContainText('Giriş Yap');
  await expect(page.locator('#authEmail')).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.locator('#authEmail').focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('#authPassword')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('#authPasswordToggle')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#authPassword')).toHaveAttribute('type', 'text');

  await expectNoSeriousAccessibilityViolations(page);
});
