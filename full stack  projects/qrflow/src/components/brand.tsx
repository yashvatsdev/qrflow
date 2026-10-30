import Link from "next/link";
import { QrCode } from "lucide-react";
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="QRFlow home">
      <span className="brand-mark">
        <QrCode size={23} />
      </span>
      QRFlow<span className="brand-dot">.</span>
    </Link>
  );
}
