import "./globals.css";

export const metadata = {
  title: "TRI:READ",
  description: "Daily reading quiz dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
