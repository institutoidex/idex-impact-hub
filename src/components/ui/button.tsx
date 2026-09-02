import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Identidade de botão do IDEX: pílula com peso 600, leve subida no hover e
// retorno no active. Os formatos (raio, peso, movimento) vivem aqui uma única
// vez — as páginas só escolhem a variante, sem `rounded-full` avulso.
const identidadeIdex =
  "rounded-full font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Variantes da marca (pílulas):
        // Texto escuro (ink) sobre verde para atingir contraste WCAG AA (~6.75:1).
        idex: `${identidadeIdex} bg-primary text-ink hover:bg-primary/90`,
        idexSecundario: `${identidadeIdex} bg-secondary text-secondary-foreground hover:bg-secondary/90`,
        /** Contorno para fundos claros */
        idexContorno: `${identidadeIdex} border-2 border-primary bg-transparent text-ink shadow-none hover:bg-primary hover:text-ink`,
        /** Contorno claro para uso sobre foto/fundo escuro */
        idexClaro: `${identidadeIdex} border border-ink-foreground/40 bg-ink-card/40 text-ink-foreground backdrop-blur-sm hover:bg-ink-card hover:border-ink-foreground/60`,
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
