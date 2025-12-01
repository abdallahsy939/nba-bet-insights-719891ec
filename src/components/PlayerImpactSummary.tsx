import { useQuery } from "@tanstack/react-query";
import { nbaApi } from "@/services/nbaApi";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingDown, TrendingUp } from "lucide-react";

interface PlayerImpactSummaryProps {
  playerId: number;
  teamId: string;
}

export function PlayerImpactSummary({
  playerId,
  teamId,
}: PlayerImpactSummaryProps) {
  const { data: analytics, isLoading, isError } = useQuery({
    queryKey: ["player-impact", playerId, teamId],
    queryFn: () => nbaApi.analyzeMissingPlayer(teamId, playerId),
    enabled: !!playerId && !!teamId,
  });

  if (isLoading) {
    return (
      <div className="text-xs text-muted-foreground italic mt-1">
        Analysing impact...
      </div>
    );
  }

  if (isError || !analytics) {
    return null;
  }

  const { stats_with, stats_without, impact_analysis } = analytics;

  // Calculate win percentage difference
  const winPctDiff = stats_with.win_pct - stats_without.win_pct;

  // Get net rating swing (already calculated by backend)
  const netRatingSwing = impact_analysis.net_rating_swing;

  // Determine if impact is negative (bad for team)
  const isNegativeImpact =
    stats_with.win_pct < stats_without.win_pct ||
    netRatingSwing < 0;

  // Determine color based on impact
  const impactColor = isNegativeImpact
    ? "border-red-500/30 bg-red-500/5"
    : "border-green-500/30 bg-green-500/5";

  const badgeColor = isNegativeImpact
    ? "bg-red-500/20 text-red-700 border-red-500/30 dark:text-red-400"
    : "bg-green-500/20 text-green-700 border-green-500/30 dark:text-green-400";

  const messageColor = isNegativeImpact
    ? "text-red-700 dark:text-red-400"
    : "text-green-700 dark:text-green-400";

  return (
    <Card className={`p-2 mt-2 border ${impactColor}`}>
      <div className="space-y-2">
        {/* Impact Message */}
        <div className="flex items-start gap-2">
          <AlertCircle
            className={`h-4 w-4 mt-0.5 flex-shrink-0 ${messageColor}`}
          />
          <p className={`text-xs font-semibold ${messageColor}`}>
            {impact_analysis.message}
          </p>
        </div>

        {/* Key Metrics Badges */}
        <div className="flex flex-wrap gap-2">
          {/* Win% Difference */}
          <Badge
            variant="outline"
            className={`text-[11px] py-0.5 px-1.5 border ${badgeColor}`}
          >
            <div className="flex items-center gap-1">
              {winPctDiff < 0 ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <TrendingUp className="h-3 w-3" />
              )}
              <span>Win%: {winPctDiff > 0 ? "+" : ""}{winPctDiff.toFixed(1)}%</span>
            </div>
          </Badge>

          {/* Net Rating Difference */}
          <Badge
            variant="outline"
            className={`text-[11px] py-0.5 px-1.5 border ${badgeColor}`}
          >
            <div className="flex items-center gap-1">
              {netRatingSwing < 0 ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <TrendingUp className="h-3 w-3" />
              )}
              <span>
                Net Rtg: {netRatingSwing > 0 ? "+" : ""}{netRatingSwing.toFixed(1)}
              </span>
            </div>
          </Badge>
        </div>
      </div>
    </Card>
  );
}
