<?php

namespace Database\Factories;

use App\Models\Attendance;
use Illuminate\Database\Eloquent\Factories\Factory;

class AttendanceFactory extends Factory
{
  protected $model = Attendance::class;

  public function definition()
  {
    $sessions = ['morning', 'afternoon', 'night'];
    $status = ['Present', 'Late', 'Absent', 'Excuse', 'Leave'];
    $timeIn = $this->faker->time('H:i:s');
    $timeOut = $this->faker->time('H:i:s');
    $breakTime = $this->faker->time('H:i:s');
    return [
      'employee_id' => $this->faker->numberBetween(1, 10),
      'time_in' => $timeIn,
      'time_out' => $timeOut,
      'break_time' => $breakTime,
      'attendance_status' => $this->faker->randomElement($status),
      'attendance_date' => $this->faker->date(),
      'session' => $this->faker->randomElement($sessions),
    ];
  }
}
