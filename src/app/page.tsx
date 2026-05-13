import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "nexa_session";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  redirect(token ? "/dashboard" : "/login");
}
