import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Privacy() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <h1 className="text-3xl font-bold text-gray-900">Política de Privacidade</h1>
          <p className="text-gray-600 mt-2">Converse em 21 Dias</p>
        </div>

        {/* Content */}
        <Card>
          <CardContent className="prose prose-sm max-w-none pt-6">
            <div className="space-y-6 text-gray-700">
              {/* Introduction */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introdução</h2>
                <p>
                  Esta Política de Privacidade descreve como o "Converse em 21 Dias" coleta, usa
                  e protege seus dados pessoais. Estamos comprometidos em proteger sua privacidade
                  e garantir que você tenha uma experiência positiva em nossa plataforma.
                </p>
              </section>

              {/* Data Collection */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  2. Coleta de Dados
                </h2>
                <p>Coletamos os seguintes tipos de dados:</p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li>
                    <strong>Dados de Acesso:</strong> Token de autenticação e data de início da
                    jornada
                  </li>
                  <li>
                    <strong>Progresso da Jornada:</strong> Dias concluídos, aprendizados
                    registrados e respostas aos checkpoints
                  </li>
                  <li>
                    <strong>Dados Técnicos:</strong> User Agent e informações de navegador
                  </li>
                </ul>
              </section>

              {/* Data Usage */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Uso dos Dados</h2>
                <p>Seus dados são usados para:</p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li>Fornecer e melhorar o serviço "Converse em 21 Dias"</li>
                  <li>Análise anônima para melhorar a experiência do usuário</li>
                  <li>Criação de materiais educativos e de pesquisa</li>
                  <li>Comunicações relacionadas ao programa</li>
                </ul>
              </section>

              {/* Anonymization */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  4. Anonimização de Dados
                </h2>
                <p>
                  Quando você concorda com o uso de seus dados, eles são anonimizados e
                  desidentificados antes de serem usados para análise, pesquisa ou criação de
                  materiais educativos. Isso significa que seus dados não podem ser rastreados
                  até você especificamente.
                </p>
              </section>

              {/* Data Protection */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  5. Proteção de Dados
                </h2>
                <p>
                  Implementamos medidas de segurança técnicas e organizacionais para proteger seus
                  dados contra acesso não autorizado, alteração, divulgação ou destruição. Todos
                  os dados são armazenados em servidores seguros com criptografia.
                </p>
              </section>

              {/* User Rights */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Seus Direitos</h2>
                <p>Você tem o direito de:</p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li>Acessar seus dados pessoais</li>
                  <li>Solicitar a correção de dados imprecisos</li>
                  <li>Revogar seu consentimento a qualquer momento</li>
                  <li>Solicitar a exclusão de seus dados</li>
                </ul>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  7. Contato e Dúvidas
                </h2>
                <p>
                  Se você tiver dúvidas sobre esta Política de Privacidade ou sobre como seus
                  dados são tratados, entre em contato conosco através do formulário de suporte
                  na plataforma.
                </p>
              </section>

              {/* Updates */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  8. Atualizações desta Política
                </h2>
                <p>
                  Esta Política de Privacidade pode ser atualizada periodicamente. Notificaremos
                  você sobre mudanças significativas através da plataforma.
                </p>
              </section>

              {/* Last Updated */}
              <div className="bg-gray-100 rounded-lg p-4 mt-6">
                <p className="text-sm text-gray-600">
                  <strong>Última atualização:</strong> Janeiro de 2026
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
