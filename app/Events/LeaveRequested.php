<?php

namespace App\Events;

use App\Models\Leave;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LeaveRequested implements ShouldBroadcastNow
{
  use Dispatchable, InteractsWithSockets, SerializesModels;

  public array $payload;

  public function __construct(public Leave $leave)
  {
    $this->payload = [
      'type' => 'leave_request',
      'leave_id' => $leave->id,
      'employee_id' => $leave->employee_id,
      'employee_name' => $leave->employee ? $leave->employee->employee_name : 'Unknown Employee',
      'leave_type' => $leave->leave_type,
      'leave_start_date' => $leave->leave_start_date,
      'leave_end_date' => $leave->leave_end_date,
      'department' => $leave->employee ? $leave->employee->department : null,
    ];
  }

  public function broadcastOn(): array
  {
    $supervisor = \App\Models\User::getSupervisorForDepartment($this->leave->employee->department);
    
    if ($supervisor) {
      return [new PrivateChannel('supervisor.' . $supervisor->id)];
    }
    
    return [new Channel('notifications')];
  }

  public function broadcastAs(): string
  {
    return 'LeaveRequested';
  }

  public function broadcastWith(): array
  {
    return $this->payload;
  }
}
