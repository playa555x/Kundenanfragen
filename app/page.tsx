import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/ui/footer";

export default function Home() {
  return (
    <div 
      className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]"
      role="main"
    >
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js Logo"
          width={180}
          height={38}
          priority
          sizes="(max-width: 768px) 100vw, 180px"
          quality={90}
        />
        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
              app/page.tsx
            </code>
            .
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2"
          >
            <Button
              variant="default"
              className="rounded-full"
            >
              <Image
                className="dark:invert mr-2"
                src="/vercel.svg"
                alt=""
                width={20}
                height={20}
                aria-hidden="true"
              />
              Deploy now
            </Button>
          </a>
          <a
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              className="rounded-full"
            >
              Read our docs
            </Button>
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}
