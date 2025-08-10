<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

class Employee extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'employees';

    protected $fillable = [
        'email',
        'employeeid',
        'employee_name',
        'firstname',
        'middlename',
        'lastname',
        'date_of_birth',
        'department',
        'position',
        'service_tenure',
        'phone',
        'work_status',
        'status',
        'gender',
        'picture',
        'pin',
    ];

    protected static function boot()
    {
        parent::boot();

        // Auto-generate PIN when creating or updating employee
        static::creating(function ($employee) {
            if (empty($employee->pin)) {
                $employee->pin = $employee->generatePin();
            }
        });

        static::updating(function ($employee) {
            // Only regenerate PIN if lastname or date_of_birth changed
            if ($employee->isDirty('lastname') || $employee->isDirty('date_of_birth')) {
                $employee->pin = $employee->generatePin();
            }
        });
    }

    /**
     * Generate PIN based on lastname and birth year
     * Format: first 3 letters of lastname (lowercase) + birth year
     */
    public function generatePin(): string
    {
        $lastname = strtolower(substr($this->lastname, 0, 3));
        $birthYear = $this->date_of_birth ? Carbon::parse($this->date_of_birth)->format('Y') : date('Y');

        return $lastname . $birthYear;
    }

    /**
     * Reset PIN for employee
     */
    public function resetPin(): string
    {
        $this->pin = $this->generatePin();
        $this->save();

        return $this->pin;
    }

    // app/Models/Employee.php

    public function fingerprints()
    {
        return $this->hasMany(Fingerprint::class);
    }
    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }
    public function evaluations()
    {
        return $this->hasMany(Evaluation::class);
    }

    public function serviceTenure()
    {
        return $this->hasMany(ServiceTenure::class);
    }
}
