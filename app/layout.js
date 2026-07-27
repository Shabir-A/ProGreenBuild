export const metadata = {
  title: 'Reno App v2',
  description: 'Minimal Next.js scaffold for Vercel deployment.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
