import { useLocation, Link } from "wouter";
import { Home, Scan, ShoppingCart, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNavigation() {
  const [location] = useLocation();

  const items = [
    {
      name: "Início",
      href: "/",
      icon: Home,
      active: location === "/"
    },
    {
      name: "Escanear",
      href: "/scanner",
      icon: Scan,
      active: location === "/scanner"
    },
    {
      name: "Carrinho",
      href: "/cart",
      icon: ShoppingCart,
      active: location === "/cart"
    },
    {
      name: "Perfil",
      href: "/profile",
      icon: User,
      active: location === "/profile" || location.startsWith("/profile/")
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto bg-white shadow-lg rounded-t-xl border-t border-neutral-200">
      <div className="flex justify-around items-center py-3">
        {items.map((item) => (
          <Link key={item.name} href={item.href}>
            <a className="flex flex-col items-center">
              <item.icon 
                className={cn(
                  "h-6 w-6", 
                  item.active ? "text-primary" : "text-gray-500"
                )} 
              />
              <span className={cn(
                "text-xs mt-1",
                item.active ? "text-primary" : "text-gray-500"
              )}>
                {item.name}
              </span>
            </a>
          </Link>
        ))}
      </div>
    </nav>
  );
}
