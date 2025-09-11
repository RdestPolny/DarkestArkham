import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react';
import { Hero, Mission, DungeonMap, Enemy, Curio, CurioOutcome, CombatState, Character, Skill, SkillTarget, StatusEffect, CombatLogEntryType } from '../types';
import { Minimap } from '../components/game/Minimap';
import { RoomArt } from '../components/game/RoomArt';
import { InvestigatorSprite } from '../components/game/InvestigatorSprite';
import { EnemySprite } from '../components/game/EnemySprite';
import { ENEMY_TYPES } from '../config/constants';
import { CURIOS_MAP } from '../config/curios';
import { CurioSprite } from '../components/game/CurioSprite';
import { CurioInteractionModal } from '../components/game/CurioInteractionModal';
import { CharacterCard } from '../components/game/CharacterCard';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

interface DungeonViewProps {
  party: Hero[];
  mission: Mission;
  endMission: (result: 'success' | 'failure') => void;
  startCombat: (party: Hero[], enemies: Enemy[]) => void;
  dungeonMap: DungeonMap;
  currentNodeId: string;
  setCurrentNodeId: React.Dispatch<React.SetStateAction<string>>;
  visitedNodes: Set<string>;
  setVisitedNodes: React.Dispatch<React.SetStateAction<Set<string>>>;
  clearedNodes: Set<string>;
  onCurioResult: (hero: Hero, curio: Curio, outcome: CurioOutcome | null) => void;
  curioInteractionLog: string[];
  activeCombatState: CombatState | null;
  onCombatAction: (user: Character, skill: Skill, targets: Character[]) => void;
  endCombat: (result: 'victory' | 'retreat') => void;
}

const MOVEMENT_SPEED = 200; // pixels per second

type MovementDirection = 'left' | 'right' | 'up' | 'down';

const getStatusIcon = (status: StatusEffect) => {
    switch (status.type) {
        case 'bleed': return <span title="Bleed" className="text-red-500">🩸</span>;
        case 'poison': return <span title="Poison" className="text-green-500">🧪</span>;
        case 'stun': return <span title="Stun" className="text-yellow-400">✨</span>;
        case 'buff': return <span title="Buff" className="text-blue-400">⬆️</span>;
        case 'debuff': return <span title="Debuff" className="text-purple-400">⬇️</span>;
        default: return null;
    }
}

const getLogMessageStyle = (type: CombatLogEntryType): string => {
    switch(type) {
        case 'player_action':
            return 'text-cyan-300';
        case 'enemy_action':
            return 'text-red-400';
        case 'status_effect':
            return 'text-purple-400';
        case 'resistance':
            return 'text-stone-400 italic';
        case 'system_info':
            return 'text-amber-300 font-bold';
        case 'round_marker':
            return 'text-stone-500 font-cinzel';
        default:
            return 'text-stone-300';
    }
};


export const DungeonView: React.FC<DungeonViewProps> = ({ 
    party, 
    mission, 
    endMission, 
    startCombat,
    dungeonMap,
    currentNodeId,
    setCurrentNodeId,
    visitedNodes,
    setVisitedNodes,
    clearedNodes,
    onCurioResult,
    curioInteractionLog,
    activeCombatState,
    onCombatAction,
    endCombat
}) => {
    const [enemies, setEnemies] = useState<Enemy[]>([]);
    const [curio, setCurio] = useState<Curio | null>(null);
    const [selectedHero, setSelectedHero] = useState<Hero | null>(party[0] || null);
    
    // Objective State
    const [isObjectiveComplete, setIsObjectiveComplete] = useState(false);
    const [showObjectiveModal, setShowObjectiveModal] = useState(false);

    // Movement State
    const [positions, setPositions] = useState({ party: 10, camera: 0 });
    const { party: partyPositionX, camera: cameraPositionX } = positions;
    const [isAtLeftExit, setIsAtLeftExit] = useState(false);
    const [isAtRightExit, setIsAtRightExit] = useState(false);
    const [isAtCurio, setIsAtCurio] = useState(false);
    const [showHeroSelectForCurio, setShowHeroSelectForCurio] = useState<Curio | null>(null);

    const keysPressed = useRef<{ [key: string]: boolean }>({}).current;
    const animationFrameId = useRef<number | null>(null);
    const lastUpdateTime = useRef<number>(0);
    const lastMoveDirection = useRef<MovementDirection | null>(null);
    const partyRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const combatLogRef = useRef<HTMLDivElement>(null);

    const isInCombat = activeCombatState !== null;
    const preCombatPositionsRef = useRef<{ party: number; camera: number } | null>(null);
    const prevIsInCombat = useRef(isInCombat);

    const locationWidthVw = useMemo(() => {
        if (isInCombat) return 100;
        const node = dungeonMap[currentNodeId];
        return node?.type === 'corridor' ? 300 : 150;
    }, [currentNodeId, dungeonMap, isInCombat]);
    
    // Combat State
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
    const [selectedTargets, setSelectedTargets] = useState<Character[]>([]);

    const activeCharacterId = isInCombat ? activeCombatState.turnQueue[activeCombatState.turnIndex] : null;
    const activeCharacter = useMemo(() => 
        activeCharacterId && activeCombatState ? [...activeCombatState.heroes, ...activeCombatState.enemies].find(c => c.id === activeCharacterId) : null
    , [activeCharacterId, activeCombatState]);
    const isPlayerTurn = useMemo(() => 
        isInCombat && activeCharacter ? activeCombatState.heroes.some(h => h.id === activeCharacter.id) : false
    , [isInCombat, activeCharacter, activeCombatState]);

    useEffect(() => {
        if (prevIsInCombat.current && !isInCombat && preCombatPositionsRef.current) {
            setPositions(preCombatPositionsRef.current);
            preCombatPositionsRef.current = null;
        }
        prevIsInCombat.current = isInCombat;
    }, [isInCombat]);
    
    // Enemy AI Logic
    useEffect(() => {
      if (!isInCombat || !activeCharacter || isPlayerTurn || !activeCombatState) return;

      if (activeCharacter.hp > 0) {
        // Simple Enemy AI
        setTimeout(() => {
          const availableSkills = activeCharacter.skills;
          const skillToUse = availableSkills[Math.floor(Math.random() * availableSkills.length)];
          const livingHeroes = activeCombatState.heroes.filter(h => h.hp > 0);
          if(livingHeroes.length > 0) {
            const target = livingHeroes[Math.floor(Math.random() * livingHeroes.length)];
            onCombatAction(activeCharacter, skillToUse, [target]);
          }
        }, 1000); // Delay for AI action
      }

    }, [activeCharacter, isInCombat, isPlayerTurn, onCombatAction, activeCombatState]);

    useLayoutEffect(() => {
        if (combatLogRef.current) {
            combatLogRef.current.scrollTop = combatLogRef.current.scrollHeight;
        }
    }, [activeCombatState?.combatLog]);


    const currentNode = dungeonMap[currentNodeId];

     useEffect(() => {
        if (!selectedHero || !party.some(h => h.id === selectedHero.id)) {
            setSelectedHero(party[0] || null);
        }
    }, [party, selectedHero]);
    
    // Reset skill selection on turn change
    useEffect(() => {
        setSelectedSkill(null);
        setSelectedTargets([]);
    }, [activeCharacterId]);

    // Effect for resetting room state ON MOVE
    useLayoutEffect(() => {
        const viewportWidth = containerRef.current?.offsetWidth ?? 0;
        const partyWidth = partyRef.current?.offsetWidth ?? 0;
        const locationTotalWidth = (locationWidthVw / 100) * window.innerWidth;

        let startPartyX = 10;
        let startCameraX = 0;

        if (lastMoveDirection.current === 'left') { // Came from the right
            startPartyX = locationTotalWidth - partyWidth - 10;
            startCameraX = locationTotalWidth - viewportWidth;
        } 
        
        setPositions({ party: startPartyX, camera: startCameraX });
        
        setIsAtLeftExit(false);
        setIsAtRightExit(false);
        setIsAtCurio(false);
        lastMoveDirection.current = null;
    }, [currentNodeId, locationWidthVw]);

    // Effect for spawning entities
    useEffect(() => {
        if (isInCombat) return; // Don't spawn new things if we're in a fight
        setEnemies([]);
        setCurio(null);

        const node = dungeonMap[currentNodeId];
        if (node) {
            if (node.roomType === 'encounter' && !clearedNodes.has(currentNodeId)) {
                let enemyTypesToSpawn = ['Cultist Acolyte', 'Ghoul'];
                if (mission.id === 'rm_act_1') {
                    enemyTypesToSpawn = ['Straitjacket Patient', 'Broken Bottle Patient', 'Lobotomy Cage Patient', 'Wild Dog'];
                }
                const numEnemies = Math.floor(Math.random() * 2) + 2; // 2-3 enemies
                const newEnemies = Array.from({ length: numEnemies }, (_, i) => {
                    const enemyTypeToSpawn = enemyTypesToSpawn[Math.floor(Math.random() * enemyTypesToSpawn.length)];
                    const baseEnemy = ENEMY_TYPES[enemyTypeToSpawn];
                    return {
                        ...baseEnemy,
                        id: `enemy-${Date.now()}-${i}`,
                        hp: baseEnemy.maxHp,
                        statusEffects: [],
                    };
                });
                setEnemies(newEnemies);
            }
            if (node.curioId && !clearedNodes.has(currentNodeId)) {
                setCurio(CURIOS_MAP[node.curioId]);
            }
        }
    }, [currentNodeId, dungeonMap, clearedNodes, mission.id, isInCombat]);
    
    // Effect for checking Act 1 Objective
    const totalRooms = useMemo(() => Object.values(dungeonMap).filter(n => n.type === 'room').length, [dungeonMap]);
    useEffect(() => {
        if (mission.id === 'rm_act_1' && !isObjectiveComplete) {
            const visitedRooms = Array.from(visitedNodes).filter(nodeId => dungeonMap[nodeId]?.type === 'room').length;
            if (totalRooms > 0 && (visitedRooms / totalRooms) >= 0.7) {
                setIsObjectiveComplete(true);
                setShowObjectiveModal(true);
            }
        }
    }, [visitedNodes, mission.id, isObjectiveComplete, dungeonMap, totalRooms]);


    const move = useCallback((nextNodeId: string, direction: MovementDirection) => {
        if (!nextNodeId || enemies.length > 0 || isInCombat) return;

        const nextNode = dungeonMap[nextNodeId];
        if (!nextNode) return;

        lastMoveDirection.current = direction;
        
        setVisitedNodes(prev => {
            const newVisited = new Set(prev);
            newVisited.add(currentNodeId);
            newVisited.add(nextNodeId);
            return newVisited;
        });

        setCurrentNodeId(nextNodeId);
    }, [dungeonMap, enemies, isInCombat, currentNodeId, setCurrentNodeId, setVisitedNodes]);

    const handleCurioInteraction = (hero: Hero) => {
        if (!curio) return;
        const rand = Math.random();
        let cumulativeChance = 0;
        let chosenOutcome: CurioOutcome | null = null;
        for (const outcome of curio.outcomes) {
            cumulativeChance += outcome.chance;
            if (rand <= cumulativeChance) {
                chosenOutcome = outcome;
                break;
            }
        }
        onCurioResult(hero, curio, chosenOutcome);
        setShowHeroSelectForCurio(null);
        setCurio(null);
    };

    const handleSkillSelect = (skill: Skill) => {
        if (!isPlayerTurn) return;
        setSelectedSkill(skill);
        setSelectedTargets([]);
    };

    const handleTargetSelect = (target: Character) => {
        if (!selectedSkill || !activeCharacter || !activeCombatState) return;

        const isTargetHero = activeCombatState.heroes.some(h => h.id === target.id);
        
        const isCompatibleTarget = 
            (isTargetHero && (selectedSkill.target === SkillTarget.Ally || selectedSkill.target === SkillTarget.AllAllies || (selectedSkill.target === SkillTarget.Self && target.id === activeCharacter.id))) ||
            (!isTargetHero && (selectedSkill.target === SkillTarget.Enemy || selectedSkill.target === SkillTarget.AllEnemies));

        if(isCompatibleTarget) {
            onCombatAction(activeCharacter, selectedSkill, [target]);
            setSelectedSkill(null);
        }
    };

    const gameLoop = useCallback((timestamp: number) => {
        if (lastUpdateTime.current === 0) lastUpdateTime.current = timestamp;
        const deltaTime = (timestamp - lastUpdateTime.current) / 1000;
        lastUpdateTime.current = timestamp;

        if (showHeroSelectForCurio || isInCombat) {
            animationFrameId.current = requestAnimationFrame(gameLoop);
            return;
        }

        setPositions(prev => {
            let { party: newPartyPosition, camera: newCameraPosition } = prev;

            const viewportWidth = containerRef.current?.offsetWidth ?? 0;
            const partyWidth = partyRef.current?.offsetWidth ?? 0;
            const locationTotalWidth = (locationWidthVw / 100) * window.innerWidth;

            if (keysPressed['ArrowRight']) newPartyPosition += MOVEMENT_SPEED * deltaTime;
            if (keysPressed['ArrowLeft']) newPartyPosition -= MOVEMENT_SPEED * deltaTime;
            
            newPartyPosition = Math.max(0, Math.min(newPartyPosition, locationTotalWidth - partyWidth));

            const deadZoneStart = viewportWidth * 0.4;
            const deadZoneEnd = viewportWidth * 0.6;
            const partyPositionInView = newPartyPosition - newCameraPosition;
            
            if (partyPositionInView < deadZoneStart) {
                newCameraPosition = newPartyPosition - deadZoneStart;
            } else if (partyPositionInView + partyWidth > deadZoneEnd) {
                newCameraPosition = newPartyPosition + partyWidth - deadZoneEnd;
            }

            newCameraPosition = Math.max(0, Math.min(newCameraPosition, locationTotalWidth - viewportWidth));

            if (enemies.length > 0 && partyRef.current && containerRef.current) {
                const partyRect = partyRef.current.getBoundingClientRect();
                const enemyElements = containerRef.current.querySelectorAll('.enemy-sprite');
                let collision = false;
                enemyElements.forEach(enemyEl => {
                    const enemyRect = enemyEl.getBoundingClientRect();
                    if (partyRect.right > enemyRect.left && partyRect.left < enemyRect.right) collision = true;
                });
                if (collision) {
                    preCombatPositionsRef.current = { party: newPartyPosition, camera: newCameraPosition };
                    startCombat(party, enemies);
                    setEnemies([]);
                }
            }

            if (curio && partyRef.current && containerRef.current) {
                const partyRect = partyRef.current.getBoundingClientRect();
                const curioEl = containerRef.current.querySelector('.curio-sprite');
                setIsAtCurio(!!curioEl && (partyRect.right > curioEl.getBoundingClientRect().left && partyRect.left < curioEl.getBoundingClientRect().right));
            } else {
                setIsAtCurio(false);
            }
            
            const rightExitThreshold = Math.max(0, locationTotalWidth - partyWidth - 1);
            setIsAtLeftExit(newPartyPosition <= 0 && enemies.length === 0);
            setIsAtRightExit(newPartyPosition >= rightExitThreshold && enemies.length === 0);
            
            return { party: newPartyPosition, camera: newCameraPosition };
        });

        animationFrameId.current = requestAnimationFrame(gameLoop);
    }, [enemies.length, party, startCombat, curio, showHeroSelectForCurio, isInCombat, locationWidthVw]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (showHeroSelectForCurio || showObjectiveModal || isInCombat) return;
            
            keysPressed[e.key] = true;
        
            if (e.repeat) return;
        
            if (e.code === 'Space' && isAtCurio && curio) {
                setShowHeroSelectForCurio(curio);
            }
        
            if ((isAtLeftExit || isAtRightExit) && currentNode?.exits) {
                if (e.key === 'ArrowUp' && currentNode.exits.up) move(currentNode.exits.up, 'up');
                if (e.key === 'ArrowDown' && currentNode.exits.down) move(currentNode.exits.down, 'down');
                if (e.key === 'ArrowLeft' && currentNode.exits.left) move(currentNode.exits.left, 'left');
                if (e.key === 'ArrowRight' && currentNode.exits.right) move(currentNode.exits.right, 'right');
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => { keysPressed[e.key] = false; };
        
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        animationFrameId.current = requestAnimationFrame(gameLoop);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        };
    }, [gameLoop, isAtLeftExit, isAtRightExit, move, currentNode, isAtCurio, curio, showHeroSelectForCurio, showObjectiveModal, isInCombat]);


    if (!currentNode) return <div className="p-8 text-center h-full flex items-center justify-center">Loading...</div>;
    
    const renderCombatEntities = () => {
        if (!activeCombatState) return null;
        
        const renderCharacterSprite = (character: Character) => {
            const isHero = 'heroClass' in character;
            const isTargetable = isPlayerTurn && selectedSkill && (
                (isHero && (selectedSkill.target === SkillTarget.Ally || selectedSkill.target === SkillTarget.AllAllies || (selectedSkill.target === SkillTarget.Self && character.id === activeCharacter?.id))) ||
                (!isHero && (selectedSkill.target === SkillTarget.Enemy || selectedSkill.target === SkillTarget.AllEnemies))
            );
            
            return (
                <div 
                    key={character.id}
                    onClick={isTargetable ? () => handleTargetSelect(character) : undefined}
                    className={`relative flex flex-col items-center transition-all duration-200 group
                        ${isTargetable ? 'cursor-pointer hover:scale-110' : ''}
                        ${activeCharacter?.id === character.id ? 'scale-105' : 'scale-100'}
                        ${character.hp <= 0 ? 'opacity-40 grayscale' : ''}
                    `}
                >
                    {activeCharacter?.id === character.id && character.hp > 0 && <div className="absolute -top-4 text-amber-400 text-3xl animate-bounce">▼</div>}
                    
                    {isHero ? <InvestigatorSprite hero={character as Hero} /> : <EnemySprite enemy={character as Enemy} />}
                    
                    {character.hp > 0 && (
                        <div className={`w-28 -mt-6 z-10 p-1 ${isTargetable ? 'bg-green-800/80' : ''}`}>
                            <div className="h-3 bg-red-900/70 border border-red-800">
                                <div className="h-full bg-green-500" style={{width: `${(character.hp / character.maxHp) * 100}%`}}></div>
                            </div>
                        </div>
                    )}
                </div>
            );
        };

        return (
            <>
                <div className="absolute bottom-8 left-16 flex items-end -space-x-8">
                     {activeCombatState.heroes.map(renderCharacterSprite)}
                </div>
                <div className="absolute bottom-8 right-16 flex items-end -space-x-8">
                    {activeCombatState.enemies.map(renderCharacterSprite)}
                </div>
            </>
        );
    }
    
    const renderExplorationPrompts = () => (
        <>
            {isAtCurio && curio && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-20 bg-black/80 p-4 border-2 border-amber-400 text-center font-cinzel text-xl shadow-lg z-20">
                    <p>Examine <span className="text-amber-300">{curio.name}</span></p>
                    <p className="text-sm mt-1 text-stone-400">"{curio.description}"</p>
                    <div className="mt-2 text-amber-300">[ SPACE ]</div>
                </div>
            )}
            {(isAtLeftExit || isAtRightExit) && Object.values(currentNode.exits).some(v => v) && enemies.length === 0 && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 p-6 border-2 border-cyan-400 text-center font-cinzel text-2xl shadow-lg flex flex-col gap-3 z-20">
                    <p>Choose a Path</p>
                    <div className="grid grid-cols-3 items-center justify-items-center gap-x-4 gap-y-2 text-cyan-300 text-3xl">
                        <div className="w-8 h-8"></div>
                        <div className="w-8 h-8 flex items-center justify-center">{currentNode.exits.up && <span>[↑]</span>}</div>
                        <div className="w-8 h-8"></div>
                        <div className="w-8 h-8 flex items-center justify-center">{currentNode.exits.left && <span>[←]</span>}</div>
                        <div className="w-8 h-8 flex items-center justify-center"><div className="w-4 h-4 bg-cyan-500 rounded-full"></div></div>
                        <div className="w-8 h-8 flex items-center justify-center">{currentNode.exits.right && <span>[→]</span>}</div>
                        <div className="w-8 h-8"></div>
                        <div className="w-8 h-8 flex items-center justify-center">{currentNode.exits.down && <span>[↓]</span>}</div>
                        <div className="w-8 h-8"></div>
                    </div>
                </div>
            )}
        </>
    );
    
    const renderObjectiveModal = () => !showObjectiveModal ? null : (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <Card className="border-4 border-green-700 max-w-lg w-full text-center">
                <h2 className="text-3xl font-cinzel text-green-400">Objective Complete!</h2>
                <p className="my-4 text-stone-300">"{mission.objective}"</p>
                <p className="font-bold mb-6">You have successfully scouted the area. You can return to Arkham now with your findings, or press on into the darkness.</p>
                <div className="flex justify-center gap-4">
                    <Button onClick={() => setShowObjectiveModal(false)} variant="secondary">Continue Exploring</Button>
                    <Button onClick={() => endMission('success')} variant="primary">Return to Arkham</Button>
                </div>
            </Card>
        </div>
    );
    
    const renderExplorationUI = () => (
        <div className="flex-shrink-0 basis-1/3 bg-stone-900 border-t-4 border-cyan-800 flex p-4 gap-4 overflow-hidden">
            <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-2 min-h-0">
                 <div className="flex gap-2 flex-wrap">
                    {party.map(hero => (
                        <div key={hero.id} onClick={() => setSelectedHero(hero)} className={`flex-grow cursor-pointer p-2 border-2 transition-colors duration-200 text-center ${selectedHero?.id === hero.id ? 'border-amber-400 bg-amber-900/50' : 'border-stone-700 hover:bg-stone-800'}`}>
                            <p className="font-cinzel text-sm font-bold truncate">{hero.name}</p>
                            <p className="text-xs text-stone-400">{hero.hp}/{hero.maxHp} HP</p>
                            <p className="text-xs text-stone-400">{hero.stress}/{hero.maxStress} S</p>
                        </div>
                    ))}
                </div>
                {selectedHero ? <div className="mt-2 flex-1 overflow-y-auto"><CharacterCard hero={selectedHero} /></div>
                : <div className="flex-1 flex items-center justify-center text-stone-500"><p>No character selected.</p></div>}
            </div>
            <div className="w-60 flex-shrink-0 flex flex-col justify-between items-center gap-4">
                <Minimap dungeonMap={dungeonMap} currentNodeId={currentNodeId} visitedNodes={visitedNodes} />
                <Button onClick={() => endMission(isObjectiveComplete ? 'success' : 'failure')} variant={isObjectiveComplete ? 'primary' : 'danger'} className="w-full">
                    {isObjectiveComplete ? 'Complete Mission' : 'Retreat'}
                </Button>
            </div>
        </div>
    );

    const renderCombatUI = () => {
        if (!activeCombatState) return null;
        return (
            <div className="flex-shrink-0 basis-1/3 bg-black/80 border-t-4 border-red-800 p-4 flex gap-4 overflow-hidden">
                {/* Party Status Column */}
                <div className="w-1/3 flex flex-col gap-2 bg-black/30 p-2 border border-stone-700">
                    <h2 className="font-cinzel text-xl border-b border-stone-600 pb-1 mb-1 flex-shrink-0">Party Status</h2>
                    <div className="flex-grow space-y-3 overflow-y-auto pr-1">
                        {activeCombatState.heroes.map(hero => (
                            <div key={hero.id}>
                                <div className="flex justify-between items-baseline">
                                    <p className="font-bold text-amber-300 truncate">{hero.name}</p>
                                    <p className="text-xs text-stone-400 flex-shrink-0 ml-2">{hero.hp}/{hero.maxHp}</p>
                                </div>
                                <div className="w-full bg-red-900/70 border border-red-900 h-2 mt-1">
                                    <div className="bg-green-500 h-full" style={{ width: `${(hero.hp / hero.maxHp) * 100}%` }}></div>
                                </div>
                                <div className="w-full bg-stone-700/80 border border-stone-600 h-2 mt-1">
                                    <div className="bg-amber-400 h-full" style={{ width: `${(hero.stress / hero.maxStress) * 100}%` }}></div>
                                </div>
                                <div className="flex justify-start items-center gap-2 mt-1 h-5">
                                    {hero.statusEffects.map((status, index) => (
                                        <div key={index} className="text-lg relative">
                                            {getStatusIcon(status)}
                                            <span className="absolute -bottom-1 -right-1 text-xs font-bold bg-black/80 rounded-full px-1">{status.duration}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Skills Column */}
                <div className="w-1/3 flex flex-col">
                    <h2 className="font-cinzel text-xl mb-2 flex-shrink-0">
                        Turn: <span className="text-amber-300">{activeCharacter?.name}</span>
                    </h2>
                    <div className="grid grid-cols-2 gap-2 flex-grow">
                        {isPlayerTurn && (activeCharacter as Hero)?.skills?.map(skill => (
                            <button
                                key={skill.name}
                                onClick={() => handleSkillSelect(skill)}
                                disabled={!isPlayerTurn || activeCharacter?.statusEffects.some(s => s.type === 'stun')}
                                className={`p-2 border-2 text-left transition-all duration-200 h-full flex flex-col justify-between
                                    ${selectedSkill?.name === skill.name ? 'bg-cyan-700 border-cyan-400 scale-105' : 'bg-stone-900/80 border-stone-700 hover:border-cyan-600'}
                                    disabled:bg-stone-800 disabled:border-stone-700 disabled:text-stone-500 disabled:cursor-not-allowed`}
                            >
                                <p className="font-bold font-cinzel">{skill.name}</p>
                                <p className="text-xs text-stone-400 mt-1">{skill.description}</p>
                            </button>
                        ))}
                        {!isPlayerTurn && (
                             <div className="col-span-2 flex items-center justify-center text-stone-400 text-center">
                                <p className="font-cinzel text-lg">Enemy is thinking...</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Battle Log Column */}
                <div className="w-1/3 flex flex-col">
                    <h2 className="font-cinzel text-xl mb-2 flex-shrink-0">Battle Log</h2>
                    <div ref={combatLogRef} className="flex-grow bg-stone-900/80 p-2 border border-stone-700 text-sm overflow-y-auto">
                        {activeCombatState.combatLog.map((logEntry) => (
                            <p key={logEntry.id} className={`${getLogMessageStyle(logEntry.type)} border-b border-stone-800/50 pb-1 mb-1`}>{logEntry.message}</p>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col text-white bg-stone-950 overflow-hidden">
            {showHeroSelectForCurio && <CurioInteractionModal curio={showHeroSelectForCurio} party={party} onSelectHero={handleCurioInteraction} onCancel={() => setShowHeroSelectForCurio(null)} />}
            {renderObjectiveModal()}
            
            <div ref={containerRef} className={`flex-grow basis-2/3 relative w-full overflow-hidden transform transition-transform duration-500 ease-in-out ${isInCombat ? 'scale-110' : 'scale-100'}`}>
                <div 
                    className="relative h-full"
                    style={{ 
                        width: `${locationWidthVw}vw`,
                        transform: `translateX(-${cameraPositionX}px)`,
                    }}
                >
                    <div className="absolute inset-0"><RoomArt node={currentNode} /></div>
                    
                    {isInCombat ? renderCombatEntities() : (
                        <>
                           <div 
                                ref={partyRef}
                                className="absolute bottom-8 flex items-end -space-x-8"
                                style={{ left: `${partyPositionX}px` }}
                            >
                                {party.map(hero => <InvestigatorSprite key={hero.id} hero={hero} />)}
                            </div>
                            {enemies.map((enemy, index) => (
                                 <div key={enemy.id} className="absolute bottom-8" style={{ right: `${100 + index * 120}px` }}>
                                    <EnemySprite enemy={enemy} />
                                 </div>
                            ))}
                            {curio && (
                                <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                                    <CurioSprite curio={curio} />
                                </div>
                            )}
                        </>
                    )}
                </div>
                
                {!isInCombat && renderExplorationPrompts()}

                 {curioInteractionLog.length > 0 && (
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-black/80 p-4 border-2 border-purple-400 text-center font-cinzel text-lg shadow-lg max-w-md z-20">
                        {curioInteractionLog.map((line, index) => <p key={index} className="text-stone-300">{line}</p>)}
                    </div>
                )}
            </div>
            
            {isInCombat ? renderCombatUI() : renderExplorationUI()}
        </div>
    );
};