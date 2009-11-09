/**
 * @class Waiting, doing nothing
 * @augments RPG.Actions.BaseAction
 */
RPG.Actions.Wait = OZ.Class().extend(RPG.Actions.BaseAction);

/**
 * @class Moving to a given cell. Target == coords.
 * @augments RPG.Actions.BaseAction
 */
RPG.Actions.Move = OZ.Class().extend(RPG.Actions.BaseAction);
RPG.Actions.Move.prototype.execute = function() {
	var sourceCoords = this._source.getCell().getCoords();
	var targetCoords = this._target;
	var you = (this._source == RPG.World.getPC());
	var memory = RPG.World.getPC().mapMemory();

	var map = this._source.getCell().getMap();
	var targetCell = map.at(targetCoords);
	this._source.getCell().setBeing(null);
	targetCell.setBeing(this._source);

	if (you) {
		this._describeLocal();
		memory.updateVisible();
	} else {
		memory.updateCoords(sourceCoords);
		memory.updateCoords(targetCoords);
	}
}

/**
 * @class Attacking other being. Target == being, params == slot
 * @augments RPG.Actions.BaseAction
 */
RPG.Actions.Attack = OZ.Class().extend(RPG.Actions.BaseAction);
RPG.Actions.Attack.prototype.init = function(source, target, params) {
	this.parent(source, target, params);
	this._hit = false;
	this._damage = false;
	this._kill = false;
}
RPG.Actions.Attack.prototype.execute = function() {
	var slot = this._params;
	
	/* hit? */
	var hit = RPG.Rules.isMeleeHit(this._source, this._target, slot);
	if (hit) { 
		this._hit = true;

		/* damage? */
		var crit = RPG.Rules.isCritical(this._source);
		var damage = RPG.Rules.getMeleeDamage(this._source, this._target, slot, crit);
		
		if (damage) {
			this._damage = true;
			this._kill = !this._target.adjustHP(-damage);
		}
	}
	
	var str = this._describe();
	RPG.UI.buffer.message(str);
}

RPG.Actions.Attack.prototype._describe = function() {
	var killVerbs = ["kill", "slay"];
	var youAttacker = (this._source == RPG.World.getPC());
	var youDefender = (this._target == RPG.World.getPC());
	var missVerb = (youAttacker ? "miss" : "misses");
	var kickVerb = (youAttacker ? "kick" : "kicks");
	var hitVerb = (youAttacker ? "hit" : "hits");
	var killVerb = (youAttacker ? killVerbs.random() : killVerbs.random() + "s");
	if (this._params instanceof RPG.Slots.Kick) { hitVerb = kickVerb; }
	
	var str = this._source.describeThe().capitalize() + " ";
	
	if (!this._hit) {
		str += missVerb + " " + this._target.describeThe() + ".";
		return str;
	}
	
	if (!this._damage) {
		if (youAttacker) {
			str += hitVerb + " " + this._target.describeThe();
			str += ", but do not manage to harm " + this._target.describeHim();
		} else {
			str += "fails to hurt " + this._target.describeThe();
		}
		str += ".";
		return str;
	}
	
	str += hitVerb + " " + this._target.describeThe();
	if (this._kill) {
		str += " and " + killVerb + " " + this._target.describeHim();
		str += "!";
	} else if (!youDefender) {
		str += " and "+this._target.woundedState()+ " wound "+this._target.describeHim();
		str += ".";
	} else {
		str += ".";
	}
	return str;
}

/**
 * @class Death - when something dies
 * @augments RPG.Actions.BaseAction
 */
RPG.Actions.Death = OZ.Class().extend(RPG.Actions.BaseAction);
RPG.Actions.Death.prototype.execute = function() {
	var memory = RPG.World.getPC().mapMemory();
	var map = RPG.World.getMap();
	var coords = this._source.getCell().getCoords();
	
	this._source.getCell().setBeing(null); /* remove being */
	
	memory.updateCoords(coords);
	RPG.World.removeActor(this._source);
}

/**
 * @class Open a door
 * @augments RPG.Actions.BaseAction
 */
RPG.Actions.Open = OZ.Class().extend(RPG.Actions.BaseAction);
RPG.Actions.Open.prototype.execute = function() {
	var pc = RPG.World.getPC();
	var map = this._source.getCell().getMap();
	var coords = this._target;
	var you = (this._source == RPG.World.getPC());
	
	var door = map.at(coords).getFeature();

	var locked = door.isLocked();
	if (locked) {
		if (you) {
			RPG.UI.buffer.message("The door is locked. You do not have appropriate key.");
		}
		return;
	}
	
	var stuck = RPG.Rules.isDoorStuck(this._source, door);
	if (stuck) {
		if (you) {
			RPG.UI.buffer.message("Ooops! The door is stuck.");
		}
		return;
	}
	
	map.at(coords).getFeature().open();
	
	var str = this._source.describeA().capitalize() + " ";
	if (you) {
		str += "open";
	} else {
		str += "opens";
	}
	str += " the door.";
	
	RPG.UI.buffer.message(str);
	pc.mapMemory().updateVisible();
}

/**
 * @class Close a door
 * @augments RPG.Actions.BaseAction
 */
RPG.Actions.Close = OZ.Class().extend(RPG.Actions.BaseAction);
RPG.Actions.Close.prototype.execute = function() {
	var map = this._source.getCell().getMap();
	var coords = this._target;
	
	var cell = map.at(coords);
	if (cell.getBeing()) {
		RPG.UI.buffer.message("There is someone standing at the door.");
		this._tookTime = false;
		return;
	}
	
	var items = cell.getItems();
	if (items.length) {
		if (items.length == 1) {
			RPG.UI.buffer.message("An item blocks the door.");
		} else {
			RPG.UI.buffer.message("Several items block the door.");
		}
		this._tookTime = false;
		return;
	}

	cell.getFeature().close();
	
	var str = this._source.describeA().capitalize() + " ";
	var you = (this._source == RPG.World.getPC());
	if (you) {
		str += "close";
	} else {
		str += "closes";
	}
	str += " the door.";
	
	RPG.UI.buffer.message(str);
	RPG.World.getPC().mapMemory().updateVisible();
}

/**
 * @class Teleporting to a given cell. Target == coords.
 * @augments RPG.Actions.BaseAction
 */
RPG.Actions.Teleport = OZ.Class().extend(RPG.Actions.BaseAction);
RPG.Actions.Teleport.prototype.execute = function() {
	this._tookTime = false;
	var pc = RPG.World.getPC();
	var you = (this._source == pc);
	
	var sourceCell = this._source.getCell();
	var sourceCoords = sourceCell.getCoords();
	var targetCoords = this._target;

	if (you) {
		RPG.UI.buffer.message("You suddenly teleport away!");
	} else {
		if (pc.canSee(sourceCoords)) {
			var str = this._source.describeA().capitalize();
			str += " suddenly disappears!";
			RPG.UI.buffer.message(str);
		}
		
		if (pc.canSee(targetCoords)) {
			var str = this._source.describeA().capitalize();
			if (pc.canSee(sourceCoords)) {
				str += " immediately reappears!";
			} else {
				str += " suddenly appears from nowhere!";
			}
			RPG.UI.buffer.message(str);
		}
	}
	
	var move = new RPG.Actions.Move(this._source, this._target);
	RPG.World.action(move);
}

/**
 * @class Picking item(s). Target = array of [item, amount]
 * @augments RPG.Actions.BaseAction
 */
RPG.Actions.Pick = OZ.Class().extend(RPG.Actions.BaseAction);
RPG.Actions.Pick.prototype.execute = function() {
	var arr = this._target;
	
	var pc = RPG.World.getPC();
	var cell = this._source.getCell();
	var you = (this._source == pc);
	
	for (var i=0;i<arr.length;i++) {
		var pair = arr[i];
		var item = pair[0];
		var amount = pair[1];
		
		if (amount == item.getAmount()) {
			/* easy, just remove item */
			cell.removeItem(item);
		} else {
			/* split heap */
			item = item.subtract(amount);
		}

		this._source.addItem(item);
		
		var str = this._source.describeA().capitalize();
		str += " " + (you ? "pick" : "picks") + " up ";
		str += (you ? item.describeThe() : item.describeA());
		str += ".";
		RPG.UI.buffer.message(str);
	}
}

/**
 * @class Droping item(s). Target = array of [item, amount]
 * @augments RPG.Actions.BaseAction
 */
RPG.Actions.Drop = OZ.Class().extend(RPG.Actions.BaseAction);
RPG.Actions.Drop.prototype.execute = function() {
	var pc = RPG.World.getPC();
	var arr = this._target;
	
	var cell = this._source.getCell();
	var you = (this._source == pc);
	
	if (!arr.length) { this._tookTime = false; }
	
	for (var i=0;i<arr.length;i++) {
		var pair = arr[i];
		var item = pair[0];
		var amount = pair[1];
		
		if (amount == item.getAmount()) {
			/* easy, just remove item */
			this._source.removeItem(item);
		} else {
			/* split heap */
			item = item.subtract(amount);
		}
		cell.addItem(item);
		
		var str = this._source.describeA().capitalize();
		str += " " + (you ? "drop" : "drops") + " ";
		str += (you ? item.describeThe() : item.describeA());
		str += ".";
		RPG.UI.buffer.message(str);
	}
}

/**
 * @class Kick something
 * @augments RPG.Actions.BaseAction
 */
RPG.Actions.Kick = OZ.Class().extend(RPG.Actions.BaseAction);
RPG.Actions.Kick.prototype.execute = function() {
	/* only PC is allowed to kick */
	var pc = RPG.World.getPC();
	var map = this._source.getCell().getMap();
	var cell = map.at(this._target);
	var feature = cell.getFeature();
	var being = cell.getBeing();
	var items = cell.getItems();
	
	if (this._source == being) {
		RPG.UI.buffer.message("You wouldn't do that, would you?");
		this._tookTime = false;
		return;
	}
	
	if (cell.flags & RPG.CELL_OBSTACLE) {
		RPG.UI.buffer.message("Ouch! That hurts!");
		return;
	}
	
	if (feature && feature instanceof RPG.Features.Door && feature.isClosed()) {
		/* kick door */
		var feet = this._source.getFeetSlot();
		var dmg = feet.getDamage().roll();
		var result = feature.damage(dmg);
		if (result) {
			RPG.UI.buffer.message("You kick the door, but it does not budge.");
		} else {
			RPG.UI.buffer.message("You shatter the door with a mighty kick!");
			pc.mapMemory().updateVisible();
		}
		return;
	}
	
	if (being) {
		/* kick being */
		var a = new RPG.Actions.Attack(this._source, being, this._source.getFeetSlot());
		RPG.World.action(a);
		this._tookTime = false;
		return;
	}
	
	if (items.length) {
		/* try kicking items */
		var sourceCoords = this._source.getCell().getCoords();
		var targetCoords = this._target.clone().minus(sourceCoords).plus(this._target);
		if (map.isValid(targetCoords) && map.at(targetCoords).isFree()) {
			/* kick topmost item */
			var item = items[items.length-1];
			map.at(this._target).removeItem(item);
			map.at(targetCoords).addItem(item);
			var str = "You kick " + item.describeThe() + ". ";
			str += "It slides away.";
			RPG.UI.buffer.message(str);
			var memory = pc.mapMemory();
			memory.updateCoords(this._target);
			memory.updateCoords(targetCoords);
			return;
		}
	}
	
	RPG.UI.buffer.message("You kick in empty air.");
}

/**
 * @class Initiate chat
 * @augments RPG.Actions.BaseAction
 */
RPG.Actions.Chat = OZ.Class().extend(RPG.Actions.BaseAction);
RPG.Actions.Chat.prototype.execute = function() {
	/* only PC is allowed to chat */
	RPG.UI.buffer.message("You talk to "+this._target.describe()+".");
	
	var chat = this._target.getChat();
	if (chat) {
		RPG.UI.setMode(RPG.UI_WAIT_CHAT, this, chat);
	} else {
		RPG.UI.buffer.message(this._target.describeHe().capitalize() + " does not reply.");
	}
}

/**
 * @class Search surroundings
 * @augments RPG.Actions.BaseAction
 */
RPG.Actions.Search = OZ.Class().extend(RPG.Actions.BaseAction);
RPG.Actions.Search.prototype.execute = function() {
	var map = RPG.World.getMap();

	/* only PC is allowed to search */
	RPG.UI.buffer.message("You search your surroundings...");
	var found = 0;
	
	var center = this._source.getCell().getCoords();
	for (var i=-1;i<=1;i++) {
		for (var j=-1;j<=1;j++) {
			if (!i && !j) { continue; }
			var coords = new RPG.Misc.Coords(i, j).plus(center);
			found += this._search(map.at(coords));
		}
	}
	
	if (found) { RPG.World.getPC().mapMemory().updateVisible(); }
}

/**
 * @returns {int} 1 = revealed, 0 = not revealed
 */
RPG.Actions.Search.prototype._search = function(cell) {
	if (cell instanceof RPG.Cells.Wall.Fake && RPG.Rules.isFakeDetected(this._source, cell)) {
		/* reveal! */
		var realCell = cell.getRealCell();
		cell.getMap().setCell(cell.getCoords(), realCell);

		var desc = "passage";
		if (realCell.getFeature()) { desc = realCell.getFeature().describe(); }
		RPG.UI.buffer.message("You discovered a hidden "+desc+"!");
		return 1;
	}
	
	var f = cell.getFeature();
	if (f && f instanceof RPG.Features.Trap && !f.knowsAbout(this._source) && RPG.Rules.isTrapDetected(this._source, f)) {
		this._source.trapMemory().remember(f);
		RPG.UI.buffer.message("You discover " + f.describeA() + "!");
		return 1;
	}
	
	return 0;
}

/**
 * @class Enter staircase or other level-changer. Target == staircase
 * @augments RPG.Actions.BaseAction
 */
RPG.Actions.EnterStaircase = OZ.Class().extend(RPG.Actions.BaseAction);
RPG.Actions.EnterStaircase.prototype.execute = function() {
	var pc = RPG.World.getPC();

	/* find new map & entry coordinates */
	var stair = this._target;
	var newMap = stair.getTargetMap();
	if (!newMap) { 
		stair.generateTarget(); 
		newMap = stair.getTargetMap();
	}
	var coords = stair.getTargetCoords();
	
	if (newMap) {	
		/* move what is necessary to new map */
		var oldCell = pc.getCell();
		oldCell.setBeing(null);
		newMap.at(coords).setBeing(pc);

		/* switch maps */
		RPG.World.setMap(newMap);
		
		/* describe what we see */
		this._describeLocal();
	}
}

/**
 * @class Enter staircase leading upwards
 * @augments RPG.Actions.EnterStaircase
 */
RPG.Actions.Ascend = OZ.Class().extend(RPG.Actions.EnterStaircase);
RPG.Actions.Ascend.prototype.execute = function() {
	RPG.UI.buffer.message("You climb upwards...");
	this.parent();
}

/**
 * @class Enter staircase leading downwards
 * @augments RPG.Actions.EnterStaircase
 */
RPG.Actions.Descend = OZ.Class().extend(RPG.Actions.EnterStaircase);
RPG.Actions.Descend.prototype.execute = function() {
	RPG.UI.buffer.message("You climb downwards...");
	this.parent();
}

/**
 * @class Moving across a trap. target == trap
 * @augments RPG.Actions.BaseAction
 */
RPG.Actions.TrapEncounter = OZ.Class().extend(RPG.Actions.BaseAction);
RPG.Actions.TrapEncounter.prototype.execute = function() {
	var pc = RPG.World.getPC();
	var you = (this._source == pc);
	var coords = this._target.getCell().getCoords();

	var knows = this._source.trapMemory().remembers(this._target);
	var activated = true;
	if (knows) { activated = RPG.Rules.isTrapActivated(this._source, this._target); }

	if (activated) {
		/* dmg or whateva */
		this._target.setOff();

		/* let the being know about this */
		this._source.trapMemory().remember(this._target);
		pc.mapMemory().updateCoords(coords);
	} else if (pc.canSee(coords)) {
		/* already knows */
		var str = this._source.describeA().capitalize() + " ";
		if (you) {
			str += "sidestep "+this._target.describeThe();
		} else {
			str += "sidesteps "+this._target.describeA();
		}
		str += ".";
		RPG.UI.buffer.message(str);
	}
}

/**
 * @class Falling into a pit
 * @augments RPG.Actions.BaseAction
 */
RPG.Actions.Pit = OZ.Class().extend(RPG.Actions.BaseAction);
RPG.Actions.Pit.prototype.execute = function() {
	var pc = RPG.World.getPC();
	var you = (this._source == pc);

	if (pc.canSee(this._target.getCell().getCoords())) {
		var str = this._source.describeA().capitalize();
		str += " " + (you ? "fall" : "falls") + " into a pit!";
		RPG.UI.buffer.message(str);
	}
	
	var dmg = RPG.Rules.getTrapDamage(this._source, this._target);
	this._source.adjustHP(-dmg);
}

/**
 * @class Looking around, target = coords
 * @augments RPG.Actions.BaseAction
 */
RPG.Actions.Look = OZ.Class().extend(RPG.Actions.BaseAction);
RPG.Actions.Look.prototype.execute = function() {
	this._tookTime = false; /* these are free */
	this._describeRemote(this._target);
}

/**
 * @class Equipping items. This is a dummy action, items are switched during UI interaction.
 * @augments RPG.Actions.BaseAction
 */
RPG.Actions.Equip = OZ.Class().extend(RPG.Actions.BaseAction);
RPG.Actions.Equip.prototype.execute = function() {
	RPG.UI.buffer.message("You adjust your equipment.");
}

/**
 * @class Abstract consumption, target = item, params = item container
 * @augments RPG.Actions.BaseAction
 */
RPG.Actions.Consume = OZ.Class().extend(RPG.Actions.BaseAction);

/**
 * @param {string} consumption verb
 * @param {function} consumption method
 */
RPG.Actions.Consume.prototype.execute = function(verb, method) {
	var str = "";
	var you = (this._source == RPG.World.getPC());
	
	/* remove item from inventory / ground */
	var amount = this._target.getAmount();
	if (amount == 1) {
		this._params.removeItem(this._target);
	} else {
		this._target = this._target.subtract(1);
	}

	str += this._source.describe().capitalize() + " ";
	if (you) {
		str += verb +  " " + this._target.describeThe() + ".";
	} else {
		str += verb + "s " + this._target.describeA() + ".";
	}
	RPG.UI.buffer.message(str);
	
	method.call(this._target, this._source);
}

/**
 * @class Eat something, target = item, params = item container
 * @augments RPG.Actions.Consume
 */
RPG.Actions.Eat = OZ.Class().extend(RPG.Actions.Consume);
RPG.Actions.Eat.prototype.execute = function() {
	return this.parent("eat", this._target.eat);
}

/**
 * @class Drink something, target = item, params = item container
 * @augments RPG.Actions.Consume
 */
RPG.Actions.Drink = OZ.Class().extend(RPG.Actions.Consume);
RPG.Actions.Drink.prototype.execute = function() {
	return this.parent("drink", this._target.drink);
}

/**
 * @class Heal wounds, target = amount
 * @augments RPG.Actions.BaseAction
 */
RPG.Actions.Heal = OZ.Class().extend(RPG.Actions.BaseAction);
RPG.Actions.Heal.prototype.execute = function() {
	var b = this._source;
	var hp = b.getHP();
	var max = b.getFeat(RPG.FEAT_MAXHP);
	if (hp == max) {
		RPG.UI.buffer.message("Nothing happens.");
		return;
	}
	
	b.adjustHP(this._target);
	hp = b.getHP();
	
	var str = "";
	
	if (hp == max) {
		str += "All";
	} else {
		str += "Some of";
	}
	str += " "+b.describeHis()+" wounds are healed."
	RPG.UI.buffer.message(str);
}

/**
 * @class Switch position
 * @augments RPG.Actions.BaseAction
 */
RPG.Actions.SwitchPosition = OZ.Class().extend(RPG.Actions.BaseAction);
RPG.Actions.SwitchPosition.prototype.execute = function() {
	var pc = RPG.World.getPC();
	var you = (this._source == pc);
	var map = this._source.getCell().getMap();
	
	var cell = map.at(this._target);
	var being = cell.getBeing();
	
	if (!being) {
		RPG.UI.buffer.message("There is noone to switch position with.");
		this._tookTime = false;
		return;
	}
	
	if (being.isHostile(this._source)) {
		/* impossible */
		if (you) {
			RPG.UI.buffer.message(being.describeThe().capitalize() + " resists!");
		}
	} else {
		var source = this._source.getCell().getCoords().clone();
		var str = "";
		if (you) {
			str += "You switch positions.";
		} else if (pc.canSee(this._target)) {
			str += this._source.describeA().capitalize() + " sneaks past " + being.describeA() + ".";
		}
		RPG.UI.buffer.message(str);
		this._source.setCell(cell);
		being.setCell(map.at(source));
		
		var m1 = new RPG.Actions.Move(this._source, this._target);
		var m2 = new RPG.Actions.Move(being, source);
		RPG.World.action(m1);
		RPG.World.action(m2);
	}

}

/**
 * @class Cast a spell; target = coords, params = spell
 * @augments RPG.Actions.BaseAction
 */
RPG.Actions.Cast = OZ.Class().extend(RPG.Actions.BaseAction);
RPG.Actions.Cast.prototype.execute = function() {
	var pc = RPG.World.getPC();
	var you = (this._source == pc);
	var map = this._source.getCell().getMap();
	
	var cell = map.at(this._target);
	var being = cell.getBeing();
	
	var str = this._source.describe().capitalize() + " cast";
	if (!you) { str += "s"; }
	str += " '" + this._params.describe() + "'.";
	RPG.UI.buffer.message(str);
	
	if (!being) {
		RPG.UI.buffer.message("Nothing happens.");
		return;
	}
	
	this._params.cast(this._source, being);
	
}
