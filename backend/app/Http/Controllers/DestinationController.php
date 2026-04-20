<?php

namespace App\Http\Controllers;

use App\Models\Destination;
use App\Models\Attraction;
use App\Services\RecommendationService;
use Illuminate\Http\Request;

class DestinationController extends Controller
{
    public function __construct(private RecommendationService $recommendations) {}

    public function index(Request $request)
    {
        $perPage = $request->query('per_page', 6);
        $destinations = Destination::paginate($perPage);
        return response()->json($destinations);
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

        return response()->json($this->recommendations->topMatches($validated));
    }

    public function attractions($id, Request $request)
    {
        $destination = Destination::find($id);

        if (!$destination) {
            return response()->json(['message' => 'Destination not found'], 404);
        }

        $budgetLimit = $request->query('budget_limit');

        $attractions = Attraction::where('destination_id', $id)
            ->when($budgetLimit, function ($query) use ($budgetLimit) {
                $perDay = $budgetLimit / 5;
                return $query->where('price_estimate', '<=', $perDay);
            })
            ->get();

        return response()->json($attractions);
    }
}
