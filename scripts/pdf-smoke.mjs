import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const APP_PORT = 4310;
const API_PORT = 4311;
const DEBUG_PORT = 4312;
const OUTPUT_PATH = process.env.PDF_SMOKE_OUTPUT || join(tmpdir(), "ninusoft-proposal-smoke.pdf");

const tableRows = Array.from(
  { length: 18 },
  (_, index) =>
    `| المرحلة ${index + 1} | مخرج تنفيذي طويل لاختبار التفاف النص داخل الخلية | ${index + 2} أيام | فريق NinuSoft | قيد المراجعة | ${(index + 1) * 125} USD |`,
).join("\n");

const markdown = `
<!-- section: المقدمة التنفيذية -->
# عرض التحول الرقمي المتكامل لمنصة العمليات وخدمة العملاء

يقدم هذا العرض رؤية عملية لبناء منصة موحدة وآمنة تساعد الإدارة على متابعة العمليات واتخاذ القرار، مع تجربة عربية واضحة تلائم فرق العمل والعملاء.

> [!IMPORTANT]
> يعتمد نجاح المشروع على اعتماد نطاق المرحلة الأولى وتسمية أصحاب القرار قبل بدء التنفيذ.

- منصة ويب متجاوبة
- لوحة تحكم تنفيذية
- تكاملات آمنة وقابلة للتوسع

<!-- section: نطاق العمل والمخرجات -->
# نطاق العمل والمخرجات

## المكونات الأساسية

يشمل النطاق تحليل العمليات، تصميم تجربة الاستخدام، بناء الواجهات والخدمات، الاختبارات، الإطلاق، والتسليم المعرفي للفريق.

1. تحليل وتوثيق العمليات الحالية.
2. تصميم تجربة مستخدم عربية وإنجليزية.
3. بناء واجهات آمنة وقابلة للتوسع.
4. إعداد المراقبة والتقارير التشغيلية.

<!-- section: خطة التنفيذ -->
# خطة التنفيذ

## مسار التسليم

\`\`\`mermaid
flowchart TD
  A["تحليل المتطلبات"] --> B{"اعتماد النطاق"}
  B -->|موافق| C["التصميم وتجربة المستخدم"]
  B -->|مراجعة| A
  C --> D["التطوير المرحلي"]
  D --> E["اختبارات الجودة والأمان"]
  E --> F["الإطلاق والتسليم"]
\`\`\`

يتم التسليم على دفعات قصيرة مع مراجعة واعتماد واضحين في نهاية كل مرحلة.

<!-- section: الجدول الزمني والاستثمار -->
# الجدول الزمني والاستثمار

## خطة المراحل التفصيلية

| المرحلة | المخرج | المدة | المسؤول | الحالة | الاستثمار |
|---|---|---:|---|---|---:|
${tableRows}

<!-- section: المتطلبات التقنية -->
# المتطلبات التقنية

## مثال إعداد آمن

\`\`\`ts
export const deploymentConfiguration = {
  environment: "production",
  observability: true,
  securityHeaders: ["strict-transport-security", "content-security-policy", "x-content-type-options"],
  releaseStrategy: "progressive-delivery-with-automatic-rollback-and-continuous-health-monitoring",
};
\`\`\`

لمراجعة العرض المرئي: [فيديو توضيحي](https://www.youtube.com/watch?v=dQw4w9WgXcQ)

<!-- section: الشروط والاعتماد -->
# الشروط والاعتماد

## الضمان والدعم

تتضمن فترة التسليم معالجة الأخطاء الحرجة ودعم الإطلاق وفق البنود المحددة في العرض، ولا تشمل التغييرات الخارجة عن النطاق المعتمد.

> [!NOTE]
> تبدأ مدة التنفيذ بعد استلام الدفعة الأولى واعتماد المواد المطلوبة.
`;

const proposal = {
  id: "pdf-smoke-fixture-2026",
  token: "pdf-smoke",
  title: "عرض التحول الرقمي المتكامل لمنصة العمليات وخدمة العملاء",
  clientName: "شركة الاختبار الاحترافية",
  markdown,
  expiresAt: "2026-09-30T23:59:59.000Z",
  updatedAt: "2026-07-24T12:00:00.000Z",
};

function startMockApi() {
  const server = createServer((request, response) => {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Headers", "*");
    response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    response.setHeader("Content-Type", "application/json; charset=utf-8");

    if (request.method === "OPTIONS") {
      response.writeHead(204);
      response.end();
      return;
    }

    if (request.url === "/v1/proposals/pdf-smoke" && request.method === "GET") {
      response.end(JSON.stringify({ locked: false, proposal }));
      return;
    }

    if (request.url?.endsWith("/signature") && request.method === "GET") {
      response.end(JSON.stringify({ signature: null }));
      return;
    }

    if (request.url?.endsWith("/comments") && request.method === "GET") {
      response.end(JSON.stringify({ comments: [] }));
      return;
    }

    response.end(JSON.stringify({ ok: true, comments: [] }));
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(API_PORT, "127.0.0.1", () => resolve(server));
  });
}

async function waitForUrl(url, timeout = 20_000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch {
      // Service is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function createCdpClient(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
  const pending = new Map();
  let nextId = 1;

  const opened = new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(String(event.data));
    if (!message.id || !pending.has(message.id)) return;
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  });

  return {
    async send(method, params = {}) {
      await opened;
      const id = nextId++;
      const result = new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
      });
      socket.send(JSON.stringify({ id, method, params }));
      return result;
    },
    close() {
      socket.close();
    },
  };
}

async function waitForExpression(client, expression, timeout = 20_000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    const result = await client.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
    });
    if (result.result?.value) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out waiting for browser expression: ${expression}`);
}

async function main() {
  const api = await startMockApi();
  const chromeProfile = await mkdtemp(join(tmpdir(), "ninusoft-pdf-chrome-"));
  const app = spawn("pnpm", ["dev"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: String(APP_PORT),
      VITE_PROPOSALS_API_URL: `http://127.0.0.1:${API_PORT}`,
    },
    stdio: "ignore",
  });

  let chrome;
  let client;
  try {
    await waitForUrl(`http://127.0.0.1:${APP_PORT}`);
    chrome = spawn(
      "/usr/bin/google-chrome",
      [
        "--headless=new",
        "--no-sandbox",
        "--disable-gpu",
        "--disable-dev-shm-usage",
        `--remote-debugging-port=${DEBUG_PORT}`,
        `--user-data-dir=${chromeProfile}`,
        `http://127.0.0.1:${APP_PORT}/proposals/pdf-smoke`,
      ],
      { stdio: "ignore" },
    );

    await waitForUrl(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
    const targets = await (
      await waitForUrl(`http://127.0.0.1:${DEBUG_PORT}/json/list`)
    ).json();
    const page = targets.find((target) => target.type === "page");
    if (!page?.webSocketDebuggerUrl) throw new Error("Chrome page target was not found");

    client = createCdpClient(page.webSocketDebuggerUrl);
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await waitForExpression(client, `Boolean(document.querySelector(".proposal-document"))`);

    await client.send("Runtime.evaluate", {
      expression: `
        localStorage.setItem("ninusoft-proposal-sec:pdf-smoke", "sec-all");
        location.reload();
      `,
    });

    await waitForExpression(
      client,
      `Boolean(document.querySelector(".proposal-document")) &&
       document.querySelectorAll(".proposal-section-block").length === 6 &&
       !document.querySelector(".mermaid-loading") &&
       Boolean(document.querySelector(".mermaid-svg-wrapper svg"))`,
      30_000,
    );

    await client.send("Runtime.evaluate", {
      expression: `document.documentElement.dataset.printMode = "pdf"`,
    });
    await client.send("Emulation.setEmulatedMedia", { media: "print" });

    const rendered = await client.send("Runtime.evaluate", {
      expression: `({
        sections: document.querySelectorAll(".proposal-section-block").length,
        diagrams: document.querySelectorAll(".mermaid-svg-wrapper svg").length,
        loading: document.querySelectorAll(".mermaid-loading").length,
        title: document.querySelector(".proposal-print-cover h1")?.textContent || ""
      })`,
      returnByValue: true,
    });

    const pdf = await client.send("Page.printToPDF", {
      displayHeaderFooter: false,
      printBackground: true,
      preferCSSPageSize: true,
      transferMode: "ReturnAsBase64",
    });
    await writeFile(OUTPUT_PATH, Buffer.from(pdf.data, "base64"));

    const details = rendered.result?.value || {};
    if (details.sections !== 6 || details.diagrams !== 1 || details.loading !== 0) {
      throw new Error(`Unexpected printable DOM: ${JSON.stringify(details)}`);
    }

    console.log(JSON.stringify({ output: OUTPUT_PATH, ...details }));
  } finally {
    client?.close();
    chrome?.kill("SIGTERM");
    app.kill("SIGTERM");
    await new Promise((resolve) => api.close(resolve));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
