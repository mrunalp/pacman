
socket = io.connect(document.domain)
socket.on 'connect', ->
	console.log 'socket connected'

canvas = document.getElementById 'board'
ctx = canvas.getContext '2d'
blinky = new Image()
pacman = new Image()
pinky = new Image()
clyde = new Image()
clyde.src = 'clyde.png'
clyde.X = -100
clyde.Y = -100
clyde.name = 'clyde'
inky = new Image()
maze = new Image()
maze.src = 'board.png'
pacman.src = 'pacman.png'
pacman.X = -100
pacman.Y = -200
inky.src = 'inky.png'
inky.X = -100
inky.Y = -100
inky.name = 'inky'
pinky.src = 'pinky.png'
pinky.X =  -100
pinky.Y = -100
pinky.name = 'pinky'
console.log pinky.X
blinky.src = 'blinky.gif'
blinky.X = -100
blinky.Y = -100
blinky.name = 'blinky'
direction = 'up'
ghost = null
controllingPacman = false
pacLocInterval = false
randDirInterval = false
movePacInterval = false
lastmsgts = new Date().getTime()

showMessage = (msg)->
	banner = $('#message')
	banner.html(msg).show()
	setTimeout (->banner.hide()), 5000

unschedule = (intrvl)->
	if intrvl != false
	    intrvl = window.clearInterval(intrvl)
	return intrvl

schedule = (intrvl, code, freq)->
	unschedule(intrvl)
	return intrvl = setInterval(code, freq)

randomlyMovePacman = ->
	showMessage("Will randomly move pacman around!")
	controllingPacman = true
	resetPac()
	pacLocInterval  = schedule(pacLocInterval,  pacLoc,   20)
	randDirInterval = schedule(randDirInterval, randDir, 500)
	return movePacInterval = schedule(movePacInterval, movePac,  20)

losePacman = ->
	controllingPacman = true
	pacLocInterval  = unschedule(pacLocInterval)
	randDirInterval = unschedule(randDirInterval)
	movePacInterval = unschedule(movePacInterval)
	showMessage("Inactive - no longer randomly moving pacman!")

reset = (ghost)->
	switch ghost.name
		when 'blinky'
			ghost.X = 430
		when 'pinky'
			ghost.X = 400
		when 'inky'
			ghost.X = 460
		when 'clyde'
			ghost.X = 490
	ghost.Y = 220
    # console.log "sending location %s: %d,%d", ghost.name, ghost.X, ghost.Y
	socket.emit 'pacman-message',
		type: 'location'
		ghost: ghost.name
		x: ghost.X
		y: ghost.Y
	lastmsgts = new Date().getTime()
	showMessage("Use the arrow keys to move your ghost " + ghost.name +
	            " around")

socket.on 'pacman-message', (message)->
	#console.log message
	switch message.type
		when 'lose-pacman'
		    losePacman()

		when 'pacman'
		    randomlyMovePacman()

		when 'location'
			sprite = eval message.sprite
			sprite.X = message.x
			sprite.Y = message.y
		
		when 'ghost'
			ghost = eval(message.name)
			console.log ghost
			reset(ghost)

		when 'win'
			reset(ghost)
			if controllingPacman
			    resetPac()
			showMessage(message.ghost + ' wins!')

		when 'full'
			full = $('#full')
			full.html('Sorry, all ghosts are in use<br>Enjoy the show').show()
		when 'newghost'
			lastmsgts = new Date().getTime()
			socket.emit 'pacman-message',
				type: 'location'
				ghost: ghost.name
				x: ghost.X
				y: ghost.Y

							
resetPac = ->
	pacman.X = 500
	pacman.Y = 300

newpac = ->
	console.log 'newpac!'
	foo = null
	blah = null
	while foo != 1
		width = Math.floor(Math.random()*1099)+1
		height = Math.floor(Math.random()*373)+1
		#console.log 'width: ' + width
		#console.log 'height: ' + height
		imgd = ctx.getImageData width, height, 30, 30
		pix = imgd.data
		i = 0
		for val in pix
			if pix[i] == 0
				foo = 1
			i += 4
	pacman.X = width
	pacman.Y = height
	return [width, height]

newGhost = (ghost)->
	foo = null
	blah = null
	while foo != 1
		width = Math.floor(Math.random()*1099)+1
		height = Math.floor(Math.random()*373)+1

		imgd = ctx.getImageData width, height, 30, 30
		pix = imgd.data
		i = 0
		for val in pix
			if pix[i] == 0
				foo = 1
			i += 4
	ghost.X = width
	ghost.Y = height
	return [width, height]

sendGhostCoords = ->
	if ! ghost
	    return ghost
	lastmsgts = new Date().getTime()
	socket.emit 'pacman-message',
		type: 'location'
		ghost: ghost.name
		x: ghost.X
		y: ghost.Y
        
mover = (event, ghost)->
	#event.preventDefault()
	if ! ghost
	    return 0
	switch event.keyCode
		when 39
			if checkCollision('right', ghost) != true
				 ghost.X += 10
		when 38
			if checkCollision('up', ghost) != true
				ghost.Y -= 10
		when 37
			if checkCollision('left', ghost) != true
				ghost.X -= 10
		when 40
			if checkCollision('down', ghost) != true
				ghost.Y += 10
		when 87
			ghost.Y -= 10
		when 83
			ghost.Y += 10
		when 68
			ghost.X += 10
		when 65
			ghost.X -= 10
	#console.log [ghost.X, ghost.Y]
	sendGhostCoords()

randDir = ->
    switch Math.floor(Math.random()*4)
	    when 0
	        direction = 'left'
	    when 1
	        direction = 'right'
	    when 2
	        direction = 'up'
	    when 3
	        direction = 'down'

movePac = ->
    if checkCollision(direction, pacman) == true
        randDir()
    else
        switch direction
            when 'left'
                pacman.X -= 10
            when 'right'
                pacman.X += 10
            when 'up'
                pacman.Y -= 10
            when 'down'
                pacman.Y += 10

pacLoc = ->
	#console.log socket
	#console.log pacman.X          
	lastmsgts = new Date().getTime()
	socket.emit 'pacman-message',
		type: 'location'
		ghost: 'pacman'
		x: pacman.X
		y: pacman.Y  
	ghosts = [blinky,pinky,inky,clyde]

checkWin = ->
	if  Math.abs(ghost.X-pacman.X) <35 && Math.abs(pacman.Y - ghost.Y)< 35 
		lastmsgts = new Date().getTime()
		socket.emit 'pacman-message',
			type: 'win'

clear = ->
	canvas.width = canvas.width

imagesLoaded = ->
	((maze.width > 0) &&  (pacman.width > 0)  && (blinky.width > 0) &&  \
	 (pinky.width > 0) && (clyde.width > 0)   && (inky.width > 0))

draw = ->
	clear()
	if ! imagesLoaded()
	    return
	checkWin() if ghost?
	ctx.drawImage maze, 0, 0
	ctx.drawImage pacman, pacman.X, pacman.Y, 30, 30
	ctx.drawImage blinky, blinky.X, blinky.Y, 30, 30 
	ctx.drawImage pinky, pinky.X, pinky.Y, 30, 30
	ctx.drawImage inky, inky.X, inky.Y, 30, 30
	ctx.drawImage clyde, clyde.X, clyde.Y, 30, 30

checkCollision = (direction, sprite)->
	switch direction
		when 'up'
			x = sprite.X
			y = sprite.Y - 10
		when 'down'
			x = sprite.X
			y = sprite.Y + 30
		when 'left'
			x = sprite.X - 10
			y = sprite.Y
		when 'right'
			x = sprite.X + 30
			y = sprite.Y
	imgd = ctx.getImageData x, y, 10, 10
	pix = imgd.data
	i = 0
	for val in pix
		if pix[i] == 0
			return true
		i += 4
	return false

ensureChannel = ->
	if (new Date().getTime() - lastmsgts) < 3000
	    return 0
	# Force client to randomly move and send pacman info.
	if controllingPacman
	    return randomlyMovePacman()
	return sendGhostCoordinates()
    
setInterval draw, 20
setInterval ensureChannel, 5000
i = Math.floor(Math.random()*2)
window.addEventListener('keydown', ((event)->mover(event,ghost)), false)
