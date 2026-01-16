import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, BookOpen } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface LearningsTabProps {
  sessionId: number;
}

export function LearningsTab({ sessionId }: LearningsTabProps) {
  const learningsQuery = trpc.learnings.getAll.useQuery({
    sessionId,
  });

  if (learningsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Carregando aprendizados...</p>
      </div>
    );
  }

  const learnings = learningsQuery.data || [];

  if (learnings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <BookOpen className="w-12 h-12 text-gray-300 mb-4" />
        <p className="text-gray-600 text-center">
          Nenhum aprendizado registrado ainda. Complete seus primeiros dias para ver os aprendizados!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <BookOpen className="w-6 h-6 mr-2 text-blue-600" />
          Seus Aprendizados
        </h2>
        <p className="text-gray-600 mt-1">
          Histórico cronológico de tudo que você aprendeu na jornada
        </p>
      </div>

      <div className="space-y-3">
        {learnings.map((learning) => (
          <Card key={learning.id} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center">
                    <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
                    Dia {learning.dayNumber}
                  </CardTitle>
                  <CardDescription>
                    {new Date(learning.createdAt).toLocaleDateString("pt-BR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Aprendizado Padrão</p>
                <p className="text-gray-900">{learning.defaultLearning}</p>
              </div>

              {learning.customLearning && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm font-semibold text-blue-900 mb-1">Seu Aprendizado</p>
                  <p className="text-blue-900">{learning.customLearning}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
