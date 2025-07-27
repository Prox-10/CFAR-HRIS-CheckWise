<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AttendanceSession extends Model
{
    /** @use HasFactory<\Database\Factories\AttendanceSessionFactory> */
    use HasFactory;

    protected $fillable = [
        'session_name',
        'time_in',
        'time_out',
        'late_time',
    ];
}
