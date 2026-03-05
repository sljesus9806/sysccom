import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ErrorBoundaryWrapper from "./error-boundary-wrapper";

export default function TiendaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-[104px] lg:pt-[148px]">
        <ErrorBoundaryWrapper>{children}</ErrorBoundaryWrapper>
      </main>
      <Footer />
    </>
  );
}
