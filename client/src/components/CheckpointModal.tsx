import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface CheckpointModalProps {
  sessionId: number;
  dayNumber: number;
  isOpen: boolean;
  onClose: () => void;
}

export function CheckpointModal({
  sessionId,
  dayNumber,
  isOpen,
  onClose,
}: CheckpointModalProps) {
  const [discovery, setDiscovery] = useState("");
  const [importantDay, setImportantDay] = useState("");
  const [feeling, setFeeling] = useState<"more_confident" | "equal" | "confused">("equal");

  const saveCheckpointMutation = trpc.checkpoints.save.useMutation();

  const handleSave = () => {
    saveCheckpointMutation.mutate(
      {
        sessionId,
        dayNumber,
        discovery: discovery || undefined,
        importantDay: importantDay || undefined,
        feeling,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Checkpoint - Dia {dayNumber}</CardTitle>
          <CardDescription>
            Reflita sobre sua jornada até aqui e compartilhe seus insights
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Discovery Question */}
          <div>
            <Label className="text-base font-semibold text-gray-900 mb-2 block">
              O que você descobriu através dos aprendizados?
            </Label>
            <Textarea
              placeholder="Compartilhe seus principais descobrimentos até agora..."
              value={discovery}
              onChange={(e) => setDiscovery(e.target.value)}
              className="min-h-24"
            />
          </div>

          {/* Important Day Question */}
          <div>
            <Label className="text-base font-semibold text-gray-900 mb-2 block">
              Qual dia foi mais importante ou que mais gostou?
            </Label>
            <Textarea
              placeholder="Qual dia marcou você mais? Por quê?"
              value={importantDay}
              onChange={(e) => setImportantDay(e.target.value)}
              className="min-h-24"
            />
          </div>

          {/* Feeling Question */}
          <div>
            <Label className="text-base font-semibold text-gray-900 mb-3 block">
              Você se sente:
            </Label>
            <RadioGroup value={feeling} onValueChange={(value) => setFeeling(value as any)}>
              <div className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value="more_confident" id="more_confident" />
                <Label htmlFor="more_confident" className="font-normal cursor-pointer">
                  Mais confiante
                </Label>
              </div>
              <div className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value="equal" id="equal" />
                <Label htmlFor="equal" className="font-normal cursor-pointer">
                  Igual
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="confused" id="confused" />
                <Label htmlFor="confused" className="font-normal cursor-pointer">
                  Confuso
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-900">
              Essas respostas serão usadas de forma anônima para melhorar o programa.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={handleSave}
              disabled={saveCheckpointMutation.isPending}
            >
              {saveCheckpointMutation.isPending ? "Salvando..." : "Salvar Checkpoint"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
