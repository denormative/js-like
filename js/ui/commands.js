/**
 * @class Basic command
 */
RPG.UI.Command = OZ.Class();

RPG.UI.Command.prototype.init = function(label) {
	RPG.UI._commands.push(this);
	this._button = new RPG.UI.Button(label, this.bind(this._activate));
}

RPG.UI.Command.prototype._activate = function(button) {
	RPG.UI.command(this);
}

RPG.UI.Command.prototype.getButton = function() {
	return this._button;
}

RPG.UI.Command.prototype.notify = function() {
}

RPG.UI.Command.prototype.cancel = function() {
}

RPG.UI.Command.prototype.exec = function() {
}

RPG.UI.Command.prototype._click = function(e) {
	RPG.UI.command(this);
}

/**
 * Get list of surrounding doors in a given opened/closed condition
 */
RPG.UI.Command.prototype._surroundingDoors = function(closed) {
	var doors = false;
	var dc = 0;
	var cell = RPG.World.pc.getCell();
	var map = cell.getMap();
	var center = cell.getCoords();
	
	var cells = map.cellsInCircle(cell.getCoords(), 1, false);
	for (var i=0;i<cells.length;i++) {
		var f = cells[i].getFeature();
		if (f && f instanceof RPG.Features.Door && f.isClosed() == closed) {
			dc++;
			doors = f;
		}
	}
	
	if (dc == 1) {
		return doors;
	} else {
		return dc;
	}
}

/**
 * Get list of surrounding beings
 */
RPG.UI.Command.prototype._surroundingBeings = function(closed) {
	var list = [];

	var cell = RPG.World.pc.getCell();
	var map = cell.getMap();
	var center = cell.getCoords();
	
	var cells = map.cellsInCircle(cell.getCoords(), 1, false);

	for (var i=0;i<cells.length;i++) {
		var b = cells[i].getBeing();
			if (b) { list.push(b); }
	}
	
	return list;
}

/**
 * @class Directional command
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Direction = OZ.Class().extend(RPG.UI.Command);
RPG.UI.Command.Direction.prototype.init = function(label, dir) {
	this.parent(label);
	this._dir = dir;
}
RPG.UI.Command.Direction.prototype.getDir = function() {
	return this._dir;
}
RPG.UI.Command.Direction.prototype.exec = function() {
	/* wait */
	if (this._dir == RPG.CENTER) {
		var result = RPG.World.pc.wait();
		RPG.World.actionResult(result);
		return;
	}
	
	var pc = RPG.World.pc;
	var cell = pc.getCell().neighbor(this._dir);
	
	/* invalid move */
	if (!cell) { 
		RPG.UI.buffer.message("You cannot move there!");
		return; 
	} 
	
	/* being there? */
	var b = cell.getBeing();
	if (b) {
		var hand = pc.getSlot(RPG.SLOT_WEAPON);
		var result = RPG.World.pc.attackMelee(b, hand);
		RPG.World.actionResult(result);
		return;
	} 
	
	/* closed door there? */
	var f = cell.getFeature();
	if (f && f instanceof RPG.Features.Door && f.isClosed()) {
		var result = RPG.World.pc.open(f);
		RPG.World.actionResult(result);
		return;
	}
	
	/* can we move there? */
	if (cell.isFree()) {
		var result = RPG.World.pc.move(cell);
		RPG.World.actionResult(result);
		return;
	}	
}

/**
 * @class Keypad
 */
RPG.UI.Command.Table = OZ.Class();

RPG.UI.Command.Table.prototype.init = function(container) {
	var table = OZ.DOM.elm("table");
	var tb = OZ.DOM.elm("tbody");
	table.appendChild(tb);
	container.appendChild(table);

	var tr = OZ.DOM.elm("tr");
	tb.appendChild(tr);
	
	var td = OZ.DOM.elm("td");
	var c = new RPG.UI.Command.Direction("◤", RPG.NW);
	OZ.DOM.append([tr, td], [td, c.getButton().getInput()]);
	c.getButton().addCharCode(55);
	c.getButton().addKeyCode(36);

	var td = OZ.DOM.elm("td");
	var c = new RPG.UI.Command.Direction("▲", RPG.N);
	OZ.DOM.append([tr, td], [td, c.getButton().getInput()]);
	c.getButton().addCharCode(56);
	c.getButton().addKeyCode(38);

	var td = OZ.DOM.elm("td");
	var c = new RPG.UI.Command.Direction("◥", RPG.NE);
	OZ.DOM.append([tr, td], [td, c.getButton().getInput()]);
	c.getButton().addCharCode(57);
	c.getButton().addKeyCode(33);

	var tr = OZ.DOM.elm("tr");
	tb.appendChild(tr);
	
	var td = OZ.DOM.elm("td");
	var c = new RPG.UI.Command.Direction("◀", RPG.W);
	OZ.DOM.append([tr, td], [td, c.getButton().getInput()]);
	c.getButton().addCharCode(52);
	c.getButton().addKeyCode(37);

	var td = OZ.DOM.elm("td");
	var c = new RPG.UI.Command.Direction("⋯", RPG.CENTER);
	OZ.DOM.append([tr, td], [td, c.getButton().getInput()]);
	c.getButton().addCharCode(46);
	c.getButton().addCharCode(53);
	c.getButton().addKeyCode(12);

	var td = OZ.DOM.elm("td");
	var c = new RPG.UI.Command.Direction("▶", RPG.E);
	OZ.DOM.append([tr, td], [td, c.getButton().getInput()]);
	c.getButton().addCharCode(54);
	c.getButton().addKeyCode(39);

	var tr = OZ.DOM.elm("tr");
	tb.appendChild(tr);

	var td = OZ.DOM.elm("td");
	var c = new RPG.UI.Command.Direction("◣", RPG.SW);
	OZ.DOM.append([tr, td], [td, c.getButton().getInput()]);
	c.getButton().addCharCode(49);
	c.getButton().addKeyCode(35);

	var td = OZ.DOM.elm("td");
	var c = new RPG.UI.Command.Direction("▼", RPG.S);
	OZ.DOM.append([tr, td], [td, c.getButton().getInput()]);
	c.getButton().addCharCode(50);
	c.getButton().addKeyCode(40);

	var td = OZ.DOM.elm("td");
	var c = new RPG.UI.Command.Direction("◢", RPG.SE);
	OZ.DOM.append([tr, td], [td, c.getButton().getInput()]);
	c.getButton().addCharCode(51);
	c.getButton().addKeyCode(34);
}

/**
 * @class Cancel command
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Cancel = OZ.Class().extend(RPG.UI.Command);
RPG.UI.Command.Cancel.prototype.init = function() {
	this.parent("Cancel");
	this._button.setChar("z");
}
RPG.UI.Command.Cancel.prototype.exec = function() {
	RPG.UI.setMode(RPG.UI_NORMAL);
}

/**
 * @class Open command
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Open = OZ.Class().extend(RPG.UI.Command);
RPG.UI.Command.Open.prototype.init = function() {
	this.parent("Open");
	this._button.setChar("o");
}
RPG.UI.Command.Open.prototype.exec = function(cmd) {
	var pc = RPG.World.pc;

	if (cmd) {
		RPG.UI.setMode(RPG.UI_NORMAL);
		/* direction given */
		var cell = pc.getCell().neighbor(cmd.getDir());
		var f = cell.getFeature();
		if (f && f instanceof RPG.Features.Door && f.isClosed()) {
			/* correct direction */
			var result = RPG.World.pc.open(f);
			RPG.World.actionResult(result);
			return;
		} else {
			/* incorrect direction */
			RPG.UI.buffer.message("there is no door at that location.");
		}
	} else {
		/* no direction, check surroundings */
		var doors = this._surroundingDoors(true);
		if (doors instanceof RPG.Features.Door) {
			/* exactly one door found */
			var result = RPG.World.pc.open(doors);
			RPG.World.actionResult(result);
			return;
		} else if (doors == 0) {
			RPG.UI.buffer.message("There are no closed doors nearby.");
		} else {
			/* too many doors */
			RPG.UI.setMode(RPG.UI_WAIT_DIRECTION, this, "Open a door");
		}
	}
}

/**
 * @class Close command
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Close = OZ.Class().extend(RPG.UI.Command);
RPG.UI.Command.Close.prototype.init = function() {
	this.parent("Close");
	this._button.setChar("c");
}
RPG.UI.Command.Close.prototype.exec = function(cmd) {
	var pc = RPG.World.pc;

	if (cmd) {
		RPG.UI.setMode(RPG.UI_NORMAL);
		/* direction given */
		var cell = pc.getCell().neighbor(cmd.getDir());
		var f = cell.getFeature();
		if (f && f instanceof RPG.Features.Door && !f.isClosed()) {
			/* correct direction */
			var result = RPG.World.pc.close(f);
			RPG.World.actionResult(result);
			return;
		} else {
			/* incorrect direction */
			RPG.UI.buffer.message("there is no door at that location.");
		}
	} else {
		/* no direction, check surroundings */
		var doors = this._surroundingDoors(false);
		if (doors instanceof RPG.Features.Door) {
			/* exactly one door found */
			var result = RPG.World.pc.close(doors);
			RPG.World.actionResult(result);
		} else if (doors == 0) {
			RPG.UI.buffer.message("There are no opened doors nearby.");
		} else {
			/* too many doors */
			RPG.UI.setMode(RPG.UI_WAIT_DIRECTION, this, "Close a door");
		}
	}
}

/**
 * @class Kick command
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Kick = OZ.Class().extend(RPG.UI.Command);
RPG.UI.Command.Kick.prototype.init = function() {
	this.parent("Kick");
	this._button.setChar("k");
}
RPG.UI.Command.Kick.prototype.exec = function(cmd) {
	if (cmd) {
		RPG.UI.setMode(RPG.UI_NORMAL);
		var cell = RPG.World.pc.getCell().neighbor(cmd.getDir());
		var result = RPG.World.pc.kick(cell);
		RPG.World.actionResult(result);
	} else {
		RPG.UI.setMode(RPG.UI_WAIT_DIRECTION, this, "Kick");
	}
}

/**
 * @class Chat
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Chat = OZ.Class().extend(RPG.UI.Command);	
RPG.UI.Command.Chat.prototype.init = function() {
	this.parent("Chat");
	this._button.setChar("C");
}
RPG.UI.Command.Chat.prototype.exec = function(cmd) {
	var errMsg = "There is noone to chat with.";
	var pc = RPG.World.pc;
	var cell = pc.getCell();

	if (cmd) {
		/* direction given */
		RPG.UI.setMode(RPG.UI_NORMAL);
		var cell = pc.getCell().neighbor(cmd.getDir());
		var being = cell.getBeing();
		if (!being) {
			RPG.UI.buffer.message(errMsg);
		} else {
			var result = RPG.World.pc.chat(being);
			RPG.World.actionResult(result);
			return;
		}
	} else {
		var beings = this._surroundingBeings();
		if (!beings.length) {
			RPG.UI.buffer.message(errMsg);
		} else if (beings.length == 1) {
			var result = RPG.World.pc.chat(beings[0]);
			RPG.World.actionResult(result);
			return;
		} else {
			RPG.UI.setMode(RPG.UI_WAIT_DIRECTION, this, "Chat");
		}
	}
}

/**
 * @class Search surroundings
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Search = OZ.Class().extend(RPG.UI.Command);	
RPG.UI.Command.Search.prototype.init = function() {
	this.parent("Search");
	this._button.setChar("s");
}
RPG.UI.Command.Search.prototype.exec = function() {
	var result = RPG.World.pc.search();
	RPG.World.actionResult(result);
}

/**
 * @class Pick command
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Pick = OZ.Class().extend(RPG.UI.Command);
RPG.UI.Command.Pick.prototype.init = function() {
	this.parent("Pick");
	this._button.setChar(",");
}
RPG.UI.Command.Pick.prototype.exec = function() {
	var pc = RPG.World.pc;
	var items = pc.getCell().getItems();
	
	if (!items.length) {
		RPG.UI.buffer.message("There is nothing to pick up!");
		return;
	}
	
	if (items.length == 1) {
		var item = items[0];
		var amount = item.getAmount();
		var result = RPG.World.pc.pick([[item, amount]]);
		RPG.World.actionResult(result);
		return;
	}
	
	RPG.UI.setMode(RPG.UI_WAIT_DIALOG);
	new RPG.UI.Itemlist(items, "Select items to be picked up", -1, this.bind(this._done));
}
RPG.UI.Command.Pick.prototype._done = function(items) {
	RPG.UI.setMode(RPG.UI_NORMAL);
	var result = RPG.World.pc.pick(items);
	RPG.World.actionResult(result);
}

/**
 * @class Drop command
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Drop = OZ.Class().extend(RPG.UI.Command);
RPG.UI.Command.Drop.prototype.init = function() {
	this.parent("Drop");
	this._button.setChar("d");
}
RPG.UI.Command.Drop.prototype.exec = function() {
	var pc = RPG.World.pc;
	var items = pc.getItems();
	if (items.length) {
		RPG.UI.setMode(RPG.UI_WAIT_DIALOG);
		new RPG.UI.Itemlist(items, "Select items to be dropped on the ground", -1, this.bind(this._done));
	} else {
		RPG.UI.buffer.message("You don't own anything!");
	}
}
RPG.UI.Command.Drop.prototype._done = function(items) {
	RPG.UI.setMode(RPG.UI_NORMAL);
	var result = RPG.World.pc.drop(items);
	RPG.World.actionResult(result);
}

/**
 * @class Inventory command
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Inventory = OZ.Class().extend(RPG.UI.Command);
RPG.UI.Command.Inventory.prototype.init = function() {
	this.parent("Inventory");
	this._button.setChar("i");
}
RPG.UI.Command.Inventory.prototype.exec = function() {
	RPG.UI.setMode(RPG.UI_WAIT_DIALOG);
	new RPG.UI.Slots(RPG.World.pc, this.bind(this._done));
}

RPG.UI.Command.Inventory.prototype._done = function(changed) {
	RPG.UI.setMode(RPG.UI_NORMAL);
	if (changed) { 
		var result = RPG.World.pc.equipDone(); 
		RPG.World.actionResult(result);
	}
}

/**
 * @class Autowalker
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Autowalk = OZ.Class().extend(RPG.UI.Command);	
RPG.UI.Command.Autowalk.prototype.init = function() {
	this.parent("Walk continuously");
	this._button.setChar("w");
	this._dir = null;
	this._left = false;
	this._right = false;
	this._steps = 0;
	this._yt = null;
	this._beings = 0;
}
RPG.UI.Command.Autowalk.prototype.exec = function(cmd) {
	if (cmd) {
		/* direction given */
		RPG.UI.setMode(RPG.UI_NORMAL);
		this._start(cmd.getDir());
	} else {
		RPG.UI.setMode(RPG.UI_WAIT_DIRECTION, this, "Walk continuously");
	}
}

RPG.UI.Command.Autowalk.prototype._start = function(dir) {
	var pc = RPG.World.pc;
	
	/* cannot walk to the wall */
	if (dir != RPG.CENTER) {
		var cell = pc.getCell().neighbor(dir);
		if (!cell.isFree() ) { return; }
	}

	this._saveState(dir);
	this._steps = 0;
	this._yt = pc.yourTurn;
	pc.yourTurn = this.bind(this._yourTurn);
	this._beings = Infinity;
	var result = this._step();
	RPG.World.actionResult(result);
}

/**
 * Save state of current direction + left/right neighbors 
 */
RPG.UI.Command.Autowalk.prototype._saveState = function(dir) {
	this._dir = dir;
	if (dir == RPG.CENTER) { return; }
	
	var pc = RPG.World.pc;
	var cell = pc.getCell();
	
	var leftDir = (dir + 6) % 8;
	var rightDir = (dir + 2) % 8;
	var leftCell = cell.neighbor(leftDir);
	var rightCell = cell.neighbor(rightDir);
	this._left = leftCell ? leftCell.isFree() : false;
	this._right = rightCell ? rightCell.isFree() : false;
}

RPG.UI.Command.Autowalk.prototype._yourTurn = function() {
	if (this._check()) {
		/* still going */
		return this._step();
	} else {
		/* walk no more */
		RPG.World.pc.yourTurn = this._yt;
		return RPG.World.pc.yourTurn();
	}
}

/**
 * Most complicated part. Check whether we can continue autowalking.
 */
RPG.UI.Command.Autowalk.prototype._check = function() {
	var pc = RPG.World.pc;
	var cell = pc.getCell();
	var map = cell.getMap();
	var coords = cell.getCoords();
	
	var count = this._beingCount();
	if (count > this._beings) { return false; }
	this._beings = count;

	if (this._steps == 50) { return false; } /* too much steps */
	if (cell.getItems().length) { return false; } /* we stepped across some items */
	if (this._dir == RPG.CENTER) { return true; } /* standing on a spot is okay now */

	/* now check neighbor status */
	var leftDir = (this._dir + 6) % 8;
	var rightDir = (this._dir + 2) % 8;

	var aheadCell = cell.neighbor(this._dir);
	var leftCell = cell.neighbor(leftDir);
	var rightCell = cell.neighbor(rightDir);
	
	if (!aheadCell) { return false; } /* end of map reached */
	var ahead = aheadCell.isFree();
	var left = leftCell ? leftCell.isFree() : false;
	var right = rightCell ? rightCell.isFree() : false;
	
	/* leaving opened area/crossroads */
	if (this._left && !left) { this._left = left; }
	if (this._right && !right) { this._right = right; }
	
	/* standing against a being */
	if (aheadCell.getBeing()) { return false; } 
	
	/* standing close to a feature */
	if (cell.getFeature() && cell.getFeature().knowsAbout(pc)) { return false; } 
	if (leftCell && leftCell.getFeature() && leftCell.getFeature().knowsAbout(pc)) { return false; } 
	if (rightCell && rightCell.getFeature() && rightCell.getFeature().knowsAbout(pc)) { return false; } 

	if (ahead) {
		/* we can - in theory - continue; just check if we are not standing on a crossroads */
		if ((!this._left && left) || (!this._right && right)) { return false; }
	} else {
		/* feature blocks way - stop */
		if (aheadCell.getFeature() && aheadCell.getFeature().knowsAbout(pc)) { return false; }
		
		/* try to change direction, because it is not possible to continue */
		var freecount = 0;
		var cells = map.cellsInCircle(coords, 1, false);
		for (var i=0;i<cells.length;i++) { if (cells[i].isFree()) { freecount++; } }
		if (freecount > 2) { return false; } /* too many options to go */
		
		if (left && !right) {
			/* turn left */
			this._saveState(leftDir);
		} else if (right && !left) {
			/* turn right */
			this._saveState(rightDir);
		} else {
			return false; /* the only way from here is diagonal, stop */
		}	
	}

	return true;
}

RPG.UI.Command.Autowalk.prototype._step = function() {
	this._steps++;
	var pc = RPG.World.pc;
	
	if (this._dir == RPG.CENTER) {
		return RPG.World.pc.wait();
	} else {
		return RPG.World.pc.move(pc.getCell().neighbor(this._dir));
	}
}

RPG.UI.Command.Autowalk.prototype._beingCount = function() {
	var counter = 0;
	var map = RPG.World.pc.getCell().getMap();
	var visible = RPG.World.pc.getVisibleCoords();
	for (var i=0;i<visible.length;i++) {
		var c = visible[i];
		if (map.at(c).getBeing()) { counter++; }
	}
	return counter;
}

/**
 * @class Message buffer backlog
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Backlog = OZ.Class().extend(RPG.UI.Command);

RPG.UI.Command.Backlog.prototype.init = function() {
	this.parent("Message backlog");
	this._button.setCtrl();
	this._button.setChar("m");
	this._visible = false;
}

RPG.UI.Command.Backlog.prototype.exec = function() {
	if (this._visible) {
		RPG.UI.buffer.hideBacklog();
		this._visible = false;
	} else {
		RPG.UI.buffer.showBacklog();
		this._visible = true;
	}
}

/**
 * @class Ascend
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Ascend = OZ.Class().extend(RPG.UI.Command);

RPG.UI.Command.Ascend.prototype.init = function() {
	this.parent("Ascend");
	this._button.setChar("<");
}

RPG.UI.Command.Ascend.prototype.exec = function() {
	var pc = RPG.World.pc;
	var f = pc.getCell().getFeature();
	if (f && f instanceof RPG.Features.Staircase.Up) {
		var result = RPG.World.pc.ascend();
		RPG.World.actionResult(result);
	} else {
		RPG.UI.buffer.message("You don't see any stairs leading upwards.");
	}
}


/**
 * @class Descend
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Descend = OZ.Class().extend(RPG.UI.Command);

RPG.UI.Command.Descend.prototype.init = function() {
	this.parent("Descend");
	this._button.setChar(">");
}

RPG.UI.Command.Descend.prototype.exec = function() {
	var pc = RPG.World.pc;
	var f = pc.getCell().getFeature();
	if (f && f instanceof RPG.Features.Staircase.Down) {
		var result = RPG.World.pc.descend();
		RPG.World.actionResult(result);
	} else {
		RPG.UI.buffer.message("You don't see any stairs leading downwards.");
	}
}

/**
 * @class Activate trap
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Trap = OZ.Class().extend(RPG.UI.Command);

RPG.UI.Command.Trap.prototype.init = function() {
	this.parent("Activate trap");
	this._button.setCtrl();
	this._button.setChar("t");
}

RPG.UI.Command.Trap.prototype.exec = function() {
	var pc = RPG.World.pc;
	var f = pc.getCell().getFeature();
	if (f && f instanceof RPG.Features.Trap && f.knowsAbout(pc)) {
		var result = pc.activateTrap(f);
		RPG.World.actionResult(result);
	} else {
		RPG.UI.buffer.message("There is no trap you are aware of.");
	}
}

/**
 * @class Show current hit/dmg
 * @augments RPG.UI.Command
 */
RPG.UI.Command.WeaponStats = OZ.Class().extend(RPG.UI.Command);

RPG.UI.Command.WeaponStats.prototype.init = function() {
	this.parent("Weapon statistics");
	this._button.setChar("W");
}

RPG.UI.Command.WeaponStats.prototype.exec = function() {
	var pc = RPG.World.pc;
	var hand = pc.getSlot(RPG.SLOT_WEAPON);
	var hit = hand.getHit();
	var dmg = hand.getDamage();
	alert("Current weapon hit/damage: "+hit.toString()+"/"+dmg.toString());
}

/**
 * @class Show kick hit/dmg
 * @augments RPG.UI.Command
 */
RPG.UI.Command.KickStats = OZ.Class().extend(RPG.UI.Command);

RPG.UI.Command.KickStats.prototype.init = function() {
	this.parent("Kick statistics");
	this._button.setChar("K");
}

RPG.UI.Command.KickStats.prototype.exec = function() {
	var pc = RPG.World.pc;
	var feet = pc.getSlot(RPG.SLOT_FEET);
	var hit = feet.getHit();
	var dmg = feet.getDamage();
	alert("Current kick hit/damage: "+hit.toString()+"/"+dmg.toString());
}

/**
 * @class Show kill statistics
 * @augments RPG.UI.Command
 */
RPG.UI.Command.KillStats = OZ.Class().extend(RPG.UI.Command);

RPG.UI.Command.KillStats.prototype.init = function() {
	this.parent("Kill statistics");
	this._button.setCtrl();
	this._button.setChar("k");
}

RPG.UI.Command.KillStats.prototype.exec = function() {
	var pc = RPG.World.pc;
	var kills = pc.getKills();
	alert("Beings killed so far: "+kills);
}

/**
 * @class Look around
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Look = OZ.Class().extend(RPG.UI.Command);

RPG.UI.Command.Look.prototype.init = function() {
	this.parent("Look");
	this._button.setChar("l");
	this._coords = null;
}

RPG.UI.Command.Look.prototype.exec = function(cmd) {
	if (cmd) {
		this._coords.plus(RPG.DIR[cmd.getDir()]);
		var cell = RPG.World.pc.getCell().getMap().at(this._coords);
		if (!cell) { return; }
		
		RPG.UI.map.setFocus(this._coords);
		var result = RPG.World.pc.look(cell);
		RPG.World.actionResult(result);
	} else {
		this._coords = RPG.World.pc.getCell().getCoords().clone();
		RPG.UI.setMode(RPG.UI_WAIT_DIRECTION, this, "Look around");
	}
}

RPG.UI.Command.Look.prototype.cancel = function() {
	RPG.UI.refocus();
}

/**
 * Abstract consumption command
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Consume = OZ.Class().extend(RPG.UI.Command);
RPG.UI.Command.Consume.prototype.exec = function(itemCtor, listTitle, errorString, method) {
	var pc = RPG.World.pc;
	var cell = pc.getCell();
	var items = cell.getItems();
	this._container = null;
	this._method = method;
	
	/* from ground? */
	var all = this._filter(items, itemCtor);
	var title = listTitle;
	
	if (all.length) {
		this._container = cell;
		title += " from the ground";
	} else {
		all = this._filter(pc.getItems(), itemCtor);
		if (!all.length) { 
			RPG.UI.buffer.message(errorString);
			return;
		}
		this._container = pc;
	}
	
	RPG.UI.setMode(RPG.UI_WAIT_DIALOG);
	new RPG.UI.Itemlist(all, title, 1, this.bind(this._done));
}
RPG.UI.Command.Consume.prototype._filter = function(items, itemCtor) {
	var arr = [];
	for (var i=0;i<items.length;i++) {
		var item = items[i];
		if (item instanceof itemCtor) { arr.push(item); }
	}
	return arr;
}
RPG.UI.Command.Consume.prototype._done = function(items) {
	RPG.UI.setMode(RPG.UI_NORMAL);
	if (!items.length) { return; }
	
	var item = items[0][0];
	var result = this._method.call(RPG.World.pc, item, this._container); 
	RPG.World.actionResult(result);
}

/**
 * @class Eating
 * @augments RPG.UI.Command.Consume
 */
RPG.UI.Command.Eat = OZ.Class().extend(RPG.UI.Command.Consume);

RPG.UI.Command.Eat.prototype.init = function() {
	this.parent("Eat");
	this._button.setChar("e");
}

RPG.UI.Command.Eat.prototype.exec = function() {
	this.parent(RPG.Items.Consumable, 
				"Select item to be eaten", 
				"You don't own anything edible!",
				RPG.World.pc.eat);
}

/**
 * @class Drinking
 * @augments RPG.UI.Command.Consume
 */
RPG.UI.Command.Drink = OZ.Class().extend(RPG.UI.Command.Consume);

RPG.UI.Command.Drink.prototype.init = function() {
	this.parent("Drink");
	this._button.setChar("D");
}

RPG.UI.Command.Drink.prototype.exec = function() {
	this.parent(RPG.Items.Potion, 
				"Select a potion", 
				"You don't own any potions!",
				RPG.World.pc.drink);
}

/**
 * @class Switch position with a being
 * @augments RPG.UI.Command
 */
RPG.UI.Command.SwitchPosition = OZ.Class().extend(RPG.UI.Command);

RPG.UI.Command.SwitchPosition.prototype.init = function() {
	this.parent("Switch position");
	this._button.setCtrl();
	this._button.setChar("s");
}

RPG.UI.Command.SwitchPosition.prototype.exec = function(cmd) {
	if (!cmd) {
		RPG.UI.setMode(RPG.UI_WAIT_DIRECTION, this, "Switch position");
	} else {
		var cell = RPG.World.pc.getCell().neighbor(cmd.getDir());
		RPG.UI.setMode(RPG.UI_NORMAL);
		var result = RPG.World.pc.switchPosition(cell);
		RPG.World.actionResult(result);
	}
}

/**
 * @class Cast a spell
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Cast = OZ.Class().extend(RPG.UI.Command);

RPG.UI.Command.Cast.prototype.init = function() {
	this.parent("Cast a spell");
	this._button.setChar("Z");
	this._spell = null;
}

RPG.UI.Command.Cast.prototype.notify = function(coords) {
	if (this._spell.getType() == RPG.SPELL_TARGET) {
		var source = RPG.World.pc.getCell();
		this._spell.showTrajectory(source, coords);
	}
}

RPG.UI.Command.Cast.prototype.exec = function(coords) {
	if (!this._spell) { /* list of spells */
		var spells = RPG.World.pc.getSpells();
		if (spells.length) {
			RPG.UI.setMode(RPG.UI_WAIT_DIALOG);
			new RPG.UI.Spelllist(spells, "Select a spell to cast", this.bind(this._done));
		} else {
			RPG.UI.buffer.message("You don't know any spells.");
		}
		
	} else { /* we have spell and optionally a direction/target */
		RPG.UI.refocus();
		RPG.UI.map.removeProjectiles();

		var type = this._spell.getType();
		
		switch (type) {
			case RPG.SPELL_SELF:
				var target = null;
			break;
			case RPG.SPELL_TOUCH:
			case RPG.SPELL_DIRECTION:
				var target = coords.getDir();
			break;
			case RPG.SPELL_REMOTE:
			case RPG.SPELL_TARGET:
				var target = coords;
			break;
		}

		RPG.UI.setMode(RPG.UI_NORMAL);
		var result = RPG.World.pc.cast(this._spell, target);
		this._spell = null;		
		RPG.World.actionResult(result);
	}
}

RPG.UI.Command.Cast.prototype.cancel = function() {
	this._spell = null;
	RPG.UI.map.removeProjectiles();
	RPG.UI.refocus();
}

/**
 * Spell selected
 */
RPG.UI.Command.Cast.prototype._done = function(spells) {
	if (!spells.length) {
		RPG.UI.setMode(RPG.UI_NORMAL);
		return;
	}
	
	var spell = spells[0][0];
	spell = new spell(RPG.World.pc);
	var cost = spell.getCost();
	
	if (RPG.World.pc.getStat(RPG.STAT_MANA) < cost) {
		RPG.UI.buffer.message("Not enough mana.");
		RPG.UI.setMode(RPG.UI_NORMAL);
		return;
	}
	
	this._spell = spell;
	var type = spell.getType();
	switch (type) {
		case RPG.SPELL_SELF:
			this.exec();
		break;
		case RPG.SPELL_TOUCH:
		case RPG.SPELL_DIRECTION:
			RPG.UI.setMode(RPG.UI_WAIT_DIRECTION, this, "Cast a spell");
		break;
		case RPG.SPELL_REMOTE:
		case RPG.SPELL_TARGET:
			RPG.UI.setMode(RPG.UI_WAIT_TARGET, this, "Cast a spell");
		break;
	}
	
	if (type == RPG.SPELL_TARGET) {
		this.notify(RPG.World.pc.getCell().getCoords());
	}
}

/**
 * @class Flirt command
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Flirt = OZ.Class().extend(RPG.UI.Command);
RPG.UI.Command.Flirt.prototype.init = function() {
	this.parent("Flirt");
	this._button.setChar("j");
	this._button.setChar("f");
}
RPG.UI.Command.Flirt.prototype.exec = function(cmd) {
	if (!cmd) {
		RPG.UI.setMode(RPG.UI_WAIT_DIRECTION, this, "Flirt with someone");
	} else {
		RPG.UI.setMode(RPG.UI_NORMAL);
		var cell = RPG.World.pc.getCell().neighbor(cmd.getDir());
		var result = RPG.World.pc.flirt(cell);
		RPG.World.actionResult(result);
	}
}

/**
 * @class Mute/unmute command
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Mute = OZ.Class().extend(RPG.UI.Command);
RPG.UI.Command.Mute.prototype.init = function() {
	this.parent("Mute");
	this._button.setChar("m");
}
RPG.UI.Command.Mute.prototype.exec = function() {
	var state = !RPG.UI.sound.getMuted();
	RPG.UI.sound.setMuted(state);
	if (state) {
		this._button.setLabel("Unmute");
	} else {
		this._button.setLabel("Mute");
	}
}

/**
 * @class Read command
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Read = OZ.Class().extend(RPG.UI.Command);
RPG.UI.Command.Read.prototype.init = function() {
	this.parent("Read");
	this._button.setChar("r");
}
RPG.UI.Command.Read.prototype.exec = function() {
	var pc = RPG.World.pc;
	var all = [];
	var items = pc.getItems();
	for (var i=0;i<items.length;i++) {
		var item = items[i];
		if (item instanceof RPG.Items.Readable) { all.push(item); }
	}
	
	if (!all.length) { 
		RPG.UI.buffer.message("You don't own anything readable!"); 
		return;
	}

	RPG.UI.setMode(RPG.UI_WAIT_DIALOG);
	new RPG.UI.Itemlist(all, "Select item to read", 1, this.bind(this._done));
}

RPG.UI.Command.Read.prototype._done = function(items) {
	RPG.UI.setMode(RPG.UI_NORMAL);
	if (!items.length) { return; }
	
	var item = items[0][0];
	var result = RPG.World.pc.read(item);
	RPG.World.actionResult(result);
}

/**
 * @class List quests
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Quests = OZ.Class().extend(RPG.UI.Command);
RPG.UI.Command.Quests.prototype.init = function() {
	this.parent("Quests");
	this._button.setChar("q");
}
RPG.UI.Command.Quests.prototype.exec = function() {
	RPG.UI.setMode(RPG.UI_WAIT_DIALOG);
	new RPG.UI.Questlist(RPG.World.pc.getQuests(), this.bind(this._done));
}

RPG.UI.Command.Quests.prototype._done = function() {
	RPG.UI.setMode(RPG.UI_NORMAL);
}

/**
 * @class Throw/shoot command
 * @augments RPG.UI.Command
 */
RPG.UI.Command.Launch = OZ.Class().extend(RPG.UI.Command);

RPG.UI.Command.Launch.prototype.init = function() {
	this.parent("Throw/shoot");
	this._button.setChar("t");
	this._projectile = null;
}

RPG.UI.Command.Launch.prototype.notify = function(coords) {
	var source = RPG.World.pc.getCell();
	this._projectile.showTrajectory(source, coords);
}

RPG.UI.Command.Launch.prototype.exec = function(coords) {
	var pc = RPG.World.pc;
	if (!coords) {
		var item = pc.getSlot(RPG.SLOT_PROJECTILE).getItem();
		if (!item) { 
			RPG.UI.buffer.message("You have no ammunition ready.");
			return;
		}
		
		var weaponCtor = item.getWeapon();
		if (weaponCtor) {
			var weapon = pc.getSlot(RPG.SLOT_WEAPON).getItem();
			if (!weapon || !(weapon instanceof weaponCtor)) {
				RPG.UI.buffer.message("You have no suitable weapon for this ammunition.");
				return;
			}
		}
		
		if (item.getAmount() == 1) {
			this._projectile = item;
			pc.unequip(RPG.SLOT_PROJECTILE);
			pc.removeItem(item);
		} else {
			this._projectile = item.subtract(1);
		}
		
		RPG.UI.setMode(RPG.UI_WAIT_TARGET, this, "Throw/shoot");
	} else {
		RPG.UI.refocus();
		RPG.UI.map.removeProjectiles();
		RPG.UI.setMode(RPG.UI_NORMAL);
		var map = pc.getCell().getMap();
		
		var cell = map.at(coords);
		if (cell == pc.getCell()) {
			RPG.UI.buffer.message("You do not want to do that, do you?");
			this.projectile = null;
			return;
		}
		
		var result = RPG.World.pc.launch(this._projectile, cell);
		this._projectile = null;		
		RPG.World.actionResult(result);
	}
}

RPG.UI.Command.Launch.prototype.cancel = function() {
	RPG.UI.map.removeProjectiles();
	RPG.UI.refocus();
}
