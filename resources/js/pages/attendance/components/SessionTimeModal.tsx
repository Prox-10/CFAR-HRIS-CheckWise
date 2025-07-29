import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "@inertiajs/react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

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
  open: boolean;
  onClose: () => void;
  mode?: 'create' | 'update';
  onSuccess?: () => void;
  sessions: Session[];
}

const sessionOptions = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "night", label: "Night" },
];

type FormValues = {
  session_name: string;
  time_in_start: string;
  time_in_end: string;
  time_out_start: string;
  time_out_end: string;
  late_time: string;
  double_scan_window: number;
};

export const SessionTimeModal: React.FC<Props> = ({ open, onClose, mode = 'create', onSuccess, sessions }) => {
  const [selected, setSelected] = useState<string>("morning");
  const { data, setData, post, put, processing, errors } = useForm<FormValues>({
    session_name: "morning",
    time_in_start: "",
    time_in_end: "",
    time_out_start: "",
    time_out_end: "",
    late_time: "",
    double_scan_window: 0,
  });

  useEffect(() => {
    if (mode === 'update') {
      const session = sessions.find((s) => s.session_name === selected);
      if (session) {
        setData({
          session_name: selected,
          time_in_start: session.time_in_start,
          time_in_end: session.time_in_end,
          time_out_start: session.time_out_start,
          time_out_end: session.time_out_end,
          late_time: session.late_time || "",
          double_scan_window: session.double_scan_window || 0,
        });
      }
    } else if (mode === 'create') {
      setData({
        session_name: selected,
        time_in_start: "",
        time_in_end: "",
        time_out_start: "",
        time_out_end: "",
        late_time: "",
        double_scan_window: 0,
      });
    }
  }, [selected, sessions, mode, setData]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'update') {
      const session = sessions.find((s) => s.session_name === selected);
      if (session) {
        put(route('attendance-session.update', { id: session.id }), {
          ...data,
          preserveScroll: true,
          onSuccess: () => {
            toast.success("Session times updated!");
            onSuccess?.();
            onClose();
          },
          onError: (errors) => {
            console.error('Update session error:', errors);
            toast.error("Failed to update session times.");
          },
        });
      } else {
        toast.error("Session not found for update.");
      }
    } else if (mode === 'create') {
      post(route('attendance-session.store'), {
        ...data,
        preserveScroll: true,
        onSuccess: () => {
          toast.success("Session times created!");
          onSuccess?.();
          onClose();
        },
        onError: (errors) => {
          console.error('Create session error:', errors);
          toast.error("Failed to create session times.");
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'update' ? 'Change Set Time' : 'Set Session Times'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <Label>
            Session:
            <select
              className="block w-full border rounded p-2 mt-1"
              value={selected}
              onChange={e => {
                setSelected(e.target.value);
                setData("session_name", e.target.value); // keep in sync
              }}
            >
              {sessionOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Label>
              Time In Start:
              <Input
                type="time"
                value={data.time_in_start}
                onChange={e => setData("time_in_start", e.target.value)}
                required
              />
            </Label>
            <Label>
              Time In End:
              <Input
                type="time"
                value={data.time_in_end}
                onChange={e => setData("time_in_end", e.target.value)}
                required
              />
            </Label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Label>
              Time Out Start (Optional):
              <Input
                type="time"
                value={data.time_out_start}
                onChange={e => setData("time_out_start", e.target.value)}
              />
            </Label>
            <Label>
              Time Out End (Optional):
              <Input
                type="time"
                value={data.time_out_end}
                onChange={e => setData("time_out_end", e.target.value)}
              />
            </Label>
          </div>
          <Label>
            Late Time (Optional):
            <Input
              type="time"
              value={data.late_time}
              onChange={e => setData("late_time", e.target.value)}
              min={data.time_in_start}
              max={data.time_in_end}
            />
            <span className="text-xs text-muted-foreground">Set the time after which employees are considered late (must be between Time In Start and Time In End).</span>
          </Label>
          <Label>
            Double Scan Window (minutes):
            <Input
              type="number"
              value={data.double_scan_window}
              onChange={e => setData("double_scan_window", parseInt(e.target.value) || 0)}
              min={1}
              max={60}
              placeholder="10"
            />
            <span className="text-xs text-muted-foreground">Time window (in minutes) for double scan detection. Within this window, second scan is ignored. After this window, second scan becomes emergency logout.</span>
          </Label>
          <DialogFooter className="flex justify-end space-x-2 mt-2">
            <DialogClose asChild>
              <Button variant='outline' type="button">Cancel</Button>
            </DialogClose>
            <Button variant='main' type="submit" disabled={processing}>
              {processing ? "Saving..." : (mode === 'update' ? "Update" : "Save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 