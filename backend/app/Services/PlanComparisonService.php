<?php

namespace App\Services;

use App\Models\TripPlan;
use Illuminate\Support\Collection;

class PlanComparisonService
{
    public function compare(Collection $plans): array
    {
        return $plans->map(fn ($plan) => $this->buildEntry($plan))->values()->all();
    }

    private function buildEntry(TripPlan $plan): array
    {
        $days = $plan->tripDays;
        $totalDays = $days->count();

        $activities = $days->flatMap(fn ($d) => $d->activities);
        $totalActivities = $activities->count();

        $restDays = $days->filter(fn ($d) => $d->activities->isEmpty())->count();

        $activitiesCost = (float) $activities->sum('cost');
        $flightCost = (float) ($plan->flight_cost ?? 0);
        $hotelCost = (float) ($plan->hotel_cost ?? 0);
        $totalCost = round($flightCost + $hotelCost + $activitiesCost, 2);

        $avgPerDay = $totalDays > 0 ? round($totalActivities / $totalDays, 2) : 0.0;

        $categoryDistribution = $activities
            ->groupBy(fn ($a) => $a->type ?: 'other')
            ->map(fn ($group) => $group->count())
            ->toArray();

        return [
            'plan' => [
                'id' => $plan->id,
                'title' => $plan->title,
                'start_date' => $plan->start_date,
                'end_date' => $plan->end_date,
                'destination' => $plan->destination,
                'budget_limit' => $plan->budget_limit,
            ],
            'metrics' => [
                'total_days' => $totalDays,
                'total_activities' => $totalActivities,
                'rest_days' => $restDays,
                'flight_cost' => $flightCost,
                'hotel_cost' => $hotelCost,
                'activities_cost' => round($activitiesCost, 2),
                'total_cost' => $totalCost,
                'avg_activities_per_day' => $avgPerDay,
                'intensity' => $this->classifyIntensity($avgPerDay),
                'category_distribution' => $categoryDistribution,
            ],
        ];
    }

    private function classifyIntensity(float $avgPerDay): string
    {
        return match (true) {
            $avgPerDay < 2.0 => 'light',
            $avgPerDay <= 3.5 => 'medium',
            default => 'intense',
        };
    }
}
