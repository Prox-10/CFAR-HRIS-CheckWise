<?php

namespace App\Events;

use App\Models\Absence;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AbsenceRequested implements ShouldBroadcastNow
{
  use Dispatchable, InteractsWithSockets, SerializesModels;

  public array $payload;

  public function __construct(public Absence $absence)
  {
    $this->payload = [
      'type' => 'absence_request',
      'absence_id' => $absence->id,
      'employee_id' => $absence->employee_id,
      'employee_name' => $absence->employee ? $absence->employee->employee_name : 'Unknown Employee',
      'absence_type' => $absence->absence_type,
      'from_date' => $absence->from_date->format('Y-m-d'),
      'to_date' => $absence->to_date->format('Y-m-d'),
      'department' => $absence->department,
      'full_name' => $absence->full_name,
      'employee_id_number' => $absence->employee_id_number,
      'position' => $absence->position,
      'reason' => $absence->reason,
      'is_partial_day' => $absence->is_partial_day,
      'days' => $absence->days,
      'submitted_at' => $absence->submitted_at->format('Y-m-d H:i:s'),
      'status' => $absence->status,
      'picture' => $absence->employee ? $absence->employee->picture : null,
    ];
  }

  public function broadcastOn(): array
  {
    $supervisor = \App\Models\User::getSupervisorForDepartment($this->absence->department);
    
    if ($supervisor) {
      return [new PrivateChannel('supervisor.' . $supervisor->id)];
    }
    
    return [new Channel('notifications')];
  }

  public function broadcastAs(): string
  {
    return 'AbsenceRequested';
  }

  public function broadcastWith(): array
  {
    return $this->payload;
  }
}
