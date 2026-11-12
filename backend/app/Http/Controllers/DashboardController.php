<?php

namespace App\Http\Controllers;

use App\Models\AssistanceRequest;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Get live dashboard summary stats and recent lists.
     */
    public function index(Request $request)
    {
        // 1. KPI Counts
        $pendingCount = AssistanceRequest::where('status', 'pending')->count();
        $inProgressCount = AssistanceRequest::whereIn('status', ['approved', 'in_progress'])->count();
        $completedCount = AssistanceRequest::where('status', 'completed')->count();

        // 2. Active In Progress / Scheduled Tasks
        $inProgressTasks = AssistanceRequest::with(['user', 'assignedIctu'])
            ->whereIn('status', ['approved', 'in_progress'])
            ->orderBy('scheduled_date', 'asc')
            ->orderBy('scheduled_time', 'asc')
            ->get();

        // 3. Pending Requests List (Left Card)
        $pendingRequests = AssistanceRequest::with(['user', 'assignedIctu', 'attachments'])
            ->where('status', 'pending')
            ->orderBy('submitted_at', 'desc')
            ->limit(15)
            ->get();

        // 4. Completed Requests List (Right Card)
        $completedRequests = AssistanceRequest::with(['user', 'assignedIctu', 'attachments'])
            ->where('status', 'completed')
            ->orderBy('updated_at', 'desc')
            ->limit(15)
            ->get();

        return response()->json([
            'kpis' => [
                'pending' => $pendingCount,
                'in_progress' => $inProgressCount,
                'completed' => $completedCount,
            ],
            'in_progress_tasks' => $inProgressTasks,
            'pending_requests' => $pendingRequests,
            'completed_requests' => $completedRequests,
        ]);
    }
}