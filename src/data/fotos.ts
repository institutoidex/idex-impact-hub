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
// `alt` recebe a descrição nos três idiomas (pt é a referência/fallback).
const foto = (
  a: { url: string; original_filename: string },
  alt: { "pt-BR": string; "en-US": string; "es-ES": string },
): Foto => {
  const v = VARIANTES[a.original_filename];
  return {
    url: v?.padrao ?? a.url,
    alt: alt["pt-BR"],
    altPorIdioma: { "en-US": alt["en-US"], "es-ES": alt["es-ES"] },
    srcSet: v?.srcSet,
    largura: v?.largura,
    altura: v?.altura,
  };
};

/** Todas as fotos enviadas, com descrição. */
export const FOTOS: Foto[] = [
  foto(f1, { "pt-BR": "Crianças perfiladas com o uniforme do Talento Brasil antes da partida", "en-US": "Children lined up in Talento Brasil uniforms before the match", "es-ES": "Niños alineados con el uniforme del Talento Brasil antes del partido" }),
  foto(f2, { "pt-BR": "Time de base posado para foto oficial no campo", "en-US": "Youth team posing for an official photo on the field", "es-ES": "Equipo base posando para la foto oficial en el campo" }),
  foto(f3, { "pt-BR": "Disputa de bola durante partida do Talento Brasil", "en-US": "Players contesting the ball during a Talento Brasil match", "es-ES": "Disputa del balón durante un partido del Talento Brasil" }),
  foto(f4, { "pt-BR": "Jovem atleta conduzindo a bola em campo", "en-US": "Young athlete dribbling the ball on the field", "es-ES": "Joven atleta conduciendo el balón en el campo" }),
  foto(f5, { "pt-BR": "Equipes reunidas na abertura do Talento Brasil", "en-US": "Teams gathered for the Talento Brasil opening", "es-ES": "Equipos reunidos en la apertura del Talento Brasil" }),
  foto(f6, { "pt-BR": "Equipe de organização e parceiros do Instituto IDEX", "en-US": "Instituto IDEX organizing team and partners", "es-ES": "Equipo de organización y socios del Instituto IDEX" }),
  foto(f7, { "pt-BR": "Jogada em frente ao painel do Talento Brasil", "en-US": "Play in front of the Talento Brasil backdrop", "es-ES": "Jugada frente al panel del Talento Brasil" }),
  foto(f8, { "pt-BR": "Atletas em disputa durante jogo do projeto", "en-US": "Athletes competing during the project's match", "es-ES": "Atletas disputando el balón durante un partido del proyecto" }),
  foto(f9, { "pt-BR": "Troféus e medalhas preparados para a premiação", "en-US": "Trophies and medals ready for the awards ceremony", "es-ES": "Trofeos y medallas preparados para la premiación" }),
  foto(f10, { "pt-BR": "Corredor de cumprimentos entre as equipes antes do jogo", "en-US": "Teams forming a greeting tunnel before the match", "es-ES": "Pasillo de saludos entre los equipos antes del partido" }),
  foto(f11, { "pt-BR": "Painel de boas-vindas do Talento Brasil no campo", "en-US": "Talento Brasil welcome banner on the field", "es-ES": "Panel de bienvenida del Talento Brasil en el campo" }),
  foto(f12, { "pt-BR": "Vista ampla do campo com todas as equipes participantes", "en-US": "Wide view of the field with all participating teams", "es-ES": "Vista amplia del campo con todos los equipos participantes" }),
  foto(f13, { "pt-BR": "Crianças aplaudindo durante a cerimônia de abertura", "en-US": "Children applauding during the opening ceremony", "es-ES": "Niños aplaudiendo durante la ceremonia de apertura" }),
  foto(f14, { "pt-BR": "Time reunido em roda antes da partida", "en-US": "Team huddled together before the match", "es-ES": "Equipo reunido en círculo antes del partido" }),
  foto(f15, { "pt-BR": "Crianças descansando no gramado durante o evento", "en-US": "Children resting on the grass during the event", "es-ES": "Niños descansando en el césped durante el evento" }),
  foto(f16, { "pt-BR": "Mãos unidas em círculo formando o símbolo do time", "en-US": "Hands joined in a circle forming the team's symbol", "es-ES": "Manos unidas en círculo formando el símbolo del equipo" }),
  foto(f17, { "pt-BR": "Jovem atleta segurando o troféu do Talento Brasil", "en-US": "Young athlete holding the Talento Brasil trophy", "es-ES": "Joven atleta sosteniendo el trofeo del Talento Brasil" }),
  foto(f18, { "pt-BR": "Lance de jogo entre duas equipes de base", "en-US": "Play between two youth teams", "es-ES": "Jugada entre dos equipos base" }),
  foto(f19, { "pt-BR": "Time comemorando com o troféu conquistado", "en-US": "Team celebrating with the trophy they won", "es-ES": "Equipo celebrando con el trofeo conquistado" }),
  foto(f20, { "pt-BR": "Foto oficial de todos os participantes do Talento Brasil", "en-US": "Official photo of all Talento Brasil participants", "es-ES": "Foto oficial de todos los participantes del Talento Brasil" }),
  foto(f21, { "pt-BR": "Treino com barreiras no campo da Penha", "en-US": "Hurdle training on the Penha field", "es-ES": "Entrenamiento con vallas en el campo de la Penha" }),
  foto(f22, { "pt-BR": "Exercício de agilidade durante o treino semanal", "en-US": "Agility drill during the weekly training session", "es-ES": "Ejercicio de agilidad durante el entrenamiento semanal" }),
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
