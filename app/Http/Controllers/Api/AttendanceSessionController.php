<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttendanceSession;
use Illuminate\Http\Request;

class AttendanceSessionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        
        return AttendanceSession::all();
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
        $validated = $request->validate([
            'session_name' => 'required|string',
            'time_in' => 'required',
            'time_out' => 'required',
            'late_time' => 'nullable',
        ]);
        $session = AttendanceSession::create($validated);
        return response()->json($session, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(AttendanceSession $attendanceSession)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(AttendanceSession $attendanceSession)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, AttendanceSession $attendanceSession)
    {
        $validated = $request->validate([
            'time_in' => 'required',
            'time_out' => 'required',
            'late_time' => 'nullable',
        ]);
        $attendanceSession->update($validated);
        return response()->json($attendanceSession);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AttendanceSession $attendanceSession)
    {
        //
    }
}
