<?php

namespace App\Services;

use App\Models\TripDay;
use App\Models\TripPlan;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class TripPlanService
{
    public function createWithDays(array $data, int $userId): TripPlan
    {
        return DB::transaction(function () use ($data, $userId) {
            $plan = TripPlan::create([
                ...$data,
                'user_id' => $userId,
            ]);

            $this->generateDays($plan, $data['start_date'], $data['end_date']);

            return $plan->load('tripDays');
        });
    }

    private function generateDays(TripPlan $plan, string $startDate, string $endDate): void
    {
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);
        $dayNumber = 1;

        for ($date = $start; $date->lte($end); $date->addDay()) {
            TripDay::create([
                'trip_plan_id' => $plan->id,
                'date' => $date->toDateString(),
                'day_number' => $dayNumber++,
            ]);
        }
    }
}
