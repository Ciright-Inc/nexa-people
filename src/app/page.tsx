import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "nexa_session";

/** Required for `cookies()` on `/` so Next does not prerender an empty static shell (blank page at `/`). */
export const dynamic = "force-dynamic";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  redirect(token ? "/dashboard/sites" : "/login");
}
