<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AttendanceSessionController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EvaluationController;
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\ServiceTenureController;
use App\Http\Controllers\TestController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AuthEmployeeController;
use App\Http\Controllers\AbsentController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::resource('employee_view', AuthEmployeeController::class)->names('employee_view');

Route::middleware(['auth', 'verified'])->group(function () {


    Route::get('request-form/leave', [LeaveController::class, 'index'])->name('request-form.index');

    Route::get('request-form/absent', [AbsentController::class, 'index'])->name('request-form.absent');

    Route::get('report', function () {
        return Inertia::render('report/index');
    })->name('report');

    // Explicit routes for all service-tenure subpages
    Route::get('service-tenure/employee', [ServiceTenureController::class, 'employee'])->name('service-tenure.employee');

    Route::get('service-tenure/index', [ServiceTenureController::class, 'index'])->name('service-tenure.index');

    Route::get('service-tenure/service-tenure', [ServiceTenureController::class, 'serviceTenure'])->name('service-tenure.service-tenure');

    Route::get('service-tenure/pay-advancement', [ServiceTenureController::class, 'payAdvancement'])->name('service-tenure.pay-advancement');
    Route::get('service-tenure/report', [ServiceTenureController::class, 'report'])->name('service-tenure.report');

    // Add recalculate route
    Route::post('service-tenure/recalculate', [ServiceTenureController::class, 'recalculate'])->name('service-tenure.recalculate');

    // Add pay advancement store route
    Route::post('service-tenure/pay-advancement/store', [ServiceTenureController::class, 'storePayAdvancement'])->name('service-tenure.pay-advancement.store');

    Route::resource('evaluation', EvaluationController::class)->names('evaluation');

    Route::resource('dashboard', DashboardController::class)->names('dashboard');
    Route::resource('attendance', AttendanceController::class)->names('attendance');
    Route::resource('attendance-session', AttendanceSessionController::class)->names('attendance-session');
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
