import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Diário de Treinos" },
      {
        name: "description",
        content:
          "Diário mobile para registrar exercícios e refeições do dia, com busca rápida e botão de adicionar.",
      },
      { property: "og:title", content: "Diário de Treinos" },
      {
        property: "og:description",
        content: "Registre exercícios e refeições do dia em um diário rápido e simples.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Tab = "exercicios" | "refeicoes";

interface Entry {
  id: string;
  tab: Tab;
  name: string;
  note: string;
  detail: string;
  kcal: number;
  at: number;
}

const STORAGE_KEY = "diario-treinos:entries";

const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const minutesAgo = (m: number) => Date.now() - m * 60_000;

function seedEntries(): Entry[] {
  return [
    {
      id: uid(),
      tab: "exercicios",
      name: "Supino reto",
      note: "Peito",
      detail: "4 × 12 · 80 kg",
      kcal: 0,
      at: minutesAgo(35),
    },
    {
      id: uid(),
      tab: "exercicios",
      name: "Leg press",
      note: "Quadríceps",
      detail: "4 × 12 · 140 kg",
      kcal: 0,
      at: minutesAgo(95),
    },
    {
      id: uid(),
      tab: "exercicios",
      name: "Remada curvada",
      note: "Costas",
      detail: "3 × 10 · 50 kg",
      kcal: 0,
      at: minutesAgo(150),
    },
    {
      id: uid(),
      tab: "refeicoes",
      name: "Peito de frango grelhado",
      note: "Almoço",
      detail: "410 kcal · 42 g proteína",
      kcal: 410,
      at: minutesAgo(210),
    },
    {
      id: uid(),
      tab: "refeicoes",
      name: "Overnight oats",
      note: "Café da manhã",
      detail: "320 kcal · 18 g proteína",
      kcal: 320,
      at: minutesAgo(420),
    },
  ];
}

const timeFmt = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

const numFmt = new Intl.NumberFormat("pt-BR");

const weekdayFmt = new Intl.DateTimeFormat("pt-BR", { weekday: "long" });
const dateFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
});

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function isToday(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

function Index() {
  const [tab, setTab] = useState<Tab>("exercicios");
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    let loaded: Entry[] | null = null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) loaded = JSON.parse(raw) as Entry[];
    } catch {
      loaded = null;
    }
    setEntries(loaded ?? seedEntries());
  }, []);

  useEffect(() => {
    if (!entries) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const list = useMemo(() => {
    if (!entries) return [];
    const q = query.trim().toLowerCase();
    return entries
      .filter((e) => e.tab === tab)
      .filter(
        (e) =>
          !q ||
          e.name.toLowerCase().includes(q) ||
          e.note.toLowerCase().includes(q),
      )
      .sort((a, b) => b.at - a.at);
  }, [entries, tab, query]);

  const kcalToday = useMemo(
    () =>
      (entries ?? [])
        .filter((e) => e.tab === "refeicoes" && isToday(e.at))
        .reduce((sum, e) => sum + e.kcal, 0),
    [entries],
  );

  const addEntry = (entry: Omit<Entry, "id" | "at">) => {
    setEntries((prev) => [
      { ...entry, id: uid(), at: Date.now() },
      ...(prev ?? []),
    ]);
    setSheetOpen(false);
    setQuery("");
  };

  const removeEntry = (id: string) => {
    setEntries((prev) => (prev ?? []).filter((e) => e.id !== id));
  };

  const now = new Date();
  const listLabel = tab === "exercicios" ? "Treinos de hoje" : "Refeições de hoje";

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-background font-body text-foreground">
      {/* soft ambient blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 -top-24 size-72 rounded-full bg-primary/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-40 size-64 rounded-full bg-leaf/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-24 left-1/3 size-56 rounded-full bg-card/60 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-[440px]">
        {/* Sticky header */}
        <header className="sticky top-0 z-30 border-b border-card/60 bg-background/60 backdrop-blur-xl">
          <div className="px-5 pb-3 pt-4">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {cap(weekdayFmt.format(now))}
                </p>
                <h1 className="font-display text-[26px] font-semibold leading-tight">
                  {cap(dateFmt.format(now))}
                </h1>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-display text-[22px] font-semibold leading-none text-primary">
                  {numFmt.format(kcalToday)}
                </p>
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  kcal hoje
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-4 flex rounded-full bg-foreground/[0.06] p-1 ring-1 ring-black/5">
              {(
                [
                  ["exercicios", "Exercícios"],
                  ["refeicoes", "Refeições"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className={
                    key === tab
                      ? "animate-tab-pop flex-1 rounded-full bg-card px-4 py-2 font-display text-sm font-semibold text-foreground shadow-sm ring-1 ring-black/5"
                      : "flex-1 rounded-full px-4 py-2 font-display text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  }
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative mt-3">
              <span
                aria-hidden="true"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base text-muted-foreground"
              >
                ⌕
              </span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  tab === "exercicios"
                    ? "Buscar exercício"
                    : "Buscar refeição"
                }
                className="w-full rounded-full bg-card/70 py-2.5 pl-10 pr-3 text-sm text-foreground ring-1 ring-black/5 outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>
        </header>

        {/* List */}
        <main className="px-4 pb-36 pt-4">
          <div className="flex items-center justify-between px-1 pb-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {listLabel}
            </p>
            <p className="text-[11px] font-medium text-muted-foreground">
              {list.length} {list.length === 1 ? "registro" : "registros"}
            </p>
          </div>

          {entries !== null && list.length === 0 ? (
            <div className="mt-2 rounded-3xl border border-dashed border-input bg-card/40 p-6 text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-full bg-foreground/5 text-lg text-muted-foreground">
                +
              </div>
              <p className="mt-3 font-display text-sm font-semibold">
                {query
                  ? "Nada encontrado"
                  : "Nada por aqui ainda"}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                {query
                  ? `Nenhum resultado para “${query}” nesta aba.`
                  : "Toque no + para registrar seu primeiro exercício ou refeição do dia."}
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {list.map((entry, i) => (
                <li
                  key={entry.id}
                  className="animate-card-in rounded-2xl bg-card/70 p-4 ring-1 ring-black/5 backdrop-blur-md transition-transform active:scale-[0.99]"
                  style={{ animationDelay: `${Math.min(i, 6) * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-display text-lg font-semibold leading-tight">
                        {entry.name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {entry.note} · {timeFmt.format(entry.at)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeEntry(entry.id)}
                      aria-label={`Remover ${entry.name}`}
                      className="grid size-7 shrink-0 place-items-center rounded-full bg-foreground/5 text-sm text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      ×
                    </button>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                      {entry.detail}
                    </span>
                    {entry.tab === "refeicoes" && entry.kcal > 0 && (
                      <span className="flex-1">
                        <span className="block h-1.5 rounded-full bg-foreground/[0.07]">
                          <span
                            className="block h-full rounded-full bg-leaf"
                            style={{
                              width: `${Math.min(100, Math.round((entry.kcal / 700) * 100))}%`,
                            }}
                          />
                        </span>
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>

      {/* Floating add button */}
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        aria-label="Adicionar registro"
        className="fixed bottom-6 z-40 grid size-14 place-items-center rounded-2xl bg-primary font-display text-2xl font-semibold text-primary-foreground shadow-lg shadow-primary/30 ring-1 ring-white/20 transition-transform active:scale-95"
        style={{ right: "max(1.5rem, calc(50% - 196px))" }}
      >
        +
      </button>

      {/* Quick-add sheet */}
      {sheetOpen && (
        <AddSheet tab={tab} onClose={() => setSheetOpen(false)} onSave={addEntry} />
      )}
    </div>
  );
}

function AddSheet({
  tab,
  onClose,
  onSave,
}: {
  tab: Tab;
  onClose: () => void;
  onSave: (entry: Omit<Entry, "id" | "at">) => void;
}) {
  const isExercise = tab === "exercicios";

  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [series, setSeries] = useState("");
  const [reps, setReps] = useState("");
  const [carga, setCarga] = useState("");
  const [kcal, setKcal] = useState("");
  const [proteina, setProteina] = useState("");

  const canSave = name.trim().length > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    if (isExercise) {
      const s = series.trim() || "3";
      const r = reps.trim() || "10";
      const c = carga.trim();
      onSave({
        tab,
        name: name.trim(),
        note: note.trim() || "Treino",
        detail: `${s} × ${r}${c ? ` · ${c} kg` : ""}`,
        kcal: 0,
      });
    } else {
      const k = Number.parseInt(kcal, 10);
      const p = proteina.trim();
      onSave({
        tab,
        name: name.trim(),
        note: note.trim() || "Refeição",
        detail: `${Number.isFinite(k) ? k : 0} kcal${p ? ` · ${p} g proteína` : ""}`,
        kcal: Number.isFinite(k) ? k : 0,
      });
    }
  };

  const inputCls =
    "w-full rounded-xl bg-background/70 px-3.5 py-2.5 text-sm text-foreground ring-1 ring-input outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40";

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="animate-fade-in absolute inset-0 bg-foreground/25 backdrop-blur-[2px]"
      />
      <form
        onSubmit={submit}
        className="animate-sheet-in absolute inset-x-0 bottom-0 mx-auto max-w-[440px] rounded-t-3xl bg-card/80 px-5 pb-7 pt-4 ring-1 ring-black/5 backdrop-blur-2xl"
      >
        <div
          aria-hidden="true"
          className="mx-auto mb-4 size-1 rounded-full bg-foreground/20"
        />
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            {isExercise ? "Novo exercício" : "Nova refeição"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="grid size-8 place-items-center rounded-full bg-foreground/5 text-muted-foreground transition-colors hover:text-foreground"
          >
            ×
          </button>
        </div>

        <div className="mt-4 space-y-2.5">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isExercise ? "Nome do exercício" : "Nome da refeição"}
            className={inputCls}
          />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              isExercise ? "Grupo muscular (ex.: Peito)" : "Momento (ex.: Almoço)"
            }
            className={inputCls}
          />

          {isExercise ? (
            <div className="grid grid-cols-3 gap-2">
              <input
                value={series}
                onChange={(e) => setSeries(e.target.value)}
                inputMode="numeric"
                placeholder="Séries"
                className={inputCls}
              />
              <input
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                inputMode="numeric"
                placeholder="Reps"
                className={inputCls}
              />
              <input
                value={carga}
                onChange={(e) => setCarga(e.target.value)}
                inputMode="decimal"
                placeholder="Carga kg"
                className={inputCls}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <input
                value={kcal}
                onChange={(e) => setKcal(e.target.value)}
                inputMode="numeric"
                placeholder="Calorias"
                className={inputCls}
              />
              <input
                value={proteina}
                onChange={(e) => setProteina(e.target.value)}
                inputMode="numeric"
                placeholder="Proteína (g)"
                className={inputCls}
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!canSave}
          className="mt-5 w-full rounded-2xl bg-primary py-3.5 font-display text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform active:scale-[0.98] disabled:opacity-40"
        >
          {isExercise ? "Registrar exercício" : "Registrar refeição"}
        </button>
      </form>
    </div>
  );
}
