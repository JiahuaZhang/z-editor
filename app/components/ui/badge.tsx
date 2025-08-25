import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
  onDelete?: () => void;
  deletable?: boolean;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className = "", variant = "default", onDelete, deletable = false, children, ...props }, ref) => {
    const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

    const variantClasses = {
      default: "border-transparent bg-blue-500 text-white hover:bg-blue-600",
      secondary: "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200",
      destructive: "border-transparent bg-red-500 text-white hover:bg-red-600",
      outline: "border-gray-300 text-gray-900 hover:bg-gray-50"
    };

    return (
      <div
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${deletable ? 'group relative' : ''} ${className}`}
        {...props}
      >
        {children}
        {deletable && onDelete && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
            }}
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-gray-600 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center hover:bg-gray-800 shadow-sm"
            aria-label="Remove tag"
          >
            <span className="text-xs leading-none">×</span>
          </button>
        )}
      </div>
    );
  }
);

Badge.displayName = "Badge";

export { Badge };