import { Card } from "@/components/ui/card";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <Card className="w-full max-w-md shadow-lg border border-zinc-200 dark:border-zinc-800">
        {children}
      </Card>
    </div>
  );
}