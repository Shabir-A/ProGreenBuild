import './globals.css';

export const metadata = {
  title: 'Pro Green Build',
  description: 'Pro Green Build landing page for Singapore home renovation.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
