import { generateItems } from "../services/gameContentService";

export enum SkillType {
    Damage = 'DAMAGE',
    Heal = 'HEAL',
    Support = 'SUPPORT',
    Status = 'STATUS',
}

export enum SkillTarget {
    Self = 'SELF',
    Ally = 'ALLY',
    Enemy = 'ENEMY',
    AllAllies = 'ALL_ALLIES',
    AllEnemies = 'ALL_ENEMIES',
}

export type StatusEffectType = 'bleed' | 'stun' | 'blind' | 'poison' | 'buff' | 'debuff';

export interface StatusEffect {
    type: StatusEffectType;
    duration: number; // in rounds
    potency?: number; // e.g., damage per round, or stat change value
    stat?: keyof HeroAttributes;
}

export interface SkillEffect {
    type: 'damage' | 'heal_hp' | 'heal_stress' | 'apply_status';
    baseValue: number; // e.g. 10 for 10 damage, 5 for 5 heal
    status?: StatusEffectType;
    duration?: number;
    stat?: keyof HeroAttributes;
    chance?: number; // 0-1 for proc chance
}

export interface Skill {
  name: string;
  level: number;
  maxLevel: number;
  description: string;
  type: SkillType;
  target: SkillTarget;
  effects: SkillEffect[];
}

export type ItemSlot = 'trinket';

export interface HeroAttributes {
    damage: number;
    defense: number;
    dodge: number;
    critChance: number;
    perception: number;
    wisdom: number;
}

export interface Item {
  id: string;
  name: string;
  slot: ItemSlot;
  description: string;
  effects: Partial<Record<keyof HeroAttributes, number>>;
  cost: number;
}

export interface Character extends HeroAttributes {
    id: string;
    name: string;
    hp: number;
    maxHp: number;
    statusEffects: StatusEffect[];
}

export interface Hero extends Character {
  heroClass: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  stress: number;
  maxStress: number;
  backstory: string;
  skills: Skill[];
  items: (Item | null)[]; // Array of 3 slots, can be null
}

export interface Enemy extends Character {
    enemyType: string;
    skills: Skill[];
}


export interface Mission {
  id:string;
  name: string;
  description: string;
  difficulty: 'Low' | 'Medium' | 'High';
  length: 'short' | 'medium' | 'long';
  reward: number;
  itemRewards?: Item[];
  campaignId?: string;
  actNumber?: number;
  objective?: string;
}

export interface CurioEffect {
    type: 'gold' | 'item' | 'heal_hp' | 'damage_hp' | 'heal_stress' | 'damage_stress' | 'apply_status';
    amount?: number;
    itemType?: 'trinket_low' | 'trinket_high';
    status?: StatusEffect;
}

export interface CurioOutcome {
    chance: number; // 0-1
    description: string;
    effects: CurioEffect[];
}

export interface Curio {
    id: string;
    name: string;
    description: string;
    outcomes: CurioOutcome[];
}

export interface DungeonNode {
  id: string;
  type: 'start' | 'corridor' | 'room';
  roomType?: 'encounter' | 'treasure' | 'curio' | 'exit' | 'start' | null;
  curioId?: string;
  description: string;
  backgroundImage?: string;
  exits: {
    up?: string;
    down?: string;
    left?: string;
    right?: string;
  };
}

export interface DungeonMap {
  [key: string]: DungeonNode;
}

export enum GameView {
  Hub = 'HUB',
  Tavern = 'TAVERN',
  MissionBoard = 'MISSION_BOARD',
  PartySelect = 'PARTY_SELECT',
  Dungeon = 'DUNGEON',
  MissionResult = 'MISSION_RESULT',
  Roster = 'ROSTER',
  Sewers = 'SEWERS',
  University = 'UNIVERSITY',
  Asylum = 'ASYLUM',
  Combat = 'COMBAT',
}

export type CombatLogEntryType = 'player_action' | 'enemy_action' | 'status_effect' | 'system_info' | 'round_marker' | 'resistance';

export interface CombatLogEntry {
  id: string;
  type: CombatLogEntryType;
  message: string;
}

export interface CombatState {
    heroes: Hero[];
    enemies: Enemy[];
    turnQueue: string[]; // array of character ids
    turnIndex: number;
    combatLog: CombatLogEntry[];
}

export interface LevelUpData {
    oldLevel: number;
    newLevel: number;
    statIncreases: string[]; // e.g., ["+5 Max HP", "+1 Damage", "+2 Dodge"]
    newXpToNextLevel: number;
}

export interface PartyMemberResult {
    id: string;
    name: string;
    heroClass: string;
    // The state of the hero BEFORE the mission rewards were applied
    initialState: {
        level: number;
        xp: number;
        xpToNextLevel: number;
    };
    finalState: {
        xp: number;
        xpToNextLevel: number;
    };
    xpGained: number;
    levelUps: LevelUpData[];
}

export interface MissionResultData {
    result: 'success' | 'failure';
    partyResults: PartyMemberResult[];
    goldReward: number;
}


export interface GameState {
  week: number;
  gold: number;
  roster: Hero[];
  inventory: Item[];
  sewersShopItems: Item[];
  asylum: string[]; // Array of hero IDs in the asylum
  currentView: GameView;
  completedMissionIds: string[];
}

export interface CampaignRoom {
    id: string;
    name: string;
    description: string;
    acts: number[]; // Which acts this room can appear in (1-5)
    type: 'neutral' | 'special' | 'boss' | 'trap';
    roomContentType: DungeonNode['roomType'];
    backgroundImage?: string;
}