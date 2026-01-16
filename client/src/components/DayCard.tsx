import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, CheckCircle2, AlertCircle } from "lucide-react";
import type { DayWithStatus } from "@shared/types";

interface DayCardProps {
  day: DayWithStatus;
  onSelect: () => void;
}

export function DayCard({ day, onSelect }: DayCardProps) {
  const isLocked = day.status === "locked";
  const isCompleted = day.status === "completed";
  const isAvailable = day.status === "available";

  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Concluído
        </Badge>
      );
    }
    if (isAvailable) {
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <AlertCircle className="w-3 h-3 mr-1" />
          Disponível
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-200 text-gray-700 hover:bg-gray-200">
        <Lock className="w-3 h-3 mr-1" />
        Bloqueado
      </Badge>
    );
  };

  const cardClasses = isLocked
    ? "opacity-60 cursor-not-allowed bg-gray-50"
    : "hover:shadow-lg cursor-pointer hover:border-blue-200";

  const bgClasses = isCompleted ? "border-emerald-200 bg-emerald-50" : "";

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-300 ${cardClasses} ${bgClasses}`}
      onClick={() => !isLocked && onSelect()}
    >
      {/* Decorative gradient background */}
      <div
        className={`absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 ${
          isCompleted ? "bg-emerald-500" : "bg-blue-500"
        }`}
      />

      <CardHeader className="relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">
              Dia {day.day}
            </CardTitle>
            <CardDescription className="mt-1 text-sm">
              {day.mission.substring(0, 60)}...
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      {!isLocked && (
        <CardContent className="relative">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Ambientes
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {day.environments.slice(0, 3).map((env) => (
                  <span
                    key={env}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                  >
                    {env}
                  </span>
                ))}
              </div>
            </div>

            {!isCompleted && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4 text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                Ver Missão
              </Button>
            )}
          </div>
        </CardContent>
      )}

      {isLocked && (
        <CardContent className="relative">
          <div className="flex items-center justify-center py-4">
            <div className="text-center">
              <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Disponível em {day.daysUntilUnlock} dia{day.daysUntilUnlock !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
