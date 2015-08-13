window.onload = function load() {
	// Bug constructor
	function Bug() {
		this.counter = 0;
		this.size = 10;
		this.live = true;
		this.x = this.size + Math.random() * (canvas.width - this.size);
		this.y = 0;
		this.img = new Image();
		this.type = 0;
		this.speed = 0;
		this.rad = 0;
		this.score = 0;
		this.alpha = 1;
		this.defColor(Math.random());
		this.target = new Target();
		this.search();
	}

	// Bug function to generate bug color
	Bug.prototype.defColor = function(num) {
		// Orange
		if (num >= 0.6 && num <= 1) {
			this.type = 0;
			this.speed = (level == 1) ? 60 / 60 : 80 / 60;
			this.score = 1;
			this.img.src = "sbugO.png";
		}
		// Red
		else if (num >= 0.3 && num < 0.6) {
			this.type = 1;
			this.speed = (level == 1) ? 75 / 60 : 100 / 60;
			this.score = 3;
			this.img.src = "sbugR.png";
		}
		// Black
		else if (num >= 0 && num < 0.3) {
			this.type = 2;
			this.speed = (level == 1) ? 150 / 60 : 200 / 60;
			this.score = 5;
			this.img.src = "sbugB.png";
		}
	};

	// Bug function to search for the nearest food.
	Bug.prototype.search = function() {
		var dx = 0;
		var dy = 0;
		var dst = 0;
		this.target.dst = canvas.width + canvas.height;
		for (var i = 0; i < foods.length; i++) {
			dx = foods[i].x - this.x;
			dy = foods[i].y - this.y;
			dst = Math.sqrt(dx * dx + dy * dy);
			if (dst < this.target.dst) {
				this.target.x = foods[i].x;
				this.target.y = foods[i].y;
				this.target.dst = dst;
				this.target.cos = (this.target.x - this.x) / this.target.dst;
				this.target.sin = (this.target.y - this.y) / this.target.dst;
				this.target.index = i;
				this.target.dx = dx;
				this.target.dy = dy;
			}
		}
		
		// calculate rotation angle
		if (this.target.dx > 0 && this.target.dy > 0)
			this.rad = Math.asin(this.target.sin);
		else if (this.target.dx < 0 && this.target.dy > 0)
			this.rad = Math.PI - Math.asin(this.target.sin);
		else if (this.target.dx < 0 && this.target.dy < 0)
			this.rad = Math.atan2(this.target.dy / this.target.dx) + Math.PI;
		else if (this.target.dx > 0 && this.target.dy < 0)
			this.rad = -Math.acos(this.target.cos);
	};

	// Bug function to update position
	Bug.prototype.update = function() {
		// Check eat
		var dx = this.x - this.target.x;
		var dy = this.y - this.target.y;
		if (Math.sqrt(dx * dx + dy * dy) < Math.sqrt(foodSize * foodSize)) {
			// Delete food
			for(var i in foods){
				if(foods[i].x == this.target.x && foods[i].y == this.target.y){
					foods.splice(i, 1);
					break;
				}
			}
		}
		this.x += this.speed * Math.cos(this.rad);
		this.y += this.speed * Math.sin(this.rad);
	};

	// Bug function to render
	Bug.prototype.render = function() {
		// image
		ctx.save();
		ctx.globalAlpha = this.alpha;
		ctx.translate(this.x, this.y);
		ctx.rotate(this.rad);
		ctx.drawImage(this.img, -this.img.width/2 , -this.img.height/2);
		ctx.restore();
	};
	// Target constructor
	function Target(x, y) {
		this.x = 0;
		this.y = 0;
		this.dx = 0;
		this.dy = 0;
		this.cos = 0;
		this.sin = 0;
		this.dst = canvas.width + canvas.height;
		this.index = 0;
	};

	// Food constructor
	function Food() {
		this.x = foodSize + Math.random() * (canvas.width - 2 * foodSize);
		this.y = Math.random() * (canvas.height / 2) + canvas.height / 2 - foodSize;
		this.size = 15;
		this.color = "rgb(0, 255, 255)";
		this.ate = false;
	};

	// Food function to render
	Food.prototype.render = function() {
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
		ctx.closePath();
		ctx.fill();
	};

	// Initialize food array
	function createFoods(num) {
		for (var i = 0; i < num; i++) {
			foods.push(new Food());
		};
	}

	// Click handler function
	function getPosition(e) {
		var rect = canvas.getBoundingClientRect();
		
		var x = e.clientX;
		var y = e.clientY;
		var dx = 0;
		var dy = 0;
		var dst = 0;

		x -= rect.left;
		y -= rect.top;
		// Check kill
		if (state == "play") {
			for (var i = 0; i < bugs.length; i++) {
				dx = bugs[i].x - x;
				dy = bugs[i].y - y;
				dst = Math.sqrt(dx * dx + dy * dy);
				if (dst < clickRadius) {
					// Update score
					score += bugs[i].score;
					bugs[i].score = 0;
					document.getElementById("score").innerHTML = "Score: " + score;
					// Kill bug
					bugs[i].live = false;
				}
			}
		}
	}

	// Game state
	function updateGame() {
		counter++;
		// Game over: lose all foods
		if (foods.length == 0) {
			state = "over";
			document.getElementById("state").innerHTML = state;
		}

		// Win: time = 0
		if (time == 0) {
			state = "win";
			document.getElementById("state").innerHTML = state;
		}
		// time counter
		if (counter % 60 == 0) {
			time--;
			document.getElementById("counter").innerHTML = time + " sec";
		}

		// born new bug counter
		if (counter % (60 * rdm) == 0) {
			rdm = Math.round(Math.random() * 2 + 1);
			counter = 0;
			bugs.push(new Bug());
		}
	}

	// Game loop
	function loop() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Draw bugs
		for (var j in bugs) {
			if (bugs[j].live) {
				//bugs[j].search();
				bugs[j].update();
				bugs[j].search();
				bugs[j].render();
			} else {
				// Fade out
				bugs[j].counter++;
				bugs[j].alpha = 1 - bugs[j].counter / fadeTime;
				bugs[j].render();
				if (bugs[j].counter == fadeTime)
					bugs.splice(bugs[j], 1);
			}
		}

		// Draw foods
		for (var i in foods) {
			foods[i].render();
		};

		// update game state
		updateGame();

		// Check over;
		if (state == "over") {
			document.getElementById("state").innerHTML = state;
			window.cancelAnimationFrame(frame);
			if (score > localStorage.getItem("score"))
				localStorage.setItem("score", score);
			var restart = confirm("Game Over!\n" + "Your score: " + score + "!\n New Game?" + " bugs: " + bugs.length);
			if (!restart) {
				document.location.href = "start.html";
			} else {
				init();
				loop();
			}
		} else if (state == "win") {
			// Record new level record.
			if (level + 1 > localStorage.getItem("levelRecord"))
				localStorage.setItem("levelRecord", level + 1);
			if (level < 2) {
				var next = confirm("You Win!\n" + "Next Level?");
				if (next) {
					init();
					level++;
					document.getElementById("currentLevel").innerHTML = "Level: " + level;
				} else {
					document.location.href = "start.html";
				}
			} else {
				alert("You Finished the Game!");
				document.location.href = "start.html";
			}

		} else if (state == "play") {
			// update frame
			frame = window.requestAnimationFrame(loop);
		}
	}

	// Initialize game
	function init() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		time = TIME;
		counter = 0;
		score = 0;
		state = "play";
		rdm = Math.round(Math.random() * 2 + 1);
		bugs = [];
		foods = [];
		createFoods(5);
		bugs = [new Bug()];

		document.getElementById("debug").innerHTML = "local level: " + localStorage.getItem("level");
		document.getElementById("state").innerHTML = state;
		document.getElementById("score").innerHTML = "Score: " + score;
		document.getElementById("currentLevel").innerHTML = "Level: " + level;
	}

	// Get canvas
	var canvas = document.getElementById("board");
	var btn = document.getElementById("state");
	var ctx = canvas.getContext("2d");

	// Define parameters
	var TIME = 60;
	var time = TIME;
	var clickRadius = 30;
	var state = "play";
	var foodSize = 20;
	var level = localStorage.getItem("level");
	var score = 0;
	var fadeTime = 120;
	var rdm = Math.round(Math.random() * 2 + 1);
	// Create food array
	var foods = [];
	createFoods(5);

	// Create bug array
	var bugs = [new Bug()];

	// Counter variables
	var frame;
	var counter = 0;

	loop();

	btn.addEventListener('click', function changeState() {
		if (state == "pause") {
			state = "play";
			loop();
		} else if (state == "play") {
			state = "pause";
		}

		document.getElementById("state").innerHTML = state;
		document.getElementById("debug").innerHTML = state;
	}, false);

	canvas.addEventListener("mousedown", getPosition, false);
	document.getElementById("debug").innerHTML = "local level: " + localStorage.getItem("level");
	document.getElementById("state").innerHTML = state;
	document.getElementById("currentLevel").innerHTML = "Level: " + level;
};

