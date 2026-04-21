import { Webhook } from "svix";
import { headers } from "next/headers";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return new Response("CLERK_WEBHOOK_SECRET não configurado", { status: 500 });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Headers svix ausentes", { status: 400 });
  }

  const body = await req.text();

  let evt: WebhookEvent;
  try {
    evt = new Webhook(secret).verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch {
    return new Response("Assinatura inválida", { status: 400 });
  }

  if (evt.type === "user.created" || evt.type === "user.updated") {
    const { id, email_addresses } = evt.data;
    const email = email_addresses[0]?.email_address;
    if (!email) return new Response("Usuário sem email", { status: 400 });

    await prisma.usuario.upsert({
      where: { id },
      create: { id, email },
      update: { email },
    });
  }

  if (evt.type === "user.deleted" && evt.data.id) {
    await prisma.usuario.delete({ where: { id: evt.data.id } }).catch(() => {});
  }

  return new Response("ok", { status: 200 });
}
