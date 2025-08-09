<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\SettingsController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', 'settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance');

    // Settings management routes
    Route::middleware(['permission:View Settings'])->group(function () {
        Route::get('settings', [SettingsController::class, 'index'])->name('settings.index');

        // Department routes
        Route::post('settings/departments', [SettingsController::class, 'storeDepartment'])->name('settings.departments.store');
        Route::put('settings/departments/{department}', [SettingsController::class, 'updateDepartment'])->name('settings.departments.update');
        Route::delete('settings/departments/{department}', [SettingsController::class, 'destroyDepartment'])->name('settings.departments.destroy');

        // Position routes
        Route::post('settings/positions', [SettingsController::class, 'storePosition'])->name('settings.positions.store');
        Route::put('settings/positions/{position}', [SettingsController::class, 'updatePosition'])->name('settings.positions.update');
        Route::delete('settings/positions/{position}', [SettingsController::class, 'destroyPosition'])->name('settings.positions.destroy');
    });
});
