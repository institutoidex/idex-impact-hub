// Fotos reais do Instituto IDEX (projeto Talento Brasil).
// Os arquivos ficam no CDN da Lovable; aqui só apontamos os endereços e as
// descrições (alt) usadas para acessibilidade.

import f1 from "@/assets/fotos/idex-1.jpg.asset.json";
import f2 from "@/assets/fotos/idex-2.jpg.asset.json";
import f3 from "@/assets/fotos/idex-3.jpg.asset.json";
import f4 from "@/assets/fotos/idex-4.jpg.asset.json";
import f5 from "@/assets/fotos/idex-5.jpg.asset.json";
import f6 from "@/assets/fotos/idex-6.jpg.asset.json";
import f7 from "@/assets/fotos/idex-7.jpg.asset.json";
import f8 from "@/assets/fotos/idex-8.jpg.asset.json";
import f9 from "@/assets/fotos/idex-9.jpg.asset.json";
import f10 from "@/assets/fotos/idex-10.jpg.asset.json";
import f11 from "@/assets/fotos/idex-11.jpg.asset.json";
import f12 from "@/assets/fotos/idex-12.jpg.asset.json";
import f13 from "@/assets/fotos/idex-13.jpg.asset.json";
import f14 from "@/assets/fotos/idex-14.jpg.asset.json";
import f15 from "@/assets/fotos/idex-15.jpg.asset.json";
import f16 from "@/assets/fotos/idex-16.jpg.asset.json";
import f17 from "@/assets/fotos/idex-17.jpg.asset.json";
import f18 from "@/assets/fotos/idex-18.jpg.asset.json";
import f19 from "@/assets/fotos/idex-19.jpg.asset.json";
import f20 from "@/assets/fotos/idex-20.jpg.asset.json";
import f21 from "@/assets/fotos/idex-21.jpg.asset.json";
import f22 from "@/assets/fotos/idex-22.jpg.asset.json";

import { VARIANTES } from "@/data/fotos-variantes";
import { LOCALE_PADRAO, type Locale } from "@/i18n/locales";
import { useLocale } from "@/i18n/mensagens";

export interface Foto {
  /** URL padrão (WebP grande) usada como src */
  url: string;
  /** Descrição em português (fallback e referência) */
  alt: string;
  /** Descrição por idioma; en-US/es-ES opcionais (pt-BR usa `alt`) */
  altPorIdioma?: Partial<Record<Locale, string>> | undefined;
  /** Conjunto responsivo 480/960/1600 em WebP */
  srcSet?: string | undefined;
  largura?: number | undefined;
  altura?: number | undefined;
}

/** Descrição (alt) da foto no idioma informado, com fallback para o português. */
export function altDaFoto(foto: Foto, locale: Locale): string {
  if (locale === LOCALE_PADRAO) return foto.alt;
  return foto.altPorIdioma?.[locale] ?? foto.alt;
}

/** Hook: descrição (alt) da foto já no idioma atual da página. */
export function useAltFoto(foto: Foto): string {
  return altDaFoto(foto, useLocale());
}

// Monta a foto já apontando para as variantes WebP responsivas quando existirem,
// caindo para o JPEG original quando não houver variante gerada.
const foto = (a: { url: string; original_filename: string }, alt: string): Foto => {
  const v = VARIANTES[a.original_filename];
  return {
    url: v?.padrao ?? a.url,
    alt,
    srcSet: v?.srcSet,
    largura: v?.largura,
    altura: v?.altura,
  };
};

/** Todas as fotos enviadas, com descrição. */
export const FOTOS: Foto[] = [
  foto(f1, "Crianças perfiladas com o uniforme do Talento Brasil antes da partida"),
  foto(f2, "Time de base posado para foto oficial no campo"),
  foto(f3, "Disputa de bola durante partida do Talento Brasil"),
  foto(f4, "Jovem atleta conduzindo a bola em campo"),
  foto(f5, "Equipes reunidas na abertura do Talento Brasil"),
  foto(f6, "Equipe de organização e parceiros do Instituto IDEX"),
  foto(f7, "Jogada em frente ao painel do Talento Brasil"),
  foto(f8, "Atletas em disputa durante jogo do projeto"),
  foto(f9, "Troféus e medalhas preparados para a premiação"),
  foto(f10, "Corredor de cumprimentos entre as equipes antes do jogo"),
  foto(f11, "Painel de boas-vindas do Talento Brasil no campo"),
  foto(f12, "Vista ampla do campo com todas as equipes participantes"),
  foto(f13, "Crianças aplaudindo durante a cerimônia de abertura"),
  foto(f14, "Time reunido em roda antes da partida"),
  foto(f15, "Crianças descansando no gramado durante o evento"),
  foto(f16, "Mãos unidas em círculo formando o símbolo do time"),
  foto(f17, "Jovem atleta segurando o troféu do Talento Brasil"),
  foto(f18, "Lance de jogo entre duas equipes de base"),
  foto(f19, "Time comemorando com o troféu conquistado"),
  foto(f20, "Foto oficial de todos os participantes do Talento Brasil"),
  foto(f21, "Treino com barreiras no campo da Penha"),
  foto(f22, "Exercício de agilidade durante o treino semanal"),
];

/** Fotos escolhidas para pontos fixos do site. */
export const FOTO_HERO = FOTOS[11]!; // panorâmica do campo
export const FOTO_TALENTO = FOTOS[17]!; // lance de jogo
export const FOTO_EQUIPE = FOTOS[5]!; // organização e parceiros
export const FOTO_VOLUNTARIADO = FOTOS[15]!; // mãos em círculo

/** Seleção usada na galeria do projeto Talento Brasil. */
export const GALERIA: Foto[] = [
  FOTOS[0]!,
  FOTOS[3]!,
  FOTOS[6]!,
  FOTOS[9]!,
  FOTOS[12]!,
  FOTOS[16]!,
  FOTOS[18]!,
  FOTOS[20]!,
  FOTOS[8]!,
  FOTOS[19]!,
  FOTOS[4]!,
  FOTOS[13]!,
];
