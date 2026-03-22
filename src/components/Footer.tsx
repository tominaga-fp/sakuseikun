export default function Footer() {
  return (
    <footer className="mt-8 text-center text-[10px] text-gray-400 space-y-1 pb-4">
      <p>運営：とみながFP事務所</p>
      <p>
        <a href="https://forms.gle/k4tbWDfMoaK2nps7A" target="_blank" rel="noopener noreferrer" className="hover:underline">
          お問い合わせ・ご要望
        </a>
      </p>
      <p className="space-x-2">
        <a href="/tokushoho" className="hover:underline">
          特商法
        </a>
        <span>|</span>
        <a href="/privacy-policy" className="hover:underline">
          プライバシーポリシー
        </a>
      </p>
    </footer>
  );
}
