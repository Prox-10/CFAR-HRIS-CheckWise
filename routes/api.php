<?php

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\FingerprintController;
use App\Http\Controllers\EmployeeController;
use App\Models\Employee;
use App\Http\Controllers\Api\EmployeeController as ApiEmployeeController;
use App\Http\Controllers\Api\AttendanceController as ApiAttendanceController;
use App\Http\Controllers\Api\AttendanceSessionController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Mark notification as read (admin only)
Route::post('/notifications/{id}/read', function ($id) {
    $notification = Notification::findOrFail($id);
    $notification->read_at = now();
    $notification->save();
    return response()->json(['success' => true]);
});


Route::post('/fingerprint/store', [FingerprintController::class, 'store']);
Route::post('/fingerprint/verify', [FingerprintController::class, 'verify']);
// Remove or comment out the identification route
// Route::post('/fingerprint/identify', [FingerprintController::class, 'identify']);
Route::post('/employee/store', [EmployeeController::class, 'store']);
Route::get('/fingerprint/all', [FingerprintController::class, 'all']);
Route::get('/employee/all', [ApiEmployeeController::class, 'index']);
Route::get('/attendance/all', [ApiAttendanceController::class, 'index']);

// Attendance session time settings API
Route::get('/attendance-sessions', [AttendanceSessionController::class, 'index'])->name('attendance-sessions.index');
Route::post('/attendance-sessions', [AttendanceSessionController::class, 'store']);
Route::put('/attendance-sessions/{attendanceSession}', [AttendanceSessionController::class, 'update']);

Route::get('/employee/by-employeeid', function (Request $request) {
    $employeeid = $request->query('employeeid');
    $employee = Employee::where('employeeid', $employeeid)->first();
    if ($employee) {
        return response()->json($employee);
    }
    return response()->json(null, 404);
});

// Evaluation Frequency Management - REMOVED (now handled in web routes)
// Route::middleware(['auth:sanctum'])->group(function () {
//     Route::get('/evaluation/frequencies', [App\Http\Controllers\Api\EvaluationFrequencyController::class, 'index']);
//     Route::get('/evaluation/frequencies/{department}', [App\Http\Controllers\Api\EvaluationFrequencyController::class, 'show']);
//     Route::put('/evaluation/frequencies/{department}', [App\Http\Controllers\Api\EvaluationFrequencyController::class, 'update']);
// });

Route::get('/attendance/test', function () {
    $data = \App\Models\Attendance::select('attendance_date', 'attendance_status')
        ->limit(10)
        ->get()
        ->map(function ($item) {
            return [
                'attendanceDate' => $item->attendance_date,
                'attendanceStatus' => $item->attendance_status,
            ];
        });

    return response()->json([
        'count' => \App\Models\Attendance::count(),
        'sample_data' => $data
    ]);
});
