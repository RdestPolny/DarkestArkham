import React, { useState, useEffect } from 'react';
import { MissionResultData, PartyMemberResult } from '../types';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { ICONS } from '../config/constants';

interface MissionResultViewProps {
  resultData: MissionResultData;
  onContinue: () => void;
}

const AnimatedXpBar: React.FC<{ result: PartyMemberResult }> = ({ result }) => {
    const [xpWidth, setXpWidth] = useState(0);
    const [currentXp, setCurrentXp] = useState(0);
    const [xpToNext, setXpToNext] = useState(1);

    useEffect(() => {
        const { xp, xpToNextLevel } = result.initialState;
        
        let currentLevel = result.initialState.level;
        let xpForThisLevel = xp;
        let nextLevelRequirement = xpToNextLevel;

        // Initial state before animation
        setXpWidth((xp / xpToNextLevel) * 100);
        setCurrentXp(xp);
        setXpToNext(xpToNextLevel);

        const animationDuration = 1500;
        const frames = 90;
        const intervalTime = animationDuration / frames;
        let frame = 0;
        
        const xpGainPerFrame = result.xpGained / frames;

        const intervalId = setInterval(() => {
            frame++;
            if (frame > frames) {
                clearInterval(intervalId);
                // Ensure final state is accurate to avoid rounding errors
                setXpWidth((result.finalState.xp / result.finalState.xpToNextLevel) * 100);
                setCurrentXp(result.finalState.xp);
                setXpToNext(result.finalState.xpToNextLevel);
                return;
            }

            xpForThisLevel += xpGainPerFrame;
            
            if (xpForThisLevel >= nextLevelRequirement) {
                const levelUpInfo = result.levelUps.find(lu => lu.oldLevel === currentLevel);
                if (levelUpInfo) {
                    xpForThisLevel -= nextLevelRequirement;
                    currentLevel++;
                    nextLevelRequirement = levelUpInfo.newXpToNextLevel;
                    setXpToNext(nextLevelRequirement);
                }
            }

            setCurrentXp(Math.floor(xpForThisLevel));
            setXpWidth((xpForThisLevel / nextLevelRequirement) * 100);

        }, intervalTime);

        return () => clearInterval(intervalId);
    }, [result]);

    return (
        <div>
            <div className="flex items-center justify-between text-sm">
                <span className="font-bold flex items-center">{ICONS.XP} <span className="ml-2">XP:</span></span>
                <span>{currentXp} / {xpToNext}</span>
            </div>
            <div className="w-full bg-purple-900/50 border border-purple-800 h-4 mt-1">
                <div className="bg-purple-400 h-full transition-all duration-100 ease-linear" style={{ width: `${xpWidth}%` }}></div>
            </div>
        </div>
    );
};


export const MissionResultView: React.FC<MissionResultViewProps> = ({ resultData, onContinue }) => {
    const { result, partyResults, goldReward } = resultData;
    const isSuccess = result === 'success';

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-black/80">
            <h1 className={`text-6xl font-cinzel drop-shadow-lg ${isSuccess ? 'text-green-400' : 'text-red-500'}`}>
                {isSuccess ? 'Mission Success' : 'Mission Failure'}
            </h1>
            {isSuccess && <p className="text-amber-400 text-2xl mt-4">Reward: {goldReward} {ICONS.GOLD}</p>}

            <div className="mt-8 w-full max-w-4xl">
                <h2 className="text-2xl font-cinzel mb-4">Expedition Report</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {partyResults.map(pr => (
                        <Card key={pr.id} className="text-left">
                           <h3 className="text-xl font-cinzel text-amber-300">{pr.name}</h3>
                           <p className="text-sm text-stone-400 mb-4">{pr.heroClass}</p>

                           {isSuccess ? (
                            <>
                               <p className="mb-2">XP Gained: <span className="text-purple-300 font-bold">+{pr.xpGained}</span></p>
                               <AnimatedXpBar result={pr} />
                               {pr.levelUps.length > 0 && (
                                   <div className="mt-4 pt-4 border-t border-stone-700">
                                       {pr.levelUps.map(lu => (
                                           <div key={lu.newLevel}>
                                                <p className="text-2xl font-cinzel text-green-400 animate-pulse">LEVEL UP!</p>
                                                <p>Level {lu.oldLevel} → {lu.newLevel}</p>
                                                <ul className="text-sm text-green-300 mt-2 list-disc list-inside">
                                                    {lu.statIncreases.map(s => <li key={s}>{s}</li>)}
                                                </ul>
                                           </div>
                                       ))}
                                   </div>
                               )}
                            </>
                           ) : (
                               <p className="text-red-400">Gained no experience.</p>
                           )}
                        </Card>
                    ))}
                </div>
            </div>

            <Button onClick={onContinue} className="mt-8">Continue</Button>
        </div>
    );
};
