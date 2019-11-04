# SnapLensStudio
Script files for use in Snapchat's [Lens Studio](https://lensstudio.snapchat.com/)

## 3D Emitter
This script file creates an interface for adding a 3D particle effect to your scene. It uses ObjectPrefabs to dynamically instantiate new copies and includes fun features like simulated physics/collisions and an open API for you to access with other scripts.

![UI Screenshot](https://github.com/haf-decent/SnapLensStudio/blob/master/3D%20Emitter%20Screenshot.png)

### Installation
Download the .js file and import it into your project. Add the script as a Component to an object in your scene - preferably the object you'd like to parent your particles to.

### Properties
| Property                	| Description                                                                            	|     type     	|        constraints        	| UI 	|        API key       	|
|-------------------------	|----------------------------------------------------------------------------------------	|:------------:	|:-------------------------:	|:--:	|:--------------------:	|
| Enabled                 	| toggle the emission of new particles                                                   	|     bool     	|             -             	|  Y 	|        enabled       	|
| Emitter Type            	| dropdown specifying local or world space                                               	|      int     	|    0 (local), 1 (world)   	|  Y 	|         type         	|
| Emitter Shape           	| dropdown specifying the shape of the emitter zone                                      	|      int     	|    0 (point), 1 (plane)   	|  Y 	|         shape        	|
| Plane Size              	| Size of plane (if type = plane)                                                        	| vec2         	| >= 0                      	| Y  	| planeSize            	|
| Parent                  	| SceneObject to add generated particles to                                              	| SceneObject  	| defaults to script parent 	| Y  	| parent               	|
| Emitter Object          	| 3D object to be used for the particles                                                 	| ObjectPrefab 	| -                         	| Y  	| emitterObject        	|
| Birthrate               	| Number of new objects to create per second                                             	| int          	| >= 0                      	| Y  	| birthrate[0]         	|
|                         	| % variation of birthrate                                                               	| float        	| >= 0                      	| Y  	| birthrate[1]         	|
| Lifetime                	| Seconds until particle disappears from scene                                           	| float        	| > 0                       	| Y  	| lifetime[0]          	|
|                         	| % variation of birthrate                                                               	| float        	| >= 0                      	| Y  	| lifetime[1]          	|
| Fade In/Out             	| Seconds for objects to fade in/out their alpha value                                   	| vec2         	| >= 0                      	| Y  	| fade                 	|
| Speed                   	| Value for how quickly particles initially move                                         	| float        	| >= 0                      	| Y  	| speed[0]             	|
|                         	| % variation of speed                                                                   	| float        	| >= 0                      	| Y  	| speed[1]             	|
| Spray Angle             	| Angle in degrees from <0,1,0> for particles to spray                                   	| float        	| >= 0                      	| Y  	| sprayAngle (radians) 	|
| Acceleration            	| Vector describing the acceleration of particles after spawning                         	| vec3         	| -                         	| Y  	| acceleration         	|
| Random Initial Rotation 	| Toggle if particles should start with a random rotation                                	| bool         	| -                         	| Y  	| randomRot            	|
| Rotation Delta          	| Change in rotation of particles over time                                              	| vec3         	| -                         	| Y  	| rotation[0]          	|
|                         	| % variation of rotation delta                                                          	| float        	| >= 0                      	| Y  	| rotation[1]          	|
| Mirrored                	| Toggle if rotation delta should be allowed to semi-randomize between positive/negative 	| bool         	| -                         	| Y  	| rotMirrored          	|
| Scale Start             	| Initial scale of particle objects                                                      	| float        	| >= 0                      	| Y  	| scaleStart[0]        	|
| Scale End               	| End scale of particle objects                                                          	| float        	| >= 0                      	| Y  	| scaleEnd[0]          	|
|                         	| % variation of scales                                                                  	| float        	| >= 0                      	| Y  	| scaleStart/End[1]    	|
| Collision               	| Toggle whether particles should collide with perceived ground (y = 0)                  	| bool         	| -                         	| Y  	| collisionEnabled     	|
| Friction                	| % reduction in particle speed after colliding with floor                               	| float        	| >= 0                      	| Y  	| frictionFactor       	|
| Time Since Last Update  	| Time in ms since last update of the particle system (mostly read-only)                 	| int          	| -                         	| N  	| timeSinceLastUpdate  	|
| Last Update             	| Timestamp of last update (ms)                                                          	| int          	| -                         	| N  	| lastUpdate           	|
| Object Array            	| Array of objects describing the individual particles still active in the scene         	| [{}]         	| -                         	| N  	| objects              	|
| Parent Rotation Offset  	| Rotation of the parent object, used for calculating relative transform properties      	| vec4 (quat)  	| -                         	| N  	| parentRotOffset      	|

### Particle Properties

**obj** (SceneObejct) The instantiated object

**position** (vec3) The initial position of the object

**speed** (vec3) The initial speed vector

**rotSpeed** (vec3) The initial rotational speed vector

**rotOffset** (vec3) The parent's rotational offset at the time of instantiation

**scale** ([floats]) An array of the start and end scales of the object

**lifetime** (int) Number of milliseconds particle should exist

**startTime** (int) Timestamp (ms) of instantiation

**friction** (int) Incrementing counter for how much friction affects the objects change in position

**materials** ([Materials]) An array of all materials found in the emitter object for use in fading in/out
