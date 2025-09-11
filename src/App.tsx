import React, { useState, useCallback } from 'react';
import { GameState, GameView, Mission, Hero, Enemy, CombatState, Character, Skill, DungeonMap, Curio, CurioOutcome, Item, MissionResultData, LevelUpData, HeroAttributes, PartyMemberResult } from './types';
import { INITIAL_GAME_STATE, ENEMY_TYPES, LEVEL_XP_REQUIREMENTS, MISSION_DIFFICULTY_XP, ASYLUM_STRESS_HEAL, ASYLUM_TREATMENT_COST, ASYLUM_SLOTS } from './config/constants';
import { generateDungeon } from './services/gameContentService';
import { CURIOS_LIST } from './config/curios';

import { Header } from './components/layout/Header';
import { HubView } from './views/HubView';
import { TavernView } from './views/TavernView';
import { MissionBoardView } from './views/MissionBoardView';
import { PartySelectView } from './views/PartySelectView';
import { DungeonView } from './views/DungeonView';
import { MissionResultView } from './views/MissionResultView';
import { RosterView } from './views/RosterView';
import { SewersView } from './views/SewersView';
import { UniversityView } from './views/UniversityView';
import { AsylumView } from './views/AsylumView';
import { processCombatAction } from './services/combatLogic';
import { generateItems } from './services/gameContentService';

const handleLevelUp = (hero: Hero): { updatedHero: Hero, levelUpData: LevelUpData } => {
    const oldLevel = hero.level;
    const newLevel = oldLevel + 1;

    let updatedHero = { ...hero };
    const newXpToNextLevel = LEVEL_XP_REQUIREMENTS[newLevel] || 9999;
    
    updatedHero.level = newLevel;
    updatedHero.xp -= hero.xpToNextLevel; // Subtract XP needed for level up
    updatedHero.xpToNextLevel = newXpToNextLevel;

    const statIncreases: string[] = [];
    
    // Guaranteed Max HP increase
    const hpIncrease = Math.floor(Math.random() * 4) + 3; // +3 to 6 HP
    updatedHero.maxHp += hpIncrease;
    updatedHero.hp = updatedHero.maxHp; // Full heal on level up
    statIncreases.push(`+${hpIncrease} Max HP`);

    // Randomly increase 2 other stats
    const attributes: (keyof HeroAttributes)[] = ['damage', 'defense', 'dodge', 'critChance', 'perception', 'wisdom'];
    const shuffledAttrs = [...attributes].sort(() => 0.5 - Math.random());
    const attrsToIncrease = shuffledAttrs.slice(0, 2);

    attrsToIncrease.forEach(attr => {
        let increaseAmount = 1;
        let statName = attr.charAt(0).toUpperCase() + attr.slice(1).replace(/([A-Z])/g, ' $1').trim();
        if (attr === 'dodge' || attr === 'critChance') {
            increaseAmount = Math.floor(Math.random() * 2) + 1; // +1 or +2
        }
        (updatedHero[attr] as number) += increaseAmount;
        statIncreases.push(`+${increaseAmount} ${statName}`);
    });
    
    return {
        updatedHero,
        levelUpData: {
            oldLevel,
            newLevel,
            statIncreases,
            newXpToNextLevel,
        }
    };
};


const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
    const [activeMission, setActiveMission] = useState<Mission | null>(null);
    const [activeParty, setActiveParty] = useState<Hero[]>([]);
    const [missionResult, setMissionResult] = useState<MissionResultData | null>(null);
    const [activeCombatState, setActiveCombatState] = useState<CombatState | null>(null);
    const [curioInteractionLog, setCurioInteractionLog] = useState<string[]>([]);

    // Dungeon state
    const [dungeonMap, setDungeonMap] = useState<DungeonMap | null>(null);
    const [currentNodeId, setCurrentNodeId] = useState<string>('start');
    const [visitedNodes, setVisitedNodes] = useState<Set<string>>(new Set(['start']));
    const [clearedNodes, setClearedNodes] = useState<Set<string>>(new Set());


    const setView = (view: GameView) => {
        setGameState(prev => ({ ...prev, currentView: view }));
    };

    const advanceWeek = useCallback((reward = 0) => {
        setGameState(prev => {
            const asylumHeroIds = new Set(prev.asylum);
            const newRoster = prev.roster.map(hero => {
                if (asylumHeroIds.has(hero.id)) {
                    return {
                        ...hero,
                        stress: Math.max(0, hero.stress - ASYLUM_STRESS_HEAL),
                    };
                }
                return hero;
            });

            return {
                ...prev,
                week: prev.week + 1,
                gold: prev.gold + reward,
                sewersShopItems: [], // Clear shop for the new week
                roster: newRoster,
                asylum: [], // Clear asylum for the new week
                currentView: GameView.Hub
            };
        });
        setActiveMission(null);
        setActiveParty([]);
        setMissionResult(null);
        // Reset dungeon state
        setDungeonMap(null);
        setCurrentNodeId('start');
        setVisitedNodes(new Set(['start']));
        setClearedNodes(new Set());
    }, []);

    const startMission = (mission: Mission) => {
        setActiveMission(mission);
        setView(GameView.PartySelect);
    };

    const startDungeon = (party: Hero[]) => {
        setActiveParty(party);
        if (!activeMission) return; // Should not happen
        setDungeonMap(generateDungeon(activeMission.difficulty, activeMission));
        setCurrentNodeId('start');
        setVisitedNodes(new Set(['start']));
        setClearedNodes(new Set());
        setView(GameView.Dungeon);
    };
    
    const endMission = (result: 'success' | 'failure') => {
        let missionResultData: MissionResultData;
        let finalRoster = [...gameState.roster];
    
        if (result === 'success' && activeMission) {
            const xpReward = MISSION_DIFFICULTY_XP[activeMission.difficulty];
            const partyResults: PartyMemberResult[] = [];
    
            // Apply XP and level-ups to surviving party members
            activeParty.forEach(partyMember => {
                const rosterHeroIndex = finalRoster.findIndex(h => h.id === partyMember.id);
                if (rosterHeroIndex === -1) return;
    
                let heroToUpdate = { ...finalRoster[rosterHeroIndex] };
                
                // Sync HP/Stress from dungeon run before any level-up healing
                heroToUpdate.hp = partyMember.hp;
                heroToUpdate.stress = partyMember.stress;
    
                const partyMemberResult: PartyMemberResult = {
                    id: heroToUpdate.id, name: heroToUpdate.name, heroClass: heroToUpdate.heroClass,
                    initialState: { level: heroToUpdate.level, xp: heroToUpdate.xp, xpToNextLevel: heroToUpdate.xpToNextLevel },
                    xpGained: xpReward,
                    levelUps: [],
                    finalState: { xp: 0, xpToNextLevel: 0 } // placeholder
                };
    
                heroToUpdate.xp += xpReward;
    
                // Handle level ups (can happen multiple times)
                while (heroToUpdate.xp >= heroToUpdate.xpToNextLevel && heroToUpdate.level < LEVEL_XP_REQUIREMENTS.length - 1) {
                    const { updatedHero, levelUpData } = handleLevelUp(heroToUpdate);
                    heroToUpdate = updatedHero;
                    partyMemberResult.levelUps.push(levelUpData);
                }
                
                partyMemberResult.finalState.xp = heroToUpdate.xp;
                partyMemberResult.finalState.xpToNextLevel = heroToUpdate.xpToNextLevel;
    
                partyResults.push(partyMemberResult);
                finalRoster[rosterHeroIndex] = heroToUpdate;
            });
    
            missionResultData = { result: 'success', partyResults, goldReward: activeMission.reward };
    
        } else {
            // Handle mission failure
            missionResultData = {
                result: 'failure',
                partyResults: activeParty.map(p => ({
                    id: p.id, name: p.name, heroClass: p.heroClass,
                    initialState: { level: p.level, xp: p.xp, xpToNextLevel: p.xpToNextLevel },
                    finalState: { xp: p.xp, xpToNextLevel: p.xpToNextLevel },
                    xpGained: 0, levelUps: [],
                })),
                goldReward: 0,
            };
            // Update roster with final HP/stress from party even on failure
            finalRoster = gameState.roster.map(hero => {
                const partyMember = activeParty.find(p => p.id === hero.id);
                return partyMember ? { ...hero, hp: partyMember.hp, stress: partyMember.stress } : hero;
            });
        }
    
        setGameState(prev => ({ ...prev, roster: finalRoster }));
        setMissionResult(missionResultData);
        setView(GameView.MissionResult);
    };

    const handleMissionResultContinue = () => {
        const reward = missionResult?.result === 'success' ? missionResult.goldReward : 0;
        if (missionResult?.result === 'success' && activeMission) {
            setGameState(prev => ({
                ...prev,
                completedMissionIds: [...new Set([...prev.completedMissionIds, activeMission.id])]
            }));
        }
        advanceWeek(reward);
    };

    const startCombat = (party: Hero[], enemies: Enemy[]) => {
        const combatHeroes = party.map(h => ({...h})); // Make copies for combat
        const turnQueue = [...combatHeroes.map(h => h.id), ...enemies.map(e => e.id)]; // Simple turn order for now
        
        setActiveCombatState({
            heroes: combatHeroes,
            enemies: enemies,
            turnQueue: turnQueue,
            turnIndex: 0,
            combatLog: [{
                id: `log-${Date.now()}`,
                type: 'system_info',
                message: `A group of enemies appeared!`
            }],
        });
    };
    
    const endCombat = (result: 'victory' | 'retreat') => {
        if (activeCombatState) {
            // Update the active party with the final stats from combat
            const finalPartyState = activeParty.map(hero => {
                const combatHero = activeCombatState.heroes.find(h => h.id === hero.id);
                return combatHero ? { ...hero, hp: combatHero.hp, stress: combatHero.stress, statusEffects: [] } : hero;
            });
            setActiveParty(finalPartyState);
        }
        
        if (result === 'victory') {
            setClearedNodes(prev => new Set(prev).add(currentNodeId));
        }

        setActiveCombatState(null);
    };

    const handleCombatAction = (user: Character, skill: Skill, targets: Character[]) => {
        if (!activeCombatState) return;
        
        const newState = processCombatAction(activeCombatState, user, skill, targets);
        
        // Check for win/loss conditions
        const allEnemiesDefeated = newState.enemies.every(e => e.hp <= 0);
        const allHeroesDefeated = newState.heroes.every(h => h.hp <= 0);

        if (allEnemiesDefeated) {
            // VICTORY
            newState.combatLog.push({ id: `log-${Date.now()}`, type: 'system_info', message: "All enemies have been defeated! VICTORY!" });
            setActiveCombatState(newState);
            setTimeout(() => endCombat('victory'), 2000);
        } else if (allHeroesDefeated) {
            // DEFEAT
            newState.combatLog.push({ id: `log-${Date.now()}`, type: 'system_info', message: "Your party has been wiped out. DEFEAT." });
            setActiveCombatState(newState);
            setTimeout(() => endMission('failure'), 2000);
        } else {
             setActiveCombatState(newState);
        }
    };
    
    const handleCurioResult = (hero: Hero, curio: Curio, outcome: CurioOutcome | null) => {
        if (!outcome) {
            const logMessages = [`${hero.name} interacts with the ${curio.name}...`, `The ${curio.name} does nothing.`];
            setCurioInteractionLog(logMessages);
            setTimeout(() => setCurioInteractionLog([]), 6000);
            setClearedNodes(prev => new Set(prev).add(currentNodeId)); // Mark as used even if nothing happens
            return;
        }

        const logMessages: string[] = [`${hero.name} interacts with the ${curio.name}...`, outcome.description];
        let newItems: Item[] = [];
        
        const newPartyState = activeParty.map(p => {
            if (p.id !== hero.id) return p;

            let newHero = { ...hero };

            outcome.effects.forEach(effect => {
                switch(effect.type) {
                    case 'gold':
                        const goldAmount = effect.amount || 0;
                        setGameState(prev => ({...prev, gold: prev.gold + goldAmount}));
                        logMessages.push(`Found ${goldAmount} gold.`);
                        break;
                    case 'item':
                        const generatedItem = generateItems(1)[0];
                        newItems.push(generatedItem);
                        logMessages.push(`Found: ${generatedItem.name}.`);
                        break;
                    case 'heal_hp':
                        const healedHp = Math.min(newHero.maxHp, newHero.hp + (effect.amount || 0)) - newHero.hp;
                        newHero.hp += healedHp;
                        if (healedHp > 0) logMessages.push(`${hero.name} heals ${healedHp} HP.`);
                        break;
                    case 'damage_hp':
                        const damagedHp = newHero.hp - Math.max(0, newHero.hp - (effect.amount || 0));
                        newHero.hp -= damagedHp;
                        if (damagedHp > 0) logMessages.push(`${hero.name} takes ${damagedHp} damage.`);
                        break;
                    case 'heal_stress':
                        const healedStress = newHero.stress - Math.max(0, newHero.stress - (effect.amount || 0));
                        newHero.stress -= healedStress;
                        if (healedStress > 0) logMessages.push(`${hero.name} recovers ${healedStress} stress.`);
                        break;
                    case 'damage_stress':
                        const damagedStress = Math.min(newHero.maxStress, newHero.stress + (effect.amount || 0)) - newHero.stress;
                        newHero.stress += damagedStress;
                        if (damagedStress > 0) logMessages.push(`${hero.name} takes ${damagedStress} stress damage.`);
                        break;
                    case 'apply_status':
                        if(effect.status) {
                            newHero.statusEffects.push(effect.status);
                             logMessages.push(`${hero.name} gains a ${effect.status.type} effect!`);
                        }
                        break;
                }
            });
            return newHero;
        });
        
        setActiveParty(newPartyState);
        if (newItems.length > 0) {
            setGameState(prev => ({ ...prev, inventory: [...prev.inventory, ...newItems] }));
        }
        
        setCurioInteractionLog(logMessages);
        setTimeout(() => setCurioInteractionLog([]), 6000);

        setClearedNodes(prev => new Set(prev).add(currentNodeId));
    }

    const handleCommitToAsylum = (hero: Hero) => {
        if (gameState.gold >= ASYLUM_TREATMENT_COST && gameState.asylum.length < ASYLUM_SLOTS) {
            setGameState(prev => ({
                ...prev,
                gold: prev.gold - ASYLUM_TREATMENT_COST,
                asylum: [...prev.asylum, hero.id],
            }));
        }
    };


    const renderView = () => {
        switch (gameState.currentView) {
            case GameView.Hub:
                return <HubView setView={setView} />;
            case GameView.Tavern:
                return <TavernView setView={setView} gameState={gameState} updateGameState={setGameState} />;
            case GameView.MissionBoard:
                return <MissionBoardView setView={setView} startMission={startMission} gameState={gameState} />;
            case GameView.PartySelect:
                if (!activeMission) return <HubView setView={setView} />; // Fallback
                return <PartySelectView setView={setView} gameState={gameState} mission={activeMission} startDungeon={startDungeon} />;
            case GameView.Dungeon:
                if (!activeMission || activeParty.length === 0 || !dungeonMap) return <HubView setView={setView} />; // Fallback
                return <DungeonView
                    party={activeParty}
                    mission={activeMission}
                    endMission={endMission}
                    startCombat={startCombat}
                    dungeonMap={dungeonMap}
                    currentNodeId={currentNodeId}
                    setCurrentNodeId={setCurrentNodeId}
                    visitedNodes={visitedNodes}
                    setVisitedNodes={setVisitedNodes}
                    clearedNodes={clearedNodes}
                    onCurioResult={handleCurioResult}
                    curioInteractionLog={curioInteractionLog}
                    activeCombatState={activeCombatState}
                    onCombatAction={handleCombatAction}
                    endCombat={endCombat}
                />;
            case GameView.MissionResult:
                if (!missionResult) return <HubView setView={setView} />; // Fallback
                return <MissionResultView resultData={missionResult} onContinue={handleMissionResultContinue} />;
            case GameView.Roster:
                return <RosterView setView={setView} gameState={gameState} updateGameState={setGameState} />;
            case GameView.Sewers:
                return <SewersView setView={setView} gameState={gameState} updateGameState={setGameState} />;
            case GameView.University:
                return <UniversityView setView={setView} gameState={gameState} updateGameState={setGameState} />;
            case GameView.Asylum:
                return <AsylumView setView={setView} gameState={gameState} onCommitHero={handleCommitToAsylum} />;
            case GameView.Combat: // Fallback, should not be used anymore
                if (!activeCombatState) return <DungeonView
                    party={activeParty}
                    mission={activeMission!}
                    endMission={endMission}
                    startCombat={startCombat}
                    dungeonMap={dungeonMap!}
                    currentNodeId={currentNodeId}
                    setCurrentNodeId={setCurrentNodeId}
                    visitedNodes={visitedNodes}
                    setVisitedNodes={setVisitedNodes}
                    clearedNodes={clearedNodes}
                    onCurioResult={handleCurioResult}
                    curioInteractionLog={curioInteractionLog}
                    activeCombatState={activeCombatState}
                    onCombatAction={handleCombatAction}
                    endCombat={endCombat}
                />;
                return <HubView setView={setView} />;
            default:
                return <HubView setView={setView} />;
        }
    };

    return (
        <div className="h-screen w-screen bg-stone-950">
            {gameState.currentView !== GameView.Dungeon && <Header gameState={gameState} />}
            <main className={`h-full ${gameState.currentView !== GameView.Dungeon ? 'pt-16' : ''}`}>
                {renderView()}
            </main>
        </div>
    );
};

export default App;