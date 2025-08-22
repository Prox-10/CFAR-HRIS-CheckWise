<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Attendance;
use App\Models\Employee;
use Carbon\Carbon;

class AttendanceSeeder extends Seeder
{
  public function run()
  {
    // Clear existing attendance data
    Attendance::truncate();

    // Get all employees or create some if none exist
    $employees = Employee::all();

    if ($employees->isEmpty()) {
      $employees = Employee::factory()->count(10)->create();
      $this->output("Created {$employees->count()} test employees");
    } else {
      $this->output("Found {$employees->count()} existing employees");
    }

    $employeeIds = $employees->pluck('id')->toArray();

    // Generate attendance data for the last 90 days
    $startDate = Carbon::now()->subDays(90);
    $endDate = Carbon::now();

    $this->output('Generating attendance data from ' . $startDate->format('Y-m-d') . ' to ' . $endDate->format('Y-m-d'));

    // Create attendance records efficiently
    $totalCreated = $this->generateAttendanceData($startDate, $endDate, $employeeIds);
    $this->output("Created {$totalCreated} attendance records");

    // Generate additional random records for variety
    $additionalCreated = $this->generateAdditionalRecords($employeeIds);
    $this->output("Created additional {$additionalCreated} random attendance records");

    // Display statistics
    $this->displayStatistics();
  }

  /**
   * Generate attendance data for a date range
   */
  private function generateAttendanceData($startDate, $endDate, $employeeIds)
  {
    $totalCreated = 0;
    $currentDate = $startDate->copy();

    while ($currentDate <= $endDate) {
      // Skip weekends
      if ($currentDate->dayOfWeek !== 0 && $currentDate->dayOfWeek !== 6) {
        foreach ($employeeIds as $employeeId) {
          // Check if attendance already exists
          $existingAttendance = Attendance::where('employee_id', $employeeId)
            ->where('attendance_date', $currentDate->format('Y-m-d'))
            ->first();

          if (!$existingAttendance) {
            $this->createAttendanceRecord($employeeId, $currentDate);
            $totalCreated++;
          }
        }
      }

      $currentDate->addDay();
    }

    return $totalCreated;
  }

  /**
   * Generate additional random attendance records
   */
  private function generateAdditionalRecords($employeeIds)
  {
    $additionalCreated = 0;

    for ($i = 0; $i < 200; $i++) {
      $employeeId = $employeeIds[array_rand($employeeIds)];
      $randomDate = Carbon::now()->subDays(rand(1, 90))->format('Y-m-d');

      // Check if attendance already exists
      $existingAttendance = Attendance::where('employee_id', $employeeId)
        ->where('attendance_date', $randomDate)
        ->first();

      if (!$existingAttendance) {
        Attendance::factory()->create([
          'employee_id' => $employeeId,
          'attendance_date' => $randomDate,
        ]);
        $additionalCreated++;
      }
    }

    return $additionalCreated;
  }

  /**
   * Create a single attendance record
   */
  private function createAttendanceRecord($employeeId, $date)
  {
    $session = $this->getRandomSession();

    Attendance::create([
      'employee_id' => $employeeId,
      'time_in' => $this->generateTimeIn($session),
      'time_out' => $this->generateTimeOut($session),
      'break_time' => $this->generateBreakTime($session),
      'attendance_status' => $this->generateAttendanceStatus(),
      'attendance_date' => $date->format('Y-m-d'),
      'session' => $session,
    ]);
  }

  /**
   * Get random session
   */
  private function getRandomSession()
  {
    $sessions = ['morning', 'afternoon', 'night'];
    return $sessions[array_rand($sessions)];
  }

  /**
   * Generate time in based on session
   */
  private function generateTimeIn($session)
  {
    $times = [
      'morning' => [
        '06:00:00',
        '06:15:00',
        '06:30:00',
        '06:45:00',
        '07:00:00',
        '07:15:00',
        '07:30:00',
        '07:45:00',
        '08:00:00',
        '08:15:00',
        '08:30:00'
      ],
      'afternoon' => [
        '12:00:00',
        '12:15:00',
        '12:30:00',
        '12:45:00',
        '13:00:00',
        '13:15:00',
        '13:30:00',
        '13:45:00',
        '14:00:00',
        '14:15:00'
      ],
      'night' => [
        '18:00:00',
        '18:15:00',
        '18:30:00',
        '18:45:00',
        '19:00:00',
        '19:15:00',
        '19:30:00',
        '19:45:00',
        '20:00:00',
        '20:15:00'
      ]
    ];

    return $times[$session][array_rand($times[$session])];
  }

  /**
   * Generate time out based on session
   */
  private function generateTimeOut($session)
  {
    $times = [
      'morning' => [
        '14:00:00',
        '14:15:00',
        '14:30:00',
        '14:45:00',
        '15:00:00',
        '15:15:00',
        '15:30:00',
        '15:45:00',
        '16:00:00'
      ],
      'afternoon' => [
        '18:00:00',
        '18:15:00',
        '18:30:00',
        '18:45:00',
        '19:00:00',
        '19:15:00',
        '19:30:00',
        '19:45:00',
        '20:00:00'
      ],
      'night' => [
        '06:00:00',
        '06:15:00',
        '06:30:00',
        '06:45:00',
        '07:00:00',
        '07:15:00',
        '07:30:00',
        '07:45:00',
        '08:00:00'
      ]
    ];

    return $times[$session][array_rand($times[$session])];
  }

  /**
   * Generate break time based on session
   */
  private function generateBreakTime($session)
  {
    $times = [
      'morning' => ['10:00:00', '10:15:00', '10:30:00'],
      'afternoon' => ['15:00:00', '15:15:00', '15:30:00'],
      'night' => ['22:00:00', '22:15:00', '22:30:00']
    ];

    return $times[$session][array_rand($times[$session])];
  }

  /**
   * Generate attendance status with realistic distribution
   * 70% Present, 20% Late, 10% Absent
   */
  private function generateAttendanceStatus()
  {
    $random = rand(1, 100);

    if ($random <= 70) {
      return 'Present';
    } elseif ($random <= 90) {
      return 'Late';
    } else {
      return 'Absent';
    }
  }

  /**
   * Display attendance statistics
   */
  private function displayStatistics()
  {
    $totalRecords = Attendance::count();
    $presentCount = Attendance::where('attendance_status', 'Present')->count();
    $lateCount = Attendance::where('attendance_status', 'Late')->count();
    $absentCount = Attendance::where('attendance_status', 'Absent')->count();

    $this->output("\n=== Attendance Statistics ===");
    $this->output("Total Records: {$totalRecords}");
    $this->output("Present: {$presentCount} (" . round(($presentCount / $totalRecords) * 100, 1) . "%)");
    $this->output("Late: {$lateCount} (" . round(($lateCount / $totalRecords) * 100, 1) . "%)");
    $this->output("Absent: {$absentCount} (" . round(($absentCount / $totalRecords) * 100, 1) . "%)");

    // Show data by date range
    $last7Days = Attendance::where('attendance_date', '>=', Carbon::now()->subDays(7)->format('Y-m-d'))->count();
    $last30Days = Attendance::where('attendance_date', '>=', Carbon::now()->subDays(30)->format('Y-m-d'))->count();
    $last90Days = Attendance::where('attendance_date', '>=', Carbon::now()->subDays(90)->format('Y-m-d'))->count();

    $this->output("\n=== Records by Date Range ===");
    $this->output("Last 7 days: {$last7Days}");
    $this->output("Last 30 days: {$last30Days}");
    $this->output("Last 90 days: {$last90Days}");

    // Show unique dates
    $uniqueDates = Attendance::distinct('attendance_date')->count('attendance_date');
    $this->output("Unique dates with data: {$uniqueDates}");

    // Show session distribution
    $morningCount = Attendance::where('session', 'morning')->count();
    $afternoonCount = Attendance::where('session', 'afternoon')->count();
    $nightCount = Attendance::where('session', 'night')->count();

    $this->output("\n=== Session Distribution ===");
    $this->output("Morning: {$morningCount} (" . round(($morningCount / $totalRecords) * 100, 1) . "%)");
    $this->output("Afternoon: {$afternoonCount} (" . round(($afternoonCount / $totalRecords) * 100, 1) . "%)");
    $this->output("Night: {$nightCount} (" . round(($nightCount / $totalRecords) * 100, 1) . "%)");
  }

  /**
   * Safe output method that works both in seeder and command contexts
   */
  private function output($message)
  {
    if (isset($this->command) && $this->command) {
      $this->command->info($message);
    } else {
      // Fallback for when called directly as seeder
      echo $message . "\n";
    }
  }
}
