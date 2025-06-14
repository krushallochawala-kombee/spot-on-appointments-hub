
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, DollarSign, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Booking {
  id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  notes: string | null;
  services: {
    name: string;
    description: string;
    duration_minutes: number;
    price: number;
    location: string;
    categories: {
      name: string;
    };
  };
}

const MyBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        services (
          name,
          description,
          duration_minutes,
          price,
          location,
          categories (
            name
          )
        )
      `)
      .eq('user_id', user?.id)
      .order('booking_date', { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load your bookings",
        variant: "destructive"
      });
    } else {
      setBookings(data || []);
    }
    setLoading(false);
  };

  const cancelBooking = async (bookingId: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to cancel booking",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Booking Cancelled",
        description: "Your booking has been cancelled successfully.",
      });
      fetchBookings();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">My Bookings</h1>
          <p className="text-xl text-gray-600">Manage your appointments</p>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-600 mb-6">Start by booking a service from our services page.</p>
            <Button onClick={() => window.location.href = '/services'}>
              Browse Services
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{booking.services.name}</CardTitle>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                  <CardDescription>{booking.services.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(booking.booking_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      {booking.booking_time} ({booking.services.duration_minutes} min)
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {booking.services.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2" />
                      ${booking.services.price}
                    </div>
                    {booking.notes && (
                      <div className="flex items-start text-sm text-gray-600">
                        <FileText className="h-4 w-4 mr-2 mt-0.5" />
                        <span className="break-words">{booking.notes}</span>
                      </div>
                    )}
                  </div>
                  {booking.status === 'confirmed' && (
                    <Button 
                      variant="outline" 
                      className="w-full text-red-600 hover:text-red-700"
                      onClick={() => cancelBooking(booking.id)}
                    >
                      Cancel Booking
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
