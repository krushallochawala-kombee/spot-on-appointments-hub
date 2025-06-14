
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { toast } from '@/hooks/use-toast';
import { CalendarIcon, Clock } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
}

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service;
}

const BookingDialog = ({ open, onOpenChange, service }: BookingDialogProps) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  const handleBooking = async () => {
    if (!user || !selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select a date and time for your booking.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        service_id: service.id,
        booking_date: selectedDate.toISOString().split('T')[0],
        booking_time: selectedTime,
        notes: notes || null,
        status: 'confirmed'
      });

    if (error) {
      toast({
        title: "Booking Failed",
        description: "There was an error creating your booking. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Booking Confirmed!",
        description: `Your appointment for ${service.name} has been booked.`,
      });
      onOpenChange(false);
      setSelectedDate(undefined);
      setSelectedTime('');
      setNotes('');
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Book {service.name}</DialogTitle>
          <DialogDescription>
            Duration: {service.duration_minutes} minutes • Price: ${service.price}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <Label className="flex items-center gap-2 mb-3">
              <CalendarIcon className="h-4 w-4" />
              Select Date
            </Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date() || date.getDay() === 0}
              className="rounded-md border"
            />
          </div>

          <div>
            <Label className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4" />
              Select Time
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special requests or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleBooking} disabled={loading || !selectedDate || !selectedTime}>
            {loading ? 'Booking...' : 'Confirm Booking'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
