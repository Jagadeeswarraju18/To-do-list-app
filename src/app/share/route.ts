import { NextResponse } from "next/server";

const shareUrl = "https://www.mardishub.com/share";
const imageUrl = "https://www.mardishub.com/x-og-card.png?v=2";
const targetUrl = "https://www.mardishub.com/";

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Mardis</title>
  <meta property="og:title" content="Mardis - Demand Capture Software for Reddit, X, and LinkedIn" />
  <meta property="og:description" content="Find high-intent conversations across Reddit, X, and LinkedIn and act on them with rule-aware drafts." />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:url" content="${shareUrl}" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@Mardishub" />
  <meta name="twitter:creator" content="@Jagadeeswarrrr" />
  <meta name="twitter:title" content="Mardis - Demand Capture Software for Reddit, X, and LinkedIn" />
  <meta name="twitter:description" content="Find high-intent conversations across Reddit, X, and LinkedIn and act on them with rule-aware drafts." />
  <meta name="twitter:image" content="${imageUrl}" />
  <link rel="canonical" href="${shareUrl}" />
  <style>
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background: #050505;
      color: #ffffff;
      display: flex;
      min-height: 100vh;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      max-width: 720px;
      width: 100%;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 20px;
      background: #0c0c0c;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(0,0,0,0.45);
    }
    img {
      display: block;
      width: 100%;
      height: auto;
    }
    .content {
      padding: 24px;
    }
    h1 {
      font-size: 32px;
      line-height: 1.1;
      margin: 0 0 12px;
    }
    p {
      color: #c8c8c8;
      font-size: 18px;
      line-height: 1.5;
      margin: 0 0 20px;
    }
    a {
      display: inline-block;
      padding: 12px 18px;
      border-radius: 999px;
      background: #ffffff;
      color: #000000;
      text-decoration: none;
      font-weight: 700;
    }
  </style>
</head>
<body>
  <main class="card">
    <img src="${imageUrl}" alt="Mardis demand capture software preview" />
    <div class="content">
      <h1>Mardis</h1>
      <p>Find high-intent conversations across Reddit, X, and LinkedIn and act on them with rule-aware drafts.</p>
      <a href="${targetUrl}">Open Mardis</a>
    </div>
  </main>
</body>
</html>`;

export async function GET() {
    return new NextResponse(html, {
        headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "public, max-age=0, must-revalidate",
        },
    });
}
