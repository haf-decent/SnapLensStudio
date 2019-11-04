# SnapLensStudio
Script files for use in Snapchat's [Lens Studio](https://lensstudio.snapchat.com/)

## 3D Emitter
This script file creates an interface for adding a 3D particle effect to your scene. It uses ObjectPrefabs to dynamically instantiate new copies and includes fun features like simulated physics/collisions and an open API for you to access with other scripts.

![UI Screenshot](https://github.com/haf-decent/SnapLensStudio/blob/master/3D%20Emitter%20Screenshot.png)

### Installation
Download the .js file and import it into your project. Add the script as a Component to an object in your scene - preferably the object you'd like to parent your particles to.

### Properties
| Property                	| Description                                                                            	|     Type     	|        Constraints        	| UI 	|        API key       	|
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
These are the properties of each object within the Object Array

|  Property 	|     Type    	| Description                                                                                  	|
|:---------:	|:-----------:	|:----------------------------------------------------------------------------------------------	|
|    obj    	| SceneObject 	| the instantiated object particle                                                             	|
|  position 	|     vec3    	| the initial position of the particle                                                         	|
|   speed   	|     vec3    	| the initial speed vector of the particle                                                     	|
|  rotSpeed 	|     vec3    	| the initial rotational speed of the particle (radians)                                       	|
| rotOffset 	| vec4 (quat) 	| a quat describing the rotation of the parent object at startTime                             	|
|   scale   	|   [float]   	| a 2-element array describing the initial and final scales of the object                      	|
|  lifetime 	|     int     	| time in milliseconds that the particle should remain in the scene                            	|
| startTime 	|     int     	| timestamp of the initial spawn time of the particle                                          	|
|  friction 	|     int     	| counter variable used to determine how much friction should affect the speed of the particle based on the global frictionFactor 	|
| materials 	|  [Material] 	| an array of clones of all materials found in prefab object, for use in fade in/out           	|
