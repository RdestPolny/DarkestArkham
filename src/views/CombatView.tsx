import React, { useState, useEffect, useMemo } from 'react';
import { CombatState, Character, Skill, Hero, Enemy, SkillTarget } from '../types';
import { Button } from '../components/common/Button';
import { CombatCharacterDisplay } from '../components/game/CombatCharacterDisplay';

interface CombatViewProps {
  combatState: CombatState;
  onCombatAction: (user: Character, skill: Skill, targets: Character[]) => void;
  endCombat: (result: 'victory' | 'retreat') => void;
}

export const CombatView: React.FC<CombatViewProps> = ({ combatState, onCombatAction, endCombat }) => {
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
    const [selectedTargets, setSelectedTargets] = useState<Character[]>([]);
    const [isPlayerTurn, setIsPlayerTurn] = useState(false);

    const activeCharacterId = combatState.turnQueue[combatState.turnIndex];
    const activeCharacter = useMemo(() => 
        [...combatState.heroes, ...combatState.enemies].find(c => c.id === activeCharacterId)
    , [activeCharacterId, combatState.heroes, combatState.enemies]);
    
    useEffect(() => {
      if (!activeCharacter) return;

      const isHero = combatState.heroes.some(h => h.id === activeCharacter.id);
      setIsPlayerTurn(isHero);
      setSelectedSkill(null);
      setSelectedTargets([]);

      if (!isHero && activeCharacter.hp > 0) {
        // Simple Enemy AI
        setTimeout(() => {
          const availableSkills = activeCharacter.skills;
          const skillToUse = availableSkills[Math.floor(Math.random() * availableSkills.length)];
          const livingHeroes = combatState.heroes.filter(h => h.hp > 0);
          if(livingHeroes.length > 0) {
            const target = livingHeroes[Math.floor(Math.random() * livingHeroes.length)];
            onCombatAction(activeCharacter, skillToUse, [target]);
          }
        }, 1000); // Delay for AI action
      }

    }, [activeCharacter, combatState.heroes, onCombatAction]);

    const handleSkillSelect = (skill: Skill) => {
        if (!isPlayerTurn) return;
        setSelectedSkill(skill);
        setSelectedTargets([]); // Reset targets when new skill is selected
    };

    const handleTargetSelect = (target: Character) => {
        if (!selectedSkill) return;
        // Basic target validation
        const isHero = combatState.heroes.some(h => h.id === target.id);
        const isValidTarget = 
            (isHero && (selectedSkill.target === SkillTarget.Ally || selectedSkill.target === SkillTarget.Self)) ||
            (!isHero && selectedSkill.target === SkillTarget.Enemy);

        if(isValidTarget) {
            setSelectedTargets([target]);
        }
    };
    
    useEffect(() => {
        if (selectedSkill && selectedTargets.length > 0 && activeCharacter) {
            onCombatAction(activeCharacter, selectedSkill, selectedTargets);
        }
    }, [selectedTargets]);


    return (
        <div className="h-full flex flex-col text-white bg-stone-950 bg-cover bg-center" style={{backgroundImage: "url('https://picsum.photos/seed/dungeon-battle/1920/1080')"}}>
            <div className="absolute inset-0 bg-black/60"></div>

            <div className="relative z-10 flex flex-col h-full">
                {/* Enemy Lineup */}
                <div className="flex-grow flex justify-center items-center gap-8">
                    {combatState.enemies.map(enemy => (
                         <CombatCharacterDisplay 
                            key={enemy.id} 
                            character={enemy} 
                            isTurn={activeCharacter?.id === enemy.id}
                            isSelected={selectedTargets.some(t => t.id === enemy.id)}
                            onClick={isPlayerTurn && selectedSkill ? () => handleTargetSelect(enemy) : undefined}
                            isTargetable={isPlayerTurn && selectedSkill?.target === SkillTarget.Enemy}
                         />
                    ))}
                </div>

                {/* Hero Lineup */}
                <div className="flex-grow flex justify-center items-center gap-8">
                     {combatState.heroes.map(hero => (
                         <CombatCharacterDisplay 
                            key={hero.id} 
                            character={hero} 
                            isTurn={activeCharacter?.id === hero.id}
                            isSelected={selectedTargets.some(t => t.id === hero.id)}
                            onClick={isPlayerTurn && selectedSkill ? () => handleTargetSelect(hero) : undefined}
                            isTargetable={isPlayerTurn && selectedSkill?.target !== SkillTarget.Enemy}
                         />
                    ))}
                </div>

                {/* UI Panel */}
                <div className="bg-black/70 border-t-4 border-stone-800 p-4 grid grid-cols-3 gap-4">
                    {/* Character Skills */}
                    <div className="col-span-2">
                        <h2 className="font-cinzel text-xl mb-2">
                            Turn: <span className="text-amber-300">{activeCharacter?.name}</span>
                        </h2>
                        <div className="grid grid-cols-2 gap-2">
                            {(activeCharacter as Hero)?.skills?.map(skill => (
                                <button
                                    key={skill.name}
                                    onClick={() => handleSkillSelect(skill)}
                                    disabled={!isPlayerTurn || activeCharacter?.statusEffects.some(s => s.type === 'stun')}
                                    className={`p-2 border-2 text-left transition-all duration-200
                                        ${selectedSkill?.name === skill.name ? 'bg-cyan-700 border-cyan-400' : 'bg-stone-900/80 border-stone-700 hover:border-cyan-600'}
                                        disabled:bg-stone-800 disabled:border-stone-700 disabled:text-stone-500 disabled:cursor-not-allowed`}
                                >
                                    <p className="font-bold font-cinzel">{skill.name}</p>
                                    <p className="text-xs text-stone-400">{skill.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Combat Log */}
                    <div className="bg-stone-900/80 p-2 border border-stone-700 text-sm h-40 overflow-y-auto flex flex-col-reverse">
                        <div>
                        {/* FIX: Render the 'message' property of the log entry object, not the object itself. Use 'msg.id' for a stable key. */}
                        {combatState.combatLog.slice().reverse().map((msg) => (
                            <p key={msg.id} className="text-stone-300">{msg.message}</p>
                        ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};