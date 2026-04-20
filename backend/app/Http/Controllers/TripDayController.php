<?php

namespace App\Http\Controllers;

use App\Models\TripDay;
use Illuminate\Http\Request;

class TripDayController extends Controller
{
    public function show(Request $request, $id)
    {
        $day = TripDay::with('activities')
            ->whereHas('tripPlan', fn ($q) => $q->where('user_id', $request->user()->id))
            ->find($id);

        if (!$day) {
            return response()->json(['message' => 'Day not found'], 404);
        }

        return response()->json($day);
    }
}
