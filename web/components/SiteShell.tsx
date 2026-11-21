import Header from "./Header";
import Footer from "./Footer";

// The shared shell for rebuilt pages: forest green header and footer
// around the page content.
export default function SiteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
