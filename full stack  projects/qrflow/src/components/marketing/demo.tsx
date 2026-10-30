"use client";
import { useState } from "react";
import { ArrowDown, ArrowUpRight, Check, Link2 } from "lucide-react";
import { QRPreview } from "@/components/qr/preview";
export function Demo() {
  const [destination, setDestination] = useState(0);
  return (
    <div className="hero-demo" data-ui>
      <div className="demo-top">
        <span>
          <span className="status-dot" /> LIVE PREVIEW
        </span>
        <span>One code. Always current.</span>
      </div>
      <div className="demo-paper">
        <QRPreview url="https://github.com/yashvatsdev/qrflow" />
        <strong>
          A little square.
          <br />A lot of possibility.
        </strong>
        <span>Scan to explore QRFlow on GitHub</span>
      </div>
      <div className="flow-connector">
        <ArrowDown size={20} />
        <span>THE SAME QR CODE</span>
      </div>
      <div className="destination-card">
        <span className="destination-icon">
          <Link2 size={20} />
        </span>
        <div>
          <small>DESTINATION · DEMONSTRATION</small>
          <strong>
            {destination ? "Your autumn menu" : "Your summer menu"}
          </strong>
        </div>
        <ArrowUpRight size={20} />
      </div>
      <button
        className="demo-switch"
        onClick={() => setDestination((v) => (v ? 0 : 1))}
      >
        <Check size={15} /> Try changing the destination <span>↗</span>
      </button>
      <p className="demo-note">
        Interactive illustration. The code opens the project repository.
      </p>
    </div>
  );
}
