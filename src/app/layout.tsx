import type { Metadata, Viewport } from "next";
import { Heebo, Inter } from "next/font/google";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EngliFun — למד אנגלית בכיף",
  description: "פלטפורמה ללימוד אנגלית בעברית בסגנון Duolingo",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${heebo.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        {/* iOS Safari ignores `user-scalable=no` from the viewport meta on
            purpose (accessibility regression in iOS 10+). The only reliable
            cross-browser way to block pinch-zoom and double-tap-zoom is to
            cancel the gesture events ourselves. Runs once at first paint. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                var stop = function (e) { e.preventDefault(); };
                document.addEventListener('gesturestart', stop, { passive: false });
                document.addEventListener('gesturechange', stop, { passive: false });
                document.addEventListener('gestureend', stop, { passive: false });
                document.addEventListener('touchmove', function (e) {
                  if (e.touches && e.touches.length > 1) e.preventDefault();
                }, { passive: false });
                var lastTouch = 0;
                document.addEventListener('touchend', function (e) {
                  var now = e.timeStamp || (new Date()).getTime();
                  if (now - lastTouch <= 350) e.preventDefault();
                  lastTouch = now;
                }, { passive: false });
              })();
            `,
          }}
        />
      </head>
      <body
        className="min-h-full flex flex-col font-heebo overflow-x-hidden"
        style={{ touchAction: "pan-x pan-y" }}
      >
        {children}
      </body>
    </html>
  );
}
