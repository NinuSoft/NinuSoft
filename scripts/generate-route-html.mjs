import fs from "node:fs";
import path from "node:path";

const distDir = path.resolve(import.meta.dirname, "../dist/public");
const indexHtmlPath = path.join(distDir, "index.html");

if (!fs.existsSync(indexHtmlPath)) {
  console.error("dist/public/index.html not found. Run vite build first.");
  process.exit(1);
}

const baseHtml = fs.readFileSync(indexHtmlPath, "utf-8");

const jobFairTitle = "معرض بغداد للتوظيف 2026 | NinuSoft";
const jobFairDesc =
  "تعلن وزارة الشباب والرياضة عن إقامة معرض بغداد للتوظيف 2026، بمشاركة أكثر من 90 شركة، وبما يوفر أكثر من 2000 فرصة عمل بالتعاون وبالشراكة مع مشروع تعزيز التحول الاقتصادي في العراق (SET)، المموّل من قبل BMZ والمنفّذ من قبل GIZ.";

const routes = ["job-fair", "swd", "baghdad-job-fair"];

for (const route of routes) {
  let html = baseHtml
    .replace('<html lang="en">', '<html lang="ar" dir="rtl">')
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${jobFairTitle}</title>`)
    .replace(
      /<meta name="description"[\s\S]*?\/>/,
      `<meta name="description" content="${jobFairDesc}" />`
    )
    .replace(
      /<meta property="og:title"[\s\S]*?\/>/,
      `<meta property="og:title" content="${jobFairTitle}" />`
    )
    .replace(
      /<meta property="og:description"[\s\S]*?\/>/,
      `<meta property="og:description" content="${jobFairDesc}" />`
    )
    .replace(
      /<meta property="og:url"[\s\S]*?\/>/,
      `<meta property="og:url" content="https://ninusoft.com/${route}" />`
    )
    .replace(
      /<meta name="twitter:title"[\s\S]*?\/>/,
      `<meta name="twitter:title" content="${jobFairTitle}" />`
    )
    .replace(
      /<meta name="twitter:description"[\s\S]*?\/>/,
      `<meta name="twitter:description" content="${jobFairDesc}" />`
    );

  const routeDir = path.join(distDir, route);
  fs.mkdirSync(routeDir, { recursive: true });
  fs.writeFileSync(path.join(routeDir, "index.html"), html, "utf-8");
}

console.log("Generated static route HTML for:", routes.join(", "));
