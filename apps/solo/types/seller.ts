export interface SellerProfile {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  image: string | null;
  streetAddress: string;
  zipCode: string;
  city: string;
  country: string;
}
