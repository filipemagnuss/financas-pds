import { auth } from "@clerk/nextjs/server";

export async function getUsuarioId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Não autenticado");
  }
  return userId;
}
