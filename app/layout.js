import { Sora } from 'next/font/google';
import './globals.css';

const sora = Sora({ subsets: ['latin'], variable: '--font-sora' });

export const metadata = {
  title: 'Pro Green Build',
  description: 'Pro Green Build landing page for Singapore home renovation.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={sora.variable}>
      <body>{children}</body>
    </html>
  );
}
