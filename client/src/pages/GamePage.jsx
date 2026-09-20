import React, { useState, useRef, useCallback } from 'react';
import { PlayerSeat } from '../components/table/PlayerSeat.jsx';
import { TrickCenter } from '../components/table/TrickCenter.jsx';
import { HandFan } from '../components/table/HandFan.jsx';
import { BiddingSlider } from '../components/table/BiddingSlider.jsx';
import { EmotePicker } from '../components/table/EmotePicker.jsx';
import { RoundResultModal } from '../components/modals/RoundResultModal.jsx';
import { MatchResultModal } from '../components/modals/MatchResultModal.jsx';
import { Table, Award, ShieldAlert, RotateCcw, ArrowLeft, Smile, Maximize2, Minimize2 } from 'lucide-react';
import { GAME_PHASES } from '@shared/constants.js';
import { haptics } from '../services/haptics.js';

export function GamePage({
  gameState,
  myUserId,
  roundResult,
  matchResult,
  activeEmotes = {},
  onSendEmote,
  onSubmitBid,
  onPlayCard,
  onRematch,
  onLeave
}) {
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [emotePickerOpen, setEmotePickerOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isPlayingCardRef = useRef(false);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        await screen.orientation?.lock('landscape').catch(() => {});
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // fullscreen not supported — ignore silently
    }
  }, []);

  if (!gameState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-slate-400 select-none">
        <div className="w-12 h-12 rounded-full border-4 border-amber-400/20 border-t-amber-400 animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wide">Syncing table state with server...</p>
      </div>
    );
  }

  const {
    phase,
    round,
    totalRounds,
    trickNumber,
    currentTurn,
    seats,
    myHand,
    myLegalMoves,
    mySeatIndex,
    currentTrick,
    lastTrick
  } = gameState;

  // Determine opponent seat assignments relative to human player (South)
  const getSeatByRelativeOffset = (offset) => {
    const targetIndex = (mySeatIndex + offset) % 4;
    return seats[targetIndex];
  };

  const southPlayer = seats[mySeatIndex];
  const westPlayer = getSeatByRelativeOffset(1);
  const northPlayer = getSeatByRelativeOffset(2);
  const eastPlayer = getSeatByRelativeOffset(3);

  const isMyTurn = currentTurn === mySeatIndex;
  const isBiddingTurn = phase === GAME_PHASES.BIDDING && isMyTurn && southPlayer && (southPlayer.bid === null || southPlayer.bid === undefined);

  const handlePlayCard = (card) => {
    if (!isMyTurn || phase !== GAME_PHASES.PLAYING) return;
    if (isPlayingCardRef.current) return;
    isPlayingCardRef.current = true;
    setTimeout(() => {
      isPlayingCardRef.current = false;
    }, 600);
    haptics.vibrateCardPlay();
    if (onPlayCard) onPlayCard(card);
  };

  return (
    <div className="relative w-full h-[calc(100dvh-48px)] sm:h-[calc(100vh-56px)] landscape:h-[calc(100dvh-36px)] max-h-[calc(100dvh-48px)] sm:max-h-[calc(100vh-56px)] landscape:max-h-[calc(100dvh-36px)] select-none overflow-hidden
      flex flex-col landscape:flex-row landscape:items-stretch">

      {/* ── PORTRAIT top info bar / LANDSCAPE left column ── */}
      {/* In portrait: slim bar at top. In landscape: left column = full table */}
      <div className="
        landscape:flex-1 landscape:min-w-0 landscape:flex landscape:flex-col landscape:justify-between landscape:py-1 landscape:px-1
        flex flex-col
      ">
        {/* Game Table Info Bar */}
        <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-0.5 sm:py-1 landscape:py-0.5 flex items-center justify-between text-xs sm:text-sm font-semibold shrink-0">
          {/* Left: Round & Trick info */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="bg-slate-900 border border-slate-800 text-slate-300 px-2 sm:px-3 py-0.5 rounded-full font-mono text-[10px] sm:text-xs">
              Round <span className="text-amber-400 font-bold">{round}</span> / {totalRounds}
            </span>
            <span className="bg-slate-900 border border-slate-800 text-slate-300 px-2 sm:px-3 py-0.5 rounded-full font-mono text-[10px] sm:text-xs">
              Trick <span className="text-amber-400 font-bold">{trickNumber}</span> / 13
            </span>
          </div>

          {/* Center: Spades Trump Badge */}
          <div className="hidden sm:flex landscape:hidden items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-extrabold uppercase tracking-wider shadow-sm">
            <span className="text-base text-amber-400 leading-none">♠</span>
            <span>Spades are Trump</span>
          </div>

          {/* Right: Fullscreen + Scores */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleFullscreen}
              className="sm:hidden flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[10px] transition-colors active:scale-90"
              title={isFullscreen ? 'Exit Fullscreen' : 'Landscape Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={11} className="text-amber-400" /> : <Maximize2 size={11} className="text-amber-400" />}
              <span>{isFullscreen ? 'Exit' : 'Full'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowScoreboard(!showScoreboard)}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-0.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[10px] sm:text-xs transition-colors"
            >
              <Award size={12} className="text-amber-400" />
              <span>Scores</span>
            </button>
          </div>
        </div>

        {/* Main Oval Table Felt Surface */}
        <div className="relative flex-1 min-h-0 w-full max-w-5xl mx-auto px-1 sm:px-6 landscape:px-1 flex items-center justify-center my-0.5 landscape:my-0">
          <div className="relative w-full h-full max-h-[290px] landscape:max-h-none sm:max-h-[395px] md:max-h-[420px] rounded-[32px] sm:rounded-[44px] table-rail p-1.5 sm:p-3 landscape:p-1.5 shadow-table flex flex-col justify-between items-center">
            {/* Felt Inner Surface */}
            <div className="relative w-full h-full rounded-[26px] sm:rounded-[34px] felt-surface p-1 sm:p-2 landscape:p-1 flex flex-col justify-between items-center border border-felt-border">

              {/* North Opponent Seat (Top) */}
              <div className="w-full flex justify-center z-10">
                <PlayerSeat
                  player={northPlayer}
                  isCurrentTurn={northPlayer && northPlayer.seatIndex === currentTurn}
                  position="north"
                  turnDeadline={gameState.turnDeadline}
                  turnTimeoutSeconds={gameState.turnTimeoutSeconds || 15}
                  activeEmote={northPlayer ? activeEmotes[northPlayer.seatIndex] : null}
                />
              </div>

              {/* Middle Row: West Seat, Center Trick, East Seat */}
              <div className="w-full flex items-center justify-between px-1 sm:px-4 landscape:px-0.5 z-10">
                {/* West Opponent (Left) */}
                <div className="w-13 sm:w-36 landscape:w-20 flex justify-start shrink-0">
                  <PlayerSeat
                    player={westPlayer}
                    isCurrentTurn={westPlayer && westPlayer.seatIndex === currentTurn}
                    position="west"
                    turnDeadline={gameState.turnDeadline}
                    turnTimeoutSeconds={gameState.turnTimeoutSeconds || 15}
                    activeEmote={westPlayer ? activeEmotes[westPlayer.seatIndex] : null}
                  />
                </div>

                {/* Center Trick Arena */}
                <div className="flex-1 flex justify-center">
                  <TrickCenter
                    currentTrick={currentTrick}
                    lastTrick={lastTrick}
                    seats={seats}
                    mySeatIndex={mySeatIndex}
                  />
                </div>

                {/* East Opponent (Right) */}
                <div className="w-13 sm:w-36 landscape:w-20 flex justify-end shrink-0">
                  <PlayerSeat
                    player={eastPlayer}
                    isCurrentTurn={eastPlayer && eastPlayer.seatIndex === currentTurn}
                    position="east"
                    turnDeadline={gameState.turnDeadline}
                    turnTimeoutSeconds={gameState.turnTimeoutSeconds || 15}
                    activeEmote={eastPlayer ? activeEmotes[eastPlayer.seatIndex] : null}
                  />
                </div>
              </div>

              {/* South Player Seat (Bottom of table - visible on desktop/tablet, hidden on mobile) */}
              <div className="w-full justify-center z-10 hidden sm:flex landscape:hidden">
                <PlayerSeat
                  player={southPlayer}
                  isCurrentTurn={southPlayer && southPlayer.seatIndex === currentTurn}
                  position="south"
                  isMe={true}
                  turnDeadline={gameState.turnDeadline}
                  turnTimeoutSeconds={gameState.turnTimeoutSeconds || 15}
                  activeEmote={southPlayer ? activeEmotes[southPlayer.seatIndex] : null}
                />
              </div>
            </div>
          </div>
        </div>

        {/* PORTRAIT ONLY: Player status bar + Hand below the table */}
        <div className="landscape:hidden flex flex-col">
          {/* Status Bar / Bidding Slider */}
          {isBiddingTurn ? (
            <BiddingSlider myHand={myHand} onSubmitBid={onSubmitBid} />
          ) : (
            <div className="w-full max-w-4xl mx-auto px-2.5 sm:px-4 py-1 sm:py-1.5 flex items-center justify-between shrink-0 bg-slate-900/90 border border-slate-800 rounded-xl sm:rounded-2xl shadow-lg z-30 my-0.5">
              {/* Left: Avatar & Name */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="relative w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-black font-bold flex items-center justify-center text-xs sm:text-sm shadow shrink-0">
                  👤
                  {southPlayer?.isDealer && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-amber-400 text-black font-black text-[8px] sm:text-[9px] flex items-center justify-center border border-slate-900 shadow" title="Dealer">D</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] sm:text-xs font-black text-slate-100">{southPlayer?.name || 'You'}</span>
                    <span className="text-[8px] sm:text-[9px] bg-amber-400 text-black font-extrabold px-1 rounded uppercase tracking-wider">YOU</span>
                  </div>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono leading-none block">
                    Score: <strong className="text-amber-400">{southPlayer?.matchScore ?? 0} pts</strong>
                  </span>
                </div>
              </div>

              {/* Center: Bid & Won */}
              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                <div className="bg-slate-950 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl border border-slate-800 flex items-center gap-1 sm:gap-1.5 shadow-inner">
                  <span className="text-slate-400 font-medium">Call:</span>
                  <span className="font-mono font-black text-amber-400 text-xs sm:text-sm">
                    {southPlayer?.bid !== null && southPlayer?.bid !== undefined ? southPlayer.bid : (phase === GAME_PHASES.BIDDING ? '...' : '-')}
                  </span>
                </div>
                <div className="bg-slate-950 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl border border-slate-800 flex items-center gap-1 sm:gap-1.5 shadow-inner">
                  <span className="text-slate-400 font-medium">Won:</span>
                  <span className="font-mono font-black text-emerald-400 text-xs sm:text-sm">{southPlayer?.tricksWon ?? 0}</span>
                </div>
              </div>

              {/* Right: Turn indicator + Emote */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button type="button" onClick={() => setEmotePickerOpen(true)}
                  className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl bg-slate-800/90 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs flex items-center gap-1 transition-all active:scale-90 shadow-sm shrink-0"
                  title="Send Table Reaction">
                  <span className="text-sm leading-none">😊</span>
                  <span className="hidden sm:inline text-[10px] font-bold">React</span>
                </button>
                {isMyTurn ? (
                  <span className="bg-gradient-to-r from-amber-400 to-yellow-300 text-black px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-md animate-pulse">Your Turn</span>
                ) : (
                  <span className="text-[10px] sm:text-xs text-slate-400 font-medium bg-slate-950/80 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-slate-800 truncate max-w-[100px] sm:max-w-none block text-center">
                    {phase === GAME_PHASES.BIDDING ? `${seats[currentTurn]?.name || 'Player'} calling...` : `${seats[currentTurn]?.name || 'Player'}'s turn`}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Hand Fan */}
          <div className="w-full max-w-5xl mx-auto shrink-0 relative z-50 pointer-events-auto">
            <HandFan
              cards={myHand}
              legalMoves={myLegalMoves}
              isMyTurn={isMyTurn}
              phase={phase}
              onPlayCard={handlePlayCard}
            />
          </div>
        </div>
      </div>

      {/* ── LANDSCAPE RIGHT COLUMN: player info + hand fan ── */}
      <div className="hidden landscape:flex landscape:flex-col landscape:w-[52%] landscape:max-w-[420px] landscape:justify-between landscape:py-1 landscape:px-1 landscape:gap-1">
        {/* Mini player badge (name, bid, won, turn) */}
        <div className="flex items-center justify-between px-2 py-1 bg-slate-900/90 border border-slate-800 rounded-xl shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="relative w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-black font-bold flex items-center justify-center text-xs shadow shrink-0">
              👤
              {southPlayer?.isDealer && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 text-black font-black text-[7px] flex items-center justify-center border border-slate-900">D</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-black text-slate-100 leading-none">{southPlayer?.name || 'You'}</span>
                <span className="text-[7px] bg-amber-400 text-black font-extrabold px-1 rounded uppercase">YOU</span>
              </div>
              <span className="text-[8px] text-slate-400 font-mono leading-none">{southPlayer?.matchScore ?? 0} pts</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[10px]">
            <div className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 flex items-center gap-1">
              <span className="text-slate-400">Call:</span>
              <span className="font-mono font-black text-amber-400">
                {southPlayer?.bid !== null && southPlayer?.bid !== undefined ? southPlayer.bid : (phase === GAME_PHASES.BIDDING ? '...' : '-')}
              </span>
            </div>
            <div className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 flex items-center gap-1">
              <span className="text-slate-400">Won:</span>
              <span className="font-mono font-black text-emerald-400">{southPlayer?.tricksWon ?? 0}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setEmotePickerOpen(true)}
              className="px-1.5 py-0.5 rounded bg-slate-800/90 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs active:scale-90">
              <span className="text-sm leading-none">😊</span>
            </button>
            {isMyTurn ? (
              <span className="bg-gradient-to-r from-amber-400 to-yellow-300 text-black px-2 py-0.5 rounded-full text-[9px] font-black uppercase animate-pulse">Your Turn</span>
            ) : (
              <span className="text-[9px] text-slate-400 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800 truncate max-w-[90px]">
                {phase === GAME_PHASES.BIDDING ? 'Calling...' : `${seats[currentTurn]?.name || ''}'s turn`}
              </span>
            )}
          </div>
        </div>

        {/* Bidding slider (landscape) or spacer */}
        {isBiddingTurn && (
          <BiddingSlider myHand={myHand} onSubmitBid={onSubmitBid} />
        )}

        {/* Hand fan — takes remaining space */}
        <div className="flex-1 min-h-0 w-full relative z-50 pointer-events-auto flex items-end">
          <div className="w-full">
            <HandFan
              cards={myHand}
              legalMoves={myLegalMoves}
              isMyTurn={isMyTurn}
              phase={phase}
              onPlayCard={handlePlayCard}
            />
          </div>
        </div>
      </div>

      {/* Modals & Overlays */}
      <RoundResultModal
        isOpen={Boolean(roundResult) || phase === GAME_PHASES.ROUND_END}
        roundNumber={round}
        totalRounds={totalRounds}
        seats={seats}
        scores={roundResult?.scores || gameState.roundScores}
        matchScores={roundResult?.matchScores || gameState.matchScores}
        onNextRound={onRematch}
      />

      <MatchResultModal
        isOpen={Boolean(matchResult) || phase === GAME_PHASES.MATCH_END}
        rankings={matchResult?.rankings || gameState.rankings}
        seats={seats}
        onRematch={onRematch}
        onLeave={onLeave}
      />

      <EmotePicker
        isOpen={emotePickerOpen}
        onClose={() => setEmotePickerOpen(false)}
        onSelectEmote={onSendEmote}
      />

      {/* Slide-out Scoreboard */}
      {showScoreboard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 font-bold text-slate-100">
                <Award size={18} className="text-amber-400" />
                <span>Match Scoreboard</span>
              </div>
              <button type="button" onClick={() => setShowScoreboard(false)}
                className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-800">
                Close
              </button>
            </div>
            <div className="space-y-2 font-mono">
              {seats.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                  <span className="font-sans font-medium text-slate-200">{p.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">Bid: {p.bid ?? '-'}</span>
                    <span className="text-slate-400">Won: {p.tricksWon}</span>
                    <span className="font-bold text-amber-400">
                      {p.matchScore > 0 ? `+${p.matchScore}` : p.matchScore} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


