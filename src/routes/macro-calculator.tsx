import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useId } from "react";
import {
  Apple,
  ArrowRight,
  Calculator,
  CheckCircle2,
  ChevronRight,
  Flame,
  Info,
  PieChart as PieIcon,
  Scale,
  Sparkles,
  Target,
  Utensils,
  Zap,
} from "lucide-react";

import { storage } from "@/utils/storage";
import { PaidAccessGate } from "@/components/paid-access-gate";

export const Route = createFileRoute("/macro-calculator")({
  head: () => ({
    meta: [
      { title: "Calculadora de Macronutrientes — Forjar Nutrição" },
      {
        name: "description",
        content:
          "Calcule suas proteínas, carboidratos e gorduras diárias recomendadas para potencializar seus treinos e atingir seus objetivos de hipertrofia ou emagrecimento.",
      },
    ],
  }),
  component: ProtectedMacroCalculatorPage,
});

function ProtectedMacroCalculatorPage() {
  return (
    <PaidAccessGate>
      <MacroCalculatorPage />
    </PaidAccessGate>
  );
}

type Gender = "male" | "female";
type ActivityLevel = "sedentary" | "light" | "moderate" | "heavy" | "extreme";
type Goal = "cut" | "maintain" | "bulk";

function MacroCalculatorPage() {
  const genderMaleId = useId();
  const genderFemaleId = useId();
  const ageId = useId();
  const weightId = useId();
  const heightId = useId();
  const activityLevelId = useId();

  const savedProfile = storage.getProfile();

  const [gender, setGender] = useState<Gender>(savedProfile?.sex === "female" ? "female" : "male");
  const [age, setAge] = useState<number>(savedProfile?.age || 26);
  const [weight, setWeight] = useState<number>(savedProfile?.weightKg || 75);
  const [height, setHeight] = useState<number>(savedProfile?.heightCm || 175);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderate");
  const [goal, setGoal] = useState<Goal>("bulk");

  // Cálculos Nutricionais (Fórmula de Mifflin-St Jeor)
  const bmr =
    gender === "male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

  const activityMultipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    heavy: 1.725,
    extreme: 1.9,
  };

  const tdee = Math.round(bmr * activityMultipliers[activityLevel]);

  let targetCalories = tdee;
  if (goal === "cut") targetCalories = Math.max(1200, Math.round(tdee - 450));
  if (goal === "bulk") targetCalories = Math.round(tdee + 350);

  // Distribuição de Macronutrientes
  const proteinFactor = goal === "cut" ? 2.2 : goal === "bulk" ? 2.0 : 2.0;
  const proteinGrams = Math.round(weight * proteinFactor);
  const proteinCalories = proteinGrams * 4;

  const fatFactor = 0.9;
  const fatGrams = Math.round(weight * fatFactor);
  const fatCalories = fatGrams * 9;

  const remainingCalories = Math.max(0, targetCalories - (proteinCalories + fatCalories));
  const carbGrams = Math.round(remainingCalories / 4);
  const carbCalories = carbGrams * 4;

  // Proporções percentuais
  const totalMacroCalories = proteinCalories + fatCalories + carbCalories || 1;
  const proteinPercent = Math.round((proteinCalories / totalMacroCalories) * 100);
  const fatPercent = Math.round((fatCalories / totalMacroCalories) * 100);
  const carbPercent = Math.round((carbCalories / totalMacroCalories) * 100);

  return (
    <div className="relative overflow-hidden bg-background py-12">
      {/* Iluminação de Fundo */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-brand/10 blur-[130px]" />
        <div className="absolute top-[50%] right-[-5%] h-[450px] w-[450px] rounded-full bg-emerald-500/10 blur-[140px]" />
      </div>

      <div className="mx-auto max-w-6xl px-4">
        {/* Cabeçalho */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-xs font-semibold text-brand backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Nutrição Científica Integrada</span>
          </div>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Calculadora de{" "}
            <span className="bg-gradient-to-r from-brand via-brand/90 to-emerald-400 bg-clip-text text-transparent">
              Macronutrientes
            </span>
          </h1>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base leading-relaxed">
            Descubra a quantidade exata de calorias, proteínas, carboidratos e gorduras necessárias para acelerar a construção de músculos e a queimada de gordura.
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-12">
          {/* Coluna Esquerda: Formulário de Parâmetros */}
          <div className="lg:col-span-5 rounded-3xl border border-border/80 bg-card/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
            <div className="flex items-center gap-2 border-b border-border/60 pb-4 mb-6">
              <Calculator className="h-5 w-5 text-brand" />
              <h2 className="text-lg font-bold">Seus Dados Biométricos</h2>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
              {/* Sexo */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Sexo Biológico
                </label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    id={genderMaleId}
                    onClick={() => setGender("male")}
                    className={`rounded-2xl py-3 text-sm font-semibold border transition ${
                      gender === "male"
                        ? "border-brand bg-brand/15 text-brand shadow-sm"
                        : "border-border bg-background/50 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Masculino
                  </button>
                  <button
                    type="button"
                    id={genderFemaleId}
                    onClick={() => setGender("female")}
                    className={`rounded-2xl py-3 text-sm font-semibold border transition ${
                      gender === "female"
                        ? "border-brand bg-brand/15 text-brand shadow-sm"
                        : "border-border bg-background/50 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Feminino
                  </button>
                </div>
              </div>

              {/* Idade, Peso e Altura */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor={ageId} className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Idade
                  </label>
                  <input
                    id={ageId}
                    type="number"
                    min={12}
                    max={90}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value) || 0)}
                    className="mt-2 w-full rounded-2xl border border-border bg-background/50 px-3 py-3 text-center text-sm font-bold outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label htmlFor={weightId} className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Peso (kg)
                  </label>
                  <input
                    id={weightId}
                    type="number"
                    min={30}
                    max={250}
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value) || 0)}
                    className="mt-2 w-full rounded-2xl border border-border bg-background/50 px-3 py-3 text-center text-sm font-bold outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label htmlFor={heightId} className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Altura (cm)
                  </label>
                  <input
                    id={heightId}
                    type="number"
                    min={100}
                    max={230}
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value) || 0)}
                    className="mt-2 w-full rounded-2xl border border-border bg-background/50 px-3 py-3 text-center text-sm font-bold outline-none focus:border-brand"
                  />
                </div>
              </div>

              {/* Nível de Atividade */}
              <div>
                <label htmlFor={activityLevelId} className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Nível de Atividade Física
                </label>
                <select
                  id={activityLevelId}
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                  className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold outline-none focus:border-brand"
                >
                  <option value="sedentary">Sedentário (pouco ou nenhum exercício)</option>
                  <option value="light">Leve (exercício 1 a 3x por semana)</option>
                  <option value="moderate">Moderado (exercício 3 a 5x por semana)</option>
                  <option value="heavy">Intenso (exercício 6 a 7x por semana)</option>
                  <option value="extreme">Muito Intenso (treino diário duplo / atleta)</option>
                </select>
              </div>

              {/* Objetivo Principal */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Objetivo Principal
                </label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {[
                    { id: "cut", label: "Emagrecer", desc: "Definição" },
                    { id: "maintain", label: "Manter", desc: "Equilíbrio" },
                    { id: "bulk", label: "Hipertrofia", desc: "Ganho" },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGoal(g.id as Goal)}
                      className={`rounded-2xl p-3 text-center border transition ${
                        goal === g.id
                          ? "border-brand bg-brand/15 text-brand font-bold"
                          : "border-border bg-background/50 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <div className="text-xs font-bold">{g.label}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{g.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>

          {/* Coluna Direita: Dashboard de Resultados Nutricionais */}
          <div className="lg:col-span-7 space-y-6">
            {/* Meta Calórica Destaque */}
            <div className="rounded-3xl border border-border/80 bg-card/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-5">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-brand">Meta Recomendada</span>
                  <h2 className="text-3xl font-extrabold font-display mt-1 text-foreground">
                    {targetCalories.toLocaleString("pt-BR")}{" "}
                    <span className="text-lg font-normal text-muted-foreground">kcal / dia</span>
                  </h2>
                </div>

                <div className="flex gap-4 text-xs">
                  <div className="rounded-2xl border border-border bg-background/60 px-4 py-2.5">
                    <span className="block text-muted-foreground">Metabolismo Basal (TMB)</span>
                    <span className="font-mono font-bold text-foreground">{bmr} kcal</span>
                  </div>
                  <div className="rounded-2xl border border-border bg-background/60 px-4 py-2.5">
                    <span className="block text-muted-foreground">Gasto Diário (GET)</span>
                    <span className="font-mono font-bold text-brand">{tdee} kcal</span>
                  </div>
                </div>
              </div>

              {/* Cards de Macronutrientes */}
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {/* Proteínas */}
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4">
                  <div className="flex items-center justify-between text-rose-400 font-bold text-xs">
                    <span>Proteínas</span>
                    <span>{proteinPercent}%</span>
                  </div>
                  <div className="mt-2 text-2xl font-extrabold font-mono text-foreground">
                    {proteinGrams} <span className="text-sm font-normal text-muted-foreground">g</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    {proteinCalories} kcal ({proteinFactor}g/kg)
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-rose-950/40 overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-500"
                      style={{ width: `${proteinPercent}%` }}
                    />
                  </div>
                </div>

                {/* Carboidratos */}
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                  <div className="flex items-center justify-between text-amber-400 font-bold text-xs">
                    <span>Carboidratos</span>
                    <span>{carbPercent}%</span>
                  </div>
                  <div className="mt-2 text-2xl font-extrabold font-mono text-foreground">
                    {carbGrams} <span className="text-sm font-normal text-muted-foreground">g</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    {carbCalories} kcal (Energia principal)
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-amber-950/40 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${carbPercent}%` }}
                    />
                  </div>
                </div>

                {/* Gorduras */}
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <div className="flex items-center justify-between text-emerald-400 font-bold text-xs">
                    <span>Gorduras Boas</span>
                    <span>{fatPercent}%</span>
                  </div>
                  <div className="mt-2 text-2xl font-extrabold font-mono text-foreground">
                    {fatGrams} <span className="text-sm font-normal text-muted-foreground">g</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    {fatCalories} kcal (Saúde hormonal)
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-emerald-950/40 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${fatPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Distribuição Sugerida por Refeição */}
              <div className="mt-8 pt-6 border-t border-border/60">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                  <Utensils className="h-4 w-4 text-brand" /> Sugestão de Divisão em 4 Refeições
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {[
                    { title: "Café da Manhã", pct: 25 },
                    { title: "Almoço", pct: 35 },
                    { title: "Lanche da Tarde", pct: 15 },
                    { title: "Jantar", pct: 25 },
                  ].map((m) => (
                    <div key={m.title} className="rounded-xl border border-border/60 bg-background/50 p-3">
                      <div className="font-semibold text-foreground">{m.title}</div>
                      <div className="text-brand font-mono font-bold mt-1">
                        {Math.round((targetCalories * m.pct) / 100)} kcal
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        ~{Math.round((proteinGrams * m.pct) / 100)}g prot
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabela de Alimentos Sugeridos */}
            <div className="rounded-3xl border border-border/80 bg-card/60 p-6 backdrop-blur-xl">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground mb-4">
                <Apple className="h-4 w-4 text-brand" /> Fontes Recomendadas de Macronutrientes
              </div>
              <div className="grid gap-3 sm:grid-cols-3 text-xs">
                <div className="rounded-2xl border border-border/60 bg-background/40 p-3">
                  <div className="font-bold text-rose-400 mb-2">Proteínas de Qualidade</div>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Peito de Frango (31g/100g)</li>
                    <li>• Patinho Moído (30g/100g)</li>
                    <li>• Ovos Inteiros (6g/unidade)</li>
                    <li>• File de Tilápia (26g/100g)</li>
                    <li>• Whey Protein (24g/dose)</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/40 p-3">
                  <div className="font-bold text-amber-400 mb-2">Carboidratos Limpos</div>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Arroz Branco/Integral</li>
                    <li>• Batata Doce / Inglesa</li>
                    <li>• Aveia em Flocos</li>
                    <li>• Tapioca / Pão Integral</li>
                    <li>• Frutas (Banana, Maçã)</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/40 p-3">
                  <div className="font-bold text-emerald-400 mb-2">Gorduras Saudáveis</div>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Azeite de Oliva Extra Virgem</li>
                    <li>• Pasta de Amendoim</li>
                    <li>• Abacate / Avocado</li>
                    <li>• Castanhas e Nozes</li>
                    <li>• Gema de Ovo</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/60 pt-4 text-xs text-muted-foreground">
                <span>Combine a dieta calculada com seu treino no Forjar para obter o máximo de hipertrofia.</span>
                <Link
                  to="/quiz"
                  className="inline-flex items-center gap-1.5 font-semibold text-brand hover:underline"
                >
                  <span>Montar treino agora</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
