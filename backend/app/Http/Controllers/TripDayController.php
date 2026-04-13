<?php

namespace App\Http\Controllers;

use App\Models\TripDay;
use Illuminate\Http\Request;

class TripDayController extends Controller
{
    public function show($id)
    {
        $day = TripDay::with('activities')->find($id);

        if (!$day) {
            return response()->json(['message' => 'Day not found'], 404);
        }

        return response()->json($day);
    }
}