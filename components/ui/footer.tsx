import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer 
      className="row-start-3 flex gap-6 flex-wrap items-center justify-center"
      role="contentinfo"
    >
      <FooterLink
        href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
        icon="/file.svg"
        text="Learn"
      />
      <FooterLink
        href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
        icon="/window.svg"
        text="Examples"
      />
      <FooterLink
        href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
        icon="/globe.svg"
        text="Go to nextjs.org →"
      />
    </footer>
  );
}

interface FooterLinkProps {
  href: string;
  icon: string;
  text: string;
}

function FooterLink({ href, icon, text }: FooterLinkProps) {
  return (
    <Link
      className="flex items-center gap-2 hover:underline hover:underline-offset-4"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={text}
    >
      <Image
        aria-hidden="true"
        src={icon}
        alt=""
        width={16}
        height={16}
      />
      {text}
    </Link>
  );
} 