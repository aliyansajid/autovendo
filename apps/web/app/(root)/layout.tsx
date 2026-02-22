import Footer from "@/components/footer";
import Header from "@/components/header";
import { Toaster } from "@repo/ui/src/components/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
