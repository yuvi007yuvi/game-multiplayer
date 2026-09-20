import React, { useState } from 'react';
import { useSocket } from './hooks/useSocket.js';
import { Navbar } from './components/common/Navbar.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { LobbyPage } from './pages/LobbyPage.jsx';
import { GamePage } from './pages/GamePage.jsx';
import { RulesModal } from './components/modals/RulesModal.jsx';
import { ProfileModal } from './components/modals/ProfileModal.jsx';
import { soundEngine } from './services/soundEngine.js';
import { AlertCircle, X } from 'lucide-react';

export function App() {
  const {
    connected,
    userProfile,
    lobbyState,
    gameState,
    roundResult,
    matchResult,
    errorNotification,
    clearError,
    createRoom,
    joinRoom,
    quickPlay,
    fillBots,
    kickBot,
    toggleReady,
    startGame,
    submitBid,
    playCard,
    rematch,
    activeEmotes,
    sendEmote,
    claimBonus,
    updateProfile,
    leaveRoom
  } = useSocket();

  const [rulesOpen, setRulesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  const handleToggleSound = () => {
    const newState = soundEngine.toggle();
    setSoundOn(newState);
  };

  // Determine current active page view
  const isInGame = gameState && gameState.phase !== 'LOBBY';
  const isInLobby = lobbyState && !isInGame;

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-[#0b0f14] text-slate-100 font-sans selection:bg-amber-400 selection:text-black">
      {/* Top App Navbar */}
      <Navbar
        userProfile={userProfile}
        connected={connected}
        soundEnabled={soundOn}
        onToggleSound={handleToggleSound}
        onOpenRules={() => setRulesOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
        onClaimBonus={claimBonus}
      />

      {/* Global Error / Alert Toast */}
      {errorNotification && (
        <div className="fixed top-16 right-4 z-50 flex items-center gap-2 bg-red-950/90 text-red-200 border border-red-500/50 px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-md animate-fade-in max-w-sm">
          <AlertCircle size={18} className="text-red-400 shrink-0" />
          <span className="text-xs font-semibold flex-1">{errorNotification}</span>
          <button
            type="button"
            onClick={clearError}
            className="p-1 text-red-300 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main View Container */}
      <main className="flex-1 flex flex-col items-center justify-center">
        {isInGame ? (
          <GamePage
            gameState={gameState}
            myUserId={userProfile?.id}
            roundResult={roundResult}
            matchResult={matchResult}
            activeEmotes={activeEmotes}
            onSendEmote={sendEmote}
            onSubmitBid={submitBid}
            onPlayCard={playCard}
            onRematch={rematch}
            onLeave={leaveRoom}
          />
        ) : isInLobby ? (
          <LobbyPage
            lobby={lobbyState}
            myUserId={userProfile?.id}
            onFillBots={fillBots}
            onKickBot={kickBot}
            onToggleReady={toggleReady}
            onStartGame={startGame}
            onLeave={leaveRoom}
          />
        ) : (
          <HomePage
            userProfile={userProfile}
            onQuickPlay={quickPlay}
            onCreateRoom={createRoom}
            onJoinRoom={joinRoom}
            onClaimBonus={claimBonus}
          />
        )}
      </main>

      {/* Shared Modals */}
      <RulesModal isOpen={rulesOpen} onClose={() => setRulesOpen(false)} />
      <ProfileModal
        isOpen={profileOpen}
        userProfile={userProfile}
        onUpdateProfile={updateProfile}
        onClose={() => setProfileOpen(false)}
      />
    </div>
  );
}
