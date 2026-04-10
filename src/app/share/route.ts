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
  <meta http-equiv="refresh" content="0;url=${targetUrl}" />
  <link rel="canonical" href="${targetUrl}" />
</head>
<body>
  <p>Redirecting to <a href="${targetUrl}">${targetUrl}</a>...</p>
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
