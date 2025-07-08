import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Save, RotateCcw, ChevronLeft, ChevronRight, Heart, Zap, Moon, Users, BarChart3, User, ArrowLeft, Tv, Phone, Refrigerator, ChefHat, Bed, Monitor, BookOpen, ShowerHead as Shower, Carrot as Mirror, Dumbbell, Activity, Volume2, VolumeX } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useProfilePicture } from '../../hooks/useProfilePicture';
import { useGameAudio } from '../../hooks/useGameAudio';

interface MobileGameInterfaceProps {
  onBack: () => void;
}

interface GameState {
  day: number;
  hour: number;
  minute: number;
  currentRoom: number;
  isPlaying: boolean;
  gameSpeed: number;
  score: number;
  factors: {
    health: number;
    energy: number;
    sleep: number;
    social: number;
    productivity: number;
  };
}

interface RoomObject {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  position: { top: string; left: string };
  timeJump: number; // em minutos
  action: {
    question: string;
    effects: {
      health?: number;
      energy?: number;
      sleep?: number;
      social?: number;
      productivity?: number;
    };
    consequence: string;
  };
}

const MobileGameInterface: React.FC<MobileGameInterfaceProps> = ({ onBack }) => {
  const { isDark } = useTheme();
  const { profilePicture, hasProfilePicture } = useProfilePicture();
  const { 
    audioSettings, 
    toggleMute, 
    playButtonSound, 
    playNavigationSound, 
    playRandomConsequenceSound 
  } = useGameAudio();
  
  const [gameState, setGameState] = useState<GameState>({
    day: 1,
    hour: 0,
    minute: 0,
    currentRoom: 0,
    isPlaying: false,
    gameSpeed: 1,
    score: 0,
    factors: {
      health: 50,
      energy: 50,
      sleep: 50,
      social: 50,
      productivity: 50
    }
  });

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [showModal, setShowModal] = useState<{
    isOpen: boolean;
    object: RoomObject | null;
  }>({ isOpen: false, object: null });
  const [showConsequence, setShowConsequence] = useState<string | null>(null);
  const [showPauseScreen, setShowPauseScreen] = useState(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);

  // Carregar jogo salvo ao inicializar
  useEffect(() => {
    const savedGame = localStorage.getItem('dream-story-save');
    if (savedGame) {
      try {
        const parsedGame = JSON.parse(savedGame);
        setGameState(parsedGame);
        setShowWelcomeMessage(false); // Se há jogo salvo, não mostrar boas-vindas
      } catch (error) {
        console.error('Erro ao carregar jogo salvo:', error);
      }
    }
  }, []);

  // Atualizar tempo quando o jogo estiver rodando
  useEffect(() => {
    if (!gameState.isPlaying || showPauseScreen || showWelcomeMessage) return;

    const interval = setInterval(() => {
      setGameState(prev => {
        let newMinute = prev.minute + (5 * prev.gameSpeed);
        let newHour = prev.hour;
        let newDay = prev.day;

        if (newMinute >= 60) {
          newHour += Math.floor(newMinute / 60);
          newMinute = newMinute % 60;
        }

        if (newHour >= 24) {
          newDay += Math.floor(newHour / 24);
          newHour = newHour % 24;
        }

        // Degradação natural dos fatores
        const newFactors = { ...prev.factors };
        if (newMinute % 30 === 0) {
          newFactors.energy = Math.max(0, newFactors.energy - 1);
          newFactors.sleep = Math.max(0, newFactors.sleep - 0.5);
          if (newHour >= 22 || newHour <= 6) {
            newFactors.health = Math.max(0, newFactors.health - 0.5);
          }
        }

        return {
          ...prev,
          minute: newMinute,
          hour: newHour,
          day: newDay,
          factors: newFactors
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.isPlaying, gameState.gameSpeed, showPauseScreen, showWelcomeMessage]);

  const rooms = [
    { 
      name: 'Sala', 
      background: 'from-green-500/20 to-emerald-600/20',
      emoji: '🛋️',
      description: 'Relaxe e socialize'
    },
    { 
      name: 'Cozinha', 
      background: 'from-orange-500/20 to-red-600/20',
      emoji: '🍳',
      description: 'Prepare refeições saudáveis'
    },
    { 
      name: 'Quarto', 
      background: 'from-purple-500/20 to-indigo-600/20',
      emoji: '🛏️',
      description: 'Durma e trabalhe'
    },
    { 
      name: 'Banheiro', 
      background: 'from-blue-500/20 to-cyan-600/20',
      emoji: '🚿',
      description: 'Cuide da higiene pessoal'
    },
    { 
      name: 'Academia', 
      background: 'from-gray-500/20 to-slate-600/20',
      emoji: '🏋️‍♂️',
      description: 'Exercite-se e ganhe saúde'
    }
  ];

  const roomObjects: { [key: number]: RoomObject[] } = {
    // Sala
    0: [
      {
        id: 'tv',
        name: 'TV',
        icon: Tv,
        position: { top: '30%', left: '20%' },
        timeJump: 120, // 2 horas
        action: {
          question: 'Assistir TV?',
          effects: { social: 15, productivity: -10, energy: -5 },
          consequence: 'Alex assistiu TV por 2 horas e relaxou, mas perdeu um pouco de produtividade.'
        }
      },
      {
        id: 'phone',
        name: 'Telefone',
        icon: Phone,
        position: { top: '60%', left: '70%' },
        timeJump: 30, // 30 minutos
        action: {
          question: 'Ligar para um amigo?',
          effects: { social: 20, energy: -5, sleep: -5 },
          consequence: 'Alex ligou para um amigo e teve uma conversa agradável por 30 minutos.'
        }
      }
    ],
    // Cozinha
    1: [
      {
        id: 'fridge',
        name: 'Geladeira',
        icon: Refrigerator,
        position: { top: '25%', left: '15%' },
        timeJump: 15, // 15 minutos
        action: {
          question: 'Pegar um lanche saudável?',
          effects: { health: 15, energy: 10, productivity: -5 },
          consequence: 'Alex comeu um lanche saudável rapidamente e se sentiu mais energizado.'
        }
      },
      {
        id: 'stove',
        name: 'Fogão',
        icon: ChefHat,
        position: { top: '50%', left: '75%' },
        timeJump: 90, // 1h30
        action: {
          question: 'Cozinhar uma refeição completa?',
          effects: { productivity: 10, health: 10, energy: -10, social: -5 },
          consequence: 'Alex cozinhou uma refeição deliciosa por 1h30, mas gastou tempo e energia.'
        }
      }
    ],
    // Quarto
    2: [
      {
        id: 'bed',
        name: 'Cama',
        icon: Bed,
        position: { top: '40%', left: '20%' },
        timeJump: 480, // 8 horas
        action: {
          question: 'Dormir um pouco?',
          effects: { sleep: 25, health: 10, energy: 20 },
          consequence: 'Alex dormiu por 8 horas e se sentiu muito mais descansado e energizado.'
        }
      },
      {
        id: 'computer',
        name: 'Computador',
        icon: Monitor,
        position: { top: '30%', left: '70%' },
        timeJump: 120, // 2 horas
        action: {
          question: 'Usar o computador para trabalhar?',
          effects: { productivity: 20, health: -10, social: -10, sleep: -5 },
          consequence: 'Alex trabalhou no computador por 2 horas e foi produtivo, mas se cansou.'
        }
      },
      {
        id: 'books',
        name: 'Estante de Livros',
        icon: BookOpen,
        position: { top: '65%', left: '45%' },
        timeJump: 60, // 1 hora
        action: {
          question: 'Ler por 1 hora?',
          effects: { productivity: 10, energy: -10 },
          consequence: 'Alex leu um livro interessante por 1 hora e aprendeu algo novo.'
        }
      }
    ],
    // Banheiro
    3: [
      {
        id: 'shower',
        name: 'Chuveiro',
        icon: Shower,
        position: { top: '35%', left: '25%' },
        timeJump: 20, // 20 minutos
        action: {
          question: 'Tomar banho?',
          effects: { health: 15, energy: 10, productivity: 5 },
          consequence: 'Alex tomou um banho relaxante de 20 minutos e se sentiu renovado.'
        }
      },
      {
        id: 'mirror',
        name: 'Espelho',
        icon: Mirror,
        position: { top: '25%', left: '70%' },
        timeJump: 15, // 15 minutos
        action: {
          question: 'Se arrumar e cuidar da aparência?',
          effects: { social: 10, energy: -5, productivity: 5 },
          consequence: 'Alex se arrumou por 15 minutos e se sentiu mais confiante para o dia.'
        }
      }
    ],
    // Academia
    4: [
      {
        id: 'treadmill',
        name: 'Esteira',
        icon: Activity,
        position: { top: '30%', left: '20%' },
        timeJump: 30, // 30 minutos
        action: {
          question: 'Correr por 30 minutos?',
          effects: { health: 20, energy: -15, sleep: -10 },
          consequence: 'Alex correu na esteira por 30 minutos e melhorou sua saúde cardiovascular.'
        }
      },
      {
        id: 'weights',
        name: 'Pesos',
        icon: Dumbbell,
        position: { top: '55%', left: '70%' },
        timeJump: 45, // 45 minutos
        action: {
          question: 'Fazer treino de força?',
          effects: { health: 15, productivity: 5, energy: -10 },
          consequence: 'Alex fez um treino de força por 45 minutos e se sentiu mais forte.'
        }
      }
    ]
  };

  const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  const factors = [
    { key: 'health', name: 'Saúde', icon: Heart, color: 'bg-red-500' },
    { key: 'energy', name: 'Energia', icon: Zap, color: 'bg-yellow-500' },
    { key: 'sleep', name: 'Sono', icon: Moon, color: 'bg-indigo-500' },
    { key: 'social', name: 'Social', icon: Users, color: 'bg-pink-500' },
    { key: 'productivity', name: 'Produtividade', icon: BarChart3, color: 'bg-emerald-500' }
  ];

  const handleRoomChange = (direction: 'prev' | 'next') => {
    if (isTransitioning || showPauseScreen || showWelcomeMessage) return;
    
    playNavigationSound();
    setIsTransitioning(true);
    
    setGameState(prev => ({
      ...prev,
      currentRoom: direction === 'next' 
        ? (prev.currentRoom + 1) % rooms.length
        : (prev.currentRoom - 1 + rooms.length) % rooms.length
    }));

    setTimeout(() => setIsTransitioning(false), 300);
  };

  const togglePlay = () => {
    if (showWelcomeMessage) return;
    
    playButtonSound();
    if (gameState.isPlaying) {
      // Pausar o jogo
      setGameState(prev => ({ ...prev, isPlaying: false }));
      setShowPauseScreen(true);
    } else {
      // Despausar o jogo
      setGameState(prev => ({ ...prev, isPlaying: true }));
      setShowPauseScreen(false);
    }
  };

  const resumeGame = () => {
    playButtonSound();
    setGameState(prev => ({ ...prev, isPlaying: true }));
    setShowPauseScreen(false);
  };

  const saveGame = () => {
    if (showPauseScreen || showWelcomeMessage) return;
    playButtonSound();
    
    // Salvar o estado atual do jogo
    localStorage.setItem('dream-story-save', JSON.stringify(gameState));
    
    setShowSaveMessage(true);
    setTimeout(() => setShowSaveMessage(false), 2000);
  };

  const handleResetConfirmation = () => {
    if (showPauseScreen || showWelcomeMessage) return;
    playButtonSound();
    setShowResetConfirmation(true);
  };

  const resetGame = () => {
    playButtonSound();
    
    // Limpar jogo salvo
    localStorage.removeItem('dream-story-save');
    
    // Resetar estado para valores iniciais
    setGameState({
      day: 1,
      hour: 0,
      minute: 0,
      currentRoom: 0,
      isPlaying: false,
      gameSpeed: 1,
      score: 0,
      factors: {
        health: 50,
        energy: 50,
        sleep: 50,
        social: 50,
        productivity: 50
      }
    });
    
    setShowPauseScreen(false);
    setShowResetConfirmation(false);
    setShowWelcomeMessage(true); // Mostrar mensagem de boas-vindas novamente
  };

  const cancelReset = () => {
    playButtonSound();
    setShowResetConfirmation(false);
  };

  const setGameSpeed = (speed: number) => {
    if (showPauseScreen || showWelcomeMessage) return;
    playButtonSound();
    setGameState(prev => ({ ...prev, gameSpeed: speed }));
  };

  const handleObjectClick = (object: RoomObject) => {
    if (showPauseScreen || showWelcomeMessage) return;
    
    playNavigationSound();
    
    if (gameState.isPlaying) {
      setGameState(prev => ({ ...prev, isPlaying: false }));
    }
    setShowModal({ isOpen: true, object });
  };

  const addTimeToGame = (minutes: number) => {
    setGameState(prev => {
      let newMinute = prev.minute + minutes;
      let newHour = prev.hour;
      let newDay = prev.day;

      if (newMinute >= 60) {
        newHour += Math.floor(newMinute / 60);
        newMinute = newMinute % 60;
      }

      if (newHour >= 24) {
        newDay += Math.floor(newHour / 24);
        newHour = newHour % 24;
      }

      return {
        ...prev,
        minute: newMinute,
        hour: newHour,
        day: newDay
      };
    });
  };

  const handleActionConfirm = () => {
    if (!showModal.object) return;

    playButtonSound();

    const { effects, consequence } = showModal.object.action;
    const timeJump = showModal.object.timeJump;
    
    // Aplicar pulo de tempo
    addTimeToGame(timeJump);
    
    setGameState(prev => {
      const newFactors = { ...prev.factors };
      let scoreChange = 0;

      Object.entries(effects).forEach(([factor, change]) => {
        if (factor in newFactors) {
          const oldValue = newFactors[factor as keyof typeof newFactors];
          const newValue = Math.max(0, Math.min(100, oldValue + change));
          newFactors[factor as keyof typeof newFactors] = newValue;
          
          // Calcular mudança na pontuação baseada no efeito
          if (change > 0) {
            scoreChange += change * 10;
          } else {
            scoreChange += change * 5;
          }
        }
      });

      return {
        ...prev,
        factors: newFactors,
        score: Math.max(0, prev.score + scoreChange),
        isPlaying: true // Retomar o jogo após a ação
      };
    });

    setShowModal({ isOpen: false, object: null });
    setShowConsequence(consequence);
    
    // Tocar som de consequência
    playRandomConsequenceSound();
    
    setTimeout(() => {
      setShowConsequence(null);
    }, 3000);
  };

  const handleActionCancel = () => {
    playButtonSound();
    setShowModal({ isOpen: false, object: null });
    setGameState(prev => ({ ...prev, isPlaying: true })); // Retomar o jogo
  };

  const handleMuteToggle = () => {
    playButtonSound();
    toggleMute();
  };

  const handleWelcomeStart = () => {
    playButtonSound();
    setShowWelcomeMessage(false);
  };

  const currentRoom = rooms[gameState.currentRoom];
  const currentObjects = roomObjects[gameState.currentRoom] || [];

  const formatTime = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  // Modal de Boas-vindas
  if (showWelcomeMessage) {
    return (
      <div className={`h-screen flex items-center justify-center px-6 transition-colors duration-300 ${
        isDark ? 'bg-slate-950' : 'bg-gradient-to-br from-white via-emerald-50/80 to-emerald-100/60'
      }`}>
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`max-w-md w-full rounded-3xl p-8 border-2 transition-all duration-300 transform scale-100 ${
            isDark 
              ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-emerald-500/50 shadow-2xl' 
              : 'bg-gradient-to-br from-white to-emerald-50 border-emerald-400/60 shadow-2xl'
          }`}>
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
                <span className="text-4xl">🌙</span>
              </div>
              <h2 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-emerald-900'
              }`}>
                Bem-vindo ao Dream Story!
              </h2>
              <p className={`text-base leading-relaxed mb-8 transition-colors duration-300 ${
                isDark ? 'text-slate-300' : 'text-emerald-800'
              }`}>
                Aqui começa sua jornada rumo ao melhor sono e saúde! Faça boas escolhas e boa sorte!
              </p>
              <button
                onClick={handleWelcomeStart}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 mx-auto"
              >
                <Play className="w-5 h-5" />
                Vamos lá!
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Modal de confirmação de reset
  if (showResetConfirmation) {
    return (
      <div className={`h-screen flex items-center justify-center px-6 transition-colors duration-300 ${
        isDark ? 'bg-slate-950' : 'bg-gradient-to-br from-white via-emerald-50/80 to-emerald-100/60'
      }`}>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`max-w-sm w-full rounded-2xl p-6 border-2 transition-all duration-300 ${
            isDark 
              ? 'bg-slate-900 border-slate-700' 
              : 'bg-white border-gray-200 shadow-2xl'
          }`}>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="w-8 h-8 text-red-400" />
              </div>
              <h3 className={`text-lg font-bold mb-3 transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Tem certeza que deseja reiniciar o jogo?
              </h3>
              <p className={`text-sm mb-6 transition-colors duration-300 ${
                isDark ? 'text-slate-400' : 'text-gray-600'
              }`}>
                Todo o progresso atual será perdido e o jogo voltará ao início.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelReset}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold transition-colors ${
                    isDark 
                      ? 'bg-slate-800 hover:bg-slate-700 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  onClick={resetGame}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-xl font-bold transition-colors"
                >
                  Sim
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col overflow-hidden transition-colors duration-300 ${
      isDark ? 'bg-slate-950' : 'bg-gradient-to-br from-white via-emerald-50/80 to-emerald-100/60'
    }`}>
      
      {/* SEÇÃO SUPERIOR - 15% da altura */}
      <header className={`h-[15vh] px-3 py-2 border-b transition-colors duration-300 ${
        isDark 
          ? 'bg-slate-900/95 border-slate-800' 
          : 'bg-white/95 border-gray-200'
      }`}>
        <div className="h-full flex items-center justify-between">
          
          {/* Lado Esquerdo - Perfil do Alex */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playButtonSound();
                onBack();
              }}
              disabled={showPauseScreen}
              className={`p-2 rounded-full transition-all duration-200 hover:scale-110 ${
                showPauseScreen 
                  ? 'opacity-50 cursor-not-allowed' 
                  : isDark 
                    ? 'hover:bg-slate-800 text-white' 
                    : 'hover:bg-gray-100 text-gray-900'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-emerald-500/30">
              {hasProfilePicture ? (
                <img
                  src={profilePicture!}
                  alt="Alex"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-emerald-500 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <div className="text-left">
              <div className={`text-sm font-bold transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Alex
              </div>
              <div className={`text-xs transition-colors duration-300 ${
                isDark ? 'text-slate-400' : 'text-gray-600'
              }`}>
                {weekDays[(gameState.day - 1) % 7]}
              </div>
            </div>
          </div>

          {/* Centro - Controles do Jogo */}
          <div className="flex flex-col items-center gap-1">
            {/* Linha superior: Salvar, Reiniciar, Mutar */}
            <div className="flex items-center gap-2">
              {/* Botão de Salvar */}
              <button
                onClick={saveGame}
                disabled={showPauseScreen || showWelcomeMessage}
                className={`p-1.5 rounded-full transition-all duration-200 hover:scale-110 ${
                  showPauseScreen || showWelcomeMessage
                    ? 'opacity-50 cursor-not-allowed' 
                    : isDark 
                      ? 'hover:bg-slate-800 text-emerald-400' 
                      : 'hover:bg-gray-100 text-emerald-600'
                }`}
                title="Salvar Progresso"
              >
                <span className="text-xs">💾</span>
              </button>

              {/* Botão de Reset */}
              <button
                onClick={handleResetConfirmation}
                disabled={showPauseScreen || showWelcomeMessage}
                className={`p-1.5 rounded-full transition-all duration-200 hover:scale-110 ${
                  showPauseScreen || showWelcomeMessage
                    ? 'opacity-50 cursor-not-allowed' 
                    : isDark 
                      ? 'hover:bg-slate-800 text-orange-400' 
                      : 'hover:bg-gray-100 text-orange-600'
                }`}
                title="Reiniciar Jogo"
              >
                <span className="text-xs">🔄</span>
              </button>

              {/* Botão de Mute */}
              <button
                onClick={handleMuteToggle}
                className={`p-1.5 rounded-full transition-all duration-200 hover:scale-110 ${
                  isDark 
                    ? 'hover:bg-slate-800 text-blue-400' 
                    : 'hover:bg-gray-100 text-blue-600'
                }`}
                title={audioSettings.isMuted ? "Ativar Som" : "Mutar Som"}
              >
                <span className="text-xs">{audioSettings.isMuted ? '🔇' : '🔊'}</span>
              </button>
            </div>

            {/* Linha do meio: Botão Play/Pause */}
            <button
              onClick={togglePlay}
              disabled={showWelcomeMessage}
              className={`p-2 rounded-full transition-all duration-200 hover:scale-110 ${
                showWelcomeMessage
                  ? 'opacity-50 cursor-not-allowed bg-gray-400'
                  : gameState.isPlaying && !showPauseScreen
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              }`}
            >
              {gameState.isPlaying && !showPauseScreen ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
            
            {/* Linha inferior: Pontuação e Tempo */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-3">
                {/* Pontuação à esquerda */}
                <div className={`text-xs font-bold transition-colors duration-300 ${
                  isDark ? 'text-emerald-400' : 'text-emerald-600'
                }`}>
                  {gameState.score.toLocaleString()}
                </div>
                
                {/* Horário à direita */}
                <div className={`text-xs font-mono transition-colors duration-300 ${
                  isDark ? 'text-emerald-400' : 'text-emerald-600'
                }`}>
                  {formatTime(gameState.hour, gameState.minute)}
                </div>
              </div>
            </div>
          </div>

          {/* Lado Direito - Velocidade (mais abaixo) */}
          <div className="flex flex-col items-center gap-1">
            {/* Espaço vazio para alinhar com os controles centrais */}
            <div className="h-6"></div>
            
            {/* Botões de velocidade mais abaixo */}
            <div className="flex flex-col gap-1">
              {[1, 2, 4].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setGameSpeed(speed)}
                  disabled={showPauseScreen || showWelcomeMessage}
                  className={`px-2 py-1 rounded text-xs font-bold transition-all duration-200 ${
                    showPauseScreen || showWelcomeMessage
                      ? 'opacity-50 cursor-not-allowed' 
                      : gameState.gameSpeed === speed
                        ? 'bg-emerald-500 text-white'
                        : isDark
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Mensagem de Save */}
      {showSaveMessage && (
        <div className="fixed top-20 right-4 z-50">
          <div className={`px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
            isDark ? 'bg-emerald-600 text-white' : 'bg-emerald-500 text-white'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-sm">💾</span>
              <span className="text-sm font-medium">Jogo salvo!</span>
            </div>
          </div>
        </div>
      )}

      <div className="px-6 py-6 max-w-7xl mx-auto">
        {/* Seção de Status Melhorada */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Fatores */}
          <div className="lg:col-span-2">
            <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              <Heart className="w-6 h-6 text-red-400" />
              Status de Alex
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {Object.entries(gameState.factors).map(([factor, value]) => {
                const IconComponent = getFactorIcon(factor);
                return (
                  <div
                    key={factor}
                    className={`backdrop-blur-sm rounded-2xl p-4 border-2 transition-all duration-300 hover:scale-105 ${
                      isDark 
                        ? 'bg-slate-900/50 border-slate-700' 
                        : 'bg-white/80 border-gray-200 shadow-lg'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-full ${
                        isDark ? 'bg-slate-800' : 'bg-gray-100'
                      }`}>
                        <IconComponent className={`w-5 h-5 ${getFactorColor(factor, value)}`} />
                      </div>
                      <span className={`text-sm font-bold capitalize transition-colors duration-300 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {factor === 'health' ? 'Saúde' : 
                         factor === 'sleep' ? 'Sono' :
                         factor === 'energy' ? 'Energia' :
                         factor === 'productivity' ? 'Produtividade' : 'Social'}
                      </span>
                    </div>
                    <div className={`rounded-full h-3 mb-2 transition-colors duration-300 ${
                      isDark ? 'bg-slate-800' : 'bg-gray-200'
                    }`}>
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${getFactorBgColor(factor, value)}`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-lg font-bold transition-colors duration-300 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {Math.round(value)}%
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        value >= 70 ? 'bg-green-100 text-green-800' :
                        value >= 40 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {value >= 70 ? 'Ótimo' : value >= 40 ? 'Regular' : 'Baixo'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Informações do Tempo */}
          <div>
            <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              <Clock className="w-6 h-6 text-blue-400" />
              Tempo
            </h3>
            <div className={`backdrop-blur-sm rounded-2xl p-6 border-2 transition-colors duration-300 ${
              isDark 
                ? 'bg-slate-900/50 border-slate-700' 
                : 'bg-white/80 border-gray-200 shadow-lg'
            }`}>
              <div className="text-center mb-4">
                <div className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {formatTime(gameState.day, gameState.hour, gameState.minute)}
                </div>
                <div className={`text-sm transition-colors duration-300 ${
                  isDark ? 'text-slate-400' : 'text-gray-600'
                }`}>
                  Desafio de 14 dias
                </div>
              </div>
              
              {/* Controles de Velocidade */}
              <div className="flex justify-center">
                <div className={`flex items-center gap-2 p-2 rounded-xl transition-colors duration-300 ${
                  isDark 
                    ? 'bg-slate-800 border border-slate-700' 
                    : 'bg-gray-100 border border-gray-200'
                }`}>
                  <span className={`text-sm font-medium transition-colors duration-300 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Velocidade:
                  </span>
                  {[1, 2, 4].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setGameState(prev => ({ ...prev, gameSpeed: speed }))}
                      className={`px-3 py-1 rounded-lg text-sm font-bold transition-all duration-200 ${
                        gameState.gameSpeed === speed
                          ? 'bg-emerald-500 text-white shadow-lg'
                          : isDark
                            ? 'hover:bg-slate-700 text-slate-300'
                            : 'hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Atividade Atual */}
        {gameState.currentActivity && (
          <div className={`backdrop-blur-sm rounded-2xl p-6 border-2 mb-8 transition-all duration-300 ${
            isDark 
              ? 'bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border-emerald-500/30' 
              : 'bg-gradient-to-r from-emerald-100/80 to-emerald-200/60 border-emerald-400/50 shadow-lg'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  {React.createElement(activities[gameState.currentActivity as keyof typeof activities].icon, {
                    className: "w-6 h-6 text-emerald-400"
                  })}
                </div>
                <div>
                  <span className={`text-lg font-bold transition-colors duration-300 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {activities[gameState.currentActivity as keyof typeof activities].name}
                  </span>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDark ? 'text-slate-400' : 'text-gray-600'
                  }`}>
                    Em andamento...
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {Math.round((gameState.activityProgress / gameState.activityDuration) * 100)}%
                </div>
                <div className={`text-sm transition-colors duration-300 ${
                  isDark ? 'text-slate-400' : 'text-gray-600'
                }`}>
                  {Math.round(gameState.activityDuration - gameState.activityProgress)}min restantes
                </div>
              </div>
            </div>
            <div className={`rounded-full h-4 transition-colors duration-300 ${
              isDark ? 'bg-slate-800' : 'bg-gray-200'
            }`}>
              <div
                className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-4 rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${(gameState.activityProgress / gameState.activityDuration) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Navegação de Quartos */}
        <div className="mb-8">
          <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 transition-colors duration-300 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            <Home className="w-6 h-6 text-indigo-400" />
            Escolha o Local
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(rooms).map(([roomId, room]) => {
              const IconComponent = room.icon;
              return (
                <button
                  key={roomId}
                  onClick={() => changeRoom(roomId)}
                  disabled={!!gameState.currentActivity}
                  className={`p-6 rounded-2xl text-center transition-all duration-200 hover:scale-105 border-2 ${
                    gameState.currentRoom === roomId
                      ? `bg-gradient-to-br ${room.color} border-emerald-500 shadow-lg`
                      : isDark
                        ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                        : 'bg-white hover:bg-gray-50 text-gray-900 border-gray-200 shadow-lg'
                  } ${gameState.currentActivity ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <IconComponent className={`w-8 h-8 mx-auto mb-3 ${
                    gameState.currentRoom === roomId ? 'text-emerald-600' : 
                    isDark ? 'text-slate-300' : 'text-gray-600'
                  }`} />
                  <span className={`text-sm font-bold ${
                    gameState.currentRoom === roomId ? 'text-emerald-600' : ''
                  }`}>
                    {room.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Atividades do Quarto Atual */}
        <div>
          <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 transition-colors duration-300 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            <Settings className="w-6 h-6 text-purple-400" />
            Atividades - {rooms[gameState.currentRoom as keyof typeof rooms].name}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms[gameState.currentRoom as keyof typeof rooms].activities.map((activityId) => {
              const activity = activities[activityId as keyof typeof activities];
              const isCompleted = gameState.completedActivities.includes(activityId);
              const IconComponent = activity.icon;
              
              return (
                <button
                  key={activityId}
                  onClick={() => startActivity(activityId)}
                  disabled={!!gameState.currentActivity}
                  className={`p-6 rounded-2xl text-center transition-all duration-200 hover:scale-105 border-2 relative ${
                    gameState.currentActivity
                      ? 'opacity-50 cursor-not-allowed'
                      : isDark
                        ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                        : 'bg-white hover:bg-gray-50 text-gray-900 border-gray-200 shadow-lg'
                  } ${isCompleted ? 'ring-2 ring-emerald-500' : ''}`}
                >
                  {isCompleted && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                  
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    isDark ? 'bg-slate-700' : 'bg-gray-100'
                  }`}>
                    <IconComponent className={`w-8 h-8 ${activity.color}`} />
                  </div>
                  
                  <div className={`text-lg font-bold mb-2 transition-colors duration-300 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {activity.name}
                  </div>
                  
                  <div className={`text-sm mb-3 transition-colors duration-300 ${
                    isDark ? 'text-slate-400' : 'text-gray-600'
                  }`}>
                    ⏱️ {activity.duration} minutos
                  </div>
                  
                  {/* Efeitos da Atividade */}
                  <div className="flex flex-wrap gap-1 justify-center">
                    {Object.entries(activity.effects).map(([effect, value]) => (
                      <span
                        key={effect}
                        className={`text-xs px-2 py-1 rounded-full ${
                          value > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {value > 0 ? '+' : ''}{value}% {
                          effect === 'health' ? 'Saúde' : 
                          effect === 'sleep' ? 'Sono' :
                          effect === 'energy' ? 'Energia' :
                          effect === 'productivity' ? 'Produtividade' : 'Social'
                        }
                      </span>
                    ))}
                  </div>
                  
                  {isCompleted && (
                    <div className="text-xs text-emerald-500 mt-2 font-bold">
                      ✅ Concluído hoje
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal de Ação */}
      {showModal.isOpen && showModal.object && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`max-w-sm w-full rounded-2xl p-6 border-2 transition-all duration-300 ${
            isDark 
              ? 'bg-slate-900 border-slate-700' 
              : 'bg-white border-gray-200 shadow-2xl'
          }`}>
            <div className="text-center mb-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isDark ? 'bg-slate-800' : 'bg-gray-100'
              }`}>
                <showModal.object.icon className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className={`text-lg font-bold mb-2 transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {showModal.object.action.question}
              </h3>
              <p className={`text-sm transition-colors duration-300 ${
                isDark ? 'text-slate-400' : 'text-gray-600'
              }`}>
                Tempo necessário: {showModal.object.timeJump >= 60 
                  ? `${Math.floor(showModal.object.timeJump / 60)}h${showModal.object.timeJump % 60 > 0 ? ` ${showModal.object.timeJump % 60}min` : ''}`
                  : `${showModal.object.timeJump}min`
                }
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleActionCancel}
                className={`flex-1 py-3 px-4 rounded-xl font-bold transition-colors ${
                  isDark 
                    ? 'bg-slate-800 hover:bg-slate-700 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                Não
              </button>
              <button
                onClick={handleActionConfirm}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-4 rounded-xl font-bold transition-colors"
              >
                Sim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mensagem de Consequência */}
      {showConsequence && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className={`max-w-xs p-4 rounded-xl shadow-lg transition-all duration-300 ${
            isDark ? 'bg-slate-800 text-white border border-slate-700' : 'bg-white text-gray-900 border border-gray-200'
          }`}>
            <p className="text-sm text-center">{showConsequence}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileGameInterface;
                    : isDark 
                      ? 'hover:bg-slate-800 text-orange-400' 
                      : 'hover:bg-gray-100 text-orange-600'
                }`}
                title="Reiniciar Jogo"
              >
                <span className="text-sm">🔄</span>
              </button>

              {/* Botão de Mute */}
              <button
                onClick={handleMuteToggle}
                className={`p-2 rounded-full transition-all duration-200 hover:scale-110 ${
                  isDark 
                    ? 'hover:bg-slate-800 text-blue-400' 
                    : 'hover:bg-gray-100 text-blue-600'
                }`}
                title={audioSettings.isMuted ? "Ativar Som" : "Mutar Som"}
              >
                <span className="text-sm">{audioSettings.isMuted ? '🔇' : '🔊'}</span>
              </button>
            </div>
            
            {/* Pontuação e Tempo */}
            <div className="text-center">
              <div className={`text-xs font-mono transition-colors duration-300 ${
                isDark ? 'text-emerald-400' : 'text-emerald-600'
              }`}>
                {formatTime(gameState.hour, gameState.minute)}
              </div>
              <div className={`text-xs font-bold transition-colors duration-300 ${
                isDark ? 'text-emerald-400' : 'text-emerald-600'
              }`}>
                {gameState.score.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Lado Direito - Velocidade */}
          <div className="flex items-center gap-1">
            {[1, 2, 4].map((speed) => (
              <button
                key={speed}
                onClick={() => setGameSpeed(speed)}
                disabled={showPauseScreen || showWelcomeMessage}
                className={`px-2 py-1 rounded text-xs font-bold transition-all duration-200 ${
                  showPauseScreen || showWelcomeMessage
                    ? 'opacity-50 cursor-not-allowed' 
                    : gameState.gameSpeed === speed
                      ? 'bg-emerald-500 text-white'
                      : isDark
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* SEÇÃO DO MEIO - 65% da altura */}
      <main className="h-[65vh] relative overflow-hidden">
        
        {/* Tela de Pausa */}
        {showPauseScreen && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className={`max-w-sm w-full rounded-2xl p-8 border-2 transition-all duration-300 ${
              isDark 
                ? 'bg-slate-900 border-slate-700' 
                : 'bg-white border-gray-200 shadow-2xl'
            }`}>
              <div className="text-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                  isDark ? 'bg-slate-800' : 'bg-gray-100'
                }`}>
                  <Pause className="w-10 h-10 text-orange-500" />
                </div>
                <h2 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Jogo Pausado
                </h2>
                <p className={`text-sm mb-8 transition-colors duration-300 ${
                  isDark ? 'text-slate-400' : 'text-gray-600'
                }`}>
                  Deseja voltar ao jogo?
                </p>
                <button
                  onClick={resumeGame}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 px-6 rounded-xl font-bold text-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Continuar Jogo
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Cenário do Cômodo */}
        <div className={`h-full relative transition-all duration-300 ${
          isTransitioning ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
        } ${showPauseScreen ? 'pointer-events-none' : ''}`}>
          <div className={`h-full bg-gradient-to-br ${currentRoom.background} flex flex-col items-center justify-center relative ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            
            {/* Emoji do Cômodo */}
            <div className="text-6xl mb-3 animate-pulse">
              {currentRoom.emoji}
            </div>
            
            {/* Nome do Cômodo */}
            <h2 className="text-xl font-bold mb-2">
              {currentRoom.name}
            </h2>
            
            {/* Descrição */}
            <p className={`text-sm text-center px-4 mb-4 transition-colors duration-300 ${
              isDark ? 'text-slate-300' : 'text-gray-700'
            }`}>
              {currentRoom.description}
            </p>

            {/* Objetos Interativos */}
            {currentObjects.map((object) => {
              const IconComponent = object.icon;
              return (
                <button
                  key={object.id}
                  onClick={() => handleObjectClick(object)}
                  disabled={showPauseScreen}
                  className={`absolute p-3 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110 border-2 ${
                    showPauseScreen 
                      ? 'opacity-50 cursor-not-allowed' 
                      : isDark 
                        ? 'bg-slate-800/80 hover:bg-slate-700 text-white border-slate-600 hover:border-slate-500' 
                        : 'bg-white/90 hover:bg-gray-100 text-gray-900 border-gray-200 hover:border-gray-300 shadow-lg'
                  }`}
                  style={{ 
                    top: object.position.top, 
                    left: object.position.left,
                    transform: 'translate(-50%, -50%)'
                  }}
                  title={object.name}
                >
                  <IconComponent className="w-5 h-5" />
                </button>
              );
            })}

            {/* Indicador de Cômodo */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {rooms.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === gameState.currentRoom
                      ? 'bg-emerald-500 w-6'
                      : isDark
                        ? 'bg-slate-600'
                        : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Setas de Navegação */}
        <button
          onClick={() => handleRoomChange('prev')}
          disabled={isTransitioning || showPauseScreen}
          className={`absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110 ${
            isDark 
              ? 'bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-700' 
              : 'bg-white/90 hover:bg-gray-100 text-gray-900 border border-gray-200 shadow-lg'
          } ${(isTransitioning || showPauseScreen) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <button
          onClick={() => handleRoomChange('next')}
          disabled={isTransitioning || showPauseScreen}
          className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110 ${
            isDark 
              ? 'bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-700' 
              : 'bg-white/90 hover:bg-gray-100 text-gray-900 border border-gray-200 shadow-lg'
          } ${(isTransitioning || showPauseScreen) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </main>

      {/* SEÇÃO INFERIOR - 20% da altura - FATORES HORIZONTAIS */}
      <footer className={`h-[20vh] px-4 py-3 border-t transition-colors duration-300 ${
        isDark 
          ? 'bg-slate-900/95 border-slate-800' 
          : 'bg-white/95 border-gray-200'
      }`}>
        <div className="h-full flex flex-col justify-between">
          {/* Fatores */}
          <div className="flex-1">
            <h3 className={`text-sm font-bold mb-2 text-center transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Status de Alex
            </h3>
            
            {/* Grid de Fatores - 2 linhas, otimizado para mobile */}
            <div className="grid grid-cols-3 gap-2 mb-2">
              {factors.slice(0, 3).map((factor) => {
                const value = gameState.factors[factor.key as keyof typeof gameState.factors];
                const IconComponent = factor.icon;
                
                return (
                  <div key={factor.key} className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${
                      isDark ? 'bg-slate-800' : 'bg-gray-100'
                    }`}>
                      <IconComponent className={`w-3 h-3 ${
                        value >= 70 ? 'text-green-500' :
                        value >= 40 ? 'text-yellow-500' : 'text-red-500'
                      }`} />
                    </div>
                    
                    <div className="w-full">
                      <div className={`h-1.5 rounded-full mb-1 transition-colors duration-300 ${
                        isDark ? 'bg-slate-800' : 'bg-gray-200'
                      }`}>
                        <div
                          className={`h-1.5 rounded-full transition-all duration-500 ${
                            value >= 70 ? 'bg-green-500' :
                            value >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-medium transition-colors duration-300 ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {factor.name}
                        </span>
                        <span className={`text-xs font-bold transition-colors duration-300 ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {value}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Segunda linha com 2 fatores centralizados */}
            <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
              {factors.slice(3, 5).map((factor) => {
                const value = gameState.factors[factor.key as keyof typeof gameState.factors];
                const IconComponent = factor.icon;
                
                return (
                  <div key={factor.key} className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${
                      isDark ? 'bg-slate-800' : 'bg-gray-100'
                    }`}>
                      <IconComponent className={`w-3 h-3 ${
                        value >= 70 ? 'text-green-500' :
                        value >= 40 ? 'text-yellow-500' : 'text-red-500'
                      }`} />
                    </div>
                    
                    <div className="w-full">
                      <div className={`h-1.5 rounded-full mb-1 transition-colors duration-300 ${
                        isDark ? 'bg-slate-800' : 'bg-gray-200'
                      }`}>
                        <div
                          className={`h-1.5 rounded-full transition-all duration-500 ${
                            value >= 70 ? 'bg-green-500' :
                            value >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-medium transition-colors duration-300 ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {factor.name}
                        </span>
                        <span className={`text-xs font-bold transition-colors duration-300 ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {value}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </footer>

      {/* Modal de Ação */}
      {showModal.isOpen && showModal.object && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`max-w-sm w-full rounded-2xl p-6 border-2 transition-all duration-300 ${
            isDark 
              ? 'bg-slate-900 border-slate-700' 
              : 'bg-white border-gray-200 shadow-2xl'
          }`}>
            <div className="text-center mb-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isDark ? 'bg-slate-800' : 'bg-gray-100'
              }`}>
                <showModal.object.icon className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className={`text-lg font-bold mb-2 transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {showModal.object.action.question}
              </h3>
              <p className={`text-sm transition-colors duration-300 ${
                isDark ? 'text-slate-400' : 'text-gray-600'
              }`}>
                Tempo necessário: {showModal.object.timeJump >= 60 
                  ? `${Math.floor(showModal.object.timeJump / 60)}h${showModal.object.timeJump % 60 > 0 ? ` ${showModal.object.timeJump % 60}min` : ''}`
                  : `${showModal.object.timeJump}min`
                }
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleActionCancel}
                className={`flex-1 py-3 px-4 rounded-xl font-bold transition-colors ${
                  isDark 
                    ? 'bg-slate-800 hover:bg-slate-700 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                Não
              </button>
              <button
                onClick={handleActionConfirm}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-4 rounded-xl font-bold transition-colors"
              >
                Sim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mensagem de Consequência */}
      {showConsequence && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className={`max-w-xs p-4 rounded-xl shadow-lg transition-all duration-300 ${
            isDark ? 'bg-slate-800 text-white border border-slate-700' : 'bg-white text-gray-900 border border-gray-200'
          }`}>
            <p className="text-sm text-center">{showConsequence}</p>
          </div>
        </div>
      )}

      {/* Mensagem de Save */}
      {showSaveMessage && (
        <div className="fixed top-20 right-4 z-50">
          <div className={`px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
            isDark ? 'bg-emerald-600 text-white' : 'bg-emerald-500 text-white'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-sm">💾</span>
              <span className="text-sm font-medium">Jogo salvo!</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileGameInterface;