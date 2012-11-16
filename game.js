(function() {
  var blinky, canvas, checkCollision, checkWin, clear, clyde, controllingPacman, ctx, direction, draw, ensureChannel, ghost, i, imagesLoaded, inky, lastmsgts, losePacman, maze, movePac, movePacInterval, mover, newGhost, newpac, pacLoc, pacLocInterval, pacman, pinky, randDir, randDirInterval, randomlyMovePacman, reset, resetPac, schedule, sendGhostCoords, showMessage, socket, unschedule;

  socket = io.connect(document.domain + ":7080");

  socket.on('connect', function() {
    return console.log('socket connected');
  });

  canvas = document.getElementById('board');

  ctx = canvas.getContext('2d');

  blinky = new Image();

  pacman = new Image();

  pinky = new Image();

  clyde = new Image();

  clyde.src = 'clyde.png';

  clyde.X = -100;

  clyde.Y = -100;

  clyde.name = 'clyde';

  inky = new Image();

  maze = new Image();

  maze.src = 'board.png';

  pacman.src = 'pacman.png';

  pacman.X = -100;

  pacman.Y = -200;

  inky.src = 'inky.png';

  inky.X = -100;

  inky.Y = -100;

  inky.name = 'inky';

  pinky.src = 'pinky.png';

  pinky.X = -100;

  pinky.Y = -100;

  pinky.name = 'pinky';

  console.log(pinky.X);

  blinky.src = 'blinky.gif';

  blinky.X = -100;

  blinky.Y = -100;

  blinky.name = 'blinky';

  direction = 'up';

  ghost = null;

  controllingPacman = false;

  pacLocInterval = false;

  randDirInterval = false;

  movePacInterval = false;

  lastmsgts = new Date().getTime();

  showMessage = function(msg) {
    var banner;
    banner = $('#message');
    banner.html(msg).show();
    return setTimeout((function() {
      return banner.hide();
    }), 5000);
  };

  unschedule = function(intrvl) {
    if (intrvl !== false) intrvl = window.clearInterval(intrvl);
    return intrvl;
  };

  schedule = function(intrvl, code, freq) {
    unschedule(intrvl);
    return intrvl = setInterval(code, freq);
  };

  randomlyMovePacman = function() {
    showMessage("Will randomly move pacman around!");
    controllingPacman = true;
    resetPac();
    pacLocInterval = schedule(pacLocInterval, pacLoc, 20);
    randDirInterval = schedule(randDirInterval, randDir, 500);
    return movePacInterval = schedule(movePacInterval, movePac, 20);
  };

  losePacman = function() {
    controllingPacman = true;
    pacLocInterval = unschedule(pacLocInterval);
    randDirInterval = unschedule(randDirInterval);
    movePacInterval = unschedule(movePacInterval);
    return showMessage("Inactive - no longer randomly moving pacman!");
  };

  reset = function(ghost) {
    switch (ghost.name) {
      case 'blinky':
        ghost.X = 430;
        break;
      case 'pinky':
        ghost.X = 400;
        break;
      case 'inky':
        ghost.X = 460;
        break;
      case 'clyde':
        ghost.X = 490;
    }
    ghost.Y = 220;
    socket.emit('pacman-message', {
      type: 'location',
      ghost: ghost.name,
      x: ghost.X,
      y: ghost.Y
    });
    lastmsgts = new Date().getTime();
    return showMessage("Use the arrow keys to move your ghost " + ghost.name + " around");
  };

  socket.on('pacman-message', function(message) {
    var full, sprite;
    switch (message.type) {
      case 'lose-pacman':
        return losePacman();
      case 'pacman':
        return randomlyMovePacman();
      case 'location':
        sprite = eval(message.sprite);
        sprite.X = message.x;
        return sprite.Y = message.y;
      case 'ghost':
        ghost = eval(message.name);
        console.log(ghost);
        return reset(ghost);
      case 'win':
        reset(ghost);
        if (controllingPacman) resetPac();
        return showMessage(message.ghost + ' wins!');
      case 'full':
        full = $('#full');
        return full.html('Sorry, all ghosts are in use<br>Enjoy the show').show();
      case 'newghost':
        lastmsgts = new Date().getTime();
        return socket.emit('pacman-message', {
          type: 'location',
          ghost: ghost.name,
          x: ghost.X,
          y: ghost.Y
        });
    }
  });

  resetPac = function() {
    pacman.X = 500;
    return pacman.Y = 300;
  };

  newpac = function() {
    var blah, foo, height, i, imgd, pix, val, width, _i, _len;
    console.log('newpac!');
    foo = null;
    blah = null;
    while (foo !== 1) {
      width = Math.floor(Math.random() * 1099) + 1;
      height = Math.floor(Math.random() * 373) + 1;
      imgd = ctx.getImageData(width, height, 30, 30);
      pix = imgd.data;
      i = 0;
      for (_i = 0, _len = pix.length; _i < _len; _i++) {
        val = pix[_i];
        if (pix[i] === 0) foo = 1;
        i += 4;
      }
    }
    pacman.X = width;
    pacman.Y = height;
    return [width, height];
  };

  newGhost = function(ghost) {
    var blah, foo, height, i, imgd, pix, val, width, _i, _len;
    foo = null;
    blah = null;
    while (foo !== 1) {
      width = Math.floor(Math.random() * 1099) + 1;
      height = Math.floor(Math.random() * 373) + 1;
      imgd = ctx.getImageData(width, height, 30, 30);
      pix = imgd.data;
      i = 0;
      for (_i = 0, _len = pix.length; _i < _len; _i++) {
        val = pix[_i];
        if (pix[i] === 0) foo = 1;
        i += 4;
      }
    }
    ghost.X = width;
    ghost.Y = height;
    return [width, height];
  };

  sendGhostCoords = function() {
    if (!ghost) return ghost;
    lastmsgts = new Date().getTime();
    return socket.emit('pacman-message', {
      type: 'location',
      ghost: ghost.name,
      x: ghost.X,
      y: ghost.Y
    });
  };

  mover = function(event, ghost) {
    if (!ghost) return 0;
    switch (event.keyCode) {
      case 39:
        if (checkCollision('right', ghost) !== true) ghost.X += 10;
        break;
      case 38:
        if (checkCollision('up', ghost) !== true) ghost.Y -= 10;
        break;
      case 37:
        if (checkCollision('left', ghost) !== true) ghost.X -= 10;
        break;
      case 40:
        if (checkCollision('down', ghost) !== true) ghost.Y += 10;
        break;
      case 87:
        ghost.Y -= 10;
        break;
      case 83:
        ghost.Y += 10;
        break;
      case 68:
        ghost.X += 10;
        break;
      case 65:
        ghost.X -= 10;
    }
    return sendGhostCoords();
  };

  randDir = function() {
    switch (Math.floor(Math.random() * 4)) {
      case 0:
        return direction = 'left';
      case 1:
        return direction = 'right';
      case 2:
        return direction = 'up';
      case 3:
        return direction = 'down';
    }
  };

  movePac = function() {
    if (checkCollision(direction, pacman) === true) {
      return randDir();
    } else {
      switch (direction) {
        case 'left':
          return pacman.X -= 10;
        case 'right':
          return pacman.X += 10;
        case 'up':
          return pacman.Y -= 10;
        case 'down':
          return pacman.Y += 10;
      }
    }
  };

  pacLoc = function() {
    var ghosts;
    lastmsgts = new Date().getTime();
    socket.emit('pacman-message', {
      type: 'location',
      ghost: 'pacman',
      x: pacman.X,
      y: pacman.Y
    });
    return ghosts = [blinky, pinky, inky, clyde];
  };

  checkWin = function() {
    if (Math.abs(ghost.X - pacman.X) < 35 && Math.abs(pacman.Y - ghost.Y) < 35) {
      lastmsgts = new Date().getTime();
      return socket.emit('pacman-message', {
        type: 'win'
      });
    }
  };

  clear = function() {
    return canvas.width = canvas.width;
  };

  imagesLoaded = function() {
    return (maze.width > 0) && (pacman.width > 0) && (blinky.width > 0) && (pinky.width > 0) && (clyde.width > 0) && (inky.width > 0);
  };

  draw = function() {
    clear();
    if (!imagesLoaded()) return;
    if (ghost != null) checkWin();
    ctx.drawImage(maze, 0, 0);
    ctx.drawImage(pacman, pacman.X, pacman.Y, 30, 30);
    ctx.drawImage(blinky, blinky.X, blinky.Y, 30, 30);
    ctx.drawImage(pinky, pinky.X, pinky.Y, 30, 30);
    ctx.drawImage(inky, inky.X, inky.Y, 30, 30);
    return ctx.drawImage(clyde, clyde.X, clyde.Y, 30, 30);
  };

  checkCollision = function(direction, sprite) {
    var i, imgd, pix, val, x, y, _i, _len;
    switch (direction) {
      case 'up':
        x = sprite.X;
        y = sprite.Y - 10;
        break;
      case 'down':
        x = sprite.X;
        y = sprite.Y + 30;
        break;
      case 'left':
        x = sprite.X - 10;
        y = sprite.Y;
        break;
      case 'right':
        x = sprite.X + 30;
        y = sprite.Y;
    }
    imgd = ctx.getImageData(x, y, 10, 10);
    pix = imgd.data;
    i = 0;
    for (_i = 0, _len = pix.length; _i < _len; _i++) {
      val = pix[_i];
      if (pix[i] === 0) return true;
      i += 4;
    }
    return false;
  };

  ensureChannel = function() {
    if ((new Date().getTime() - lastmsgts) < 3000) return 0;
    if (controllingPacman) return randomlyMovePacman();
    return sendGhostCoordinates();
  };

  setInterval(draw, 20);

  setInterval(ensureChannel, 5000);

  i = Math.floor(Math.random() * 2);

  window.addEventListener('keydown', (function(event) {
    return mover(event, ghost);
  }), false);

}).call(this);
