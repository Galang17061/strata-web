import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-content flex-col gap-8 px-6 py-16">
      <header className="flex items-center justify-between">
        <span className="text-h3 font-bold tracking-tight">Strata</span>
        <ThemeToggle />
      </header>
      <section className="flex flex-col gap-4">
        <h1 className="text-display font-extrabold tracking-tight">
          Know how likely your system still works.
        </h1>
        <p className="max-w-2xl text-body text-foreground-muted">
          Model your system as layers of blocks, wire them the way they really connect, and let
          Strata score every layer from the parts up.
        </p>
        <p className="font-mono text-numeric-lg tabular-nums text-foreground">0.94210000</p>
      </section>
    </main>
  );
}
