import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const t = await getTranslations("Header");

  return (
    <div className="bg-muted flex flex-col items-center justify-center min-h-svh p-6 md:p-10">
      <div className="flex flex-col w-full max-w-sm gap-6">
        <Link href="/" className="flex self-center">
          <Image
            src="/logo.svg"
            alt={t("logoAlt")}
            width={200}
            height={200}
          />
        </Link>
        {children}
      </div>
    </div>
  );
}
