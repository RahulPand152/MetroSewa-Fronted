"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SocialLink {
  name: string;
  href: string;
}

interface FooterLink {
  name: string;
  Icon?: LucideIcon | React.FC<React.SVGProps<SVGSVGElement>>;
  href?: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface FooterProps extends React.HTMLAttributes<HTMLDivElement> {
  brand: {
    name: string;
    description: string;
  };
  columns: FooterColumn[];
  copyright?: string;
}

export const Footer = React.forwardRef<HTMLDivElement, FooterProps>(
  ({ className, brand, columns, copyright, ...props }, ref) => {
    return (
      <footer ref={ref} className={cn("border-t bg-background", className)} {...props}>
        <div className="max-w-screen-xl mx-auto px-4 py-12">

          {/* Top Grid */}
          <div className="grid grid-cols-1 gap-10 md:grid-cols-4">

            {/* Brand */}
            <div>
              <h2 className="text-lg font-semibold">{brand.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {brand.description}
              </p>
            </div>

            {/* Columns */}
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="text-sm font-semibold">{col.title}</h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {col.links.map(({ name, Icon, href }) => (
                    <li key={name}>
                      <a
                        href={href || "#"}
                        className="flex items-center gap-2 hover:text-foreground transition"
                      >
                        {Icon && <Icon className="h-4 w-4" />}
                        {name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom */}
          <div className="mt-10 border-t pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">{copyright}</p>
            <div className="flex gap-4 text-muted-foreground">
              👍 🔗
            </div>
          </div>

        </div>
      </footer>
    );
  }
);

Footer.displayName = "Footer";
