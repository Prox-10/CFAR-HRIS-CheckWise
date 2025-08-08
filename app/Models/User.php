<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'firstname',
        'middlename',
        'lastname',
        'email',
        'password',
        'department',
        'profile_image',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the user's full name.
     */
    public function getFullnameAttribute(): string
    {
        $name = trim($this->firstname . ' ' . $this->lastname);
        return $name;
    }

    /**
     * Get the departments this user supervises
     */
    public function supervisedDepartments()
    {
        return $this->hasMany(SupervisorDepartment::class);
    }

    /**
     * Check if user can evaluate employees in a specific department
     */
    public function canEvaluateDepartment($department)
    {
        return $this->supervisedDepartments()
            ->where('department', $department)
            ->where('can_evaluate', true)
            ->exists();
    }

    /**
     * Get all departments this user can evaluate
     */
    public function getEvaluableDepartments()
    {
        return $this->supervisedDepartments()
            ->where('can_evaluate', true)
            ->pluck('department')
            ->toArray();
    }

    /**
     * Check if user is a supervisor
     */
    public function isSupervisor()
    {
        return $this->hasRole('Supervisor');
    }

    /**
     * Check if user is super admin
     */
    public function isSuperAdmin()
    {
        return $this->hasRole('Super Admin');
    }

    /**
     * Check if user can evaluate (super admin or supervisor with permissions)
     */
    public function canEvaluate()
    {
        return $this->isSuperAdmin() || ($this->isSupervisor() && $this->supervisedDepartments()->where('can_evaluate', true)->exists());
    }
}
