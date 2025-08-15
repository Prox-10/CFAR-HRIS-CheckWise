<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationConfiguration extends Model
{
  use HasFactory;

  protected $fillable = [
    'department',
    'evaluation_frequency',
  ];

  protected $casts = [
    'evaluation_frequency' => 'string',
  ];

  /**
   * Get the evaluation frequency for a specific department
   */
  public static function getFrequencyForDepartment(string $department): string
  {
    $config = static::where('department', $department)->first();
    return $config ? $config->evaluation_frequency : 'annual'; // Default to annual
  }

  /**
   * Check if a department uses semi-annual evaluations
   */
  public static function isSemiAnnual(string $department): bool
  {
    return static::getFrequencyForDepartment($department) === 'semi_annual';
  }

  /**
   * Check if a department uses annual evaluations
   */
  public static function isAnnual(string $department): bool
  {
    return static::getFrequencyForDepartment($department) === 'annual';
  }
}
