import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Todas as rotas, exceto internos do Next (_next, incl. HMR), favicon, imagens
  // e os assets do PWA (manifest e service worker) — que não podem ser redirecionados.
  matcher: [
    "/((?!_next|favicon.ico|manifest.webmanifest|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest)$).*)",
  ],
};
