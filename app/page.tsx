import { UserButton } from "@clerk/nextjs";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
      <h1 className="text-4xl font-black tracking-tight text-white">Login feito</h1>
      <UserButton />
    </main>
  );
}
