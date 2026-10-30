import { Brand } from "@/components/brand";
export default function Privacy() {
  return (
    <main className="container legal">
      <Brand />
      <h1>Privacy at QRFlow</h1>
      <p>
        QRFlow uses Supabase and Google to sign you in. Your profile name,
        avatar URL, QR code names, destinations, design settings, and timestamps
        are stored to provide your account.
      </p>
      <h2>Recorded scans</h2>
      <p>
        Each recorded redirect request stores the QR code identifier, timestamp,
        and source type. QRFlow does not store raw IP addresses or create
        visitor fingerprints for scan analytics. Automated requests may count as
        scans.
      </p>
      <h2>Cookies and infrastructure</h2>
      <p>
        Authentication cookies keep you signed in. Supabase and the hosting
        provider process requests and may retain operational logs under their
        respective policies. Destination websites have their own privacy
        practices.
      </p>
      <h2>Your choices</h2>
      <p>
        You can pause or delete your QR codes in the dashboard. Deleting a code
        also deletes its recorded scan events. For account-data requests or
        abuse concerns, use the <a href="/report">report page</a>.
      </p>
    </main>
  );
}
