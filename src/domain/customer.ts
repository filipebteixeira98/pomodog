/** Identity must come from a verified auth adapter, never from local timer storage. */
export type CustomerSession =
  | { status: "guest" }
  | {
      status: "authenticated";
      customer: { id: string; displayName: string; email?: string };
    };

export const localSession: CustomerSession = { status: "guest" };

export function customerSummary(session: CustomerSession) {
  if (session.status === "guest")
    return {
      title: "Seu espaço, sem conta",
      detail:
        "Você pode focar e guardar seu progresso neste dispositivo, sem fazer login.",
    };
  return {
    title: session.customer.displayName.trim() || "Sua conta",
    detail: session.customer.email ?? "Sessão autenticada",
  };
}
