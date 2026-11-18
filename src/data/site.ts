export const navLinks = [
  { href: "#destaques", label: "Destaques" },
  { href: "#cardapio", label: "Cardápio" },
  { href: "#historia", label: "Nossa História" },
  { href: "#localizacao", label: "Localização" },
] as const;

export const heroImage =
  "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=1800&q=85";

export const aboutImage =
  "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1400&q=85";

export const address = {
  street: "Rua Harmonia, 418",
  neighborhood: "Vila Madalena",
  city: "São Paulo — SP",
  mapsQuery: "Rua Harmonia, 418, Vila Madalena, São Paulo",
};

export const hours = [
  { label: "Segunda", value: "Fechado" },
  { label: "Terça a sábado", value: "7h – 19h" },
  { label: "Domingo", value: "8h – 14h" },
] as const;

export const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.mapsQuery)}`;

export const reviews = [
  {
    id: "marina",
    name: "Marina A.",
    text: "O campagne chega com a casca estalando. Virou o pão da semana lá em casa.",
  },
  {
    id: "paulo",
    name: "Paulo R.",
    text: "Peço no WhatsApp de manhã e retiro no balcão, quente, no meu horário.",
  },
  {
    id: "helena",
    name: "Helena V.",
    text: "O V60 muda com o grão da semana e a extração vem sempre limpa.",
  },
] as const;

export function getWhatsAppPhone() {
  return (process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? "").replace(/\D/g, "");
}
