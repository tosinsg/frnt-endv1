# Oscillate Marketing — Frontend

Full-stack marketplace frontend built from the Frontend Build Brief. All 14 screens from
Section 3, wired end-to-end with Redux Toolkit state, populated with mock content, and a
motion layer on top.

## Setup

```bash
npm install
npm run dev
```

Network access wasn't available in the build sandbox, so `npm install` hasn't been run here —
run it locally to pull in the dependencies listed in `package.json`.

## Latest round — design polish (no image generation — being upfront about that)

There's no image-generation tool in this environment, so "generate images" isn't something I
can actually do here — didn't want to fake it or quietly substitute something misleading.
What I did instead was real design craft toward the same goal (sleek, premium):

- **Found and fixed a real bug**: the display font (`--font-display`) was set to `"General
  Sans"`, which was never actually imported anywhere — `index.html` only ever loaded Inter.
  Every headline on the site has been silently falling back to the system sans-serif this whole
  time. Replaced with **Fraunces**, a warm characterful serif built for exactly this kind of
  display use, properly imported now. This alone changes the site's whole personality — worth
  checking first, before judging anything else here.
- **Subtle grain texture** (`.grain-overlay` in `index.css`) on the hero — an SVG-noise overlay
  at low opacity via `mix-blend-mode: overlay`. Costs nothing (pure CSS, no image request).
- **Pedestal glow** under the product spotlight — a soft blurred ellipse beneath the floating
  product, like studio lighting rather than a paste job.
- **Buttons now have real shadow depth** and a spring-based hover lift instead of a flat color
  swap and a 1px nudge.
- A third, smaller ambient accent orb in the hero for more layered depth.

If you want real generated or photographed imagery, bring it the same way you brought the cart
and hoodie photos — generate it elsewhere and send it here, or point me at real product
photography once vendors are uploading it — and I'll wire it in.

## History (most recent first)

- **Hero slideshow, replacing the 3D ring carousel.** `HeroProductSlideshow.jsx` shows one
  product at a time, autoplaying, with a different transition per slide (fade+zoom, slide,
  rotate-in, blur-in) instead of one repeating effect. No card outline — the hoodie photos have
  real alpha transparency, and every slide gets a soft radial edge-mask regardless. Hover
  pauses + slightly scales it; click goes to that product's page; dots jump directly.
- **Hero height actually capped.** `min-h-[90vh]` only ever set a *minimum*, so content could
  push the hero taller than the screen — which is what was happening. Now
  `h-[calc(100vh-4rem)]` (4rem = the navbar's real height), with a `min-h-[560px]` floor for
  very short viewports. Also added `overflow-x: hidden` at the `html`/`body` level as a width
  safety net.
- **3D rotating product ring** (`ProductGlobeCarousel.jsx`, since superseded by the slideshow
  above): `perspective` + `preserve-3d`, cards on `rotateY(angle) translateZ(radius)`, spinning
  continuously and pausing on hover.
- **Cart-travel hero entrance removed entirely**, replaced with `HeroIntro.jsx`: a short accent
  line draws itself, the headline slides up from it, then everything else pops in with a
  staggered spring. The carousel/slideshow slides in from the right independently.
- **Structural fix**: the cart used to be an absolutely-positioned full-bleed layer independent
  of the grid — which is what caused a dead gap in the middle of the hero, since the grid still
  reserved a column for it but the cart's real position had nothing to do with that column. The
  product showcase is now a normal grid child in the same `md:grid-cols-2` as the text.
- **4 hoodie products added** (`p-9`–`p-12`), each with a real bundled photo
  (`src/assets/products/`, resized + WebP-compressed). `ProductThumb.jsx` handles both local
  bundled images and Cloudinary IDs, telling them apart by whether the string looks like a URL.
- **Earlier still**: a hand-drawn SVG cart illustration, then a real bundled cart photo with
  trail marks and an arrival tilt, then produce illustrations (tomato/banana/grapes/etc.) — all
  removed in favor of what's described above. Also from this era: the full green palette
  (`leaf`/`canopy`/`slate`) from `ui_theme.jpg`, light theme throughout, Lenis (inertia scroll)
  removed after repeated lag complaints in favor of native scroll with GSAP `ScrollTrigger`
  (`Reveal.jsx`) still running section fade-ins independently, discount badges + strikethrough
  pricing (`PriceTag.jsx`), a trust bar, a flash-sale countdown, a trending carousel, a
  testimonial carousel, and a category showcase — all still in place today.

## Structure

```
src/
  assets/
    products/              brown/red/white/blue hoodie photos (real, bundled, with alpha)
  pages/                   14 screens, one file each, named after the brief's screen list
  components/
    Navbar, Footer, Reveal (GSAP scroll wrapper), PageLoader, ProductThumb, PriceTag
    HeroIntro.jsx           line-draw + headline slide-up hero entrance
    HeroProductSlideshow.jsx   one-product-at-a-time hero slideshow, edges masked, per-slide transitions
    TrendingCarousel.jsx, TestimonialCarousel.jsx   the two slideshows lower on the page
    CategoryShowcase.jsx, HowItWorks.jsx, TrustBar.jsx, FlashSaleBanner.jsx
    ui/                    Button, Input, ProgressBar
  store/slices/            authSlice (onboardingStage machine), adminSlice (queues + audit log),
                           catalogSlice (products, cart, reviews, orders)
  lib/
    categoryTints.js       category → icon/color mapping, used everywhere a product needs a visual
    cloudinary.js           minimal Cloudinary URL builder
```

## Route map

| Screen (brief) | Route |
|---|---|
| 1. Landing Page | `/` |
| 2. Auth Entry | `/auth`, `/login` |
| 3. Registration | `/register` |
| 4. OTP Verification | `/verify-otp` |
| 5. Role Confirmation | `/role-confirmation` |
| 6. Customer Onboarding Quiz | `/onboarding/quiz` |
| 7. Vendor Eligibility Flow | `/onboarding/vendor` |
| 8. Customer Dashboard | `/customer/dashboard` |
| 9. Vendor Dashboard | `/vendor/dashboard` |
| 10. Admin Dashboard | `/admin` |
| 11. Profile Customization | `/profile` |
| 12. Product Detail | `/products/:id` (+ public browse at `/products`, with `?category=` filtering) |
| 13. Checkout Flow | `/checkout` |
| 14. Terms & Privacy | `/terms` |

## Backend integration

The app talks to the Spring Boot API via Vite proxy (`/api` → `http://localhost:8080`).

1. Start MongoDB (`mongodb://localhost:27017`)
2. Start the backend: `cd ../backend/backend && mvnw.cmd spring-boot:run`
3. Start this app: `npm install && npm run dev`

Optional: set `VITE_API_URL=http://localhost:8080/api` to call the API without the proxy.

**Seeded admin:** `admin@aro.com` / `admin12345`  
**OTP in dev:** shown on the verify screen and in the backend console (`[Oscillate OTP]`) when mail is disabled.

## Route guards (by role)

Guards live in `RequireAuth` / `RequireGuest` + `lib/authRoutes.js`.

| Path | Access |
|---|---|
| `/auth`, `/login`, `/register`, `/verify-otp` | guests only (`RequireGuest`) |
| `/role-confirmation` | authenticated, no role yet |
| `/onboarding/quiz` | `customer` (onboarding allowed) |
| `/onboarding/vendor` | `vendor` (onboarding allowed) |
| `/customer/dashboard`, `/checkout`, `/checkout/callback` | `customer` (onboarding complete) |
| `/vendor/dashboard` | `vendor` (eligibility submitted) |
| `/admin` | `admin` |
| `/profile` | `customer` \| `vendor` \| `admin` (onboarding complete) |
| `/contact` | any authenticated user |

Wrong role or unfinished onboarding redirects via `routeForUser()`.

## Integrations (env)

Backend env (see `backend/backend/README.md`):

- **Email OTP:** `APP_MAIL_ENABLED`, `SMTP_HOST`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `APP_MAIL_FROM`
- **Cloudinary:** `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- **Paystack:** `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`, `PAYSTACK_CALLBACK_URL`

Frontend optional: `VITE_CLOUDINARY_CLOUD_NAME` (image delivery only), `VITE_API_URL`.

## Remaining polish

- Hoodie product images are still local-only assets; API products may fall back to category icons.
"# frnt-endv1" 
