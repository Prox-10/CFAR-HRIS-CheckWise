<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
// use App\Models\Employee;
use Illuminate\Database\Eloquent\SoftDeletes;


class Leave extends Model
{
    use HasFactory, SoftDeletes;
    protected $table = 'leaves'; // optional if you follow Laravel naming conventions

    protected $fillable = [
        'employee_id',
        'leave_start_date',
        'leave_end_date',
        'leave_type',
        'leave_days',
        'leave_date_reported',
        'leave_date_approved',
        'leave_reason',
        'leave_comments',
        'leave_status',
    ];

    protected $casts = [
        'leave_start_date' => 'date',
        'leave_end_date' => 'date',
        'leave_date_reported' => 'date',
        'leave_date_approved' => 'date',
    ];


    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }
}
