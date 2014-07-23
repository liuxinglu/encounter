'use strict';

var Player = new THREE.Mesh(); // initially a default mesh, we'll define this in init()

Player.RADIUS = 40;
Player.GEOMETRY = new THREE.SphereGeometry(Player.RADIUS, 8, 4);
Player.MATERIAL = MATS.wireframe.clone();
Player.SHOT_MATERIAL = new THREE.MeshBasicMaterial({ color: C64.white });

Player.radarType = Radar.TYPE_PLAYER;

Player.lastTimeFired = null;
Player.shotsInFlight = null;
Player.isAlive = false;

Player.init = function()
{
  // actually set up this Mesh using our materials
  THREE.Mesh.call(Player, Player.GEOMETRY, Player.MATERIAL); 

  // FIXME for debug purposes player can move in pause mode - uncomment to fix this.
  //State.actors.push(playerMesh);
}

Player.reset = function()
{
  Player.position.set(Grid.MAX_X / 2, Encounter.CAMERA_HEIGHT, Grid.MAX_Z / 2);
  Player.rotation.x = 0;
  Player.rotation.y = Encounter.PLAYER_INITIAL_ROTATION;
  Player.rotation.z = 0;

  Player.shotsInFlight = 0;
  Player.lastTimeFired = 0;
  Player.isAlive = true;
}

Player.update = function()
{
  // if an obelisk is close (fast check), do a detailed collision check
  if (Grid.isActive && Physics.isCloseToAnObelisk(Player.position, Player.RADIUS))
  {
    // check for precise collision
    var obelisk = Physics.getCollidingObelisk(Player.position, Player.RADIUS);
    // if we get a return there is work to do
    if (typeof obelisk !== "undefined")
    {
      // we have a collision, move the player out but don't change the rotation
      Physics.moveCircleOutOfStaticCircle(obelisk.position, Obelisk.RADIUS, Player.position, Player.RADIUS);
      Sound.playerCollideObelisk();
    }
  }
}

Player.wasHit = function()
{
  Sound.playerKilled();
  Player.isAlive = false;
  State.setupGameOver();
}

Player.shoot = function()
{
  if (Player.shotsInFlight < Encounter.MAX_PLAYERS_SHOTS_ALLOWED)
  {
    // FIXME use the clock
    var now = new Date().getTime();
    var timeSinceLastShot = now - Player.lastTimeFired;
    if (timeSinceLastShot > Encounter.SHOT_INTERVAL_MS)
    {
      Sound.playerShoot();
      var shot = Shot.newInstance(Player, Player.position, Player.rotation, Player.SHOT_MATERIAL);
      Player.shotsInFlight += 1;
      Player.lastTimeFired = now;
      State.actors.push(shot);
      scene.add(shot);    
    }
  }
}