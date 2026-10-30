import { Brand } from "@/components/brand";
export default function Report() {
  const email = process.env.ABUSE_REPORT_EMAIL;
  return (
    <main className="container legal">
      <Brand />
      <h1>Report a QR code</h1>
      <p>
        If a QRFlow code leads to phishing, malware, or misleading content, stop
        using that destination. Include the QRFlow link and a description when
        reporting it. Do not send passwords or sensitive information.
      </p>
      {email ? (
        <a
          className="button primary"
          href={`mailto:${email}?subject=QRFlow%20abuse%20report`}
        >
          Email an abuse report
        </a>
      ) : (
        <a
          className="button primary"
          href="https://github.com/yashvatsdev/qrflow/issues/new?title=QRFlow%20abuse%20report"
        >
          Report through the project issue tracker
        </a>
      )}
      <p>
        Public issue reports are visible to others. Do not include personal
        information. For private account-data requests,{" "}
        {email
          ? "use the email link above."
          : "ask the operator for a private contact channel through the issue tracker."}
      </p>
      <p>
        Dynamic redirect services can be abused. Reports require operator
        review; QRFlow cannot guarantee that every destination is safe.
      </p>
    </main>
  );
}
