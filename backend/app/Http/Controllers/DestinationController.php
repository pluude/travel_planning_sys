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

    // ── Admin CRUD: destinations ──────────────────────────────────────────

    public function store(Request $request)
    {
        $validated = $request->validate($this->destinationRules());
        $destination = Destination::create($validated);
        return response()->json($destination, 201);
    }

    public function update(Request $request, $id)
    {
        $destination = Destination::find($id);
        if (!$destination) {
            return response()->json(['message' => 'Destination not found'], 404);
        }

        $validated = $request->validate($this->destinationRules(forUpdate: true));
        $destination->update($validated);
        return response()->json($destination);
    }

    public function destroy($id)
    {
        $destination = Destination::find($id);
        if (!$destination) {
            return response()->json(['message' => 'Destination not found'], 404);
        }
        $destination->delete();
        return response()->json(['message' => 'Destination deleted']);
    }

    // ── Admin CRUD: attractions ───────────────────────────────────────────

    public function storeAttraction(Request $request, $id)
    {
        $destination = Destination::find($id);
        if (!$destination) {
            return response()->json(['message' => 'Destination not found'], 404);
        }

        $validated = $request->validate($this->attractionRules());
        $attraction = Attraction::create([...$validated, 'destination_id' => $id]);
        return response()->json($attraction, 201);
    }

    public function updateAttraction(Request $request, $id)
    {
        $attraction = Attraction::find($id);
        if (!$attraction) {
            return response()->json(['message' => 'Attraction not found'], 404);
        }

        $validated = $request->validate($this->attractionRules(forUpdate: true));
        $attraction->update($validated);
        return response()->json($attraction);
    }

    public function destroyAttraction($id)
    {
        $attraction = Attraction::find($id);
        if (!$attraction) {
            return response()->json(['message' => 'Attraction not found'], 404);
        }
        $attraction->delete();
        return response()->json(['message' => 'Attraction deleted']);
    }

    private function destinationRules(bool $forUpdate = false): array
    {
        $req = $forUpdate ? 'sometimes' : 'required';
        return [
            'name' => [$req, 'string', 'max:255'],
            'country' => [$req, 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'trip_type' => [$req, 'string', 'max:50'],
            'season' => [$req, 'string', 'max:50'],
            'budget_level' => [$req, 'string', 'max:50'],
            'duration_range' => [$req, 'string', 'max:50'],
            'image_url' => ['nullable', 'string', 'max:1000'],
        ];
    }

    private function attractionRules(bool $forUpdate = false): array
    {
        $req = $forUpdate ? 'sometimes' : 'required';
        return [
            'name' => [$req, 'string', 'max:255'],
            'type' => ['nullable', 'string', 'max:50'],
            'price_estimate' => ['nullable', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
            'opening_hours' => ['nullable', 'array'],
            'duration_minutes' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
