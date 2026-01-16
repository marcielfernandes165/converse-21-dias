import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, BookOpen, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useSession } from "@/hooks/useSession";
import { DayCard } from "@/components/DayCard";
import { ConsentModal } from "@/components/ConsentModal";
import { DayDetail } from "./DayDetail";
import { LearningsTab } from "./LearningsTab";

export default function Home() {
  const { session, loading, error, isAuthenticated } = useSession();
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "learnings">("dashboard");
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Mostrar modal de consentimento se o usuário não deu consentimento
    if (session && !session.consentGiven) {
      setShowConsent(true);
    }
  }, [session]);

  const daysQuery = trpc.days.getAll.useQuery(
    {
      sessionId: session?.sessionId || 0,
      startDate: session?.startDate || new Date(),
    },
    {
      enabled: !!session,
    }
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando sua jornada...</p>
        </div>
      </div>
    );
  }

  if (error || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Card className="w-full max-w-md border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Erro de Autenticação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-800">
              {error || "Token inválido ou não fornecido. Verifique a URL de acesso."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedDayNumber !== null && session) {
    return (
      <DayDetail
        sessionId={session.sessionId}
        startDate={session.startDate}
        dayNumber={selectedDayNumber}
        onBack={() => setSelectedDayNumber(null)}
      />
    );
  }

  const days = daysQuery.data?.days || [];
  const stats = daysQuery.data?.stats;

  // Mensagens motivacionais baseadas no progresso
  const getMotivationalMessage = () => {
    if (!stats) return "";

    if (stats.currentDay >= 3 && stats.currentDay <= 5) {
      return "Você já fez mais do que a maioria das pessoas que começa";
    }
    if (stats.currentDay >= 6 && stats.currentDay <= 8) {
      return "A maior parte das desistências acontece aqui - continuar aumenta muito a chance de espontaneidade";
    }
    if (stats.currentDay >= 15) {
      return "Você está na reta final! Mantenha o ritmo 💪";
    }
    if (stats.currentDay >= 10) {
      return "Você já passou da metade! Que progresso incrível 🚀";
    }

    return "Bem-vindo à sua jornada de 21 dias";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Converse em 21 Dias</h1>
              <p className="text-gray-600 mt-1">Sua jornada de autoconhecimento e mudança</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{stats?.currentDay || 0}/21</p>
              <p className="text-sm text-gray-600">Dias disponíveis</p>
            </div>
          </div>

          {/* Progress Bar */}
          {stats && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Progresso</span>
                <span className="text-sm text-gray-600">{stats.progressPercentage}%</span>
              </div>
              <Progress value={stats.progressPercentage} className="h-2" />
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Motivational Message */}
        {stats && stats.currentDay >= 3 && (
          <Card className="mb-6 border-l-4 border-l-blue-500 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-blue-900 font-medium">{getMotivationalMessage()}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "dashboard" | "learnings")}
          className="w-full"
        >
          <TabsList className="grid w-full max-w-xs grid-cols-2 mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="learnings" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Aprendizados
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {days.map((day) => (
                <DayCard
                  key={day.day}
                  day={day}
                  onSelect={() => {
                    if (day.status !== "locked") {
                      setSelectedDayNumber(day.day);
                    }
                  }}
                />
              ))}
            </div>
          </TabsContent>

          {/* Learnings Tab */}
          <TabsContent value="learnings">
            {session && <LearningsTab sessionId={session.sessionId} />}
          </TabsContent>
        </Tabs>
      </div>

      {/* Consent Modal */}
      {session && (
        <ConsentModal
          sessionId={session.sessionId}
          isOpen={showConsent}
          onClose={() => setShowConsent(false)}
          onConsent={() => setShowConsent(false)}
        />
      )}
    </div>
  );
}
