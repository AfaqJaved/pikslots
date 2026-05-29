/**
 * Pikslots Stakeholder Presentation Generator
 *
 * Usage:
 *   node generate-presentation.mjs
 *
 * Prerequisites:
 *   - App running at http://localhost:5173
 *   - API running at http://localhost:3000
 *   - Database seeded (user: afaqjaved / admin12345)
 *   - puppeteer-core in /tmp/pikslots-pres/node_modules
 */

import { createRequire } from 'module';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const require = createRequire(import.meta.url);
let puppeteer;
try {
  puppeteer = require('/tmp/pikslots-pres/node_modules/puppeteer-core');
} catch (e) {
  console.error('puppeteer-core not found. Run: cd /tmp && mkdir pikslots-pres && cd pikslots-pres && npm init -y && npm install puppeteer-core');
  process.exit(1);
}

const BASE_URL = 'http://localhost:5173';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const CREDS = { usernameOrEmail: 'afaqjaved', password: 'admin12345' };
const OUT_FILE = './pitch-presentation.html';

const PAGES = [
  { id: 'login',       path: '/login',                                         label: 'Login Page',          settingsPage: false },
  { id: 'dashboard',   path: '/home',                                           label: 'Dashboard',           settingsPage: false },
  { id: 'brand',       path: '/home/settings/brand/brand-details',             label: 'Brand Setup',         settingsPage: true  },
  { id: 'appearance',  path: '/home/settings/brand/appearance',                label: 'Appearance',          settingsPage: true  },
  { id: 'bookings',    path: '/home/bookings',                                  label: 'Bookings',            settingsPage: false },
  { id: 'services',    path: '/home/services',                                  label: 'Services',            settingsPage: false },
  { id: 'customers',   path: '/home/customers',                                 label: 'Customers',           settingsPage: false },
  { id: 'payments',    path: '/home/payments',                                  label: 'Payments',            settingsPage: false },
];

async function captureScreenshots() {
  console.log('Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  const screenshots = {};

  // Login
  console.log('Logging in...');
  try {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0', timeout: 15000 });
  } catch {
    console.error('\nERROR: Cannot reach http://localhost:5173 — is the dev server running?');
    await browser.close();
    process.exit(1);
  }

  // Take login screenshot before filling form
  await new Promise(r => setTimeout(r, 800));
  screenshots['login'] = await page.screenshot({ encoding: 'base64', fullPage: false });
  console.log('  [1/8] login captured');

  // Fill login form
  await page.waitForSelector('#userNameOrEmail', { timeout: 8000 });
  await page.type('#userNameOrEmail', CREDS.usernameOrEmail, { delay: 40 });
  await page.type('#password', CREDS.password, { delay: 40 });

  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 20000 }),
    page.click('button[type="submit"]'),
  ]);

  const currentUrl = page.url();
  if (!currentUrl.includes('/home')) {
    console.error(`Login failed. Current URL: ${currentUrl}`);
    await browser.close();
    process.exit(1);
  }
  console.log('  Login successful!');

  // Screenshot remaining pages
  const remaining = PAGES.filter(p => p.id !== 'login');
  for (let i = 0; i < remaining.length; i++) {
    const { id, path, label, settingsPage } = remaining[i];
    try {
      console.log(`  [${i + 2}/8] Capturing ${label}...`);
      await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle0', timeout: 25000 });
      // Extra wait for settings pages (business query needs to resolve)
      await new Promise(r => setTimeout(r, settingsPage ? 2500 : 1500));
      screenshots[id] = await page.screenshot({ encoding: 'base64', fullPage: false });
    } catch (err) {
      console.warn(`  Warning: Failed to capture ${label}: ${err.message}`);
      screenshots[id] = null;
    }
  }

  await browser.close();
  console.log('All screenshots captured.\n');
  return screenshots;
}

function img(b64, alt) {
  if (!b64) {
    return `<div class="screenshot-placeholder"><span>Screenshot unavailable — run the capture script with app running</span></div>`;
  }
  return `<img src="data:image/png;base64,${b64}" alt="${alt}" class="screenshot-img" />`;
}

function buildHTML(s) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Pikslots — Stakeholder Pitch Deck</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:         #08080f;
    --bg-card:    #111119;
    --bg-hi:      #1a1a2e;
    --accent:     #7c3aed;
    --accent-l:   #a78bfa;
    --accent-d:   #5b21b6;
    --teal:       #0ea5e9;
    --green:      #10b981;
    --orange:     #f59e0b;
    --red:        #ef4444;
    --text:       #f1f5f9;
    --muted:      #94a3b8;
    --border:     #2a2a3e;
    --radius:     14px;
  }

  html, body {
    width: 100%; height: 100%;
    background: var(--bg);
    color: var(--text);
    font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
    overflow: hidden;
  }

  /* Progress bar */
  #progress {
    position: fixed; top: 0; left: 0; height: 3px;
    background: linear-gradient(90deg, var(--accent), var(--teal));
    transition: width 0.4s ease;
    z-index: 100;
  }

  /* Slides container */
  #deck {
    width: 100%; height: 100%;
    position: relative;
    overflow: hidden;
  }

  .slide {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 48px 64px;
    opacity: 0;
    transform: translateX(60px);
    transition: opacity 0.45s ease, transform 0.45s ease;
    pointer-events: none;
    overflow: hidden;
  }
  .slide.active {
    opacity: 1;
    transform: translateX(0);
    pointer-events: all;
  }
  .slide.exit-left {
    opacity: 0;
    transform: translateX(-60px);
  }

  /* Nav arrows */
  .nav-btn {
    position: fixed;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(124,58,237,0.15);
    border: 1px solid var(--border);
    color: var(--muted);
    width: 44px; height: 44px;
    border-radius: 50%;
    font-size: 20px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.2s, color 0.2s;
    z-index: 50;
  }
  .nav-btn:hover { background: var(--accent); color: #fff; }
  #nav-prev { left: 16px; }
  #nav-next { right: 16px; }

  /* Slide counter */
  #counter {
    position: fixed;
    bottom: 20px; right: 28px;
    font-size: 13px;
    color: var(--muted);
    z-index: 50;
  }

  /* Hint */
  #hint {
    position: fixed;
    bottom: 20px; left: 50%;
    transform: translateX(-50%);
    font-size: 12px;
    color: var(--border);
    z-index: 50;
  }

  /* ── Typography ── */
  .label {
    font-size: 11px; font-weight: 600; letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--accent-l);
    margin-bottom: 12px;
  }
  h1 { font-size: clamp(38px, 5vw, 64px); font-weight: 800; line-height: 1.1; }
  h2 { font-size: clamp(28px, 3.5vw, 42px); font-weight: 700; line-height: 1.2; }
  h3 { font-size: 18px; font-weight: 600; }
  p  { font-size: 16px; line-height: 1.7; color: var(--muted); }

  .accent { color: var(--accent-l); }
  .teal   { color: var(--teal); }
  .green  { color: var(--green); }

  /* ── Gradient text ── */
  .grad {
    background: linear-gradient(135deg, var(--accent-l), var(--teal));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* ── Cards ── */
  .card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 24px 28px;
  }
  .card-grid {
    display: grid;
    gap: 16px;
    width: 100%;
  }
  .card-grid.col2 { grid-template-columns: 1fr 1fr; }
  .card-grid.col3 { grid-template-columns: repeat(3, 1fr); }

  /* ── Feature card ── */
  .feature-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 22px 24px;
    position: relative;
    overflow: hidden;
    transition: border-color 0.2s;
  }
  .feature-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, var(--accent), var(--teal));
    opacity: 0;
    transition: opacity 0.2s;
  }
  .feature-card:hover::before { opacity: 1; }
  .feature-card:hover { border-color: var(--accent); }
  .feature-icon {
    font-size: 28px; margin-bottom: 10px;
    display: block;
  }
  .feature-card h3 { margin-bottom: 6px; font-size: 15px; }
  .feature-card p  { font-size: 13px; }

  /* ── Screenshot card ── */
  .screenshot-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    position: relative;
  }
  .screenshot-card .sc-header {
    padding: 8px 14px;
    background: var(--bg-hi);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 6px;
    font-size: 12px; color: var(--muted);
  }
  .sc-dot { width: 10px; height: 10px; border-radius: 50%; }
  .sc-dot.r { background: #ef4444; }
  .sc-dot.y { background: #f59e0b; }
  .sc-dot.g { background: #10b981; }
  .screenshot-img {
    width: 100%;
    display: block;
    border: none;
  }
  .screenshot-placeholder {
    padding: 40px;
    text-align: center;
    color: var(--muted);
    font-size: 13px;
    background: var(--bg-hi);
    min-height: 200px;
    display: flex; align-items: center; justify-content: center;
  }

  /* ── Pill badge ── */
  .badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(124,58,237,0.15);
    border: 1px solid rgba(124,58,237,0.3);
    color: var(--accent-l);
    padding: 4px 12px;
    border-radius: 100px;
    font-size: 12px; font-weight: 600;
  }
  .badge.teal {
    background: rgba(14,165,233,0.12);
    border-color: rgba(14,165,233,0.3);
    color: var(--teal);
  }
  .badge.green {
    background: rgba(16,185,129,0.12);
    border-color: rgba(16,185,129,0.3);
    color: var(--green);
  }

  /* ── List ── */
  .check-list { list-style: none; display: flex; flex-direction: column; gap: 10px; }
  .check-list li { display: flex; align-items: flex-start; gap: 10px; font-size: 15px; color: var(--text); }
  .check-list li::before { content: '✓'; color: var(--green); font-weight: 700; flex-shrink: 0; margin-top: 1px; }

  /* ── Pain point card ── */
  .pain-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 28px 24px;
    text-align: center;
  }
  .pain-icon { font-size: 36px; margin-bottom: 12px; display: block; }
  .pain-card h3 { margin-bottom: 8px; }

  /* ── Tier card ── */
  .tier-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 24px;
    display: flex; flex-direction: column; gap: 8px;
    position: relative;
  }
  .tier-card.featured {
    border-color: var(--accent);
    background: linear-gradient(135deg, rgba(124,58,237,0.1), rgba(14,165,233,0.06));
  }
  .tier-card.featured::after {
    content: 'POPULAR';
    position: absolute;
    top: -10px; left: 50%; transform: translateX(-50%);
    background: var(--accent);
    color: #fff;
    font-size: 10px; font-weight: 700; letter-spacing: 1px;
    padding: 2px 10px;
    border-radius: 100px;
  }
  .tier-price { font-size: 28px; font-weight: 800; }
  .tier-price span { font-size: 14px; font-weight: 400; color: var(--muted); }
  .tier-desc { font-size: 13px; color: var(--muted); }

  /* ── Timeline ── */
  .timeline { display: flex; flex-direction: column; gap: 16px; width: 100%; }
  .tl-item {
    display: flex; gap: 16px; align-items: flex-start;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px 20px;
  }
  .tl-q {
    background: linear-gradient(135deg, var(--accent), var(--accent-d));
    color: #fff;
    font-weight: 700; font-size: 12px;
    padding: 4px 10px;
    border-radius: 6px;
    flex-shrink: 0;
    align-self: flex-start;
    margin-top: 2px;
  }
  .tl-content h3 { font-size: 15px; margin-bottom: 4px; }
  .tl-content p  { font-size: 13px; }

  /* ── Tech stack pills ── */
  .tech-pills { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
  .tech-pill {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 10px 16px;
    font-size: 13px; font-weight: 500;
    display: flex; align-items: center; gap: 8px;
    transition: border-color 0.2s;
  }
  .tech-pill:hover { border-color: var(--accent); }

  /* ── Stat block ── */
  .stat-block {
    text-align: center;
    padding: 20px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
  }
  .stat-num { font-size: 36px; font-weight: 800; }
  .stat-label { font-size: 13px; color: var(--muted); margin-top: 4px; }

  /* ── Slide-specific helpers ── */
  .center { text-align: center; }
  .w-full { width: 100%; }
  .gap-sm { gap: 12px; }
  .mt-4  { margin-top: 16px; }
  .mt-6  { margin-top: 24px; }
  .mt-8  { margin-top: 32px; }
  .mb-2  { margin-bottom: 8px; }
  .mb-4  { margin-bottom: 16px; }
  .mb-6  { margin-bottom: 24px; }

  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; width: 100%; align-items: center; }
  .two-col-wide { display: grid; grid-template-columns: 1.2fr 1fr; gap: 32px; width: 100%; }

  /* Glow effect on accent elements */
  .glow { box-shadow: 0 0 40px rgba(124,58,237,0.2); }

  /* ── Slide 1 — Title ── */
  #s1 { text-align: center; }
  #s1 .logo {
    font-size: 72px; font-weight: 900;
    font-family: 'Courier New', monospace;
    letter-spacing: -2px;
    margin-bottom: 16px;
    background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 40%, #0ea5e9 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  #s1 .tagline {
    font-size: 22px;
    color: var(--muted);
    max-width: 600px;
    line-height: 1.5;
    margin: 0 auto 32px;
  }
  #s1 .badges { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

  /* Stars bg */
  #s1::before {
    content: '';
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse 60% 40% at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 70%),
      radial-gradient(ellipse 40% 30% at 80% 80%, rgba(14,165,233,0.08) 0%, transparent 60%);
    pointer-events: none;
  }

  /* ── CTA slide ── */
  #s11 { text-align: center; }
  #s11::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 70% 50% at 50% 50%, rgba(124,58,237,0.15) 0%, transparent 70%);
    pointer-events: none;
  }
  .cta-btn {
    display: inline-block;
    padding: 16px 40px;
    background: linear-gradient(135deg, var(--accent), var(--accent-d));
    color: #fff;
    font-size: 16px; font-weight: 700;
    border-radius: 100px;
    text-decoration: none;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.2s;
    border: none;
  }
  .cta-btn:hover { opacity: 0.9; transform: translateY(-2px); }
  .contact-grid {
    display: flex; gap: 24px; justify-content: center; flex-wrap: wrap;
    margin-top: 32px;
  }
  .contact-item {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px 28px;
    min-width: 160px;
    text-align: center;
  }
  .contact-item .ci-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
  .contact-item .ci-value { font-size: 15px; font-weight: 600; color: var(--accent-l); }
</style>
</head>
<body>

<div id="progress"></div>

<button class="nav-btn" id="nav-prev">&#8592;</button>
<button class="nav-btn" id="nav-next">&#8594;</button>
<div id="counter">1 / 11</div>
<div id="hint">← → arrow keys to navigate</div>

<div id="deck">

<!-- ─────────────────────────────────────────────────────
     SLIDE 1 — TITLE
──────────────────────────────────────────────────────── -->
<section class="slide active" id="s1">
  <div class="logo">pikslots</div>
  <p class="tagline">The all-in-one appointment booking platform<br>built for modern service businesses</p>
  <div class="badges">
    <span class="badge">SaaS Platform</span>
    <span class="badge teal">Multi-Tenant</span>
    <span class="badge green">MVP Ready</span>
  </div>
  <p style="margin-top: 48px; font-size: 13px; color: var(--border);">Investor Pitch Deck &nbsp;·&nbsp; May 2026</p>
</section>


<!-- ─────────────────────────────────────────────────────
     SLIDE 2 — THE PROBLEM
──────────────────────────────────────────────────────── -->
<section class="slide" id="s2">
  <div class="label">The Problem</div>
  <h2 class="mb-6" style="max-width:700px; text-align:center;">Service businesses are drowning in<br><span class="grad">scheduling chaos</span></h2>

  <div class="card-grid col3 w-full">
    <div class="pain-card">
      <span class="pain-icon">📞</span>
      <h3>Manual Booking Overload</h3>
      <p>Staff spend hours on phone/email taking appointments — time that should go to customers.</p>
    </div>
    <div class="pain-card">
      <span class="pain-icon">📭</span>
      <h3>No-Shows & Last-Minute Cancellations</h3>
      <p>Without automated reminders and policies, ~20% of booked slots go unused — direct revenue loss.</p>
    </div>
    <div class="pain-card">
      <span class="pain-icon">🧩</span>
      <h3>Fragmented, Expensive Tools</h3>
      <p>Businesses juggle 3–5 separate tools for booking, payments, CRM, and notifications — at $50–$200/mo each.</p>
    </div>
  </div>

  <div class="card mt-6 w-full" style="background: rgba(124,58,237,0.08); border-color: rgba(124,58,237,0.3); text-align:center; padding:18px;">
    <p style="color: var(--text); font-size:15px;"><strong style="color:var(--accent-l)">$483 billion</strong> global professional services market — still heavily reliant on phone calls and manual scheduling in 2026.</p>
  </div>
</section>


<!-- ─────────────────────────────────────────────────────
     SLIDE 3 — THE SOLUTION
──────────────────────────────────────────────────────── -->
<section class="slide" id="s3">
  <div class="two-col">
    <div>
      <div class="label">The Solution</div>
      <h2 class="mb-6">One platform.<br><span class="grad">Infinite bookings.</span></h2>
      <ul class="check-list mb-6">
        <li>Custom branded booking page at <strong>yourbusiness.pikslots.com</strong></li>
        <li>Smart scheduling with configurable lead time, cancellation policies & reminders</li>
        <li>Team calendar management with role-based access</li>
        <li>Built-in payment collection before or after appointments</li>
        <li>Real-time notifications (email/SMS) for staff & customers</li>
        <li>Full white-label customization — colors, logos, themes</li>
      </ul>
      <div style="display:flex; gap:12px; flex-wrap:wrap;">
        <span class="badge">No Coding Required</span>
        <span class="badge teal">Up in Minutes</span>
        <span class="badge green">Works on Any Device</span>
      </div>
    </div>
    <div class="screenshot-card glow">
      <div class="sc-header"><span class="sc-dot r"></span><span class="sc-dot y"></span><span class="sc-dot g"></span> &nbsp;pikslots.com</div>
      ${img(s.brand, 'Brand Setup')}
    </div>
  </div>
</section>


<!-- ─────────────────────────────────────────────────────
     SLIDE 4 — KEY FEATURES
──────────────────────────────────────────────────────── -->
<section class="slide" id="s4">
  <div class="label">Key Features</div>
  <h2 class="mb-6 center">Everything a service business needs</h2>

  <div class="card-grid col3 w-full">
    <div class="feature-card">
      <span class="feature-icon">📅</span>
      <h3>Smart Booking Engine</h3>
      <p>Configurable availability, lead times, buffer periods, and multi-service booking in one flow.</p>
    </div>
    <div class="feature-card">
      <span class="feature-icon">👥</span>
      <h3>Team Management</h3>
      <p>Invite staff, assign roles (Admin/Enhanced/Standard), set per-member schedules and notification preferences.</p>
    </div>
    <div class="feature-card">
      <span class="feature-icon">🎨</span>
      <h3>Brand Customization</h3>
      <p>Custom logo, banner, colors, button shapes, light/dark themes — your brand, your booking page.</p>
    </div>
    <div class="feature-card">
      <span class="feature-icon">💳</span>
      <h3>Integrated Payments</h3>
      <p>Collect deposits or full payment at booking. Built-in payment history and reporting.</p>
    </div>
    <div class="feature-card">
      <span class="feature-icon">🔔</span>
      <h3>Smart Notifications</h3>
      <p>Automated email reminders to customers and staff. Configurable timing, templates, and channels.</p>
    </div>
    <div class="feature-card">
      <span class="feature-icon">📊</span>
      <h3>Analytics Dashboard</h3>
      <p>Revenue tracking, customer growth, booking trends, and performance metrics at a glance.</p>
    </div>
  </div>
</section>


<!-- ─────────────────────────────────────────────────────
     SLIDE 5 — DEMO: DASHBOARD & BRAND
──────────────────────────────────────────────────────── -->
<section class="slide" id="s5">
  <div class="label">Live Demo</div>
  <h2 class="mb-6 center">Dashboard &amp; Business Setup</h2>

  <div class="card-grid col2 w-full">
    <div>
      <p class="mb-2" style="font-size:13px; color:var(--muted); font-weight:600; text-transform:uppercase; letter-spacing:1px;">Business Dashboard</p>
      <div class="screenshot-card">
        <div class="sc-header"><span class="sc-dot r"></span><span class="sc-dot y"></span><span class="sc-dot g"></span> &nbsp;app.pikslots.com/home</div>
        ${img(s.dashboard, 'Dashboard')}
      </div>
    </div>
    <div>
      <p class="mb-2" style="font-size:13px; color:var(--muted); font-weight:600; text-transform:uppercase; letter-spacing:1px;">Brand Setup with Live Preview</p>
      <div class="screenshot-card">
        <div class="sc-header"><span class="sc-dot r"></span><span class="sc-dot y"></span><span class="sc-dot g"></span> &nbsp;app.pikslots.com/home/settings/brand</div>
        ${img(s.brand, 'Brand Details')}
      </div>
    </div>
  </div>
</section>


<!-- ─────────────────────────────────────────────────────
     SLIDE 6 — DEMO: CUSTOMIZATION
──────────────────────────────────────────────────────── -->
<section class="slide" id="s6">
  <div class="label">Live Demo</div>
  <h2 class="mb-6 center">White-Label Customization</h2>

  <div class="card-grid col2 w-full">
    <div>
      <p class="mb-2" style="font-size:13px; color:var(--muted); font-weight:600; text-transform:uppercase; letter-spacing:1px;">Appearance — Colors, Theme &amp; Buttons</p>
      <div class="screenshot-card">
        <div class="sc-header"><span class="sc-dot r"></span><span class="sc-dot y"></span><span class="sc-dot g"></span> &nbsp;app.pikslots.com/home/settings/brand/appearance</div>
        ${img(s.appearance, 'Appearance Settings')}
      </div>
    </div>
    <div>
      <p class="mb-2" style="font-size:13px; color:var(--muted); font-weight:600; text-transform:uppercase; letter-spacing:1px;">Secure Customer Login</p>
      <div class="screenshot-card">
        <div class="sc-header"><span class="sc-dot r"></span><span class="sc-dot y"></span><span class="sc-dot g"></span> &nbsp;app.pikslots.com/login</div>
        ${img(s.login, 'Login')}
      </div>
    </div>
  </div>
</section>


<!-- ─────────────────────────────────────────────────────
     SLIDE 7 — DEMO: OPERATIONS
──────────────────────────────────────────────────────── -->
<section class="slide" id="s7">
  <div class="label">Live Demo</div>
  <h2 class="mb-4 center">Bookings, Services &amp; Customers</h2>

  <div class="card-grid col2 w-full" style="grid-template-columns: repeat(2,1fr); gap:14px;">
    <div>
      <p class="mb-2" style="font-size:12px; color:var(--muted); text-transform:uppercase; letter-spacing:1px; font-weight:600;">Bookings</p>
      <div class="screenshot-card">
        <div class="sc-header" style="padding:6px 12px;"><span class="sc-dot r"></span><span class="sc-dot y"></span><span class="sc-dot g"></span></div>
        ${img(s.bookings, 'Bookings')}
      </div>
    </div>
    <div>
      <p class="mb-2" style="font-size:12px; color:var(--muted); text-transform:uppercase; letter-spacing:1px; font-weight:600;">Services</p>
      <div class="screenshot-card">
        <div class="sc-header" style="padding:6px 12px;"><span class="sc-dot r"></span><span class="sc-dot y"></span><span class="sc-dot g"></span></div>
        ${img(s.services, 'Services')}
      </div>
    </div>
    <div>
      <p class="mb-2" style="font-size:12px; color:var(--muted); text-transform:uppercase; letter-spacing:1px; font-weight:600;">Customers</p>
      <div class="screenshot-card">
        <div class="sc-header" style="padding:6px 12px;"><span class="sc-dot r"></span><span class="sc-dot y"></span><span class="sc-dot g"></span></div>
        ${img(s.customers, 'Customers')}
      </div>
    </div>
    <div>
      <p class="mb-2" style="font-size:12px; color:var(--muted); text-transform:uppercase; letter-spacing:1px; font-weight:600;">Payments</p>
      <div class="screenshot-card">
        <div class="sc-header" style="padding:6px 12px;"><span class="sc-dot r"></span><span class="sc-dot y"></span><span class="sc-dot g"></span></div>
        ${img(s.payments, 'Payments')}
      </div>
    </div>
  </div>
</section>


<!-- ─────────────────────────────────────────────────────
     SLIDE 8 — MARKET OPPORTUNITY
──────────────────────────────────────────────────────── -->
<section class="slide" id="s8">
  <div class="label">Market Opportunity</div>
  <h2 class="mb-6 center">A massive, underserved market</h2>

  <div class="card-grid col3 w-full mb-6">
    <div class="stat-block">
      <div class="stat-num grad">$483B</div>
      <div class="stat-label">TAM — Global Professional Services Market</div>
    </div>
    <div class="stat-block" style="border-color: var(--accent);">
      <div class="stat-num" style="color: var(--accent-l);">$4.6B</div>
      <div class="stat-label">SAM — Online Booking Software Market (2026)</div>
    </div>
    <div class="stat-block">
      <div class="stat-num" style="color: var(--teal);">$460M</div>
      <div class="stat-label">SOM — Realistic 3-Year Addressable Share</div>
    </div>
  </div>

  <div class="card-grid col2 w-full">
    <div class="card">
      <h3 class="mb-4">Target Verticals</h3>
      <ul class="check-list">
        <li>Salons &amp; Beauty Studios (2.1M+ in US alone)</li>
        <li>Health &amp; Wellness Practitioners</li>
        <li>Fitness Studios &amp; Personal Trainers</li>
        <li>Medical &amp; Dental Clinics</li>
        <li>Legal &amp; Financial Advisors</li>
        <li>Education &amp; Tutoring Centers</li>
      </ul>
    </div>
    <div class="card">
      <h3 class="mb-4">Why Now?</h3>
      <ul class="check-list">
        <li>Post-pandemic digital transformation in SMBs</li>
        <li>Customers expect online self-service booking</li>
        <li>Existing tools (Calendly, Acuity) lack multi-tenant &amp; white-label</li>
        <li>AI-driven scheduling is the next frontier</li>
        <li>Growing gig economy &amp; freelance service providers</li>
      </ul>
    </div>
  </div>
</section>


<!-- ─────────────────────────────────────────────────────
     SLIDE 9 — REVENUE MODEL
──────────────────────────────────────────────────────── -->
<section class="slide" id="s9">
  <div class="label">Revenue Model</div>
  <h2 class="mb-6 center">Subscription SaaS with transaction upside</h2>

  <div class="card-grid col2 w-full" style="grid-template-columns: repeat(4, 1fr); gap:14px; margin-bottom:20px;">
    <div class="tier-card">
      <div style="font-size:13px; color:var(--muted); text-transform:uppercase; letter-spacing:1px; font-weight:600;">Free</div>
      <div class="tier-price">$0 <span>/ mo</span></div>
      <div class="tier-desc">1 user · 50 bookings/mo · Pikslots branding</div>
    </div>
    <div class="tier-card featured">
      <div style="font-size:13px; color:var(--accent-l); text-transform:uppercase; letter-spacing:1px; font-weight:600;">Starter</div>
      <div class="tier-price">$29 <span>/ mo</span></div>
      <div class="tier-desc">3 users · Unlimited bookings · Remove branding</div>
    </div>
    <div class="tier-card">
      <div style="font-size:13px; color:var(--muted); text-transform:uppercase; letter-spacing:1px; font-weight:600;">Pro</div>
      <div class="tier-price">$79 <span>/ mo</span></div>
      <div class="tier-desc">10 users · Custom domain · Payments · Analytics</div>
    </div>
    <div class="tier-card">
      <div style="font-size:13px; color:var(--muted); text-transform:uppercase; letter-spacing:1px; font-weight:600;">Enterprise</div>
      <div class="tier-price">Custom</div>
      <div class="tier-desc">Unlimited · White-label · API access · SLA</div>
    </div>
  </div>

  <div class="card-grid col3 w-full">
    <div class="card center">
      <div style="font-size:22px; font-weight:800; color:var(--accent-l);">2.5%</div>
      <div style="font-size:13px; color:var(--muted); margin-top:4px;">Transaction fee on payments processed through platform</div>
    </div>
    <div class="card center">
      <div style="font-size:22px; font-weight:800; color:var(--teal);">14-day</div>
      <div style="font-size:13px; color:var(--muted); margin-top:4px;">Free trial on all paid plans — no credit card required</div>
    </div>
    <div class="card center">
      <div style="font-size:22px; font-weight:800; color:var(--green);">Annual</div>
      <div style="font-size:13px; color:var(--muted); margin-top:4px;">20% discount on annual billing — improves cash flow &amp; retention</div>
    </div>
  </div>
</section>


<!-- ─────────────────────────────────────────────────────
     SLIDE 10 — MVP ROADMAP
──────────────────────────────────────────────────────── -->
<section class="slide" id="s10">
  <div class="two-col-wide">
    <div>
      <div class="label">MVP Roadmap</div>
      <h2 class="mb-6">From launch to scale</h2>

      <div class="timeline">
        <div class="tl-item">
          <div class="tl-q">Q3 2026</div>
          <div class="tl-content">
            <h3>Core Booking Platform <span class="badge green" style="font-size:10px; padding:2px 8px;">MVP</span></h3>
            <p>Business registration, custom booking pages, team management, appointment scheduling, email notifications</p>
          </div>
        </div>
        <div class="tl-item">
          <div class="tl-q">Q4 2026</div>
          <div class="tl-content">
            <h3>Payments &amp; Analytics</h3>
            <p>Stripe integration, deposit/full-payment flows, dashboard analytics, SMS reminders, customer portal</p>
          </div>
        </div>
        <div class="tl-item">
          <div class="tl-q">Q1 2027</div>
          <div class="tl-content">
            <h3>Integrations &amp; Growth</h3>
            <p>Google Calendar sync, Zapier/webhooks, public API, review management, affiliate program launch</p>
          </div>
        </div>
        <div class="tl-item">
          <div class="tl-q">Q2 2027</div>
          <div class="tl-content">
            <h3>Enterprise &amp; White-Label</h3>
            <p>Custom domain support, full white-label reseller program, multi-location businesses, advanced reporting</p>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 class="mb-4" style="font-size:16px; color:var(--muted); text-transform:uppercase; letter-spacing:1px; font-weight:600;">Current Status</h3>
      <div class="card mb-4" style="border-color: var(--green);">
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
          <span style="width:8px; height:8px; border-radius:50%; background:var(--green); display:inline-block;"></span>
          <strong style="color:var(--green);">Completed</strong>
        </div>
        <ul class="check-list" style="gap:6px;">
          <li>Full-stack monorepo architecture (NestJS + SvelteKit)</li>
          <li>Multi-tenant business registration &amp; auth</li>
          <li>JWT auth with role-based access control (6 roles)</li>
          <li>Brand customization UI with live preview</li>
          <li>Dashboard with analytics charts</li>
          <li>Settings suite (brand, notifications, team, booking)</li>
          <li>BullMQ job queue for background tasks</li>
        </ul>
      </div>
      <div class="card" style="border-color: rgba(245,158,11,0.4);">
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
          <span style="width:8px; height:8px; border-radius:50%; background:var(--orange); display:inline-block;"></span>
          <strong style="color:var(--orange);">In Progress</strong>
        </div>
        <ul class="check-list" style="gap:6px;">
          <li>Customer-facing booking page</li>
          <li>Real-time availability calendar</li>
          <li>Payment integration</li>
        </ul>
      </div>
    </div>
  </div>
</section>


<!-- ─────────────────────────────────────────────────────
     SLIDE 11 — TECH STACK
──────────────────────────────────────────────────────── -->
<section class="slide" id="s10b">
  <div class="label">Technology</div>
  <h2 class="mb-6 center">Enterprise-grade, scalable from day one</h2>

  <div class="tech-pills mb-6">
    <div class="tech-pill"><span>⚡</span> SvelteKit 5</div>
    <div class="tech-pill"><span>🔷</span> NestJS</div>
    <div class="tech-pill"><span>🐘</span> PostgreSQL</div>
    <div class="tech-pill"><span>🔴</span> Redis + BullMQ</div>
    <div class="tech-pill"><span>📦</span> Nx Monorepo</div>
    <div class="tech-pill"><span>🐋</span> Docker</div>
    <div class="tech-pill"><span>🔒</span> JWT Auth</div>
    <div class="tech-pill"><span>✅</span> TypeScript</div>
    <div class="tech-pill"><span>⚡</span> Tailwind CSS v4</div>
    <div class="tech-pill"><span>🔍</span> Zod Validation</div>
  </div>

  <div class="card-grid col3 w-full">
    <div class="card">
      <h3 class="mb-4">Clean Architecture</h3>
      <p>Domain layer fully isolated from frameworks. Repository pattern, use-case classes, and domain events for maintainability at scale.</p>
    </div>
    <div class="card">
      <h3 class="mb-4">Built for Multi-Tenancy</h3>
      <p>Every business gets its own slug, isolated data, and customizable experience from day one. Scales horizontally without redesign.</p>
    </div>
    <div class="card">
      <h3 class="mb-4">Developer-First</h3>
      <p>Full TypeScript across frontend, backend, and shared contracts. Nx workspace enables independent deployments and fast CI/CD.</p>
    </div>
  </div>
</section>


<!-- ─────────────────────────────────────────────────────
     SLIDE 12 — CALL TO ACTION
──────────────────────────────────────────────────────── -->
<section class="slide" id="s11">
  <div class="label">Join Us</div>
  <h1 class="mb-4">Ready to book<br><span class="grad">your slot?</span></h1>
  <p style="max-width:520px; margin:0 auto 32px; font-size:18px;">We're raising our seed round to accelerate development and acquire our first 500 paying customers. Let's build the future of service business scheduling together.</p>

  <button class="cta-btn">Schedule a Demo</button>

  <div class="contact-grid">
    <div class="contact-item">
      <div class="ci-label">Product</div>
      <div class="ci-value">pikslots.com</div>
    </div>
    <div class="contact-item">
      <div class="ci-label">Email</div>
      <div class="ci-value">hello@pikslots.com</div>
    </div>
    <div class="contact-item">
      <div class="ci-label">Stage</div>
      <div class="ci-value">Pre-Seed / MVP</div>
    </div>
    <div class="contact-item">
      <div class="ci-label">Looking For</div>
      <div class="ci-value">Seed Investment</div>
    </div>
  </div>
</section>

</div><!-- /#deck -->

<script>
(function() {
  const TOTAL = document.querySelectorAll('.slide').length;
  let current = 0;

  const slides   = Array.from(document.querySelectorAll('.slide'));
  const progress = document.getElementById('progress');
  const counter  = document.getElementById('counter');
  const prevBtn  = document.getElementById('nav-prev');
  const nextBtn  = document.getElementById('nav-next');

  function goTo(n) {
    if (n < 0 || n >= TOTAL) return;
    slides[current].classList.remove('active');
    slides[current].classList.add(n > current ? 'exit-left' : 'exit-right');
    setTimeout(() => slides[current].classList.remove('exit-left', 'exit-right'), 450);

    current = n;
    slides[current].classList.add('active');

    const pct = ((current + 1) / TOTAL) * 100;
    progress.style.width = pct + '%';
    counter.textContent = (current + 1) + ' / ' + TOTAL;

    prevBtn.style.opacity = current === 0 ? '0.3' : '1';
    nextBtn.style.opacity = current === TOTAL - 1 ? '0.3' : '1';
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'j') goTo(current + 1);
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp'   || e.key === 'k') goTo(current - 1);
  });

  // Touch/swipe support
  let touchStartX = 0;
  document.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; });
  document.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) goTo(current + (dx < 0 ? 1 : -1));
  });

  // Init
  goTo(0);
})();
</script>
</body>
</html>`;
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log('=== Pikslots Presentation Generator ===\n');

  let screenshots;
  try {
    screenshots = await captureScreenshots();
  } catch (err) {
    console.error('Screenshot capture failed:', err.message);
    console.log('\nGenerating presentation with placeholder images...\n');
    screenshots = {};
    for (const p of PAGES) screenshots[p.id] = null;
  }

  console.log('Building HTML presentation...');
  const html = buildHTML(screenshots);
  writeFileSync(OUT_FILE, html, 'utf8');

  const sizeMB = (html.length / 1024 / 1024).toFixed(1);
  console.log(`\nDone! Output: ${OUT_FILE} (${sizeMB} MB)`);
  console.log('Open with:  open pitch-presentation.html');
})();
