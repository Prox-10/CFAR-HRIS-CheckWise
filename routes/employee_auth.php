<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthEmployeeController;
use Inertia\Inertia;

Route::middleware('guest')->group(function () {
    Route::get('employeelogin', [AuthEmployeeController::class, 'create'])->name('employeelogin');
    Route::post('employeelogin', [AuthEmployeeController::class, 'store'])->name('employeelogin.store');
});

Route::middleware(['web', 'employee.auth'])->group(function () {
    Route::get('employee-view', [AuthEmployeeController::class, 'index'])->name('employee-view');
    Route::get('employee-view/profile', [AuthEmployeeController::class, 'profile'])->name('employee-view.profile');
    Route::get('employee-view/attendance', [AuthEmployeeController::class, 'attendance'])->name('employee-view.attendance');
    Route::get('employee-view/evaluations', [AuthEmployeeController::class, 'evaluations'])->name('employee-view.evaluations');
    // Updated to render the new request-form Leave page component
    Route::get('employee-view/leave', fn() => Inertia::render('employee-view/request-form/leave/index'))
        ->name('employee-view.leave');
    // Updated to render the new request-form Absence page component
    Route::get('employee-view/absence', fn() => Inertia::render('employee-view/request-form/absence/index'))
        ->name('employee-view.absence');
    // Updated to render the new request-form Return to Work page component
    Route::get('employee-view/return-work', fn() => Inertia::render('employee-view/request-form/return-request/absence'))
        ->name('employee-view.return-work');
    Route::get('employee-view/records', [AuthEmployeeController::class, 'records'])->name('employee-view.records');
    Route::get('employee-view/reports', [AuthEmployeeController::class, 'reports'])->name('employee-view.reports');

    // Employee profile settings page (to edit name, photo, password)
    Route::get('employee-view/profile-settings', [AuthEmployeeController::class, 'profileSettings'])->name('employee-view.profile-settings');
    Route::post('employee-view/profile-settings/update-profile', [AuthEmployeeController::class, 'updateProfile'])->name('employee-view.profile.update');
    Route::post('employee-view/profile-settings/update-password', [AuthEmployeeController::class, 'updatePassword'])->name('employee-view.password.update');

    // Employee notification routes
    Route::post('employee/notifications/mark-read', [AuthEmployeeController::class, 'markNotificationAsRead'])->name('employee.notifications.mark-read');
    Route::post('employee/notifications/mark-all-read', [AuthEmployeeController::class, 'markAllNotificationsAsRead'])->name('employee.notifications.mark-all-read');

    // Employee dashboard refresh route
    Route::get('employee/dashboard/refresh', [AuthEmployeeController::class, 'refreshDashboard'])->name('employee.dashboard.refresh');

    Route::post('employee/logout', [AuthEmployeeController::class, 'logout'])->name('employee.logout');
    Route::post('employee/reset-pin', [AuthEmployeeController::class, 'resetPin'])->name('employee.reset-pin');
});
