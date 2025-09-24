import '../styles/globals.css';
import Link from 'next/link';

export const metadata = {
  title: '在宅報告書',
  description: '在宅療養管理指導のレポート記録（雛形）',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <header className="container header noPrint">
          <h1>在宅報告書</h1>
          <nav className="nav">
            <Link className="btn" href="/">Home</Link>
            <Link className="btn" href="/reports">一覧</Link>
            <Link className="btn primary" href="/reports/new">新規作成</Link>
          </nav>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
