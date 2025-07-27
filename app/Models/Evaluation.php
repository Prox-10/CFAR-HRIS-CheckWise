<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Evaluation extends Model
{
    /** @use HasFactory<\Database\Factories\EvaluationFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'employee_id',
        'ratings',
        'rating_date',
        'work_quality',
        'safety_compliance',
        'punctuality',
        'teamwork',
        'organization',
        'equipment_handling',
        'comment',
        
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

   

}
