import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, DollarSign } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import BookingDialog from '@/components/BookingDialog';

interface Service {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  location: string;
  categories: {
    name: string;
  };
}

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from('services')
      .select(`
        *,
        categories (
          name
        )
      `);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load services",
        variant: "destructive"
      });
    } else {
      setServices(data || []);
    }
    setLoading(false);
  };

  const handleBookNow = (service: Service) => {
    setSelectedService(service);
    setBookingDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h1>
          <p className="text-xl text-gray-600">Book your appointments with ease</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{service.name}</CardTitle>
                  <Badge variant="secondary">{service.categories?.name}</Badge>
                </div>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {service.duration_minutes} minutes
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {service.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    ${service.price}
                  </div>
                </div>
                {user ? (
                  <Button className="w-full" onClick={() => handleBookNow(service)}>
                    Book Now
                  </Button>
                ) : (
                  <Button className="w-full" variant="outline" disabled>
                    Sign in to book
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {selectedService && (
        <BookingDialog
          open={bookingDialogOpen}
          onOpenChange={setBookingDialogOpen}
          service={selectedService}
        />
      )}
    </div>
  );
};

export default Services;
