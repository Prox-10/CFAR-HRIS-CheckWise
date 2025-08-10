<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Absence extends Model
{
    /** @use HasFactory<\Database\Factories\AbsenceFactory> */
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'full_name',
        'employee_id_number',
        'department',
        'position',
        'absence_type',
        'from_date',
        'to_date',
        'is_partial_day',
        'reason',
        'status',
        'submitted_at',
        'approved_at',
        'approved_by',
        'approval_comments',
    ];

    protected $casts = [
        'from_date' => 'date',
        'to_date' => 'date',
        'is_partial_day' => 'boolean',
        'submitted_at' => 'datetime',
        'approved_at' => 'datetime',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function getDaysAttribute(): int
    {
        return $this->from_date->diffInDays($this->to_date) + 1;
    }
}
