<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthEmployeeController;



Route::middleware('guest')->group(function () {

    Route::get('employee_login', [AuthEmployeeController::class, 'create'])->name('employee_login');
    Route::post('employee_login', [AuthEmployeeController::class, 'store'])->name('employee_login.store');
    Route::get('employee_view', [AuthEmployeeController::class, 'index'])->name('employee_view');
    
    
});
