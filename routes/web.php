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
use App\Http\Controllers\AbsenceController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SupervisorDepartmentController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Employee routes are handled in employee_auth.php

Route::middleware(['auth', 'verified'])->group(function () {


    Route::get('request-form/leave', [LeaveController::class, 'index'])->name('request-form.index');

    Route::middleware(['permission:view-report'])->group(function () {
        Route::get('report', function () {
            return Inertia::render('report/index');
        })->name('report');
    });

    // Explicit routes for all service-tenure subpages
    Route::middleware(['permission:View Service Tenure'])->group(function () {
        Route::get('service-tenure/employee', [ServiceTenureController::class, 'employee'])->name('service-tenure.employee');
        Route::get('service-tenure/index', [ServiceTenureController::class, 'index'])->name('service-tenure.index');
        Route::get('service-tenure/service-tenure', [ServiceTenureController::class, 'serviceTenure'])->name('service-tenure.service-tenure');
        Route::get('service-tenure/pay-advancement', [ServiceTenureController::class, 'payAdvancement'])->name('service-tenure.pay-advancement');
        Route::get('service-tenure/report', [ServiceTenureController::class, 'report'])->name('service-tenure.report');
        Route::post('service-tenure/recalculate', [ServiceTenureController::class, 'recalculate'])->name('service-tenure.recalculate');
        Route::post('service-tenure/pay-advancement/store', [ServiceTenureController::class, 'storePayAdvancement'])->name('service-tenure.pay-advancement.store');
    });

    // Supervisor management routes (only for super admin) - moved outside evaluation group
    Route::get('evaluation/supervisor-management', [SupervisorDepartmentController::class, 'index'])->name('evaluation.supervisor-management');
    Route::post('evaluation/supervisor-management', [SupervisorDepartmentController::class, 'store'])->name('evaluation.supervisor-management.store');
    Route::put('evaluation/supervisor-management/{assignment}', [SupervisorDepartmentController::class, 'update'])->name('evaluation.supervisor-management.update');
    Route::delete('evaluation/supervisor-management/{assignment}', [SupervisorDepartmentController::class, 'destroy'])->name('evaluation.supervisor-management.destroy');

    // Evaluation frequency update route (accessible from supervisor management)
    Route::put('evaluation/frequencies/{department}', [EvaluationController::class, 'updateFrequency'])->name('evaluation.frequencies.update');

    // Check existing evaluation route
    Route::get('evaluation/check-existing/{employeeId}/{department}', [EvaluationController::class, 'checkExistingEvaluation'])->name('evaluation.check-existing');

    // Temporary route for department evaluation (for testing - remove permission middleware)
    Route::get('evaluation/department-evaluation', [EvaluationController::class, 'departmentEvaluation'])->name('evaluation.department-evaluation');
    Route::post('evaluation/department-evaluation', [EvaluationController::class, 'storeDepartmentEvaluation'])->name('evaluation.department-evaluation.store');

    Route::middleware(['permission:View Evaluation'])->group(function () {
        Route::resource('evaluation', EvaluationController::class)->names('evaluation');

        // Evaluation frequency update route (requires evaluation permissions)
        // Route::put('evaluation/frequencies/{department}', [EvaluationController::class, 'updateFrequency'])->name('evaluation.frequencies.update'); // Moved outside
    });

    Route::middleware(['permission:View Dashboard'])->group(function () {
        Route::resource('dashboard', DashboardController::class)->names('dashboard');
    });

    Route::middleware(['permission:View Attendance'])->group(function () {
        Route::resource('attendance', AttendanceController::class)->names('attendance');
        Route::resource('attendance-session', AttendanceSessionController::class)->names('attendance-session');
    });

    Route::middleware(['permission:View Leave'])->group(function () {
        Route::resource('leave', LeaveController::class)->names('leave');
    });

    // Absence routes
    Route::middleware(['permission:View Absence'])->group(function () {
        Route::get('absence', [AbsenceController::class, 'index'])->name('absence.index');
        Route::get('absence/absence-approve', [AbsenceController::class, 'request'])->name('absence.absence-approve');
        Route::post('absence', [AbsenceController::class, 'store'])->name('absence.store');
        Route::get('absence/approve', [AbsenceController::class, 'approve'])->name('absence.approve');
        Route::patch('absence/{absence}/status', [AbsenceController::class, 'updateStatus'])->name('absence.updateStatus');
        Route::delete('absence/{absence}', [AbsenceController::class, 'destroy'])->name('absence.destroy');
    });
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::middleware(['permission:View Employee'])->group(function () {
        Route::get('/employee', [EmployeeController::class, 'index'])->name('employee.index');
        Route::post('/employee', [EmployeeController::class, 'store'])->name('employee.store');
        Route::put('/employee/{id}', [EmployeeController::class, 'update'])->name('employee.update');
        Route::delete('/employee/{id}', [EmployeeController::class, 'destroy'])->name('employee.destroy');
    });
});


Route::middleware(['auth', 'verified'])->group(function () {
    // Permission Management Routes
    Route::middleware(['permission:View Permission'])->group(function () {
        Route::get('permission/access/index', [PermissionController::class, 'index'])->name('permission.index');
        Route::post('permission/access/store', [PermissionController::class, 'store'])->name('permission.store');
        Route::delete('permission/access/{permission}', [PermissionController::class, 'destroy'])->name('permission.destroy');
    });

    // User Management Routes
    Route::middleware(['auth', 'verified'])->group(function () {
        Route::get('permission/user/index', [UserController::class, 'index'])->name('user.index');
        Route::get('permission/user/{user}', [UserController::class, 'show'])->name('user.show');
        Route::post('permission/user/store', [UserController::class, 'store'])->name('user.store');
        Route::put('permission/user/{user}', [UserController::class, 'update'])->name('user.update');
        Route::delete('permission/user/{user}', [UserController::class, 'destroy'])->name('user.destroy');
    });

    // Role Management Routes
    Route::middleware(['permission:View Role'])->group(function () {
        Route::get('permission/role/index', [RoleController::class, 'index'])->name('role.index');
        Route::get('permission/role/create', [RoleController::class, 'create'])->name('role.create');
        Route::post('permission/role/store', [RoleController::class, 'store'])->name('role.store');
        Route::get('permission/role/{role}', [RoleController::class, 'show'])->name('role.show');
        Route::get('permission/role/{role}/edit', [RoleController::class, 'edit'])->name('role.edit');
        Route::put('permission/role/{role}', [RoleController::class, 'update'])->name('role.update');
        Route::delete('permission/role/{role}', [RoleController::class, 'destroy'])->name('role.destroy');
    });
});






require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/employee_auth.php';
