<?php

namespace App\Http\Controllers;

use App\Models\TripPlan;
use App\Models\TripDay;
use Illuminate\Http\Request;

class TripPlanController extends Controller
{
    public function index(Request $request)
    {
        $plans = TripPlan::where('user_id', $request->user()->id)
            ->with('destination', 'tripDays')
            ->get();

        return response()->json($plans);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'destination_id' => ['required', 'exists:destinations,id'],
            'title' => ['required', 'string', 'max:255'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'budget_limit' => ['nullable', 'numeric', 'min:0'],
        ]);

        $plan = TripPlan::create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        // Automatiškai sugeneruok dienas
        $start = \Carbon\Carbon::parse($validated['start_date']);
        $end = \Carbon\Carbon::parse($validated['end_date']);
        $dayNumber = 1;

        for ($date = $start; $date->lte($end); $date->addDay()) {
            TripDay::create([
                'trip_plan_id' => $plan->id,
                'date' => $date->toDateString(),
                'day_number' => $dayNumber++,
            ]);
        }

        return response()->json($plan->load('tripDays'), 201);
    }

    public function show(Request $request, $id)
    {
        $plan = TripPlan::where('user_id', $request->user()->id)
            ->with('destination', 'tripDays.activities')
            ->find($id);

        if (!$plan) {
            return response()->json(['message' => 'Plan not found'], 404);
        }

        return response()->json($plan);
    }

    public function destroy(Request $request, $id)
    {
        $plan = TripPlan::where('user_id', $request->user()->id)->find($id);

        if (!$plan) {
            return response()->json(['message' => 'Plan not found'], 404);
        }

        $plan->delete();

        return response()->json(['message' => 'Plan deleted']);
    }
}