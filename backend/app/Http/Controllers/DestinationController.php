<?php

namespace App\Http\Controllers;

use App\Models\Destination;
use Illuminate\Http\Request;

class DestinationController extends Controller
{
    public function index()
    {
        return response()->json(Destination::all());
    }

    public function show($id)
    {
        $destination = Destination::find($id);

        if (!$destination) {
            return response()->json(['message' => 'Destination not found'], 404);
        }

        return response()->json($destination);
    }

    public function recommend(Request $request)
    {
        $validated = $request->validate([
            'trip_type' => ['required', 'string'],
            'season' => ['required', 'string'],
            'budget_level' => ['required', 'string'],
            'duration_range' => ['required', 'string'],
        ]);

        $topDestinations = Destination::all()
            ->map(function ($destination) use ($validated) {
                $score = 0;

                if ($destination->trip_type === $validated['trip_type']) $score++;
                if ($destination->season === $validated['season']) $score++;
                if ($destination->budget_level === $validated['budget_level']) $score++;
                if ($destination->duration_range === $validated['duration_range']) $score++;

                return [
                    'score' => $score,
                    'destination' => $destination,
                ];
            })
            ->sortByDesc('score')
            ->take(3)
            ->values();

        return response()->json($topDestinations);
    }
}