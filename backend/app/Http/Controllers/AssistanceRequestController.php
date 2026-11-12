<?php

namespace App\Http\Controllers;

use App\Models\AssistanceRequest;
use App\Models\AssistanceCompletionForm;
use App\Models\Message;
use App\Models\RequestAttachment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class AssistanceRequestController extends Controller
{
    /**
     * Get list of available ICTU personnel
     */
    public function getIctuPersonnel()
    {
        return response()->json(
            User::select('user_id', 'name', 'designation', 'unit')->get()
        );
    }

    /**
     * Get requests list with optional filters
     */
    public function index(Request $request)
    {
        $query = AssistanceRequest::with(['user', 'assignedIctu', 'attachments']);

        if ($request->has('type')) {
            $query->where('request_type', $request->query('type'));
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->query('user_id'));
        }

        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->has('assigned_ictu_id')) {
            $query->where('assigned_ictu_id', $request->query('assigned_ictu_id'));
        }

        // Hide rejected requests from active schedules if requested
        if ($request->query('active_only') === 'true') {
            $query->where('status', '!=', 'rejected');
        }

        return response()->json($query->orderBy('submitted_at', 'desc')->get());
    }

    /**
     * Fetch single request details
     */
    public function show($id)
    {
        $assistanceRequest = AssistanceRequest::with(['user', 'assignedIctu', 'attachments'])->findOrFail($id);
        return response()->json($assistanceRequest);
    }

    /**
     * Submit a new technical or repair request
     */
    public function store(Request $request)
    {
        $user = $request->user();

        // Enforce server-side CSF block
        $hasUncompletedCsf = AssistanceRequest::where('user_id', $user->user_id)
            ->where('status', 'awaiting_csf')
            ->exists();

        if ($hasUncompletedCsf) {
            return response()->json([
                'message' => 'You cannot submit a new request while a previous service requires CSF evaluation.'
            ], 422);
        }

        $validated = $request->validate([
            'request_type' => ['required', Rule::in(['technical', 'repair'])],
            'subject' => 'required|string|max:150',
            'description' => 'required|string',
            'preferred_date' => 'required|date',
            'preferred_time' => 'required',
            'assigned_ictu_id' => 'required|exists:users,user_id',
            'photos.*' => 'nullable|image|mimes:jpeg,png,jpg|max:5120',
        ]);

        return DB::transaction(function () use ($validated, $user, $request) {
            $assistanceRequest = AssistanceRequest::create([
                'user_id' => $user->user_id,
                'assigned_ictu_id' => $validated['assigned_ictu_id'],
                'request_type' => $validated['request_type'],
                'subject' => $validated['subject'],
                'description' => $validated['description'],
                'preferred_date' => $validated['preferred_date'],
                'preferred_time' => $validated['preferred_time'],
                'status' => 'pending',
                'submitted_at' => now(),
            ]);

            if ($request->hasFile('photos')) {
                foreach ($request->file('photos') as $file) {
                    $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                    $path = $file->storeAs('attachments/' . $assistanceRequest->request_id, $filename, 'public');

                    RequestAttachment::create([
                        'request_id' => $assistanceRequest->request_id,
                        'file_name' => $file->getClientOriginalName(),
                        'file_path' => $path,
                        'uploaded_at' => now(),
                    ]);
                }
            }

            return response()->json([
                'message' => 'Assistance request submitted successfully.',
                'request' => $assistanceRequest->load('attachments', 'assignedIctu')
            ], 201);
        });
    }

    /**
     * Step 1 -> Step 2: Approve Pending or Reassigned Request.
     * Transitions status to 'in_progress' and sets official schedule.
     */
    public function approve(Request $request, $id)
    {
        $assistanceRequest = AssistanceRequest::findOrFail($id);

        if (!in_array($assistanceRequest->status, ['pending', 'reassigned'])) {
            return response()->json([
                'message' => 'Only pending or reassigned requests can be approved.'
            ], 422);
        }

        $validated = $request->validate([
            'scheduled_date' => 'required|date',
            'scheduled_time' => 'required',
            'estimated_duration' => 'required|integer|min:15',
            'ictu_remarks' => 'nullable|string',
        ]);

        // Conflict check for assigned ICTU personnel against active in-progress tasks
        $startTime = Carbon::parse($validated['scheduled_date'] . ' ' . $validated['scheduled_time']);
        $endTime = (clone $startTime)->addMinutes((int)$validated['estimated_duration']);

        $conflict = AssistanceRequest::where('assigned_ictu_id', $assistanceRequest->assigned_ictu_id)
            ->where('request_id', '!=', $id)
            ->where('status', 'in_progress')
            ->where('scheduled_date', $validated['scheduled_date'])
            ->get()
            ->contains(function ($existing) use ($startTime, $endTime) {
                if (!$existing->scheduled_time) return false;
                $existStart = Carbon::parse($existing->scheduled_date . ' ' . $existing->scheduled_time);
                $existEnd = (clone $existStart)->addMinutes((int)($existing->estimated_duration ?? 30));
                return $startTime->lt($existEnd) && $endTime->gt($existStart);
            });

        if ($conflict) {
            return response()->json([
                'message' => 'Scheduling Conflict: The assigned ICTU personnel already has an active task in this timeframe.'
            ], 422);
        }

        $assistanceRequest->update([
            'status' => 'in_progress', // Transitions directly to in_progress upon approval
            'scheduled_date' => $validated['scheduled_date'],
            'scheduled_time' => $validated['scheduled_time'],
            'estimated_duration' => $validated['estimated_duration'],
            'ictu_remarks' => $validated['ictu_remarks'] ?? null,
        ]);

        return response()->json([
            'message' => 'Request approved and scheduled. Status set to In Progress.',
            'request' => $assistanceRequest->fresh(['user', 'assignedIctu', 'attachments'])
        ]);
    }

    /**
     * Reassign task to another ICTU personnel.
     * Status becomes 'reassigned' (awaiting approval by new ICTU member).
     */
    public function reassign(Request $request, $id)
    {
        $assistanceRequest = AssistanceRequest::findOrFail($id);

        if (in_array($assistanceRequest->status, ['completed', 'rejected', 'awaiting_csf'])) {
            return response()->json([
                'message' => 'Cannot reassign a finished or rejected request.'
            ], 422);
        }

        $validated = $request->validate([
            'new_assigned_ictu_id' => 'required|exists:users,user_id',
            'reassignment_reason' => 'required|string',
        ]);

        $assistanceRequest->update([
            'assigned_ictu_id' => $validated['new_assigned_ictu_id'],
            'reassignment_reason' => $validated['reassignment_reason'],
            'status' => 'reassigned',
        ]);

        return response()->json([
            'message' => 'Task reassigned successfully. New assignee must review and approve.',
            'request' => $assistanceRequest->fresh(['user', 'assignedIctu', 'attachments'])
        ]);
    }

    /**
     * Reject request -> Removes it from active schedule.
     */
    public function reject(Request $request, $id)
    {
        $validated = $request->validate([
            'rejection_reason' => 'required|string',
        ]);

        $assistanceRequest = AssistanceRequest::findOrFail($id);

        $assistanceRequest->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['rejection_reason'],
        ]);

        return response()->json([
            'message' => 'Request rejected.',
            'request' => $assistanceRequest->fresh(['user', 'assignedIctu', 'attachments'])
        ]);
    }

    /**
     * Step 2 -> Step 3: ICTU marks task complete -> Status becomes 'awaiting_csf'
     */
    public function updateStatus(Request $request, $id)
    {
        $assistanceRequest = AssistanceRequest::findOrFail($id);

        if ($assistanceRequest->status !== 'in_progress') {
            return response()->json([
                'message' => 'Only in-progress tasks can be marked as finished.'
            ], 422);
        }

        $assistanceRequest->update([
            'status' => 'awaiting_csf',
            'ictu_remarks' => $request->input('ictu_remarks', $assistanceRequest->ictu_remarks),
        ]);

        return response()->json([
            'message' => 'Task marked as finished by ICTU. Status updated to awaiting CSF.',
            'request' => $assistanceRequest->fresh(['user', 'assignedIctu', 'attachments'])
        ]);
    }

    /**
     * Step 3 -> Step 4: End User submits Customer Satisfaction Form (CSF) -> Status becomes 'completed'
     */
    public function submitCsf(Request $request, $id)
    {
        $assistanceRequest = AssistanceRequest::findOrFail($id);

        if ($assistanceRequest->status !== 'awaiting_csf') {
            return response()->json([
                'message' => 'This request is not awaiting a Customer Satisfaction Form.'
            ], 422);
        }

        $validated = $request->validate([
            'ratings' => 'required|array',
            'comments' => 'nullable|string',
        ]);

        DB::transaction(function () use ($assistanceRequest, $validated, $request) {
            AssistanceCompletionForm::create([
                'request_id' => $assistanceRequest->request_id,
                'user_id' => $request->user()->user_id,
                'form_data' => $validated,
                'submitted_at' => now(),
            ]);

            $assistanceRequest->update(['status' => 'completed']);
        });

        return response()->json([
            'message' => 'Customer Satisfaction Form submitted! Service is now marked as completed.',
            'request' => $assistanceRequest->fresh(['user', 'assignedIctu', 'attachments'])
        ]);
    }

    /**
     * Get chat messages for a request
     */
    public function getMessages($id)
    {
        $messages = Message::where('request_id', $id)
            ->with('sender')
            ->orderBy('sent_at', 'asc')
            ->get();

        return response()->json($messages);
    }

    /**
     * Post a message in request thread
     */
    public function sendMessage(Request $request, $id)
    {
        $validated = $request->validate([
            'message_content' => 'required|string',
        ]);

        $message = Message::create([
            'request_id' => $id,
            'sender_id' => $request->user()->user_id,
            'message_content' => $validated['message_content'],
            'sent_at' => now(),
        ]);

        return response()->json($message->load('sender'), 201);
    }
}