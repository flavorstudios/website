// app/contact/page.tsx

export const metadata = {
  title: "Contact | Flavor Studios",
  description:
    "Connect with Flavor Studios—reach out for collaborations, support, business inquiries, or just to say hello. Fill out our contact form and our team will respond quickly.",
  alternates: {
    canonical: "https://flavorstudios.in/contact",
  },
};

import ContactForm from "./ContactForm";

export default function ContactPage() {
  return <ContactForm />;
}
