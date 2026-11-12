<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use Illuminate\Http\Request;

class SubjectController extends Controller
{
    /**
     * Get active subjects filtered by request type (technical/repair/both)
     */
    public function index(Request $request)
    {
        $type = $request->query('type');

        $query = Subject::where('is_active', true);

        if ($type) {
            $query->where(function ($q) use ($type) {
                $q->where('request_type', $type)
                  ->orWhere('request_type', 'both');
            });
        }

        return response()->json($query->orderBy('title', 'asc')->get());
    }

    /**
     * Admin: Store new subject option
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:150|unique:subjects,title',
            'request_type' => 'required|in:technical,repair,both',
        ]);

        $subject = Subject::create([
            'title' => $validated['title'],
            'request_type' => $validated['request_type'],
            'is_active' => true,
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'Subject option added successfully.',
            'subject' => $subject
        ], 201);
    }

    /**
     * Admin: Delete subject option
     */
    public function destroy($id)
    {
        $subject = Subject::findOrFail($id);
        $subject->delete();

        return response()->json(['message' => 'Subject option deleted successfully.']);
    }
}