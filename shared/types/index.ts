export enum Class {
  DARK_KNIGHT = 'DARK_KNIGHT',
  DARK_WIZARD = 'DARK_WIZARD',
  ELF = 'ELF',
  SUMMONER = 'SUMMONER'
}

export interface Position {
  x: number;
  y: number;
}

export interface PlayerStats {
  str: number;
  agi: number;
  vit: number;
  ene: number;
}

export interface Player {
  id: string;
  name: string;
  class: Class;
  level: number;
  exp: number;
  zen: number;
  stats: PlayerStats;
  currentHp: number;
  maxHp: number;
  currentMana: number;
  maxMana: number;
}

export interface Monster {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  exp: number;
}

export interface Item {
  id: string;
  name: string;
  type: string;
  attack?: number;
  defense?: number;
}
