"use client";
import { useApp } from "./app-shell";
import { redesignDictionaries } from "@/lib/i18n";
export function HomeScreen() { const { lang } = useApp(); return <h1 className="text-3xl font-bold">{redesignDictionaries[lang].home}</h1>; }
