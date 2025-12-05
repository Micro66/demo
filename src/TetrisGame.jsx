import React, { useState, useEffect, useCallback, useRef } from 'react';

const TetrisGame = () => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // 游戏常量
  const BLOCK_SIZE = 30;
  const BOARD_WIDTH = 10;
  const BOARD_HEIGHT = 20;

  // 方块形状定义
  const PIECES = [
    // I
    [
      [1, 1, 1, 1]
    ],
    // O
    [
      [1, 1],
      [1, 1]
    ],
    // T
    [
      [0, 1, 0],
      [1, 1, 1]
    ],
    // S
    [
      [0, 1, 1],
      [1, 1, 0]
    ],
    // Z
    [
      [1, 1, 0],
      [0, 1, 1]
    ],
    // J
    [
      [1, 0, 0],
      [1, 1, 1]
    ],
    // L
    [
      [0, 0, 1],
      [1, 1, 1]
    ]
  ];

  // 方块颜色
  const COLORS = [
    '#00f0f0', // 青色 (I)
    '#f0f000', // 黄色 (O)
    '#a000f0', // 紫色 (T)
    '#00f000', // 绿色 (S)
    '#f00000', // 红色 (Z)
    '#0000f0', // 蓝色 (J)
    '#f0a000'  // 橙色 (L)
  ];

  const gameStateRef = useRef({
    board: [],
    currentPiece: null,
    currentX: 0,
    currentY: 0,
    currentColor: '',
    dropCounter: 0,
    lastTime: 0,
    dropInterval: 1000
  });

  // 初始化游戏板
  const initBoard = useCallback(() => {
    const board = [];
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      board[y] = [];
      for (let x = 0; x < BOARD_WIDTH; x++) {
        board[y][x] = '';
      }
    }
    return board;
  }, [BOARD_WIDTH, BOARD_HEIGHT]);

  // 创建新方块
  const createPiece = useCallback(() => {
    const pieceIndex = Math.floor(Math.random() * PIECES.length);
    return {
      shape: PIECES[pieceIndex].map(row => [...row]),
      color: COLORS[pieceIndex]
    };
  }, [PIECES, COLORS]);

  // 碰撞检测
  const checkCollision = useCallback((piece, x, y, board) => {
    for (let row = 0; row < piece.length; row++) {
      for (let col = 0; col < piece[row].length; col++) {
        if (piece[row][col]) {
          const newX = x + col;
          const newY = y + row;

          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return true;
          }

          if (newY >= 0 && board[newY][newX]) {
            return true;
          }
        }
      }
    }
    return false;
  }, [BOARD_WIDTH, BOARD_HEIGHT]);

  // 旋转矩阵
  const rotate = useCallback((matrix) => {
    const N = matrix.length;
    const M = matrix[0].length;
    const rotated = [];
    for (let i = 0; i < M; i++) {
      rotated[i] = [];
      for (let j = 0; j < N; j++) {
        rotated[i][j] = matrix[N - 1 - j][i];
      }
    }
    return rotated;
  }, []);

  // 合并方块到游戏板
  const mergePiece = useCallback((piece, x, y, color, board) => {
    for (let row = 0; row < piece.length; row++) {
      for (let col = 0; col < piece[row].length; col++) {
        if (piece[row][col]) {
          const boardY = y + row;
          const boardX = x + col;
          if (boardY >= 0) {
            board[boardY][boardX] = color;
          }
        }
      }
    }
  }, []);

  // 清除完整的行
  const clearLines = useCallback((board) => {
    let linesCleared = 0;
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (board[y].every(cell => cell !== '')) {
        board.splice(y, 1);
        board.unshift(new Array(BOARD_WIDTH).fill(''));
        linesCleared++;
        y++; // 重新检查当前行
      }
    }
    return linesCleared;
  }, [BOARD_WIDTH, BOARD_HEIGHT]);

  // 绘制游戏
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { board, currentPiece, currentX, currentY, currentColor } = gameStateRef.current;

    // 清空画布
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制游戏板
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (board[y][x]) {
          ctx.fillStyle = board[y][x];
          ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
        }
      }
    }

    // 绘制当前方块
    if (currentPiece) {
      ctx.fillStyle = currentColor;
      for (let row = 0; row < currentPiece.length; row++) {
        for (let col = 0; col < currentPiece[row].length; col++) {
          if (currentPiece[row][col]) {
            const x = (currentX + col) * BLOCK_SIZE;
            const y = (currentY + row) * BLOCK_SIZE;
            ctx.fillRect(x, y, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
          }
        }
      }
    }

    // 绘制网格线
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= BOARD_WIDTH; x++) {
      ctx.beginPath();
      ctx.moveTo(x * BLOCK_SIZE, 0);
      ctx.lineTo(x * BLOCK_SIZE, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= BOARD_HEIGHT; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * BLOCK_SIZE);
      ctx.lineTo(canvas.width, y * BLOCK_SIZE);
      ctx.stroke();
    }
  }, [BLOCK_SIZE, BOARD_WIDTH, BOARD_HEIGHT]);

  // 移动方块
  const movePiece = useCallback((dx, dy) => {
    const { currentPiece, currentX, currentY, board } = gameStateRef.current;
    if (!currentPiece) return false;

    const newX = currentX + dx;
    const newY = currentY + dy;

    if (!checkCollision(currentPiece, newX, newY, board)) {
      gameStateRef.current.currentX = newX;
      gameStateRef.current.currentY = newY;
      return true;
    }
    return false;
  }, [checkCollision]);

  // 旋转方块
  const rotatePiece = useCallback(() => {
    const { currentPiece, currentX, currentY, board } = gameStateRef.current;
    if (!currentPiece) return;

    const rotated = rotate(currentPiece);
    if (!checkCollision(rotated, currentX, currentY, board)) {
      gameStateRef.current.currentPiece = rotated;
    }
  }, [rotate, checkCollision]);

  // 快速下落
  const dropPiece = useCallback(() => {
    while (movePiece(0, 1)) {
      // 继续下落
    }
  }, [movePiece]);

  // 固定方块
  const lockPiece = useCallback(() => {
    const { currentPiece, currentX, currentY, currentColor, board } = gameStateRef.current;
    if (!currentPiece) return;

    mergePiece(currentPiece, currentX, currentY, currentColor, board);

    // 清除完整的行
    const linesCleared = clearLines(board);
    if (linesCleared > 0) {
      setLines(prev => prev + linesCleared);
      setScore(prev => prev + linesCleared * 100 * level);

      // 每10行升一级
      const newLevel = Math.floor((lines + linesCleared) / 10) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
        gameStateRef.current.dropInterval = Math.max(100, 1000 - (newLevel - 1) * 100);
      }
    }

    // 创建新方块
    const newPiece = createPiece();
    gameStateRef.current.currentPiece = newPiece.shape;
    gameStateRef.current.currentColor = newPiece.color;
    gameStateRef.current.currentX = Math.floor(BOARD_WIDTH / 2) - Math.floor(newPiece.shape[0].length / 2);
    gameStateRef.current.currentY = 0;

    // 检查游戏结束
    if (checkCollision(newPiece.shape, gameStateRef.current.currentX, gameStateRef.current.currentY, board)) {
      setGameOver(true);
    }
  }, [mergePiece, clearLines, level, lines, createPiece, checkCollision, BOARD_WIDTH]);

  // 游戏循环
  const gameLoop = useCallback((time = 0) => {
    if (gameOver || isPaused) {
      requestAnimationFrame(gameLoop);
      return;
    }

    const { dropCounter, lastTime, dropInterval } = gameStateRef.current;
    const deltaTime = time - lastTime;

    gameStateRef.current.lastTime = time;
    gameStateRef.current.dropCounter = dropCounter + deltaTime;

    if (gameStateRef.current.dropCounter > dropInterval) {
      if (!movePiece(0, 1)) {
        lockPiece();
      }
      gameStateRef.current.dropCounter = 0;
    }

    draw();
    requestAnimationFrame(gameLoop);
  }, [gameOver, isPaused, movePiece, lockPiece, draw]);

  // 键盘控制
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (gameOver) {
        if (event.key === 'r' || event.key === 'R') {
          resetGame();
        }
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
          movePiece(1, 0);
          break;
        case 'ArrowDown':
          movePiece(0, 1);
          break;
        case 'ArrowUp':
          rotatePiece();
          break;
        case ' ':
          setIsPaused(prev => !prev);
          break;
        case 'r':
        case 'R':
          resetGame();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameOver, movePiece, rotatePiece]);

  // 重置游戏
  const resetGame = useCallback(() => {
    gameStateRef.current = {
      board: initBoard(),
      currentPiece: null,
      currentX: 0,
      currentY: 0,
      currentColor: '',
      dropCounter: 0,
      lastTime: 0,
      dropInterval: 1000
    };

    // 创建第一个方块
    const firstPiece = createPiece();
    gameStateRef.current.currentPiece = firstPiece.shape;
    gameStateRef.current.currentColor = firstPiece.color;
    gameStateRef.current.currentX = Math.floor(BOARD_WIDTH / 2) - Math.floor(firstPiece.shape[0].length / 2);
    gameStateRef.current.currentY = 0;

    setScore(0);
    setLevel(1);
    setLines(0);
    setGameOver(false);
    setIsPaused(false);
  }, [initBoard, createPiece, BOARD_WIDTH]);

  // 初始化游戏
  useEffect(() => {
    resetGame();
  }, [resetGame]);

  // 启动游戏循环
  useEffect(() => {
    const animationId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationId);
  }, [gameLoop]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
        <h1 className="text-4xl font-bold text-white text-center mb-8">俄罗斯方块</h1>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-shrink-0">
            <canvas
              ref={canvasRef}
              width={BOARD_WIDTH * BLOCK_SIZE}
              height={BOARD_HEIGHT * BLOCK_SIZE}
              className="border-2 border-white/30 rounded-lg shadow-lg"
            />
          </div>

          <div className="text-white space-y-6">
            <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-4">游戏信息</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg">分数:</span>
                  <span className="text-2xl font-bold text-yellow-400">{score}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg">等级:</span>
                  <span className="text-2xl font-bold text-green-400">{level}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg">行数:</span>
                  <span className="text-2xl font-bold text-blue-400">{lines}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-4">操作说明</h2>
              <div className="space-y-2 text-lg">
                <div className="flex items-center gap-3">
                  <kbd className="bg-white/20 px-3 py-1 rounded border border-white/30">←</kbd>
                  <span>左移</span>
                </div>
                <div className="flex items-center gap-3">
                  <kbd className="bg-white/20 px-3 py-1 rounded border border-white/30">→</kbd>
                  <span>右移</span>
                </div>
                <div className="flex items-center gap-3">
                  <kbd className="bg-white/20 px-3 py-1 rounded border border-white/30">↓</kbd>
                  <span>下移</span>
                </div>
                <div className="flex items-center gap-3">
                  <kbd className="bg-white/20 px-3 py-1 rounded border border-white/30">↑</kbd>
                  <span>旋转</span>
                </div>
                <div className="flex items-center gap-3">
                  <kbd className="bg-white/20 px-3 py-1 rounded border border-white/30">空格</kbd>
                  <span>暂停/继续</span>
                </div>
                <div className="flex items-center gap-3">
                  <kbd className="bg-white/20 px-3 py-1 rounded border border-white/30">R</kbd>
                  <span>重新开始</span>
                </div>
              </div>
            </div>

            {gameOver && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 text-center">
                <h2 className="text-3xl font-bold text-red-400 mb-2">游戏结束!</h2>
                <p className="text-lg mb-4">按 R 键重新开始</p>
                <button
                  onClick={resetGame}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  重新开始
                </button>
              </div>
            )}

            {isPaused && !gameOver && (
              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-6 text-center">
                <h2 className="text-3xl font-bold text-yellow-400">游戏暂停</h2>
                <p className="text-lg">按空格键继续</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TetrisGame;