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
      'from_date' => $absence->from_date,
      'to_date' => $absence->to_date,
      'department' => $absence->department,
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
