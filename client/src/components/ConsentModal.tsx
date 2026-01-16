import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertCircle, ExternalLink } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface ConsentModalProps {
  sessionId: number;
  isOpen: boolean;
  onClose: () => void;
  onConsent: (given: boolean) => void;
}

export function ConsentModal({
  sessionId,
  isOpen,
  onClose,
  onConsent,
}: ConsentModalProps) {
  const [agreed, setAgreed] = useState(false);

  const saveConsentMutation = trpc.consent.save.useMutation();

  const handleConsent = (consentGiven: boolean) => {
    const userAgent = navigator.userAgent;
    const ipAddress = undefined; // Will be captured server-side if needed

    saveConsentMutation.mutate(
      {
        sessionId,
        consentGiven,
        userAgent,
        ipAddress,
      },
      {
        onSuccess: () => {
          onConsent(consentGiven);
          onClose();
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <AlertCircle className="w-6 h-6 mr-2 text-blue-600" />
            Consentimento para Uso de Dados
          </CardTitle>
          <CardDescription>
            Ajude-nos a melhorar o programa compartilhando suas respostas
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Main Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-900 font-medium mb-2">
              Ao responder os checkpoints, você autoriza o uso anônimo dessas respostas para:
            </p>
            <ul className="text-blue-900 space-y-1 ml-4">
              <li>✓ Melhoria do produto</li>
              <li>✓ Publicidade e materiais educativos</li>
              <li>✓ Pesquisa e análise de dados</li>
            </ul>
          </div>

          {/* Privacy Policy Link */}
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-gray-700 mb-3">
              Seus dados serão tratados de forma confidencial e em conformidade com nossa política
              de privacidade.
            </p>
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              Ler Política de Privacidade
              <ExternalLink className="w-4 h-4 ml-1" />
            </a>
          </div>

          {/* Consent Checkbox */}
          <div className="flex items-start space-x-3">
            <Checkbox
              id="consent"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
              className="mt-1"
            />
            <Label htmlFor="consent" className="font-normal cursor-pointer">
              Eu autorizo o uso anônimo de minhas respostas para melhorar o programa e criar
              materiais educativos
            </Label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleConsent(false)}
              disabled={saveConsentMutation.isPending}
            >
              Não Autorizar
            </Button>
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={() => handleConsent(true)}
              disabled={!agreed || saveConsentMutation.isPending}
            >
              {saveConsentMutation.isPending ? "Salvando..." : "Autorizar"}
            </Button>
          </div>

          {/* Info */}
          <p className="text-xs text-gray-600 text-center">
            Você pode alterar suas preferências a qualquer momento
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
