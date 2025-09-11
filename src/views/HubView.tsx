import React from 'react';
import { GameView } from '../types';
import { ICONS } from '../config/constants';

interface HubViewProps {
  setView: (view: GameView) => void;
}

export const HubView: React.FC<HubViewProps> = ({ setView }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-cover bg-center" style={{backgroundImage: "url('https://picsum.photos/seed/arkham-city/1920/1080')"}}>
        <div className="bg-black/70 p-10 border-4 border-stone-800 shadow-2xl shadow-black">
            <h1 className="text-6xl font-cinzel text-cyan-200 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Arkham</h1>
            <p className="text-stone-400 mt-2 mb-8 max-w-lg">The oldest and strongest emotion of mankind is fear, and the oldest and strongest kind of fear is fear of the unknown.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div 
                    onClick={() => setView(GameView.Tavern)}
                    className="p-6 border-2 border-stone-700 hover:border-cyan-500 bg-stone-900/80 cursor-pointer transition-all duration-200 transform hover:scale-105"
                >
                    <h2 className="text-2xl font-cinzel text-cyan-400">Recruitment Office</h2>
                    <p className="text-stone-400 mt-2">Hire new investigators drawn to the city.</p>
                </div>
                <div 
                    onClick={() => setView(GameView.MissionBoard)}
                    className="p-6 border-2 border-stone-700 hover:border-cyan-500 bg-stone-900/80 cursor-pointer transition-all duration-200 transform hover:scale-105"
                >
                    <h2 className="text-2xl font-cinzel text-cyan-400">Case Files</h2>
                    <p className="text-stone-400 mt-2">Look into strange and unsettling events.</p>
                </div>
                <div 
                    onClick={() => setView(GameView.Roster)}
                    className="p-6 border-2 border-stone-700 hover:border-cyan-500 bg-stone-900/80 cursor-pointer transition-all duration-200 transform hover:scale-105"
                >
                    <h2 className="text-2xl font-cinzel text-cyan-400">Investigator Roster</h2>
                    <p className="text-stone-400 mt-2">Manage your team of investigators.</p>
                </div>
                 <div 
                    onClick={() => setView(GameView.Asylum)}
                    className="p-6 border-2 border-stone-700 hover:border-cyan-300 bg-stone-900/80 cursor-pointer transition-all duration-200 transform hover:scale-105"
                >
                    <h2 className="text-2xl font-cinzel text-cyan-200">Arkham Asylum</h2>
                    <p className="text-stone-400 mt-2">Treat the minds of stressed investigators.</p>
                </div>
                <div 
                    onClick={() => setView(GameView.Sewers)}
                    className="p-6 border-2 border-stone-700 hover:border-green-500 bg-stone-900/80 cursor-pointer transition-all duration-200 transform hover:scale-105"
                >
                    <h2 className="text-2xl font-cinzel text-green-400">Old Sewers</h2>
                    <p className="text-stone-400 mt-2">Acquire strange and unusual trinkets.</p>
                </div>
                <div 
                    onClick={() => setView(GameView.University)}
                    className="p-6 border-2 border-stone-700 hover:border-purple-500 bg-stone-900/80 cursor-pointer transition-all duration-200 transform hover:scale-105"
                >
                    <h2 className="text-2xl font-cinzel text-purple-400">Miskatonic University</h2>
                    <p className="text-stone-400 mt-2">Study forbidden tomes to enhance skills.</p>
                </div>
            </div>
        </div>
    </div>
  );
};