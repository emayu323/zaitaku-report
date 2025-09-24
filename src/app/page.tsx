export default function Page() {
  return (
    <section>
      <h2>最小構成の雛形</h2>
      <p>ログイン → 新規作成 → 一覧 → 印刷/Excelエクスポート の動線を先に通しています。</p>
      <ul>
        <li>メール＋パスワードでログイン</li>
        <li>1訪問=1レコード</li>
        <li>一覧表示と検索（患者ID/期間）</li>
        <li>Excel出力・印刷</li>
      </ul>
    </section>
  );
}
