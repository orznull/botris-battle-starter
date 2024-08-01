export type GameStartedEvent = {
  type: "game_started"
}

export type RoundStartedEvent = {
  type: 'round_started';
  payload: {
    startsAt: number;
    roomData: RoomData;
  }
}

export type RequestMoveEvent = {
  type: "request_move";
  payload: {
    gameState: PublicGameState;
    players: PlayerData[];
  };
}

export type PlayerJoinedEvent = {
  type: "player_joined";
  payload: {
    playerData: PlayerData;
  };
};

export type PlayerLeftEvent = {
  type: "player_left";
  payload: {
    sessionId: string;
  };
};

export type PlayerBannedEvent = {
  type: "player_banned";
  payload: {
    playerInfo: PlayerInfo;
  };
};

export type PlayerUnbannedEvent = {
  type: "player_unbanned";
  payload: {
    playerInfo: PlayerInfo;
  };
};

export type SettingsChangedEvent = {
  type: "settings_changed";
  payload: {
    roomData: RoomData;
  };
};

export type HostChangedEvent = {
  type: "host_changed";
  payload: {
    hostInfo: PlayerInfo;
  };
};

export type GameEvent = {
  type: 'piece_placed';
  payload: {
    initial: PieceData;
    final: PieceData;
  };
} | {
  type: 'damage_tanked';
  payload: {
    holeIndices: number[];
  };
} | {
  type: 'clear';
  payload: {
    clearName: string;
    allSpin: boolean;
    b2b: boolean;
    combo: number;
    pc: boolean;
    attack: number;
    cancelled: number;
    piece: PieceData;
    clearedLines: {
      height: number;
      blocks: Block[];
    }[];
  };
} | {
  type: 'game_over';
};

export type RoundOverEvent =
  {
    type: 'round_over';
    payload: {
      winnerSession: string;
      winnerInfo: PlayerInfo;
      roomInfo: typeof GAME_INFO;
    }
  }
export type GameOverEvent =
  {
    type: 'game_over';
    payload: {
      winnerSession: string;
      winnerInfo: PlayerInfo;
      roomData: RoomData;
    }
  }

export type GameResetEvent =
  {
    type: "game_reset";
    payload: {
      roomData: RoomData;
    };
  }

export type ServerEvent =
  | RoundStartedEvent
  | GameStartedEvent
  | RequestMoveEvent
  | PlayerJoinedEvent
  | PlayerLeftEvent
  | PlayerBannedEvent
  | PlayerUnbannedEvent
  | SettingsChangedEvent
  | HostChangedEvent
  | RoundOverEvent
  | GameOverEvent
  | GameResetEvent
  | GameEvent;

export type ActionEvent = {
  type: 'action';
  payload: {
    commands: Command[];
  }
}

export type Command = 'move_left' | 'move_right' | 'rotate_cw' | 'rotate_ccw' | 'drop' | 'sonic_drop';

export type PublicGameState = {
  board: Block[][];
  queue: Piece[];
  garbageQueued: number;
  held: Piece | null;
  current: PieceData;
  isImmobile: boolean;
  canHold: boolean;
  combo: number;
  b2b: boolean;
  score: number;
  piecesPlaced: number;
  dead: boolean;
};

export type PieceData = {
  piece: Piece;
  x: number;
  y: number;
  rotation: 0 | 1 | 2 | 3;
}

export type Block = Piece | 'G' | null;

export type Piece = 'I' | 'O' | 'J' | 'L' | 'S' | 'Z' | 'T';

export type PlayerInfo = {
  botId: string;
  creator: string;
  bot: string;
};

export type PlayerData = {
  sessionId: string;
  playing: boolean;
  info: PlayerInfo;
  wins: number;
  gameState: PublicGameState | null;
}

export type RoomData = {
  id: string;
  host: PlayerInfo;
  private: boolean;
  ft: number;
  initialPps: number;
  finalPps: number;
  startMargin: number;
  endMargin: number;
  maxPlayers: number;
  gameOngoing: boolean;
  roundOngoing: boolean;
  startedAt: number | null;
  endedAt: number | null;
  lastWinner: string | null;
  players: PlayerData[];
  banned: PlayerInfo[];
}

const GAME_INFO = {
  boardWidth: 10,
  boardHeight: 20,
  garbageMessiness: 0.05,
  attackTable: {
    'single': 0,
    'double': 1,
    'triple': 2,
    'quad': 4,
    'asd': 4,
    'ass': 2,
    'ast': 6,
    'pc': 10,
    'b2b': 1,
  },
  comboTable: [0, 0, 1, 1, 1, 2, 2, 3, 3, 4],
}