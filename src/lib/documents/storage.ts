import "server-only";

import { del, get } from "@vercel/blob";

export async function getPrivateBlob(pathname: string, ifNoneMatch?: string) {
  return get(pathname, {
    access: "private",
    ifNoneMatch,
  });
}

export async function deleteBlob(pathname: string) {
  await del(pathname);
}
