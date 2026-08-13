export default function AdminPendingPage({ title }: { title: string }) {
  return (
    <section className="border-primary/10 bg-bg rounded-xl border p-8 shadow-sm">
      <h1 className="text-primary text-2xl font-bold">{title}</h1>
      <p className="text-primary/65 mt-2">Memuat area administrasi...</p>
    </section>
  );
}
