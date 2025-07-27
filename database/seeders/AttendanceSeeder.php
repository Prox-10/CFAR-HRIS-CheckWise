<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Attendance;

class AttendanceSeeder extends Seeder
{
  public function run()
  {
    Attendance::factory()->count(50)->create();
  }
}
