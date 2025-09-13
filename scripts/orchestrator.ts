#!/usr/bin/env -S node --enable-source-maps
import { exec, spawn } from "node:child_process";
import { promisify } from "node:util";
import { existsSync, mkdirSync, writeFileSync, readFileSync, createWriteStream, appendFileSync } from "node:fs";
import { join } from "node:path";

const sh = promisify(exec);
const OUT_DIR = "out";
const PROMPTS_DIR = "prompts";
const MAX_ITERS = Number(process.env.MAX_ITERS || 3);
const PARALLEL_DEVS = Number(process.env.PARALLEL_DEVS || 2); // 2 = FE/BE 並列
const PROGRESS_STYLE = process.env.PROGRESS_STYLE || "bar"; // bar | spinner | none
const PROGRESS_INTERVAL = Number(process.env.PROGRESS_INTERVAL || 120); // ms

function logSection(title: string) {
  if (process.env.PROGRESS_ONLY) return; // 抑制
  console.log(`\n\n=== ${title} ===`);
}

async function run(cmd: string, outfile?: string) {
  if (!process.env.PROGRESS_ONLY) console.log(`\n$ ${cmd}`);
  const { stdout, stderr } = await sh(cmd, { maxBuffer: 20 * 1024 * 1024 });
  if (outfile) writeFileSync(join(OUT_DIR, outfile), stdout);
  if (stderr?.trim()) console.error(stderr);
  return { stdout, stderr };
}

// Execute Codex CLI non-interactively. Concatenates provided files and pipes them
// as stdin to `codex exec -`. Writes JSONL stream to jsonLog (if provided)
// and the agent's last message to lastMessageFile (required by callers).
async function runCodex({
  inputFiles,
  lastMessageFile,
  jsonLogFile,
  showProgress = true,
  stageLabel,
  timeoutMs = Number(process.env.CODEX_TIMEOUT_MS || 30 * 60 * 1000),
  stallTimeoutMs = Number(process.env.CODEX_STALL_TIMEOUT_MS || 5 * 60 * 1000),
  allowFailure = false,
}: {
  inputFiles: string[];
  lastMessageFile: string;
  jsonLogFile?: string;
  showProgress?: boolean;
  stageLabel?: string;
  timeoutMs?: number;
  stallTimeoutMs?: number;
  /**
   * 非0終了コードやSIGKILL等のシグナル終了でも例外にせずresolveする。
   * 呼び出し側でログ/成果物の有無に応じて処理を継続させたいステージ（例: QA）向け。
   */
  allowFailure?: boolean;
}) {
  const absLast = join(OUT_DIR, lastMessageFile);

  return new Promise<{
    stdout: string;
    stderr: string;
    lines: number;
    durationMs: number;
  }>((resolve, reject) => {
    const args = [
      "exec",
      "--skip-git-repo-check",
      "--dangerously-bypass-approvals-and-sandbox",
      "--json",
      "--output-last-message",
      absLast,
      "-",
    ];

    const started = Date.now();
    const child = spawn("codex", args, { stdio: ["pipe", "pipe", "pipe"] });
    let stdoutAll = "";
    let stderrAll = "";
    let lineBuf = "";
    let lines = 0;
    let lastLineAt = Date.now();

    // If jsonLogFile provided, open a write stream (ESM互換: require非使用)
    const jsonLogStream = jsonLogFile
      ? createWriteStream(join(OUT_DIR, jsonLogFile), { encoding: "utf8" })
      : null;

    // Concatenate and send inputs
    try {
      for (const f of inputFiles) {
        const content = readFileSync(f, "utf8");
        child.stdin.write(content.endsWith("\n") ? content : content + "\n");
      }
    } catch (e) {
      child.kill();
      return reject(e);
    } finally {
      child.stdin.end();
    }

  // Progress renderer (single line). For unknown total, animate an indefinite bar or spinner.
  let tick = 0;
    let lastRender = 0;
    const barWidth = Math.min(40, Math.max(20, (process.stdout.columns || 80) - 40));
    const spinnerFrames = ["⣾","⣽","⣻","⢿","⡿","⣟","⣯","⣷"];
    const makeBar = (t: number) => {
      const pos = t % barWidth;
      let bar = "";
      for (let i = 0; i < barWidth; i++) bar += i === pos ? "█" : "─";
      return bar;
    };
    const render = (force = false) => {
      if (!showProgress || PROGRESS_STYLE === "none") return;
      const now = Date.now();
      if (!force && now - lastRender < PROGRESS_INTERVAL) return;
      lastRender = now;
      const elapsed = ((now - started) / 1000).toFixed(1);
      let visual: string;
      if (PROGRESS_STYLE === "spinner") {
        visual = spinnerFrames[tick % spinnerFrames.length];
      } else { // bar
        visual = makeBar(tick);
      }
      const stage = stageLabel ? `[${stageLabel}] ` : "";
      const msg = `${visual} ${stage}lines:${lines} elapsed:${elapsed}s`;
      process.stdout.write("\r" + msg.slice(0, process.stdout.columns || msg.length));
      tick++;
    };
    const interval = showProgress && PROGRESS_STYLE !== "none" ? setInterval(render, PROGRESS_INTERVAL) : null;

    // セクション直後に即座に 0 行で表示したいので初回強制レンダー
    render(true);

  child.stdout.on("data", (chunk: Buffer) => {
      const text = chunk.toString("utf8");
      stdoutAll += text;
      if (jsonLogStream) jsonLogStream.write(text);
      lineBuf += text;
      let idx: number;
      while ((idx = lineBuf.indexOf("\n")) >= 0) {
        const line = lineBuf.slice(0, idx);
        lineBuf = lineBuf.slice(idx + 1);
        if (line.trim().length) lines++;
    lastLineAt = Date.now();
      }
      render();
    });
    child.stderr.on("data", (chunk: Buffer) => {
      const text = chunk.toString("utf8");
      stderrAll += text;
      // Show stderr immediately (often token streaming or debug)
      process.stderr.write(text);
    });
    // タイマー: 全体タイムアウト
    const timeoutTimer = setTimeout(() => {
      const msg = `⏰ TIMEOUT ${stageLabel || ''} ${timeoutMs}ms 超過 → 強制終了 (調整: CODEX_TIMEOUT_MS)`;
      process.stderr.write("\n" + msg + "\n");
      try { child.kill('SIGKILL'); } catch {}
    }, timeoutMs);

    // スタール監視: 一定時間新規行なし
    const stallTimer = setInterval(() => {
      const idle = Date.now() - lastLineAt;
      if (idle >= stallTimeoutMs) {
        const msg = `⚠️ STALL ${stageLabel || ''} ${Math.round(idle/1000)}s 無出力 (閾値 ${stallTimeoutMs/1000}s) → SIGKILL (調整: CODEX_STALL_TIMEOUT_MS)`;
        process.stderr.write("\n" + msg + "\n");
        try { child.kill('SIGKILL'); } catch {}
      }
    }, Math.min(30_000, stallTimeoutMs));

    child.on("error", (err) => {
      if (interval) clearInterval(interval as any);
      clearTimeout(timeoutTimer);
      clearInterval(stallTimer);
      if (jsonLogStream) jsonLogStream.end();
      process.stdout.write("\n");
      reject(err);
    });
    child.on("close", (code, signal) => {
      if (interval) clearInterval(interval as any);
      clearTimeout(timeoutTimer);
      clearInterval(stallTimer);
      if (jsonLogStream) jsonLogStream.end();
      const durationMs = Date.now() - started;
      const stage = stageLabel ? `[${stageLabel}] ` : "";
      const finalLine = `✔ ${stage}codex完了: ${lines} json行 (${(durationMs / 1000).toFixed(1)}s, exitCode=${code}, signal=${signal ?? "none"})`;
      if (process.env.PROGRESS_ONLY) {
        process.stdout.write("\r" + finalLine + "\n");
      } else if (showProgress && PROGRESS_STYLE !== "none") {
        process.stdout.write("\r" + finalLine + "\n");
      } else {
        process.stdout.write(finalLine + "\n");
      }
      if (code === 0) {
        resolve({ stdout: stdoutAll, stderr: stderrAll, lines, durationMs });
      } else if (allowFailure) {
        // 失敗を許容: 呼び出し側でリカバリ（例: Planner差し戻し等）する前提でresolve
        const msg = `WARN ${stage}codex 非正常終了を継続許容: exitCode=${code}, signal=${signal ?? "none"}`;
        process.stderr.write(msg + "\n");
        resolve({ stdout: stdoutAll, stderr: stderrAll, lines, durationMs });
      } else {
        const err = new Error(`codex exited with code ${code}`);
        (err as any).stdout = stdoutAll;
        (err as any).stderr = stderrAll;
        reject(err);
      }
    });
  });
}

async function ensureDirs() {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
  if (!existsSync(PROMPTS_DIR)) {
    throw new Error(`Missing '${PROMPTS_DIR}' directory. Place po.md / architect.md / planner.md / dev-fe.md / dev-be.md / qa.md / docs.md under ${PROMPTS_DIR}/`);
  }
}

function isQaGreen(text: string): boolean {
  // QAエージェントの標準出力に、下記のいずれかのトークンが含まれていれば合格とみなす
  // 例: "E2E: GREEN" / "ACCEPTED" / {"status":"green"}
  try {
    const m = text.match(/\{\s*\"status\"\s*:\s*\"(green|passed|ok)\"\s*\}/i);
    if (m) return true;
  } catch {}
  return /E2E\s*:\s*GREEN|ACCEPTED|QA\s*STATUS\s*:\s*GREEN/i.test(text);
}

function parseRunnerTag(text: string): "mcp" | "fallback" | "unknown" {
  try {
    const m = text.match(/runner\s*=\s*(mcp|fallback)/i);
    if (m) return (m[1].toLowerCase() as any) || "unknown";
  } catch {}
  return "unknown";
}

async function main() {
  await ensureDirs();

  // ===== 引数 / 環境オプション解析 =====
  const STAGES = ["po","architect","planner","dev","qa","docs"] as const;
  type Stage = typeof STAGES[number];
  function parseFromArg(): Stage {
    const argPrefix = "--from=";
    let from = process.env.START_FROM as Stage | undefined;
    for (const a of process.argv.slice(2)) if (a.startsWith(argPrefix)) from = a.slice(argPrefix.length) as Stage;
    if (!from) return "po";
    if (!STAGES.includes(from)) {
      console.error(`無効な --from 指定: '${from}'. 使用可能: ${STAGES.join(', ')}`);
      process.exit(2);
    }
    return from;
  }
  const startFrom = parseFromArg();
  const startIdx = STAGES.indexOf(startFrom);
  const should = (stage: Stage) => STAGES.indexOf(stage) >= startIdx;
  if (startFrom !== "po") console.log(`(from='${startFrom}' 以前のステージはスキップ)`);

  // 1) PO → backlog
  if (should("po")) {
    logSection("1) PO: Backlog 生成");
    await runCodex({
      inputFiles: [join(PROMPTS_DIR, "po.md")],
      lastMessageFile: "backlog.yml",
      jsonLogFile: "po.jsonl",
      stageLabel: "PO",
    });
  } else if (!existsSync(join(OUT_DIR, "backlog.yml"))) {
    throw new Error(`--from=${startFrom} ですが 'out/backlog.yml' が存在しません。PO を先に実行してください。`);
  }

  // 2) Architect → scaffold（提案 + 自動適用想定）
  if (should("architect")) {
    logSection("2) Architect: 技術選定/雛形適用");
    await runCodex({
      inputFiles: [join(PROMPTS_DIR, "architect.md"), join(OUT_DIR, "backlog.yml")],
      lastMessageFile: "scaffold.log",
      jsonLogFile: "architect.jsonl",
      stageLabel: "Architect",
    });
  } else if (!existsSync(join(OUT_DIR, "scaffold.log"))) {
    console.warn(`Architect スキップ (--from=${startFrom}). 既存 scaffold.log が無いので続行しますが問題が起きる可能性があります。`);
  }

  // 3) Planner → tasks
  if (should("planner")) {
    logSection("3) Planner: タスク分解 + E2E雛形");
    await runCodex({
      inputFiles: [join(PROMPTS_DIR, "planner.md"), join(OUT_DIR, "backlog.yml")],
      lastMessageFile: "tasks.yml",
      jsonLogFile: "planner.jsonl",
      stageLabel: "Planner",
    });
  } else if (!existsSync(join(OUT_DIR, "tasks.yml"))) {
    throw new Error(`--from=${startFrom} ですが 'out/tasks.yml' が存在しません。Planner を実行してください。`);
  }

  // 4) Dev (FE/BE) 並列 → 5) QA → 失敗なら Planner→Dev→QA をリトライ
  if (should("dev") || should("qa") || should("docs")) {
  for (let i = 1; i <= MAX_ITERS; i++) {
    logSection(`4) 実装イテレーション ${i}/${MAX_ITERS}`);

    const devJobs: Promise<any>[] = [];
    if (should("dev") && PARALLEL_DEVS >= 1) {
      devJobs.push(
        runCodex({
          inputFiles: [join(PROMPTS_DIR, "dev-fe.md"), join(OUT_DIR, "tasks.yml")],
          lastMessageFile: `dev-fe-${i}.log`,
          jsonLogFile: `dev-fe-${i}.jsonl`,
          stageLabel: `Dev-FE#${i}`,
        })
      );
    }
    if (should("dev") && PARALLEL_DEVS >= 2) {
      devJobs.push(
        runCodex({
          inputFiles: [join(PROMPTS_DIR, "dev-be.md"), join(OUT_DIR, "tasks.yml")],
          lastMessageFile: `dev-be-${i}.log`,
          jsonLogFile: `dev-be-${i}.jsonl`,
          stageLabel: `Dev-BE#${i}`,
        })
      );
    }
    if (devJobs.length) await Promise.all(devJobs);
    if (!should("qa") && !should("docs")) {
      console.log("Dev のみ実行 (--from 指定)。終了します。");
      return;
    }

    logSection("5) QA: 受け入れテスト");
    if (should("qa")) {
      await runCodex({
        inputFiles: [join(PROMPTS_DIR, "qa.md"), join(OUT_DIR, "tasks.yml")],
        lastMessageFile: `qa-${i}.txt`,
        jsonLogFile: `qa-${i}.jsonl`,
        stageLabel: `QA#${i}`,
  // QAは失敗・SIGKILLでも次の差し戻し処理に進めるため許容
  allowFailure: true,
      });
    } else {
      console.log("QA スキップ (--from により)");
    }

    // Determine QA status from the last message file content
    const qaLastPath = join(OUT_DIR, `qa-${i}.txt`);
    const qaLast = existsSync(qaLastPath) ? readFileSync(qaLastPath, "utf8") : "";
    // Record which runner was used (MCP or fallback) if the tag appears in output.
    // QA agent may include `runner=mcp` or `runner=fallback` (optional; acceptance does not depend on it).
    const runner = parseRunnerTag(qaLast);
    const runnerLog = join(OUT_DIR, "qa-runner.log");
    const entry = `iter=${i}, runner=${runner}, at=${new Date().toISOString()}\n`;
    try {
      const prev = existsSync(runnerLog) ? readFileSync(runnerLog, "utf8") : "";
      // Idempotent: avoid duplicating the same iteration entry
      if (!prev.split(/\r?\n/).some((l) => l.startsWith(`iter=${i},`))) {
        appendFileSync(runnerLog, entry, { encoding: "utf8" });
      }
    } catch (e) {
      console.warn(`WARN: failed to write runner log: ${(e as Error).message}`);
    }
    if (!process.env.PROGRESS_ONLY) console.log(`QA#${i} runner=${runner}`);
    // Enforce MCP runner if required
    const requireMcp = process.env.QA_REQUIRE_MCP === '1' || process.env.QA_REQUIRE_MCP === 'true' || !!process.env.CI
    if (should("qa") && isQaGreen(qaLast) && (!requireMcp || runner === 'mcp')) {
      console.log("\n✅ QA GREEN → 受け入れ完了");
      if (should("docs")) {
        logSection("6) Docs: ドキュメント生成");
        await runCodex({
          inputFiles: [join(PROMPTS_DIR, "docs.md"), join(OUT_DIR, "tasks.yml")],
          lastMessageFile: `docs-${i}.log`,
          jsonLogFile: `docs-${i}.jsonl`,
          stageLabel: `Docs#${i}`,
        });
      }
      console.log(`\n完了: 成果物/ログは '${OUT_DIR}/' を参照してください。`);
      return;
    }

    if (should("qa") && isQaGreen(qaLast) && requireMcp && runner !== 'mcp') {
      console.warn("\n⚠️  QA は GREEN でしたが runner!='mcp' のため不合格扱いにします (QA_REQUIRE_MCP 有効)");
    }

    if (should("qa")) {
      // レッド時は Planner に差し戻し → 再分解 → 次イテレーションへ
      console.warn("\n⚠️  QA RED → Plannerに差し戻し (再分解)");
      await runCodex({
        inputFiles: [join(PROMPTS_DIR, "planner.md"), join(OUT_DIR, "backlog.yml")],
        lastMessageFile: `tasks-replan-${i}.yml`,
        jsonLogFile: `planner-replan-${i}.jsonl`,
        stageLabel: `Replan#${i}`,
      });
      // 最新tasksに差し替え
      const latest = readFileSync(join(OUT_DIR, `tasks-replan-${i}.yml`), "utf8");
      writeFileSync(join(OUT_DIR, "tasks.yml"), latest);
    } else if (should("docs")) {
      // QA を通さず docs を求めている場合 (非推奨) 一度だけ docs 生成して終了
      logSection("6) Docs: ドキュメント生成 (QAスキップ) ");
      await runCodex({
        inputFiles: [join(PROMPTS_DIR, "docs.md"), join(OUT_DIR, "tasks.yml")],
        lastMessageFile: `docs-${i}.log`,
        jsonLogFile: `docs-${i}.jsonl`,
        stageLabel: `Docs#${i}`,
      });
      console.log(`\n完了: 成果物/ログは '${OUT_DIR}/' を参照してください。`);
      return;
    }
  }
  }

  if (should("qa")) {
    console.error(`\n❌ 収束せず: MAX_ITERS=${MAX_ITERS} に達しました。${OUT_DIR}/qa-*.log を確認してください。`);
  }
  process.exit(1);
}

main().catch((e) => {
  console.error("\nUnexpected error:", e);
  process.exit(1);
});
