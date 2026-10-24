# DROP — Small Steps. Big Ideas.

> **DROP** is an emerging student-led creative technology project exploring ideas through software, connected systems, and digital experiences.

---

## 💧 Overview & Design Concept

The visual identity of DROP is inspired by a luminous droplet creating ripples across a dark reflective surface—representing how a small, focused idea can expand and create a meaningful ripple effect.

* **Design Palette:**
  * Deep Navy: `#050B18`
  * Midnight Blue: `#08172B`
  * Electric Cyan: `#00E5F0`
  * Electric Blue: `#1677FF`
  * Violet: `#6657FF`
  * White: `#F7FAFF`
  * Muted Text: `#A9B8CC`
* **Core Ethos:** Build • Connect • Grow
* **Status:** Non-commercial student lab initiative. All concept and hardware models are transparently labeled as *Experiment*, *In Progress*, or *Completed*.

---

## 🛠️ Technology Stack

* **Framework:** Next.js 15 (App Router)
* **Language:** TypeScript 5
* **Styling:** Tailwind CSS with custom brand token extensions
* **Interactive Canvas:** High-performance HTML5 Canvas 2D with fluid ripple physics and `prefers-reduced-motion` compliance
* **Icons:** Lucide React
* **Email Provider:** Resend transactional email API
* **Security:** Sliding window rate limiting, honeypot anti-spam, input sanitization, and strict HTTP headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, etc.)

---

## 🚀 Getting Started

### 1. Prerequisites
* **Node.js:** v18.18+ or v20+ / v22+ (tested on v24)
* **npm:** v9+

### 2. Environment Variables Configuration
Copy the `.env.example` file to create your local `.env.local`:
```bash
cp .env.example .env.local
```

Inside `.env.local`, set your configuration values:
```ini
# Resend API Key (obtain free key from https://resend.com/api-keys)
RESEND_API_KEY=re_your_api_key_here

# Verified Sender Address (free testing tier uses onboarding@resend.dev)
CONTACT_FROM_EMAIL=DROP Website <onboarding@resend.dev>

# Destination email where contact form submissions will be received
# (Note: In Resend free test mode, this must be your registered Resend account email)
CONTACT_TO_EMAIL=your-email@example.com

# Site URL for metadata & sitemaps
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> **Security Note:** `.env.local` is listed in `.gitignore` and must **never** be committed to source control.

### 3. Local Development
Start the local Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build
Verify compilation and optimize for production:
```bash
npm run build
npm run start
```

---

## 📬 Contact Form & Resend Email Setup

The contact form is built with full server-side validation and security:
1. **Client-side Validation:** Real-time feedback for required fields, length boundaries, and valid email syntax.
2. **Anti-Spam Honeypot:** Hidden `website_hp` field catches automated bot scripts silently.
3. **In-Memory Rate Limiting:** Sliding-window rate limiter limits requests to 5 submissions per 15 minutes per IP.
4. **Server-Side Validation:** Re-validates data independently of the browser before dispatching to Resend.
5. **Config Handling:**
   - If `RESEND_API_KEY` is not yet configured or contains placeholders, the API responds with a polite `unconfigured` status displaying setup guidance rather than crashing or pretending an email was sent.
   - Once configured, emails are dispatched securely to your `CONTACT_TO_EMAIL` with the visitor set as the `replyTo` address.

### Step-by-Step Resend Verification:
1. Sign up for a free account at [Resend.com](https://resend.com).
2. Go to **API Keys** and click **Create API Key**. Copy the key starting with `re_`.
3. In development, you can test immediately with the default sender `onboarding@resend.dev` and deliver to the email address registered with your Resend account.
4. For production with a custom domain:
   - In Resend, go to **Domains** -> **Add Domain** (e.g. `dropcraft.org`).
   - Add the supplied DNS records (DKIM, SPF, MX) to your domain registrar (Cloudflare, Namecheap, Route53, etc.).
   - Once verified (usually within a few minutes), update `CONTACT_FROM_EMAIL="DROP <hello@yourdomain.com>"`.

---

## 🌐 Deploying to Production

### Deploying to Vercel (Recommended for Next.js)
1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Log into [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your DROP repository.
4. In the **Environment Variables** section, add:
   * `RESEND_API_KEY`
   * `CONTACT_FROM_EMAIL`
   * `CONTACT_TO_EMAIL`
   * `NEXT_PUBLIC_SITE_URL` (set to your production domain, e.g. `https://drop.vercel.app`)
5. Click **Deploy**. Vercel will automatically build and distribute the app globally.

### Deploying to Any Node.js Server or Docker
```bash
npm ci
npm run build
npm run start
```
Bind port `3000` (or `PORT` environment variable).

---

## ♿ Accessibility (WCAG 2.2 AA)

* **Keyboard Navigation:** Full focus visibility with cyan rings across all interactive elements.
* **Skip Link:** Accessible `<a href="#main-content" class="skip-link">` allows screen reader and keyboard users to bypass navigation.
* **Reduced Motion:** Interactive droplet canvas and CSS animations automatically obey system `prefers-reduced-motion` settings.
* **Color Contrast:** Deep navy (`#050B18`) and midnight blue (`#08172B`) background pairings with white (`#F7FAFF`) and cyan (`#00E5F0`) exceed WCAG 4.5:1 contrast ratios.

---

## 📄 License & Attribution

Created with curiosity by the DROP student creative technology initiative. Open for educational and non-commercial exploration.
