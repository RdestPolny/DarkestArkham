import React, { useState } from 'react';
import { GameState, GameView, Hero, Skill } from '../types';
import { Button } from '../components/common/Button';
import { ICONS, SKILL_UPGRADE_COST_MULTIPLIER } from '../config/constants';
import { Card } from '../components/common/Card';

interface UniversityViewProps {
  setView: (view: GameView) => void;
  gameState: GameState;
  updateGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export const UniversityView: React.FC<UniversityViewProps> = ({ setView, gameState, updateGameState }) => {
    const [selectedHero, setSelectedHero] = useState<Hero | null>(null);

    const handleSelectHero = (hero: Hero) => {
        setSelectedHero(hero);
    }

    const handleUpgradeSkill = (skillToUpgrade: Skill) => {
        if (!selectedHero) return;
        
        const newLevel = skillToUpgrade.level + 1;
        const cost = newLevel * SKILL_UPGRADE_COST_MULTIPLIER;

        if (gameState.gold >= cost && selectedHero.level >= newLevel && newLevel <= skillToUpgrade.maxLevel) {
            updateGameState(prev => {
                const newRoster = prev.roster.map(hero => {
                    if (hero.id === selectedHero.id) {
                        const newSkills = hero.skills.map(skill => {
                            if (skill.name === skillToUpgrade.name) {
                                return { ...skill, level: newLevel };
                            }
                            return skill;
                        });
                        return { ...hero, skills: newSkills };
                    }
                    return hero;
                });

                return {
                    ...prev,
                    gold: prev.gold - cost,
                    roster: newRoster,
                }
            });

            // Also update the selected hero state to reflect the change immediately
            setSelectedHero(prevHero => {
                if (!prevHero) return null;
                const newSkills = prevHero.skills.map(skill => skill.name === skillToUpgrade.name ? { ...skill, level: newLevel } : skill);
                return {...prevHero, skills: newSkills};
            });
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-cinzel text-purple-400">Miskatonic University</h1>
                <Button onClick={() => setView(GameView.Hub)} variant="secondary">Back to Arkham</Button>
            </div>
            <p className="text-stone-400 mb-8 border-t-2 border-b-2 border-stone-800 py-2">The quiet halls of the university library hold knowledge best left undisturbed. Here, investigators can hone their skills... for a price.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Roster List */}
                <div className="md:col-span-1">
                    <Card>
                        <h2 className="text-2xl font-cinzel border-b-2 border-stone-700 pb-2 mb-4">Select Investigator</h2>
                        <ul className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                           {gameState.roster.map(hero => (
                               <li 
                                key={hero.id}
                                onClick={() => handleSelectHero(hero)}
                                className={`p-3 border-2 transition-all duration-200 cursor-pointer ${selectedHero?.id === hero.id ? 'bg-purple-900/50 border-purple-500' : 'bg-stone-800/50 border-stone-700 hover:border-purple-700'}`}
                               >
                                  <p className="font-bold text-lg font-cinzel text-amber-300">{hero.name}</p>
                                  <p className="text-sm text-stone-400">Lvl {hero.level} {hero.heroClass}</p>
                               </li>
                           ))}
                        </ul>
                    </Card>
                </div>

                {/* Skill Upgrade Panel */}
                <div className="md:col-span-2">
                    <Card>
                        <h2 className="text-2xl font-cinzel border-b-2 border-stone-700 pb-2 mb-4">Train Skills</h2>
                        {selectedHero ? (
                            <div className="space-y-4">
                                {selectedHero.skills.map(skill => {
                                    const nextLevel = skill.level + 1;
                                    const cost = nextLevel * SKILL_UPGRADE_COST_MULTIPLIER;
                                    const canAfford = gameState.gold >= cost;
                                    const meetsLevelReq = selectedHero.level >= nextLevel;
                                    const isMaxLevel = skill.level >= skill.maxLevel;
                                    const canUpgrade = canAfford && meetsLevelReq && !isMaxLevel;

                                    return (
                                        <div key={skill.name} className="bg-stone-900/70 p-4 border border-stone-800 flex justify-between items-center">
                                            <div>
                                                <h3 className="text-xl font-cinzel text-cyan-300">{skill.name} <span className="text-base text-stone-400">(Level {skill.level})</span></h3>
                                                <p className="text-sm italic text-stone-400 mt-1">{skill.description}</p>
                                                {!isMaxLevel && !meetsLevelReq && <p className="text-red-500 text-xs mt-1">Requires Hero Level {nextLevel}</p>}
                                            </div>
                                            <div>
                                                {isMaxLevel ? (
                                                    <span className="text-green-400 font-bold">MAX</span>
                                                ) : (
                                                    <Button onClick={() => handleUpgradeSkill(skill)} disabled={!canUpgrade}>
                                                        Upgrade ({cost}{ICONS.GOLD})
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <p className="text-stone-500 text-xl">Select an investigator from the roster to train their skills.</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};
