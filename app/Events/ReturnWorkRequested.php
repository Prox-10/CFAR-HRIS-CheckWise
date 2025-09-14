<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ReturnWorkRequested implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $payload;

    public function __construct(array $data)
    {
        $this->payload = [
            'type' => 'return_work_request',
            'return_work_id' => $data['return_work_id'],
            'employee_name' => $data['employee_name'],
            'employee_id_number' => $data['employee_id_number'],
            'department' => $data['department'],
            'return_date' => $data['return_date'],
            'absence_type' => $data['absence_type'],
            'reason' => $data['reason'],
            'return_date_reported' => $data['return_date_reported'],
        ];
    }

    public function broadcastOn(): array
    {
        // For now, broadcast to general notifications channel
        // You can implement supervisor-specific channels later if needed
        return [new Channel('notifications')];
    }

    public function broadcastAs(): string
    {
        return 'ReturnWorkRequested';
    }

    public function broadcastWith(): array
    {
        return $this->payload;
    }
}
