import React, { useState, useEffect } from 'react';
import { GameView, Mission, GameState } from '../types';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { generateMissions } from '../services/gameContentService';
import { ICONS } from '../config/constants';

interface MissionBoardViewProps {
  setView: (view: GameView) => void;
  startMission: (mission: Mission) => void;
  gameState: GameState;
}

export const MissionBoardView: React.FC<MissionBoardViewProps> = ({ setView, startMission, gameState }) => {
  const [missions, setMissions] = useState<Mission[]>([]);

  useEffect(() => {
    const allCampaignMissions = generateMissions();
    const completedIds = new Set(gameState.completedMissionIds);
    const availableMissions: Mission[] = [];

    // Find the next mission to display
    for (let i = 0; i < allCampaignMissions.length; i++) {
        const mission = allCampaignMissions[i];
        if (!completedIds.has(mission.id)) {
            // This is the first uncompleted mission, it's the only one available.
            availableMissions.push(mission);
            break; // Stop looking, we only show one mission at a time.
        }
    }
    
    setMissions(availableMissions);
  }, [gameState.completedMissionIds]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-cinzel">Case Files</h1>
        <Button onClick={() => setView(GameView.Hub)} variant="secondary">Back to Arkham</Button>
      </div>
      <p className="text-stone-400 mb-8 border-t-2 border-b-2 border-stone-800 py-2">Disturbing reports from across the city demand investigation. Choose your case, but be warned: the truth is often worse than the rumors.</p>
      
      {missions.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {missions.map(mission => (
                <Card key={mission.id} className="flex flex-col justify-between">
                    <div>
                        <h2 className="text-2xl font-cinzel text-cyan-300">{mission.name}</h2>
                        <div className="flex justify-between items-center text-sm text-stone-400 my-2">
                            <span>Difficulty: <span className="font-bold text-white">{mission.difficulty}</span></span>
                            <span className="flex items-center gap-1">Reward: <span className="font-bold text-amber-300">{mission.reward} {ICONS.GOLD}</span></span>
                        </div>
                        <p className="text-stone-400 italic mb-4">"{mission.description}"</p>
                        {mission.objective && <p className="font-bold text-cyan-200 mb-4">Objective: {mission.objective}</p>}
                    </div>
                    <Button onClick={() => startMission(mission)}>
                        Accept Case
                    </Button>
                </Card>
            ))}
        </div>
      ) : (
          <div className="text-center py-16">
            <p className="text-2xl text-stone-500 font-cinzel">No new cases this week.</p>
            <p className="text-stone-400 mt-2">You have solved all the current mysteries. Perhaps the horrors have subsided... for now.</p>
        </div>
      )}
    </div>
  );
};
