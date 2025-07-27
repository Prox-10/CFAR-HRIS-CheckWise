<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\AttendanceSession;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $attendance = Attendance::with('employee')->orderBy('created_at', 'asc')->get();

        $attendanceList = $attendance->transform(
            fn($attendance) => [
                'id'               => $attendance->id,
                'timeIn'           => $attendance->time_in,
                'timeOut'          => $attendance->time_out,
                'breakTime'        => $attendance->break_time,
                'attendanceStatus' => $attendance->attendance_status,
                'attendanceDate'   => $attendance->attendance_date,
                'employee_name'    => $attendance->employee ? $attendance->employee->employee_name : null,
                'picture'          => $attendance->employee ? $attendance->employee->picture : null,
                'department'       => $attendance->employee ? $attendance->employee->department : null,
                'employeeid'       => $attendance->employee ? $attendance->employee->employeeid : null,
                'position'         => $attendance->employee ? $attendance->employee->position : null,
                'session'          => $attendance->session, // Add session
            ]
        );

        // Get sessions data
        $sessions = AttendanceSession::orderBy('created_at', 'desc')->get();

        // Analytics for section cards
        $totalEmployee = \App\Models\Employee::distinct('employeeid')->count('employeeid');
        $totalDepartment = \App\Models\Employee::distinct('department')->count('department');
        $prevTotalEmployee = \App\Models\Employee::where('created_at', '<', now()->startOfMonth())->distinct('employeeid')->count('employeeid');
        $prevTotalDepartment = \App\Models\Employee::where('created_at', '<', now()->startOfMonth())->distinct('department')->count('department');

        return Inertia::render('attendance/index', [
            'attendanceData' => $attendanceList,
            'sessions' => $sessions,
            'totalEmployee' => $totalEmployee,
            'prevTotalEmployee' => $prevTotalEmployee,
            'totalDepartment' => $totalDepartment,
            'prevTotalDepartment' => $prevTotalDepartment,
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
        $request->validate([
            'employeeid' => 'required|string',
            'timeIn' => 'required',
            'attendanceStatus' => 'required|string',
            'attendanceDate' => 'required|date',
            // Add validation for timeOut, breakTime if needed
        ]);

        // Find the employee by employeeid
        $employee = \App\Models\Employee::where('employeeid', $request->employeeid)->first();
        if (!$employee) {
            return redirect()->back()->with('error', 'Employee not found.');
        }

        // Determine session if not provided
        $session = $request->input('session');
        if (!$session) {
            $now = $request->timeIn ? $request->timeIn : now()->format('H:i:s');
            $hour = (int)substr($now, 0, 2);
            if ($hour >= 6 && $hour < 12) {
                $session = 'morning';
            } elseif ($hour >= 12 && $hour < 18) {
                $session = 'afternoon';
            } else {
                $session = 'night';
            }
        }

        // Prevent duplicate attendance for the same employee, date, and session
        $existing = \App\Models\Attendance::where('employee_id', $employee->id)
            ->where('attendance_date', $request->attendanceDate)
            ->where('session', $session)
            ->first();
        if ($existing) {
            return redirect()->back()->with('error', 'Attendance already recorded for this employee, date, and session.');
        }

        // Save attendance
        $attendance = new \App\Models\Attendance();
        $attendance->employee_id = $employee->id;
        $attendance->time_in = $request->timeIn;
        $attendance->attendance_status = $request->attendanceStatus;
        $attendance->attendance_date = $request->attendanceDate;
        $attendance->session = $session; // Always set session
        // Optionally set time_out, break_time, etc.
        if ($request->has('timeOut')) $attendance->time_out = $request->timeOut;
        if ($request->has('breakTime')) $attendance->break_time = $request->breakTime;
        $attendance->save();

        return redirect()->back()->with('success', 'Attendance recorded successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Attendance $attendance)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Attendance $attendance)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Attendance $attendance)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Attendance $attendance)
    {
        //
    }
}
