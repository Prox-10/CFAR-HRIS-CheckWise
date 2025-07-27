<?php

namespace App\Http\Controllers;

use App\Models\Leave;
use App\Models\Employee;
use Illuminate\Http\Request;
// use Inertia\Controller;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Log;
use Exception;
use App\Models\Notification;

class LeaveController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        // Fetch the employee data
        $leave = Leave::with('employee')->orderBy('created_at', 'desc')->get();

        $leaveList = $leave->transform(fn($leave) => [
            'id'                  => $leave->id,
            'leave_type'          => $leave->leave_type,
            'leave_start_date'    => $leave->leave_start_date,
            'leave_end_date'      => $leave->leave_end_date,
            'leave_days'          => $leave->leave_days,
            'status'              => $leave->leave_status,
            'leave_reason'        => $leave->leave_reason,
            'leave_date_reported' => $leave->leave_date_reported,
            'leave_date_approved' => $leave->leave_date_approved,
            'leave_comments'      => $leave->leave_comments,
            'created_at'          => $leave->created_at->format('d M Y'),
            'employee_name'       => $leave->employee ? $leave->employee->employee_name : null,
            'picture'       => $leave->employee ? $leave->employee->picture : null,
            'department'       => $leave->employee ? $leave->employee->department : null,
            'employeeid'       => $leave->employee ? $leave->employee->employeeid : null,
            'position'       => $leave->employee ? $leave->employee->position : null,
        ]);

        // Fetch employees for dropdown
        $employees = Employee::select('id', 'employeeid', 'employee_name', 'department', 'position')->get();

        // Calculate leave stats (current)
        $totalLeaves = Leave::count();
        $pendingLeaves = Leave::where('leave_status', 'Pending')->count();
        $approvedLeaves = Leave::where('leave_status', 'Approved')->count();
        $rejectedLeaves = Leave::where('leave_status', 'Rejected')->count();
        $cancelledLeaves = Leave::where('leave_status', 'Cancelled')->count();
        $approvalRate = $totalLeaves > 0 ? round(($approvedLeaves / $totalLeaves) * 100, 2) : 0;

        // Previous period (previous month)
        $prevMonthStart = now()->subMonth()->startOfMonth();
        $prevMonthEnd = now()->subMonth()->endOfMonth();
        $prevTotalLeaves = Leave::whereBetween('created_at', [$prevMonthStart, $prevMonthEnd])->count();
        $prevPendingLeaves = Leave::where('leave_status', 'Pending')->whereBetween('created_at', [$prevMonthStart, $prevMonthEnd])->count();
        $prevApprovedLeaves = Leave::where('leave_status', 'Approved')->whereBetween('created_at', [$prevMonthStart, $prevMonthEnd])->count();
        $prevRejectedLeaves = Leave::where('leave_status', 'Rejected')->whereBetween('created_at', [$prevMonthStart, $prevMonthEnd])->count();
        $prevCancelledLeaves = Leave::where('leave_status', 'Cancelled')->whereBetween('created_at', [$prevMonthStart, $prevMonthEnd])->count();
        $prevApprovalRate = $prevTotalLeaves > 0 ? round(($prevApprovedLeaves / $prevTotalLeaves) * 100, 2) : 0;

        $leaveStats = [
            'totalLeaves' => $totalLeaves,
            'pendingLeaves' => $pendingLeaves,
            'approvedLeaves' => $approvedLeaves,
            'rejectedLeaves' => $rejectedLeaves,
            'cancelledLeaves' => $cancelledLeaves,
            'approvalRate' => $approvalRate,
            'prevTotalLeaves' => $prevTotalLeaves,
            'prevPendingLeaves' => $prevPendingLeaves,
            'prevApprovedLeaves' => $prevApprovedLeaves,
            'prevRejectedLeaves' => $prevRejectedLeaves,
            'prevCancelledLeaves' => $prevCancelledLeaves,
            'prevApprovalRate' => $prevApprovalRate,
        ];

        return Inertia::render('leave/index', [
            'leave'     => $leaveList,  // Pass transformed data to Inertia
            'employees' => $employees,  // Pass employees for dropdown
            'leaveStats' => $leaveStats, // Pass leave stats for section cards
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'employee_id' => 'required|exists:employees,id',
                'leave_type' => 'required|string',
                'leave_start_date' => 'required|date',
                'leave_end_date' => 'required|date|after_or_equal:leave_start_date',
                'leave_days' => 'required|integer|min:1',
                'leave_reason' => 'required|string',
                'leave_date_reported' => 'required|date',
            ]);

            $leave = new Leave();
            $leave->employee_id = $request->employee_id;
            $leave->leave_type = $request->leave_type;
            $leave->leave_start_date = $request->leave_start_date;
            $leave->leave_end_date = $request->leave_end_date;
            $leave->leave_days = $request->leave_days;
            $leave->leave_reason = $request->leave_reason;
            $leave->leave_date_reported = $request->leave_date_reported;
            $leave->leave_status = 'Pending'; // Default status
            $leave->leave_comments = $request->leave_comments ?? '';

            $leave->save();

            // Create admin notification for new leave request
            $employee = Employee::find($request->employee_id);
            Notification::create([
                'type' => 'leave_request',
                'data' => [
                    'leave_id' => $leave->id,
                    'employee_name' => $employee ? $employee->employee_name : null,
                    'leave_type' => $leave->leave_type,
                    'leave_start_date' => $leave->leave_start_date,
                    'leave_end_date' => $leave->leave_end_date,
                ],
            ]);

            return redirect()->route('leave.index')->with('success', 'Leave request submitted successfully!');
        } catch (Exception $e) {
            Log::error('Leave creation failed: ' . $e->getMessage());
            return redirect()->back()->with('error', 'An error occurred while creating the leave request. Please try again!');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Leave $leave)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Leave $leave)
    {
        $leave->load('employee');
        return Inertia::render('leave/edit', [
            'leave' => [
                'id' => $leave->id,
                'leave_type' => $leave->leave_type,
                'leave_start_date' => $leave->leave_start_date,
                'leave_end_date' => $leave->leave_end_date,
                'leave_days' => $leave->leave_days,
                'leave_reason' => $leave->leave_reason,
                'leave_comments' => $leave->leave_comments,
                'leave_status' => $leave->leave_status,
                'leave_date_reported' => $leave->leave_date_reported,
                'leave_date_approved' => $leave->leave_date_approved,
                // Employee info 
                'employee' => $leave->employee ? [
                    'employeeid' => $leave->employee->employeeid,
                    'employee_name' => $leave->employee->employee_name,
                    'department' => $leave->employee->department,
                    'email' => $leave->employee->email,
                    'position' => $leave->employee->position,
                    'picture' => $leave->employee->picture,
                ] : null,
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Leave $leave)
    {
        try {
            if ($leave) {
                $leave->leave_start_date        = $request->leave_start_date;
                $leave->leave_end_date = $request->leave_end_date;
                $leave->leave_type       = $request->leave_type;
                $leave->leave_days        = $request->leave_days;
                $leave->leave_date_reported        = $request->leave_date_reported;

                // Set approval date - use provided date or current date if none provided
                if (!empty($request->leave_date_approved)) {
                    $leave->leave_date_approved = $request->leave_date_approved;
                } else {
                    $leave->leave_date_approved = now()->format('Y-m-d');
                }

                $leave->leave_reason        = $request->leave_reason;
                $leave->leave_comments        = $request->leave_comments;
                $leave->leave_status        = $request->leave_status;

                // if ($request->file('featured_image')) {
                //     $featuredImage             = $request->file('featured_image');
                //     $featuredImageOriginalName = $featuredImage->getClientOriginalName();
                //     $featuredImage             = $featuredImage->store('products', 'public');

                //     $leave->featured_image               = $featuredImage;
                //     $leave->featured_image_original_name = $featuredImageOriginalName;
                // }

                $leave->save();

                // Log::info('[DEBUG]Leave updated info: ',  $leave);
                return redirect()->route('leave.edit', $leave->id)->with('success', 'Leave updated successfully!');
            }
            return redirect()->back()->with('error', 'Unable to update leave. Please try again!');
        } catch (Exception $e) {
            Log::error('Leave update failed: ' . $e->getMessage());
            return redirect()->back()->with('error', 'An error occurred while updating the leave. Please try again!');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $leave = Leave::findOrFail($id);
        $leave->delete();
        return redirect()->back()->with('success', 'Leave deleted');
    }
}
