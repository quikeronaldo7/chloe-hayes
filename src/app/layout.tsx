import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import Script from "next/script";
import { CartProvider } from "@/components/cart";
import { JsonLd } from "@/components/json-ld";
import { RevealObserver } from "@/components/reveal-observer";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { absoluteUrl, siteConfig } from "@/lib/config";
import { activePriceBook } from "@/lib/server/pricing";
import { storefrontOpen } from "@/lib/storefront";
import "./globals.css";

// The guides are set in Fraunces and DM Sans: the site uses the same pair.
const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["SOFT", "WONK"],
  variable: "--font-fraunces",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.title, template: "%s · Chloe in Austin" },
  description: siteConfig.description,
  applicationName: "Chloe in Austin",
  openGraph: {
    type: "website",
    siteName: "Chloe in Austin",
    locale: "en_US",
    images: [{ url: "/images/chloe/chloe-bbq-table.jpg", width: 1100, height: 1375, alt: "Chloe at a table loaded with barbecue" }],
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
  // Previews are private; only Production may ever be indexed (and only once launched).
  robots: process.env.VERCEL_ENV === "production" ? undefined : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#f7f1e6",
  width: "device-width",
  initialScale: 1,
};

const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
const gaId = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({ children }: LayoutProps<"/">) {
  const book = activePriceBook();
  const isPreview = process.env.VERCEL_ENV !== "production";
  return (
    <html lang="en-US" className={`${fraunces.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <CartProvider book={book} shopOpen={storefrontOpen()}>
          {isPreview ? (
            <aside aria-label="Preview notice" className="bg-ink px-4 py-1.5 text-center text-[0.72rem] font-medium tracking-wide text-paper/85">
              Private preview · not public · {book.mode === "test" ? "Stripe TEST mode, $1 test prices" : "prices not yet approved, nothing is for sale"}
            </aside>
          ) : null}
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </CartProvider>
        <RevealObserver />

        <JsonLd
          data={[
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Chloe in Austin",
              url: siteConfig.url,
              logo: absoluteUrl("/icon.svg"),
              founder: { "@type": "Person", name: "Chloe Hayes" },
            },
            { "@context": "https://schema.org", "@type": "WebSite", name: "Chloe in Austin", url: siteConfig.url },
          ]}
        />

        {plausibleDomain ? <Script defer data-domain={plausibleDomain} src="https://plausible.io/js/script.revenue.js" strategy="afterInteractive" /> : null}
        {gaId ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="ga" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId}');`}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
