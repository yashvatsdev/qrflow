import Link from "next/link";
import { Suspense } from "react";
import { WorkspaceLoading } from "@/components/dashboard/workspace";
import { Plus } from "lucide-react";
import { listCodeSummaries, userContext } from "@/lib/qr/service";
import { appUrl } from "@/lib/config";
import { CodeList } from "@/components/qr/list";
export default function Codes() {
  return (
    <Suspense fallback={<WorkspaceLoading />}>
      <CodesData />
    </Suspense>
  );
}
async function CodesData() {
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR CONNECTIONS, ORGANIZED</span>
          <h1>
            My QR codes<span className="blue">.</span>
          </h1>
          <p>One place for every destination.</p>
        </div>
        <Link className="button primary" href="/dashboard/codes/new">
          <Plus size={17} /> Create QR code
        </Link>
      </div>
      <CodeList
        codes={await listCodeSummaries(await userContext())}
        origin={appUrl()}
      />
    </>
  );
}
