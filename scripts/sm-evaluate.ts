#!/usr/bin/env -S node --enable-source-maps
import { exec as _exec } from 'node:child_process'
import { promisify } from 'node:util'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const exec = promisify(_exec)

type Check = { area: string; ok: boolean; info?: string }

function exists(p: string) { return existsSync(p) }
function read(p: string) { return readFileSync(p, 'utf8') }

function findAcFromBacklog(): string[] {
  const backlogPath = 'docs/backlog/travel-planner-mvp.md'
  if (!exists(backlogPath)) return []
  const txt = read(backlogPath)
  const ids = Array.from(new Set((txt.match(/TPA-\d{3}/g) || [])))
  return ids
}

function findTestsAndMapAC(): { testTitle: string; file: string; acIds: string[] }[] {
  const root = 'tests/e2e'
  if (!exists(root)) return []
  const files = readdirSync(root).filter(f => f.endsWith('.ts'))
  const entries: { testTitle: string; file: string; acIds: string[] }[] = []
  const titleRe = /test\(\s*(["'`])([^\1]+?)\1/gs
  for (const f of files) {
    const p = join(root, f)
    const src = read(p)
    let m: RegExpExecArray | null
    while ((m = titleRe.exec(src))) {
      const title = m[2]
      const ac = Array.from(new Set((title.match(/TPA-\d{3}/g) || [])
        .concat(title.match(/\[AC: *(TPA-\d{3})\]/g)?.map(s => s.replace(/.*\[AC: *(TPA-\d{3})\].*/, '$1')) || [])))
      entries.push({ testTitle: title, file: p, acIds: ac })
    }
  }
  return entries
}

async function runE2EJson(): Promise<null | any> {
  try {
    const { stdout } = await exec('npx playwright test -c config/playwright.config.ts --reporter=json', { maxBuffer: 20 * 1024 * 1024 })
    return JSON.parse(stdout)
  } catch (e: any) {
    // JSON reporterが出力しなかった/壊れている等
    return null
  }
}

function summarizeJson(json: any) {
  if (!json) return { total: 0, passed: 0, failed: 0, byTitle: new Map<string, boolean>() }
  const byTitle = new Map<string, boolean>()
  let total = 0, passed = 0, failed = 0
  const suites = json.suites || []
  const walk = (suite: any) => {
    for (const s of suite.suites || []) walk(s)
    for (const t of suite.tests || []) {
      total++
      const ok = (t.status === 'passed')
      ok ? passed++ : failed++
      byTitle.set(t.title, ok)
    }
  }
  for (const s of suites) walk(s)
  return { total, passed, failed, byTitle }
}

async function main() {
  const run = process.argv.includes('--run')
  const checks: Check[] = []

  // PO
  const backlog = 'docs/backlog/travel-planner-mvp.md'
  checks.push({ area: 'PO: Backlog', ok: exists(backlog), info: backlog })

  // Architect
  checks.push({ area: 'Architect: README 構成ポリシー', ok: /## 構成ポリシー/.test(read('README.md')), info: 'README.md' })
  checks.push({ area: 'Architect: CI', ok: exists('.github/workflows/ci.yml'), info: '.github/workflows/ci.yml' })

  // Planner
  const acIds = findAcFromBacklog()
  checks.push({ area: 'Planner: AC(TPA-***) 抽出', ok: acIds.length > 0, info: `${acIds.length}件` })

  // QA: テストのACひも付け状況
  const tests = findTestsAndMapAC()
  const covered = new Set<string>()
  for (const t of tests) for (const id of t.acIds) covered.add(id)
  const coverageRatio = acIds.length ? `${covered.size}/${acIds.length}` : '0/0'
  checks.push({ area: 'QA: AC⇔E2E マッピング', ok: acIds.length > 0 && covered.size > 0, info: coverageRatio })

  // Dev-FE/BE: READMEの起動手順有無（最小）
  checks.push({ area: 'Dev: 起動/テスト手順', ok: /## 起動/.test(read('README.md')) && /## E2E テスト/.test(read('README.md')), info: 'README.md' })

  let runSummary: ReturnType<typeof summarizeJson> | null = null
  if (run) {
    const json = await runE2EJson()
    runSummary = summarizeJson(json)
    const passRate = runSummary.total ? Math.round((runSummary.passed / runSummary.total) * 100) : 0
    checks.push({ area: 'QA: E2E 実行', ok: runSummary.failed === 0, info: `passed ${runSummary.passed}/${runSummary.total} (${passRate}%)` })

    // AC単位のGreen判定
    if (acIds.length) {
      let greenAC = 0
      for (const id of acIds) {
        // idを含むor [AC:id] を含むテストが1件でもpass
        const ok = Array.from(runSummary.byTitle.entries()).some(([title, ok]) => ok && (title.includes(id) || title.includes(`[AC:${id}]`)))
        if (ok) greenAC++
      }
      const ratio = Math.round((greenAC / acIds.length) * 100)
      checks.push({ area: 'QA: AC Green率', ok: greenAC === acIds.length, info: `${greenAC}/${acIds.length} (${ratio}%)` })
    }
  }

  // 出力
  const mark = (ok: boolean) => ok ? '✔' : '✖'
  console.log('\nSM Scorecard')
  console.log('-------------')
  for (const c of checks) console.log(`${mark(c.ok)} ${c.area}${c.info ? ' — ' + c.info : ''}`)

  // 補助情報
  console.log('\nHints')
  console.log('- AC定義を明示する場合: docs/acceptance/ac.yaml を編集')
  console.log('- テスト⇔ACの紐付け: テスト名に "[AC:TPA-***]" または "TPA-***" を含める')
  if (!run) {
    console.log('- E2Eも含めた確認: npm run sm:eval:run')
  }
}

main().catch((e) => { console.error(e); process.exit(1) })

