<?php

namespace App\Services;

use App\Models\Destination;

class RecommendationService
{
    private const BUDGET_ORDER = ['low', 'medium', 'high'];
    private const DURATION_ORDER = ['3-5 days', '5-7 days', '1 week'];
    private const SEASON_ORDER = ['spring', 'summer', 'autumn', 'winter'];

    private const WEIGHTS = [
        'trip_type' => 2.0,
        'season' => 1.0,
        'budget' => 1.0,
        'duration' => 0.75,
    ];

    public function topMatches(array $preferences, int $limit = 3)
    {
        $maxScore = array_sum(self::WEIGHTS); //max 4,75

        // Dataset is small and scoring uses non-SQL-friendly ordinal distances,
        // so we score in PHP. If destinations grow >>100, narrow with a WHERE first.
        return Destination::all()
            ->map(function ($destination) use ($preferences, $maxScore) {
                $score = $this->scoreDestination($destination, $preferences);

                return [
                    'match_percent' => (int) round($score / $maxScore * 100),
                    'destination' => $destination,
                ];
            })
            ->sortByDesc('match_percent')
            ->take($limit)
            ->values();
    }

    private function scoreDestination(Destination $destination, array $preferences): float
    {
        $tripType = $destination->trip_type === $preferences['trip_type'] ? 1.0 : 0.0;
        $season = $this->cyclicScore($preferences['season'], $destination->season, self::SEASON_ORDER);
        $budget = $this->linearScore($preferences['budget_level'], $destination->budget_level, self::BUDGET_ORDER);
        $duration = $this->linearScore($preferences['duration_range'], $destination->duration_range, self::DURATION_ORDER);

        return self::WEIGHTS['trip_type'] * $tripType
            + self::WEIGHTS['season'] * $season
            + self::WEIGHTS['budget'] * $budget
            + self::WEIGHTS['duration'] * $duration;
    }

    private function linearScore(string $user, string $dest, array $order): float
    {
        $a = array_search($user, $order, true);
        $b = array_search($dest, $order, true);
        if ($a === false || $b === false) return 0.0;
        return $this->partialCredit(abs($a - $b));
    }

    private function cyclicScore(string $user, string $dest, array $order): float
    {
        $a = array_search($user, $order, true);
        $b = array_search($dest, $order, true);
        if ($a === false || $b === false) return 0.0;
        $n = count($order);
        $raw = abs($a - $b);
        return $this->partialCredit(min($raw, $n - $raw));
    }

    private function partialCredit(int $distance): float
    {
        return match (true) {
            $distance === 0 => 1.0,
            $distance === 1 => 0.5,
            default => 0.0,
        };
    }
}
