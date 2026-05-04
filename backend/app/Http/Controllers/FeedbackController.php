<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use Illuminate\Http\Request;

class FeedbackController extends Controller
{
    public function index(Request $request)
    {
        $query = Feedback::with(['user:id,name', 'destination:id,name'])->latest();

        if ($request->filled('subject_type')) {
            $query->where('subject_type', $request->query('subject_type'));
        }

        if ($request->filled('destination_id')) {
            $query->where('destination_id', $request->query('destination_id'));
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject_type' => ['required', 'in:system,destination'],
            'destination_id' => ['nullable', 'required_if:subject_type,destination', 'exists:destinations,id'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['required', 'string', 'max:2000'],
        ]);

        if ($validated['subject_type'] === 'system') {
            $validated['destination_id'] = null;
        }

        $feedback = Feedback::create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        $feedback->load(['user:id,name', 'destination:id,name']);

        return response()->json($feedback, 201);
    }

    public function destroy(Request $request, $id)
    {
        $feedback = Feedback::find($id);

        if (!$feedback) {
            return response()->json(['message' => 'Feedback not found'], 404);
        }

        $user = $request->user();
        if ($feedback->user_id !== $user->id && !$user->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $feedback->delete();

        return response()->json(['message' => 'Feedback deleted']);
    }
}
