import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-muted flex flex-col items-center justify-center min-h-svh p-6 md:p-10">
      <div className="flex flex-col w-full max-w-sm gap-6">
        <Link href="/" className="flex self-center">
          <Image
            src="/logo.svg"
            alt="AutoVendo Logo"
            width={200}
            height={200}
          />
        </Link>
        {children}
      </div>
    </div>
  );
}
