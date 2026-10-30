import Link from "next/link";
import { Brand } from "@/components/brand";
export default function NotFound() {
  return (
    <main className="container legal">
      <Brand />
      <h1>This connection isn’t here.</h1>
      <p>The page or QR code may have been moved or deleted.</p>
      <Link href="/" className="button primary">
        Back to QRFlow
      </Link>
    </main>
  );
}
