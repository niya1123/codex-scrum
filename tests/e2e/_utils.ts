import { Page, expect, APIRequestContext } from '@playwright/test'

export async function gotoHome(page: Page) {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: '旅程プランナー（MVP）' })).toBeVisible()
}

export async function fillForm(
  page: Page,
  params: { destination: string; startDate: string; endDate: string }
) {
  await page.getByLabel('行き先').fill(params.destination)
  await page.getByLabel('開始日').fill(params.startDate)
  await page.getByLabel('終了日').fill(params.endDate)
}

export async function submit(page: Page) {
  await page.getByRole('button', { name: '計画する' }).click()
}

export async function postPlan(request: APIRequestContext, body: any) {
  const res = await request.post('/api/itinerary', {
    data: body,
    headers: { 'content-type': 'application/json' }
  })
  return res
}

