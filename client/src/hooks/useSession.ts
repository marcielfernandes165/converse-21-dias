import { useEffect, useState } from "react";
import { useSearchParams } from "wouter";
import { trpc } from "@/lib/trpc";
import type { SessionData } from "@shared/types";

export function useSession() {
  const [searchParams] = useSearchParams();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authenticateMutation = trpc.session.authenticate.useMutation();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setError("Token não fornecido");
      setLoading(false);
      return;
    }

    authenticateMutation.mutate(
      { token },
      {
        onSuccess: (data) => {
          setSession(data);
          setLoading(false);
        },
        onError: (err) => {
          setError(err.message || "Erro ao autenticar");
          setLoading(false);
        },
      }
    );
  }, [searchParams]);

  return {
    session,
    loading,
    error,
    isAuthenticated: !!session,
  };
}
