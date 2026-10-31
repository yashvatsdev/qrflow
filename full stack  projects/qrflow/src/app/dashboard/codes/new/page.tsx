import { appUrl } from "@/lib/config";
import { QREditor } from "@/components/qr/editor";
import { connection } from "next/server";
import { Suspense } from "react";
import { WorkspaceLoading } from "@/components/dashboard/workspace";
export default function NewCode() {
  return (
    <Suspense fallback={<WorkspaceLoading />}>
      <NewCodeContent />
    </Suspense>
  );
}
async function NewCodeContent() {
  await connection();
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">MAKE SOMETHING CONNECT</span>
          <h1>
            Create a QR code<span className="blue">.</span>
          </h1>
          <p>One small code. A destination that grows with you.</p>
        </div>
      </div>
      <QREditor origin={appUrl()} />
    </>
  );
}
