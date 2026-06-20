import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "CauseLoop - Premium Golf Score Tracking & Charity Prize Draws",
  description: "A subscription-based golf score tracking platform combined with a monthly charity-driven prize draw system.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} min-h-screen bg-black text-slate-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-200`}
      >
        {children}
      </body>
    </html>
  );
}
