<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

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
    ];



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
}
