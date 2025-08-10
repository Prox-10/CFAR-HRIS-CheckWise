<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthEmployeeController;

Route::middleware('guest')->group(function () {
    Route::get('employee_login', [AuthEmployeeController::class, 'create'])->name('employee_login');
    Route::post('employee_login', [AuthEmployeeController::class, 'store'])->name('employee_login.store');
});

Route::middleware(['web', 'employee.auth'])->group(function () {
    Route::get('employee_view', [AuthEmployeeController::class, 'index'])->name('employee_view');
    Route::get('employee_view/profile', [AuthEmployeeController::class, 'profile'])->name('employee_view.profile');
    Route::get('employee_view/attendance', [AuthEmployeeController::class, 'attendance'])->name('employee_view.attendance');
    Route::get('employee_view/evaluations', [AuthEmployeeController::class, 'evaluations'])->name('employee_view.evaluations');
    Route::get('employee_view/leave', [AuthEmployeeController::class, 'leave'])->name('employee_view.leave');
    Route::get('employee_view/absence', [AuthEmployeeController::class, 'absence'])->name('employee_view.absence');
    Route::get('employee_view/return-work', [AuthEmployeeController::class, 'returnWork'])->name('employee_view.return-work');
    Route::get('employee_view/records', [AuthEmployeeController::class, 'records'])->name('employee_view.records');
    Route::get('employee_view/reports', [AuthEmployeeController::class, 'reports'])->name('employee_view.reports');
    Route::post('employee_logout', [AuthEmployeeController::class, 'logout'])->name('employee_logout');
    Route::post('employee_reset_pin', [AuthEmployeeController::class, 'resetPin'])->name('employee_reset_pin');
});
