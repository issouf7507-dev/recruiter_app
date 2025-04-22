import { ReactNode } from "react";

interface FormProps {
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  className?: string;
}

export function CustomForm({ children, onSubmit, className = "" }: FormProps) {
  return (
    <form onSubmit={onSubmit} className={`space-y-6 ${className}`}>
      {children}
    </form>
  );
}

interface FormGroupProps {
  label: ReactNode;
  error?: string;
  children: ReactNode;
}

export function FormGroup({ label, error, children }: FormGroupProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export function CustomInput({ error, className = "", ...props }: InputProps) {
  return (
    <input
      className={`block w-full rounded-md border-gray-300  p-2 border focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
        error ? "border-red-500" : ""
      } ${className}`}
      {...props}
    />
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  isLoading?: boolean;
}

export function CustomButton({
  children,
  variant = "primary",
  isLoading = false,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex justify-center rounded-md border px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    primary:
      "border-transparent bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
    secondary:
      "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-indigo-500",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? "Chargement..." : children}
    </button>
  );
}
