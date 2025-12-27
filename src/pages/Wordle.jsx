import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../services/axiosSetup';
import toast from 'react-hot-toast';
import { Flame, Trophy, Target, Sparkles, Delete, CornerDownLeft } from 'lucide-react';

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;

const Wordle = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [gameState, setGameState] = useState({
        available: false,
        loading: true,
        guesses: [],
        currentGuess: '',
        completed: false,
        won: false,
        hint: null,
        correctWord: null
    });
    const [streak, setStreak] = useState({ current: 0, max: 0, totalWins: 0 });
    const [shakeRow, setShakeRow] = useState(-1);
    const [flipRow, setFlipRow] = useState(-1);
    const [celebrateWin, setCelebrateWin] = useState(false);
    const [keyboardStatus, setKeyboardStatus] = useState({});

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchTodayWordle();
    }, [user, navigate]);

    const fetchTodayWordle = async () => {
        try {
            const response = await axios.get('/api/wordle/today');
            const data = response.data;

            if (data.available) {
                const guesses = data.attempt?.guesses || [];
                setGameState({
                    available: true,
                    loading: false,
                    guesses,
                    currentGuess: '',
                    completed: data.attempt?.completed || false,
                    won: data.attempt?.won || false,
                    hint: data.hint,
                    correctWord: null
                });
                setStreak(data.streak || { current: 0, max: 0, totalWins: 0 });

                // Rebuild keyboard status from previous guesses
                const newKeyboardStatus = {};
                guesses.forEach(g => {
                    g.guess.split('').forEach((letter, i) => {
                        const status = g.result[i];
                        if (status === 'correct' || (status === 'present' && newKeyboardStatus[letter] !== 'correct')) {
                            newKeyboardStatus[letter] = status;
                        } else if (!newKeyboardStatus[letter]) {
                            newKeyboardStatus[letter] = status;
                        }
                    });
                });
                setKeyboardStatus(newKeyboardStatus);
            } else {
                setGameState({
                    available: false,
                    loading: false,
                    guesses: [],
                    currentGuess: '',
                    completed: false,
                    won: false,
                    hint: null,
                    correctWord: null
                });
            }
        } catch (error) {
            console.error('Error fetching wordle:', error);
            setGameState(prev => ({ ...prev, loading: false, available: false }));
        }
    };

    const handleKeyPress = useCallback((key) => {
        if (gameState.completed) return;

        if (key === 'ENTER') {
            submitGuess();
        } else if (key === 'BACKSPACE') {
            setGameState(prev => ({
                ...prev,
                currentGuess: prev.currentGuess.slice(0, -1)
            }));
        } else if (/^[A-Z]$/.test(key) && gameState.currentGuess.length < WORD_LENGTH) {
            setGameState(prev => ({
                ...prev,
                currentGuess: prev.currentGuess + key
            }));
        }
    }, [gameState.completed, gameState.currentGuess]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey || e.metaKey || e.altKey) return;

            const key = e.key.toUpperCase();
            if (key === 'ENTER' || key === 'BACKSPACE' || /^[A-Z]$/.test(key)) {
                handleKeyPress(key);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyPress]);

    const submitGuess = async () => {
        if (gameState.currentGuess.length !== WORD_LENGTH) {
            setShakeRow(gameState.guesses.length);
            setTimeout(() => setShakeRow(-1), 500);
            toast.error('Word must be 5 letters!');
            return;
        }

        try {
            const response = await axios.post('/api/wordle/guess', {
                guess: gameState.currentGuess
            });

            const data = response.data;
            const newGuess = { guess: data.guess, result: data.result };

            // Update keyboard status
            const newKeyboardStatus = { ...keyboardStatus };
            data.guess.split('').forEach((letter, i) => {
                const status = data.result[i];
                if (status === 'correct' || (status === 'present' && newKeyboardStatus[letter] !== 'correct')) {
                    newKeyboardStatus[letter] = status;
                } else if (!newKeyboardStatus[letter]) {
                    newKeyboardStatus[letter] = status;
                }
            });
            setKeyboardStatus(newKeyboardStatus);

            // Trigger flip animation
            setFlipRow(gameState.guesses.length);

            setTimeout(() => {
                setGameState(prev => ({
                    ...prev,
                    guesses: [...prev.guesses, newGuess],
                    currentGuess: '',
                    completed: data.completed,
                    won: data.won,
                    correctWord: data.correctWord
                }));

                if (data.streak) {
                    setStreak(data.streak);
                }

                if (data.won) {
                    setCelebrateWin(true);
                    toast.success('🎉 Congratulations! You won!', { duration: 3000 });
                } else if (data.completed) {
                    toast.error(`The word was: ${data.correctWord}`, { duration: 5000 });
                }

                setFlipRow(-1);
            }, 500);

        } catch (error) {
            console.error('Guess error:', error);
            // Shake the current row to indicate invalid word
            setShakeRow(gameState.guesses.length);
            setTimeout(() => setShakeRow(-1), 500);
            toast.error(error.response?.data?.message || 'Failed to submit guess');
        }
    };

    const getTileColor = (status) => {
        switch (status) {
            case 'correct': return 'bg-emerald-500 border-emerald-500';
            case 'present': return 'bg-amber-500 border-amber-500';
            case 'absent': return 'bg-gray-600 border-gray-600';
            default: return 'bg-transparent border-gray-600';
        }
    };

    const getKeyColor = (letter) => {
        const status = keyboardStatus[letter];
        switch (status) {
            case 'correct': return 'bg-emerald-500 hover:bg-emerald-600';
            case 'present': return 'bg-amber-500 hover:bg-amber-600';
            case 'absent': return 'bg-gray-700 hover:bg-gray-600';
            default: return 'bg-gray-600 hover:bg-gray-500';
        }
    };

    const keyboard = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
    ];

    if (!user) {
        return null;
    }

    if (gameState.loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading today's Wordle...</p>
                </div>
            </div>
        );
    }

    if (!gameState.available) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
                        <Sparkles className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4">No Wordle Today</h1>
                    <p className="text-gray-400 mb-6">The admin hasn't set today's word yet. Check back later!</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-all"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-6 px-4">
            <div className="max-w-lg mx-auto">
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                        <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                            K-Wordle
                        </span>
                        <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
                    </h1>
                    <p className="text-gray-400">Guess the 5-letter word in 6 tries</p>

                    {gameState.hint && (
                        <div className="mt-3 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl inline-block">
                            <span className="text-amber-400 text-sm">💡 Hint: {gameState.hint}</span>
                        </div>
                    )}
                </div>

                {/* Streak Display */}
                <div className="flex justify-center gap-4 mb-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl">
                        <Flame className={`w-5 h-5 ${streak.current > 0 ? 'text-orange-400 animate-pulse' : 'text-gray-500'}`} />
                        <span className="text-white font-bold">{streak.current}</span>
                        <span className="text-gray-400 text-sm">Streak</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl">
                        <Trophy className="w-5 h-5 text-purple-400" />
                        <span className="text-white font-bold">{streak.max}</span>
                        <span className="text-gray-400 text-sm">Best</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-xl">
                        <Target className="w-5 h-5 text-emerald-400" />
                        <span className="text-white font-bold">{streak.totalWins}</span>
                        <span className="text-gray-400 text-sm">Wins</span>
                    </div>
                </div>

                {/* Game Board */}
                <div className="grid gap-2 mb-6">
                    {[...Array(MAX_ATTEMPTS)].map((_, rowIndex) => {
                        const guess = gameState.guesses[rowIndex];
                        const isCurrentRow = rowIndex === gameState.guesses.length && !gameState.completed;
                        const letters = guess ? guess.guess.split('') :
                            isCurrentRow ? gameState.currentGuess.padEnd(WORD_LENGTH, ' ').split('') :
                                Array(WORD_LENGTH).fill(' ');

                        return (
                            <div
                                key={rowIndex}
                                className={`flex justify-center gap-2 ${shakeRow === rowIndex ? 'animate-shake' : ''}`}
                            >
                                {letters.map((letter, colIndex) => {
                                    const status = guess?.result?.[colIndex];
                                    const hasLetter = letter !== ' ';
                                    const isFlipping = flipRow === rowIndex;

                                    return (
                                        <div
                                            key={colIndex}
                                            className={`
                        w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center
                        text-2xl sm:text-3xl font-bold text-white uppercase
                        border-2 rounded-lg transition-all duration-300
                        ${getTileColor(status)}
                        ${hasLetter && !guess ? 'scale-105 border-gray-400' : ''}
                        ${isFlipping ? 'animate-flip' : ''}
                        ${celebrateWin && guess?.result?.[colIndex] === 'correct' ? 'animate-bounce' : ''}
                      `}
                                            style={{
                                                animationDelay: isFlipping ? `${colIndex * 100}ms` :
                                                    celebrateWin ? `${colIndex * 100}ms` : '0ms'
                                            }}
                                        >
                                            {letter !== ' ' ? letter : ''}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>

                {/* Game Over Message */}
                {gameState.completed && (
                    <div className={`text-center mb-6 p-4 rounded-xl ${gameState.won
                        ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30'
                        : 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30'
                        }`}>
                        {gameState.won ? (
                            <div>
                                <span className="text-4xl mb-2 block">🎉</span>
                                <h2 className="text-xl font-bold text-white">Excellent!</h2>
                                <p className="text-gray-300">You solved it in {gameState.guesses.length} {gameState.guesses.length === 1 ? 'try' : 'tries'}!</p>
                                {streak.current > 1 && (
                                    <p className="text-orange-400 flex items-center justify-center gap-2 mt-2">
                                        <Flame className="w-5 h-5 animate-pulse" />
                                        {streak.current} day streak! Keep it going!
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div>
                                <span className="text-4xl mb-2 block">😔</span>
                                <h2 className="text-xl font-bold text-white">Better luck tomorrow!</h2>
                                <p className="text-gray-300">The word was: <span className="font-bold text-red-400">{gameState.correctWord}</span></p>
                            </div>
                        )}
                    </div>
                )}

                {/* Keyboard */}
                <div className="space-y-2">
                    {keyboard.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex justify-center gap-1 sm:gap-2">
                            {row.map((key) => (
                                <button
                                    key={key}
                                    onClick={() => handleKeyPress(key)}
                                    disabled={gameState.completed}
                                    className={`
                    ${key.length > 1 ? 'px-3 sm:px-4 text-xs' : 'w-8 sm:w-10'}
                    h-12 sm:h-14 rounded-lg font-bold text-white uppercase
                    transition-all duration-150 active:scale-95
                    ${getKeyColor(key)}
                    ${gameState.completed ? 'opacity-50 cursor-not-allowed' : ''}
                    flex items-center justify-center
                  `}
                                >
                                    {key === 'BACKSPACE' ? <Delete className="w-5 h-5" /> :
                                        key === 'ENTER' ? <CornerDownLeft className="w-5 h-5" /> : key}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Play Again / Stats */}
                {gameState.completed && (
                    <div className="mt-6 text-center">
                        <p className="text-gray-400 mb-4">Come back tomorrow for a new word!</p>
                        <button
                            onClick={() => navigate('/profile')}
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all"
                        >
                            View Your Stats
                        </button>
                    </div>
                )}
            </div>

            {/* Custom Animations */}
            <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-10px); }
          80% { transform: translateX(10px); }
        }
        
        @keyframes flip {
          0% { transform: rotateX(0); }
          50% { transform: rotateX(90deg); }
          100% { transform: rotateX(0); }
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animate-flip {
          animation: flip 0.5s ease-in-out;
        }
      `}</style>
        </div>
    );
};

export default Wordle;
