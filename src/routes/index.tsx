import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase";

import { toast } from "sonner";
import { Search, Sparkles } from "lucide-react";
import baseTACO from "../data/taco.json"; 
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


      <div className="relative mx-auto w-full max-w-[440px]">
        {/* Sticky header */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
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
            <div className="mt-4 flex rounded-full bg-white/[0.05] p-1">
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
                      ? "animate-tab-pop flex-1 rounded-full bg-foreground px-4 py-2 font-display text-sm font-semibold text-background"
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
                className="w-full rounded-full bg-white/[0.05] py-2.5 pl-10 pr-3 text-sm text-foreground ring-1 ring-white/[0.07] outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50"
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
            <div className="mt-2 rounded-3xl border border-dashed border-input bg-white/[0.02] p-6 text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-full bg-white/[0.05] text-lg text-muted-foreground">
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
                  className="animate-card-in rounded-2xl bg-card p-4 ring-1 ring-white/[0.05] transition-transform active:scale-[0.99]"
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
                      className="grid size-7 shrink-0 place-items-center rounded-full bg-white/[0.06] text-sm text-muted-foreground transition-colors hover:bg-primary/15 hover:text-primary"
                    >
                      ×
                    </button>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-semibold text-primary">
                      {entry.detail}
                    </span>
                    {entry.tab === "refeicoes" && entry.kcal > 0 && (
                      <span className="flex-1">
                        <span className="block h-1.5 rounded-full bg-white/[0.08]">
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
        className="fixed bottom-6 z-40 grid size-14 place-items-center rounded-2xl bg-primary font-display text-2xl font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform active:scale-95"
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

interface ExerciseNinjaResult {
  name: string;
  muscle: string;
  equipment: string;
  difficulty: string;
  instructions: string;
}

const MUSCLE_TRANSLATIONS: Record<string, string> = {
  abdominals: "Abdômen",
  abductors: "Abdutores",
  adductors: "Adutores",
  biceps: "Bíceps",
  calves: "Panturrilhas",
  chest: "Peito",
  forearms: "Antebraços",
  glutes: "Glúteos",
  hamstrings: "Posterior de coxa",
  lats: "Dorsais / Costas",
  lower_back: "Lombar",
  middle_back: "Costas",
  neck: "Pescoço",
  quadriceps: "Quadríceps",
  traps: "Trapézio",
  triceps: "Tríceps",
};

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
  const [buscandoExercicio, setBuscandoExercicio] = useState(false);
  const [exerciciosNinja, setExerciciosNinja] = useState<ExerciseNinjaResult[]>([]);

  const canSave = name.trim().length > 0;

  // Busca na base local de forma segura, sem travar o modal com alerts
  const buscarNaBaseLocal = (alimentoEscolhido?: (typeof baseTACO)[number]) => {
    if (alimentoEscolhido) {
      setName(alimentoEscolhido.description);
      setProteina(String(alimentoEscolhido.protein_g));
      setKcal(String(alimentoEscolhido.energy_kcal));
      toast.success(`Valores aplicados para: ${alimentoEscolhido.description}`);
      return;
    }

    const termoBusca = name.toLowerCase().trim();
    if (!termoBusca) {
      toast.warning("Digite o nome de um alimento para buscar.");
      return;
    }

    const resultados = baseTACO.filter((item) =>
      item.description.toLowerCase().includes(termoBusca),
    );

    if (resultados.length > 0) {
      const produto = resultados[0];
      setName(produto.description);
      setProteina(String(produto.protein_g));
      setKcal(String(produto.energy_kcal));
      toast.success(`Alimento encontrado: ${produto.description}`);
    } else {
      toast.info("Alimento não encontrado na base rápida. Preencha os macros manualmente.");
    }
  };

  const aplicarExercicioNinja = (ex: ExerciseNinjaResult) => {
    setName(ex.name);
    const musculoPt = MUSCLE_TRANSLATIONS[ex.muscle.toLowerCase()] || ex.muscle;
    const equipPt = ex.equipment ? ex.equipment.replace(/_/g, " ") : "";
    setNote(`${musculoPt}${equipPt ? ` · ${equipPt}` : ""}`);
    setExerciciosNinja([]);
    toast.success(`Exercício aplicado: ${ex.name}`);
  };

  // API NINJAS - Busca de exercícios segura via backend
  const buscarNaAPINinjas = async () => {
    const termo = name.trim();
    if (!termo) {
      toast.warning("Digite o nome do exercício em inglês (ex: bench press, squat, curl, pushups).");
      return;
    }

    setBuscandoExercicio(true);

    try {
      // Chama a rota de servidor interna /api/exercise
      const response = await fetch(`/api/exercise?name=${encodeURIComponent(termo)}`);

      if (!response.ok) {
        throw new Error(`Erro na API (${response.status})`);
      }

      const data: ExerciseNinjaResult[] = await response.json();

      if (data && data.length > 0) {
        setExerciciosNinja(data.slice(0, 4));
        aplicarExercicioNinja(data[0]);
      } else {
        toast.info("Nenhum exercício encontrado. Tente buscar o termo em inglês (ex: pushups, squat, bench press).");
      }
    } catch (error) {
      console.error("Erro ao buscar exercícios:", error);
      toast.error("Falha ao comunicar com o servidor de exercícios.");
    } finally {
      setBuscandoExercicio(false);
    }
  };

  const sugestoes = useMemo(() => {
    if (isExercise || !name.trim() || name.length < 2) return [];
    const q = name.toLowerCase().trim();
    return baseTACO
      .filter((item) => item.description.toLowerCase().includes(q))
      .slice(0, 4);
  }, [name, isExercise]);

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
    "w-full rounded-xl bg-white/[0.05] px-3.5 py-2.5 text-sm text-foreground ring-1 ring-input outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50";

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="animate-fade-in absolute inset-0 bg-black/60 backdrop-blur-[2px]"
      />
      <form
        onSubmit={submit}
        className="animate-sheet-in absolute inset-x-0 bottom-0 mx-auto max-w-[440px] rounded-t-3xl bg-card px-5 pb-7 pt-4 ring-1 ring-white/[0.06]"
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
          {/* CAMPO DE NOME COM BOTÃO DE BUSCA */}
          <div className="space-y-1.5">
            <div className="flex gap-2">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isExercise ? "Nome do exercício (ex: pushups, curl)" : "Ex: Aveia, Frango, Arroz..."}
                className={`${inputCls} flex-1`}
              />

              {isExercise ? (
                <button
                  type="button"
                  onClick={buscarNaAPINinjas}
                  disabled={buscandoExercicio || !name.trim()}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3.5 text-xs font-semibold text-primary-foreground transition-transform active:scale-95 disabled:opacity-50"
                >
                  <Search className="size-3.5" />
                  {buscandoExercicio ? "..." : "Buscar"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => buscarNaBaseLocal()}
                  disabled={!name.trim()}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3.5 text-xs font-semibold text-primary-foreground transition-transform active:scale-95 disabled:opacity-50"
                >
                  <Search className="size-3.5" />
                  Buscar
                </button>
              )}
            </div>

            {/* Sugestões de exercícios retornados pela API Ninjas */}
            {isExercise && exerciciosNinja.length > 1 && (
              <div className="rounded-xl border border-white/[0.08] bg-black/40 p-1.5 shadow-md">
                <p className="px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Exercícios encontrados (API)
                </p>
                <div className="flex flex-col gap-1">
                  {exerciciosNinja.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => aplicarExercicioNinja(item)}
                      className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs text-foreground transition-colors hover:bg-white/[0.08]"
                    >
                      <span className="font-medium truncate mr-2">{item.name}</span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {MUSCLE_TRANSLATIONS[item.muscle.toLowerCase()] || item.muscle}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sugestões rápidas da base local para refeições */}
            {!isExercise && sugestoes.length > 0 && (
              <div className="rounded-xl border border-white/[0.08] bg-black/40 p-1.5 shadow-md">
                <p className="px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Sugestões da base
                </p>
                <div className="flex flex-col gap-1">
                  {sugestoes.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => buscarNaBaseLocal(item)}
                      className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs text-foreground transition-colors hover:bg-white/[0.08]"
                    >
                      <span className="font-medium truncate mr-2">{item.description}</span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {item.energy_kcal} kcal · {item.protein_g}g prot
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

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
          className="mt-5 w-full rounded-2xl bg-primary py-3.5 font-display text-base font-semibold text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-40"
        >
          {isExercise ? "Registrar exercício" : "Registrar refeição"}
        </button>
      </form>
    </div>
  );
}
