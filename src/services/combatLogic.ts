import { CombatState, Character, Skill, SkillTarget, Hero, Enemy, StatusEffect, CombatLogEntry, CombatLogEntryType } from "../types";

// Deep copy helper to avoid state mutation issues in combat
const deepCopy = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

const getTargets = (currentState: CombatState, user: Character, skill: Skill): Character[] => {
    const isUserHero = currentState.heroes.some(h => h.id === user.id);
    
    switch (skill.target) {
        case SkillTarget.Self:
            return [user];
        case SkillTarget.Ally: // For now, assuming user will provide a specific target. This logic will expand.
        case SkillTarget.Enemy:
             // This function is now a placeholder; actual target is passed in.
            return [];
        case SkillTarget.AllAllies:
            return isUserHero ? currentState.heroes : currentState.enemies;
        case SkillTarget.AllEnemies:
            return isUserHero ? currentState.enemies : currentState.heroes;
        default:
            return [];
    }
};

const applyEffects = (user: Character, skill: Skill, target: Character, log: CombatLogEntry[], isUserHero: boolean): Character => {
    let newTarget = deepCopy(target);
    const actionType: CombatLogEntryType = isUserHero ? 'player_action' : 'enemy_action';
    
    skill.effects.forEach(effect => {
        // Check for proc chance
        if (effect.chance && Math.random() > effect.chance) {
            log.push({ id: `log-${Date.now()}-${Math.random()}`, type: 'resistance', message: `${target.name} resisted the ${effect.status} effect!` });
            return;
        }

        switch (effect.type) {
            case 'damage':
                const damage = Math.round((effect.baseValue / 100) * user.damage); // Simple damage calculation
                newTarget.hp = Math.max(0, newTarget.hp - damage);
                log.push({ id: `log-${Date.now()}-${Math.random()}`, type: actionType, message: `${user.name} uses ${skill.name} on ${target.name} for ${damage} damage!` });
                break;
            case 'heal_hp':
                newTarget.hp = Math.min(newTarget.maxHp, newTarget.hp + effect.baseValue);
                log.push({ id: `log-${Date.now()}-${Math.random()}`, type: actionType, message: `${user.name} uses ${skill.name} on ${target.name}, healing ${effect.baseValue} HP.` });
                break;
            case 'apply_status':
                 if(effect.status && effect.duration) {
                    const newStatus: StatusEffect = {
                        type: effect.status,
                        duration: effect.duration,
                        potency: effect.baseValue,
                        stat: effect.stat,
                    };
                    newTarget.statusEffects.push(newStatus);
                    log.push({ id: `log-${Date.now()}-${Math.random()}`, type: 'status_effect', message: `${target.name} is afflicted with ${effect.status}!` });
                 }
                break;
            // Other effect types (heal_stress, etc.) would go here
        }
    });
    return newTarget;
};

// FIX: Made the function generic to preserve the character subtype (Hero/Enemy).
const processStatusEffects = <T extends Character>(character: T, log: CombatLogEntry[]): T => {
    let newCharacter = deepCopy(character);
    
    newCharacter.statusEffects = newCharacter.statusEffects.filter(status => {
        switch (status.type) {
            case 'bleed':
            case 'poison':
                const dotDamage = status.potency || 0;
                newCharacter.hp = Math.max(0, newCharacter.hp - dotDamage);
                log.push({ id: `log-${Date.now()}-${Math.random()}`, type: 'status_effect', message: `${newCharacter.name} takes ${dotDamage} damage from ${status.type}.` });
                break;
        }
        status.duration -= 1;
        return status.duration > 0;
    });

    return newCharacter;
};


export const processCombatAction = (
    currentState: CombatState, 
    user: Character, 
    skill: Skill, 
    targets: Character[]
): CombatState => {
    const newState = deepCopy(currentState);
    const isUserHero = newState.heroes.some(h => h.id === user.id);

    // 1. Apply skill effects to all targets
    targets.forEach(target => {
        const updatedTarget = applyEffects(user, skill, target, newState.combatLog, isUserHero);
        
        // Update the character in the correct array (heroes or enemies)
        let heroIndex = newState.heroes.findIndex(h => h.id === target.id);
        if (heroIndex !== -1) {
            newState.heroes[heroIndex] = updatedTarget as Hero;
        } else {
            let enemyIndex = newState.enemies.findIndex(e => e.id === target.id);
            if (enemyIndex !== -1) {
                newState.enemies[enemyIndex] = updatedTarget as Enemy;
            }
        }
    });

    // 2. Advance turn
    newState.turnIndex = (newState.turnIndex + 1);
    
    // 3. Check if round is over to process DoTs
    if (newState.turnIndex >= newState.turnQueue.length) {
        newState.turnIndex = 0;
        newState.combatLog.push({ id: `log-${Date.now()}-${Math.random()}`, type: 'round_marker', message: "--- End of Round ---" });
        // Process status effects for everyone
        newState.heroes = newState.heroes.map(h => h.hp > 0 ? processStatusEffects(h, newState.combatLog) : h);
        newState.enemies = newState.enemies.map(e => e.hp > 0 ? processStatusEffects(e, newState.combatLog) : e);
        newState.combatLog.push({ id: `log-${Date.now()}-${Math.random()}`, type: 'round_marker', message: "--- Start of New Round ---" });
    }
    
    // Skip turns for dead characters
    while(true) {
        const nextTurnCharId = newState.turnQueue[newState.turnIndex];
        const nextHero = newState.heroes.find(h => h.id === nextTurnCharId);
        const nextEnemy = newState.enemies.find(e => e.id === nextTurnCharId);
        if((nextHero && nextHero.hp > 0) || (nextEnemy && nextEnemy.hp > 0)) {
            break; // Found a living character, break the loop
        }
        newState.turnIndex = (newState.turnIndex + 1) % newState.turnQueue.length;
    }


    return newState;
};