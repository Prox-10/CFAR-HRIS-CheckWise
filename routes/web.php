<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AttendanceSessionController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EvaluationController;
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\TestController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AuthEmployeeController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::resource('employee_view', AuthEmployeeController::class)->names('employee_view');

Route::middleware(['auth', 'verified'])->group(function () {



    Route::get('report', function () {
        return Inertia::render('report/index');
    })->name('report');

    Route::resource('evaluation', EvaluationController::class)->names('evaluation');

    Route::resource('dashboard', DashboardController::class)->names('dashboard');
    Route::resource('attendance', AttendanceController::class)->names('attendance');
    Route::resource('attendance-sessions', AttendanceSessionController::class)->names('attendance-sessions');
    Route::resource('leave', LeaveController::class)->names('leave');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/employee', [EmployeeController::class, 'index'])->name('employee.index');
    Route::post('/employee', [EmployeeController::class, 'store'])->name('employee.store');
    Route::put('/employee/{id}', [EmployeeController::class, 'update'])->name('employee.update');
    Route::delete('/employee/{id}', [EmployeeController::class, 'destroy'])->name('employee.destroy');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/test', [TestController::class, 'index'])->name('test.index');
    Route::post('/test', [TestController::class, 'store'])->name('test.store');
    Route::put('/test/{id}', [TestController::class, 'update'])->name('test.update');
    Route::delete('/test/{id}', [TestController::class, 'destroy'])->name('test.destroy');
});






require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/employee_auth.php';
