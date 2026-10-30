import Link from "next/link";
import { Plus } from "lucide-react";
import { listCodes, userContext } from "@/lib/qr/service";
import { CodeList } from "@/components/qr/list";
export default async function Codes() {
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
      <CodeList codes={await listCodes(await userContext())} />
    </>
  );
}
