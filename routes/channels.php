<?php

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Auth;

Broadcast::channel('notifications', function ($user) {
    return Auth::check();
});

Broadcast::channel('employee.{employeeId}', function ($user, $employeeId) {
    return Auth::check();
});
