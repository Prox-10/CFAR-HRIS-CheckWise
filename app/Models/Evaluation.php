<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\EvaluationConfiguration;

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
        'period',
        'year',
    ];

    protected $casts = [
        'rating_date' => 'date',
        'period' => 'integer',
        'year' => 'integer',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Get the period label (e.g., "Jan-Jun" or "Jul-Dec")
     */
    public function getPeriodLabelAttribute(): string
    {
        if ($this->period === 1) {
            return 'Jan-Jun';
        } elseif ($this->period === 2) {
            return 'Jul-Dec';
        }
        return 'Unknown';
    }

    /**
     * Check if this evaluation is for the current period
     */
    public function isCurrentPeriod(): bool
    {
        $now = now();
        $currentPeriod = $this->calculatePeriod($now);
        $currentYear = $now->year;

        return $this->period === $currentPeriod && $this->year === $currentYear;
    }

    /**
     * Calculate the current evaluation period based on month
     */
    public static function calculatePeriod(\Carbon\Carbon $date): int
    {
        $month = $date->month;
        return $month <= 6 ? 1 : 2; // Jan-Jun = 1, Jul-Dec = 2
    }

    /**
     * Check if an employee can be evaluated for the current period
     */
    public static function canEvaluateEmployee(int $employeeId, string $department): bool
    {
        $now = now();
        $currentPeriod = static::calculatePeriod($now);
        $currentYear = $now->year;

        $frequency = EvaluationConfiguration::getFrequencyForDepartment($department);

        if ($frequency === 'annual') {
            // For annual, only check year
            return !static::where('employee_id', $employeeId)
                ->where('year', $currentYear)
                ->exists();
        } else {
            // For semi-annual, check both period and year
            return !static::where('employee_id', $employeeId)
                ->where('period', $currentPeriod)
                ->where('year', $currentYear)
                ->exists();
        }
    }
}
