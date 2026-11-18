export const productCategories = [
  "Pães Artesanais",
  "Cafés Especiais",
  "Doces",
  "Combos",
] as const;

export type ProductCategory = (typeof productCategories)[number];

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  ingredients: string[];
  price: number;
  image: string;
  badge?: "Mais pedido" | "Feito hoje";
  featured?: boolean;
}

export const menuFilters = ["Todos", ...productCategories] as const;

export type MenuFilter = (typeof menuFilters)[number];

export const products: Product[] = [
  {
    id: "pao-campagne",
    name: "Pão Campagne",
    category: "Pães Artesanais",
    description: "Casca crocante, miolo úmido e fermentação lenta de 36 horas.",
    ingredients: ["farinha orgânica", "levain", "sal marinho"],
    price: 24.9,
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=85",
    badge: "Mais pedido",
    featured: true,
  },
  {
    id: "focaccia-alecrim",
    name: "Focaccia de Alecrim",
    category: "Pães Artesanais",
    description: "Macia por dentro, dourada por fora, com azeite extravirgem e flor de sal.",
    ingredients: ["farinha de trigo", "alecrim fresco", "azeite extravirgem"],
    price: 18.5,
    image:
      "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=1200&q=85",
    badge: "Feito hoje",
    featured: true,
  },
  {
    id: "v60-cafe-especial",
    name: "Café Coado V60",
    category: "Cafés Especiais",
    description: "Café de origem rotativa, coado na hora para uma xícara limpa e aromática.",
    ingredients: ["grãos 100% arábica", "torra fresca", "água filtrada"],
    price: 13.9,
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=85",
    badge: "Feito hoje",
    featured: true,
  },
  {
    id: "cappuccino-casa",
    name: "Cappuccino da Casa",
    category: "Cafés Especiais",
    description: "Espresso duplo, leite vaporizado e finalização delicada de cacau.",
    ingredients: ["espresso", "leite integral", "cacau em pó"],
    price: 15.9,
    image:
      "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "cookie-chocolate-70",
    name: "Cookie Chocolate 70%",
    category: "Doces",
    description: "Cookie de bordas crocantes e centro macio com chocolate intenso.",
    ingredients: ["chocolate 70%", "manteiga", "baunilha"],
    price: 12.9,
    image:
      "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "cinnamon-roll",
    name: "Cinnamon Roll",
    category: "Doces",
    description: "Massa macia de fermentação natural, canela e cobertura de cream cheese.",
    ingredients: ["canela", "açúcar mascavo", "cream cheese"],
    price: 16.9,
    image:
      "https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&w=1200&q=85",
    badge: "Mais pedido",
  },
  {
    id: "combo-manha",
    name: "Combo Manhã Leve",
    category: "Combos",
    description: "Café coado, fatia de pão campagne com manteiga e geleia da casa.",
    ingredients: ["café coado", "pão campagne", "manteiga", "geleia artesanal"],
    price: 29.9,
    image:
      "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "combo-brunch",
    name: "Brunch Forno & Grão",
    category: "Combos",
    description: "Focaccia, ovos cremosos, salada da estação e cappuccino da casa.",
    ingredients: ["focaccia", "ovos caipiras", "folhas frescas", "cappuccino"],
    price: 47.9,
    image:
      "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=1200&q=85",
  },
];

export const featuredProducts = products.filter((product) => product.featured);
