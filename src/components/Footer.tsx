export default function Footer() {
  return (
    <footer className="mt-8 text-center text-[10px] text-gray-400 space-y-1 pb-4">
      <p>運営：とみながFP事務所</p>
      <p>
        お問い合わせ：
        <a href="mailto:jtominaga@tominaga-fp.com" className="hover:underline">
          jtominaga@tominaga-fp.com
        </a>
      </p>
      <p className="space-x-2">
        <a href="https://tominaga-fp.com/sakuseikun/tokusyoho/" target="_blank" rel="noopener noreferrer" className="hover:underline">
          特商法
        </a>
        <span>|</span>
        <a href="https://tominaga-fp.com/sakuseikun/privacy-policy/" target="_blank" rel="noopener noreferrer" className="hover:underline">
          プライバシーポリシー
        </a>
      </p>
    </footer>
  );
}
