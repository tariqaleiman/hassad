export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-paper-sunken/40 flex items-center justify-center p-3 sm:p-6">
      {children}
    </div>
  );
}
