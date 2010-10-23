/**
 * @class Testbed story
 * @augments RPG.Story
 */
RPG.Story.Testbed = OZ.Class().extend(RPG.Story);

RPG.Story.Testbed.prototype._firstMap = function() {
	var gen = new RPG.Generators.IceyMaze(new RPG.Misc.Coords(59, 19), null, 0);
	var map = gen.generate("testbed", 1);
	
	var up = new RPG.Features.Staircase.Up();
	map.setFeature(up, map.getFreeCoords());
	
	this._staircases["end"] = up;
	this._staircaseCallbacks["end"] = this.end;

	return map;
}

RPG.Story.Testbed.prototype._createPC = function(race, profession, name) {
	var pc = new RPG.Beings.God(race, profession);
	pc.setName(name);
	return pc;
}
