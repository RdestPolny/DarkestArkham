import React from 'react';
import { GameState, GameView, Hero, HeroAttributes, Skill, SkillEffect, SkillTarget, SkillType, Enemy } from '../types';

export const INITIAL_GOLD = 1000;
export const ROSTER_LIMIT = 12;
export const PARTY_LIMIT = 4;
export const RECRUIT_COST = 100;
export const SKILL_UPGRADE_COST_MULTIPLIER = 250;
export const ASYLUM_TREATMENT_COST = 200;
export const ASYLUM_STRESS_HEAL = 50;
export const ASYLUM_SLOTS = 3;

// The amount of XP required to advance from level i to level i+1. Index 0 is unused.
export const LEVEL_XP_REQUIREMENTS = [0, 100, 150, 250, 350, 500, 700, 950, 1250, 1600];
export const MISSION_DIFFICULTY_XP = {
    'Low': 100,
    'Medium': 200,
    'High': 350,
};

export const ICONS = {
    WEEK: <span title="Week" className="text-cyan-400">⏳</span>,
    GOLD: <span title="Gold" className="text-amber-400">💰</span>,
    ROSTER: <span title="Roster" className="text-stone-400">👥</span>,
    HEART: <span title="Health" className="text-green-400">❤</span>,
    SKULL: <span title="Stress" className="text-yellow-400">💀</span>,
    XP: <span title="Experience" className="text-purple-400">✧</span>,
    ASYLUM: <span title="Asylum" className="text-cyan-200">✚</span>,
};

export const HERO_CLASSES = ['Private Detective', 'Occultist', 'Doctor', 'Grave Robber'];

const DETECTIVE_SKILLS: Skill[] = [
    { name: 'Pistol Shot', level: 1, maxLevel: 5, description: 'A standard, reliable shot.', type: SkillType.Damage, target: SkillTarget.Enemy, effects: [{ type: 'damage', baseValue: 100 }] },
    { name: 'Interrogate', level: 1, maxLevel: 3, description: 'Weaken an enemy, lowering their defense.', type: SkillType.Status, target: SkillTarget.Enemy, effects: [{ type: 'apply_status', baseValue: -5, status: 'debuff', stat: 'defense', duration: 3 }] },
    { name: 'Take Cover', level: 1, maxLevel: 3, description: 'Improve own dodge for a short time.', type: SkillType.Support, target: SkillTarget.Self, effects: [{ type: 'apply_status', baseValue: 20, status: 'buff', stat: 'dodge', duration: 2 }] },
    { name: 'First Aid', level: 1, maxLevel: 5, description: 'Apply basic first aid to an ally.', type: SkillType.Heal, target: SkillTarget.Ally, effects: [{ type: 'heal_hp', baseValue: 10 }] },
];

const OCCULTIST_SKILLS: Skill[] = [
    { name: 'Eldritch Stab', level: 1, maxLevel: 5, description: 'A chaotic strike that can cause bleeding.', type: SkillType.Damage, target: SkillTarget.Enemy, effects: [{ type: 'damage', baseValue: 80 }, { type: 'apply_status', status: 'bleed', baseValue: 2, duration: 3, chance: 0.7 }] },
    { name: 'Wyrd Reconstruction', level: 1, maxLevel: 5, description: 'A powerful, but unpredictable heal.', type: SkillType.Heal, target: SkillTarget.Ally, effects: [{ type: 'heal_hp', baseValue: 25 }] },
    { name: 'Vulnerability Hex', level: 1, maxLevel: 3, description: 'Curse an enemy, making them easier to hit.', type: SkillType.Status, target: SkillTarget.Enemy, effects: [{ type: 'apply_status', baseValue: -15, status: 'debuff', stat: 'dodge', duration: 3 }] },
    { name: 'Abyssal Artillery', level: 1, maxLevel: 5, description: 'A blast of dark energy from the beyond.', type: SkillType.Damage, target: SkillTarget.Enemy, effects: [{ type: 'damage', baseValue: 120 }] },
];


export const CLASS_DETAILS: { [key: string]: { baseStats: HeroAttributes, skillPool: Skill[] } } = {
    'Private Detective': {
        baseStats: { damage: 10, defense: 5, dodge: 10, critChance: 5, perception: 15, wisdom: 10 },
        skillPool: DETECTIVE_SKILLS,
    },
    'Occultist': {
        baseStats: { damage: 8, defense: 3, dodge: 5, critChance: 8, perception: 10, wisdom: 15 },
        skillPool: OCCULTIST_SKILLS,
    },
     'Doctor': {
        baseStats: { damage: 6, defense: 4, dodge: 5, critChance: 3, perception: 12, wisdom: 18 },
        skillPool: [], // Placeholder
    },
    'Grave Robber': {
        baseStats: { damage: 9, defense: 2, dodge: 15, critChance: 10, perception: 18, wisdom: 8 },
        skillPool: [], // Placeholder
    },
};

export const INITIAL_GAME_STATE: GameState = {
    week: 1,
    gold: INITIAL_GOLD,
    roster: [
        {
            id: 'hero-1',
            name: 'John "The Fixer" Donovan',
            heroClass: 'Private Detective',
            level: 1,
            xp: 0,
            xpToNextLevel: LEVEL_XP_REQUIREMENTS[1],
            hp: 30, maxHp: 30, stress: 10, maxStress: 100,
            backstory: 'A cynical ex-cop who has seen too much, now making a living in the shadows of Arkham.',
            ...CLASS_DETAILS['Private Detective'].baseStats,
            skills: CLASS_DETAILS['Private Detective'].skillPool.slice(0, 4),
            items: [null, null, null],
            statusEffects: [],
        },
        {
            id: 'hero-2',
            name: 'Eleanor Vance',
            heroClass: 'Occultist',
            level: 1,
            xp: 0,
            xpToNextLevel: LEVEL_XP_REQUIREMENTS[1],
            hp: 25, maxHp: 25, stress: 25, maxStress: 100,
            backstory: 'A scholar who delved too deep into forbidden texts and now wields their dangerous power.',
            ...CLASS_DETAILS['Occultist'].baseStats,
            skills: CLASS_DETAILS['Occultist'].skillPool.slice(0, 4),
            items: [null, null, null],
            statusEffects: [],
        }
    ],
    inventory: [],
    sewersShopItems: [],
    asylum: [],
    currentView: GameView.Hub,
    completedMissionIds: [],
};

export const ENEMY_TYPES: { [key: string]: Omit<Enemy, 'id' | 'hp' | 'statusEffects'> } = {
    'Cultist Acolyte': { enemyType: 'Human', name: 'Cultist Acolyte', maxHp: 15, damage: 5, defense: 0, dodge: 5, critChance: 3, perception: 10, wisdom: 5, skills: [{ name: 'Knife Slash', level: 1, maxLevel: 1, description: '', type: SkillType.Damage, target: SkillTarget.Enemy, effects: [{ type: 'damage', baseValue: 100 }]}] },
    'Ghoul': { enemyType: 'Undead', name: 'Ghoul', maxHp: 25, damage: 8, defense: 2, dodge: 10, critChance: 5, perception: 12, wisdom: 3, skills: [{ name: 'Claw', level: 1, maxLevel: 1, description: '', type: SkillType.Damage, target: SkillTarget.Enemy, effects: [{ type: 'damage', baseValue: 100 }]}] },
    'Straitjacket Patient': { enemyType: 'Human', name: 'Straitjacket Patient', maxHp: 20, damage: 6, defense: 1, dodge: 5, critChance: 2, perception: 5, wisdom: 1, skills: [{ name: 'Headbutt', level: 1, maxLevel: 1, description: '', type: SkillType.Damage, target: SkillTarget.Enemy, effects: [{ type: 'damage', baseValue: 100 }]}] },
    'Broken Bottle Patient': { enemyType: 'Human', name: 'Patient with Bottle', maxHp: 18, damage: 9, defense: 0, dodge: 8, critChance: 8, perception: 6, wisdom: 2, skills: [{ name: 'Shank', level: 1, maxLevel: 1, description: '', type: SkillType.Damage, target: SkillTarget.Enemy, effects: [{ type: 'damage', baseValue: 100 }]}] },
    'Lobotomy Cage Patient': { enemyType: 'Human', name: 'Cage-Head Patient', maxHp: 30, damage: 5, defense: 5, dodge: 0, critChance: 1, perception: 3, wisdom: 1, skills: [{ name: 'Flail', level: 1, maxLevel: 1, description: '', type: SkillType.Damage, target: SkillTarget.Enemy, effects: [{ type: 'damage', baseValue: 100 }]}] },
    'Wild Dog': { enemyType: 'Beast', name: 'Wild Dog', maxHp: 15, damage: 7, defense: 0, dodge: 15, critChance: 6, perception: 15, wisdom: 2, skills: [{ name: 'Bite', level: 1, maxLevel: 1, description: '', type: SkillType.Damage, target: SkillTarget.Enemy, effects: [{ type: 'damage', baseValue: 100 }]}] },
};