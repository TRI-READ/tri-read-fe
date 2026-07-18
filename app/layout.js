import "./globals.css";

export const metadata = {
  title: "TRI:READ",
  description: "평일마다 이어지는 고3 비문학 퀴즈",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
