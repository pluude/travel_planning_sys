<?php

namespace App\Http\Controllers;

use App\Models\TripPlan;
use App\Services\TripPlanService;
use Illuminate\Http\Request;

class TripPlanController extends Controller
{
    public function __construct(private TripPlanService $tripPlans) {}

    public function index(Request $request)
    {
        $plans = TripPlan::where('user_id', $request->user()->id)
            ->with('destination', 'tripDays.activities')
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
            'flight_cost' => ['nullable', 'numeric', 'min:0'],
            'hotel_cost' => ['nullable', 'numeric', 'min:0'],
        ]);

        $plan = $this->tripPlans->createWithDays($validated, $request->user()->id);

        return response()->json($plan, 201);
    }

    public function update(Request $request, $id)
    {
        $plan = TripPlan::where('user_id', $request->user()->id)->find($id);

        if (!$plan) {
            return response()->json(['message' => 'Plan not found'], 404);
        }

        $validated = $request->validate([
            'budget_limit' => ['nullable', 'numeric', 'min:0'],
            'flight_cost' => ['nullable', 'numeric', 'min:0'],
            'hotel_cost' => ['nullable', 'numeric', 'min:0'],
            'status' => ['nullable', 'string', 'in:draft,planned,completed'],
        ]);

        $plan->update($validated);
        $plan->load('destination', 'tripDays.activities');

        return response()->json($plan);
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
