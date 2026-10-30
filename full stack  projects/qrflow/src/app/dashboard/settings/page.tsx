import { userContext } from "@/lib/qr/service";
export default async function Settings() {
  const { user, db } = await userContext();
  const { data } = await db
    .from("profiles")
    .select("display_name,created_at")
    .eq("id", user.id)
    .single();
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR WORKSPACE</span>
          <h1>
            Settings<span className="blue">.</span>
          </h1>
          <p>The essentials for your QRFlow account.</p>
        </div>
      </div>
      <section className="panel settings-panel">
        <h2>Profile</h2>
        <dl>
          <dt>Display name</dt>
          <dd>{data?.display_name || "QRFlow member"}</dd>
          <dt>Email</dt>
          <dd>{user.email}</dd>
          <dt>Plan</dt>
          <dd>Free MVP · Up to 100 QR codes</dd>
          <dt>Sign-in method</dt>
          <dd>Google via Supabase</dd>
        </dl>
        <form action="/auth/logout" method="post">
          <button className="button" type="submit">
            Sign out of QRFlow
          </button>
        </form>
      </section>
    </>
  );
}
