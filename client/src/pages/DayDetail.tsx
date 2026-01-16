import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { CheckpointModal } from "@/components/CheckpointModal";
import type { DayWithStatus } from "@shared/types";

interface DayDetailProps {
  sessionId: number;
  startDate: Date;
  dayNumber: number;
  onBack: () => void;
}

type FlowStep = "view" | "assumption" | "assumption-yes" | "assumption-no" | "learning" | "completed";

export function DayDetail({ sessionId, startDate, dayNumber, onBack }: DayDetailProps) {
  const [step, setStep] = useState<FlowStep>("view");
  const [customLearning, setCustomLearning] = useState("");
  const [repeatNextDay, setRepeatNextDay] = useState(false);
  const [showCheckpoint, setShowCheckpoint] = useState(false);

  const getDayQuery = trpc.days.getDay.useQuery({
    sessionId,
    dayNumber,
    startDate,
  });

  const recordAssumptionMutation = trpc.days.recordAssumption.useMutation();
  const recordRepeatChoiceMutation = trpc.days.recordRepeatChoice.useMutation();
  const completeDayMutation = trpc.days.completeDay.useMutation();

  const day = getDayQuery.data;

  if (getDayQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  if (!day) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">Dia não encontrado</p>
      </div>
    );
  }

  const handleAssumptionYes = () => {
    recordAssumptionMutation.mutate(
      { sessionId, dayNumber, assumptionOccurred: true },
      {
        onSuccess: () => {
          setStep("assumption-yes");
        },
      }
    );
  };

  const handleAssumptionNo = () => {
    recordAssumptionMutation.mutate(
      { sessionId, dayNumber, assumptionOccurred: false },
      {
        onSuccess: () => {
          setStep("assumption-no");
        },
      }
    );
  };

  const handleRepeatChoice = (repeat: boolean) => {
    recordRepeatChoiceMutation.mutate(
      { sessionId, dayNumber, repeatNextDay: repeat },
      {
        onSuccess: () => {
          if (!repeat) {
            setStep("learning");
          } else {
            setStep("completed");
            setTimeout(onBack, 2000);
          }
        },
      }
    );
  };

  const handleCompleteDay = () => {
    completeDayMutation.mutate(
      { sessionId, dayNumber, customLearning: customLearning || undefined },
      {
        onSuccess: () => {
          // Mostrar checkpoint se for dia 8, 15 ou 21
          if ([8, 15, 21].includes(dayNumber)) {
            setShowCheckpoint(true);
          } else {
            setStep("completed");
            setTimeout(onBack, 2000);
          }
        },
      }
    );
  };

  const handleCheckpointClose = () => {
    setShowCheckpoint(false);
    setStep("completed");
    setTimeout(onBack, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <Badge className="bg-blue-100 text-blue-800">Dia {dayNumber} de 21</Badge>
        </div>

        {/* Main Content */}
        {step === "view" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{day.mission}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Ambientes */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Ambientes Sugeridos</h3>
                  <div className="flex flex-wrap gap-2">
                    {day.environments.map((env) => (
                      <Badge key={env} variant="secondary">
                        {env}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Suposição */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h3 className="font-semibold text-amber-900 mb-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Suposição
                  </h3>
                  <p className="text-amber-900">{day.assumption}</p>
                </div>

                {/* Comportamento de Segurança */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-900 mb-2">Comportamento de Segurança</h3>
                  <p className="text-red-900">{day.safetyBehavior}</p>
                </div>

                {/* Foco Interno */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-2">Foco Interno</h3>
                  <p className="text-purple-900">{day.internalFocus}</p>
                </div>

                {/* Script */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">Script (Ação Oposta)</h3>
                  <p className="text-green-900">{day.script}</p>
                </div>

                {/* Action Button */}
                <Button
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => setStep("assumption")}
                >
                  Completei a Missão
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Assumption Question */}
        {step === "assumption" && (
          <Card>
            <CardHeader>
              <CardTitle>A suposição ocorreu?</CardTitle>
              <CardDescription>
                Durante a interação, a suposição que você tinha se confirmou?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-900 font-medium">{day.assumption}</p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={handleAssumptionNo}
                >
                  Não
                </Button>
                <Button
                  size="lg"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={handleAssumptionYes}
                >
                  Sim
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assumption Yes - Warning */}
        {step === "assumption-yes" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-amber-900">⚠️ Aviso Importante</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-900">
                  Avalie se, durante a interação, você ainda usou comportamentos de segurança ou
                  avaliou como se sente (foco interno). Isso pode ter afetado o resultado.
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-900 mb-3">
                  Quer repetir essa missão amanhã?
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    onClick={() => handleRepeatChoice(false)}
                  >
                    Não, continuar
                  </Button>
                  <Button
                    size="lg"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleRepeatChoice(true)}
                  >
                    Sim, repetir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assumption No - Learning */}
        {step === "assumption-no" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-green-900 flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Aprendizado do Dia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-900 font-medium">{day.defaultLearning}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Outro aprendizado (opcional)
                </label>
                <Textarea
                  placeholder="Compartilhe outro aprendizado que você teve durante essa missão..."
                  value={customLearning}
                  onChange={(e) => setCustomLearning(e.target.value)}
                  className="min-h-24"
                />
              </div>

              <Button
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={handleCompleteDay}
              >
                Concluir Dia
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Learning Step */}
        {step === "learning" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-green-900 flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Aprendizado do Dia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-900 font-medium">{day.defaultLearning}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Outro aprendizado (opcional)
                </label>
                <Textarea
                  placeholder="Compartilhe outro aprendizado que você teve durante essa missão..."
                  value={customLearning}
                  onChange={(e) => setCustomLearning(e.target.value)}
                  className="min-h-24"
                />
              </div>

              <Button
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={handleCompleteDay}
              >
                Concluir Dia
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Completed */}
        {step === "completed" && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto" />
                <h2 className="text-2xl font-bold text-green-900">Parabéns!</h2>
                <p className="text-green-800">
                  Você completou o Dia {dayNumber}. Continue assim! 🎉
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Checkpoint Modal */}
      <CheckpointModal
        sessionId={sessionId}
        dayNumber={dayNumber}
        isOpen={showCheckpoint}
        onClose={handleCheckpointClose}
      />
    </div>
  );
}
