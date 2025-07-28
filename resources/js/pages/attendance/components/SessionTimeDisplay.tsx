import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit } from "lucide-react";
import React, { useState } from "react";
import { SessionTimeModal } from "./SessionTimeModal";

type Session = {
  id: number;
  session_name: string;
  time_in_start: string;
  time_in_end: string;
  time_out_start: string;
  time_out_end: string;
  late_time?: string;
  double_scan_window?: number;
};

interface Props {
  sessions: Session[];
}

export const SessionTimeDisplay: React.FC<Props> = ({ sessions }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleUpdateSuccess = () => {
    // Refresh the page to get updated data from Inertia
    // window.location.reload();
  };

  const getSessionColor = (sessionName: string) => {
    switch (sessionName) {
      case 'morning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'afternoon':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'night':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTime = (time: string) => {
    if (!time) return 'Not set';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Session Times</CardTitle>
            <CardDescription>Current attendance session settings</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setModalOpen(true)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Change Set Time
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No session times configured yet.
              </div>
            ) : (
              sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge className={getSessionColor(session.session_name)}>
                      {session.session_name.charAt(0).toUpperCase() + session.session_name.slice(1)}
                    </Badge>
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="font-medium">Time In:</span> {formatTime(session.time_in_start)} - {formatTime(session.time_in_end)}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Time Out:</span> {session.time_out_start && session.time_out_end ?
                          `${formatTime(session.time_out_start)} - ${formatTime(session.time_out_end)}` :
                          'Not configured'
                        }
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Late Time:</span> {session.late_time ? formatTime(session.late_time) : 'Not configured'}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Double Scan Window:</span> {session.double_scan_window ? `${session.double_scan_window} minutes` : 'Not configured'}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <SessionTimeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode="update"
        onSuccess={handleUpdateSuccess}
        sessions={sessions}
      />
    </>
  );
}; 
