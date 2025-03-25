import Link from "next/link";

export function Header() {
  return (
    <header className="w-full">
      <nav className="text-white">
        <ul className="flex gap-4">
          <li>
            <Link href="/">Início</Link>
          </li>
          <li>
            <Link href="/about">Sobre</Link>
          </li>
          <li>
            <Link href="/contact">Blog</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
