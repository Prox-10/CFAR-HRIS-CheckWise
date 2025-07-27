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
  time_in: string;
  time_out: string;
  late_time: string | null;
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
  time_in: string;
  time_out: string;
  late_time: string;
};

export const SessionTimeModal: React.FC<Props> = ({ open, onClose, mode = 'create', onSuccess, sessions }) => {
  const [selected, setSelected] = useState<string>("morning");
  const { data, setData, post, put, processing, errors } = useForm<FormValues>({
    session_name: "morning",
    time_in: "",
    time_out: "",
    late_time: "",
  });

  useEffect(() => {
    if (mode === 'update') {
      const session = sessions.find((s) => s.session_name === selected);
      if (session) {
        setData({
          session_name: selected,
          time_in: session.time_in,
          time_out: session.time_out,
          late_time: session.late_time || "",
        });
      }
    } else if (mode === 'create') {
      setData({
        session_name: selected,
        time_in: "",
        time_out: "",
        late_time: "",
      });
    }
  }, [selected, sessions, mode, setData]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'update') {
      const session = sessions.find((s) => s.session_name === selected);
      if (session) {
        put(route('attendance-sessions.update', { id: session.id }), {
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
      post(route('attendance-sessions.store'), {
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
          <Label>
            Time In:
            <Input
              type="time"
              value={data.time_in}
              onChange={e => setData("time_in", e.target.value)}
              required
            />
          </Label>
          <Label>
            Time Out:
            <Input
              type="time"
              value={data.time_out}
              onChange={e => setData("time_out", e.target.value)}
              required
            />
          </Label>
          <Label>
            Late Time (optional):
            <Input
              type="time"
              value={data.late_time}
              onChange={e => setData("late_time", e.target.value)}
            />
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