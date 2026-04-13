<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\TripDay;
use Illuminate\Http\Request;

class ActivityController extends Controller
{
    public function store(Request $request, $tripDayId)
    {
        $day = TripDay::find($tripDayId);

        if (!$day) {
            return response()->json(['message' => 'Day not found'], 404);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['nullable', 'string'],
            'cost' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
            'start_time' => ['nullable', 'date_format:H:i'],
        ]);

        $activity = Activity::create([
            ...$validated,
            'trip_day_id' => $tripDayId,
        ]);

        return response()->json($activity, 201);
    }

    public function destroy($id)
    {
        $activity = Activity::find($id);

        if (!$activity) {
            return response()->json(['message' => 'Activity not found'], 404);
        }

        $activity->delete();

        return response()->json(['message' => 'Activity deleted']);
    }
}