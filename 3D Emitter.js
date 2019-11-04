/* 3D Emitter.js
    
*/

// @input bool enabled = true
// @ui {"widget": "separator"}

// @input int type = 0 {"label": "Emitter Type", "widget": "combobox", "values": [{"label": "local", "value": 0}, {"label": "world", "value": 1}]}
// @input int shape = 0 {"label": "Emitter Shape", "widget": "combobox", "values": [{"label": "point", "value": 0}, {"label": "plane", "value": 1}]}
// @input vec2 planeSize {"label": "Plane Dimensions", "showIf": "shape", "showIfValue": 1}
// @ui {"widget": "separator"}

// @input SceneObject parent {"hint": "Will default to current Object if unassigned"}
// @input Asset.ObjectPrefab emitterObject {"hint": "3D Object to use as the emitter particle"}
// @ui {"widget": "separator"}

// @input int birthrate = 10 {"min": 0, "step": 1}
// @input int birthrateVar = 0 {"label": "variation (%)", "min": 0, "step": 5}
// @input float lifetime = 2 {"label": "Lifetime (s)", "min": 0.1, "step": 0.1}
// @input int lifetimeVar = 0 {"label": "variation (%)", "min": 0, "step": 5}
// @input vec2 fade {"label": "Fade In/Out (s)", "hint": "Time to fade in/out the alpha value of all materials used in emitter object"}
// @ui {"widget": "separator"}

// @input float speed = 10 {"min": 0, "step": 1}
// @input int speedVar = 0 {"label": "variation (%)", "min": 0, "step": 5}
// @input float sprayAngle = 0 {"widget": "slider", "label": "Spray Angle", "hint": "Set to 180 for spherical emission", "min": 0, "max": 180, "step": 1}
// @input vec3 acceleration {"hint": "The acceleration of the object in the specified directions"}
// @ui {"widget": "separator"}

// @input bool randomRot {"label": "Random Initial Rotation"}
// @input vec3 deltaRot {"label": "Rotation Delta (deg/s)"}
// @input int rotVar = 0 {"label": "variation (%)", "min": 0, "step": 5}
// @input bool rotMirrored = true {"label": "mirrored", "hint": "Whether the Rotation Delta values should be allowed to be randomly negative for some objects"}
// @ui {"widget": "separator"}

// @input float scaleStart = 1 {"min": 0}
// @input float scaleEnd = 1 {"min": 0}
// @input int scaleVar = 0 {"label": "variation (%)", "min": 0, "step": 5}
// @ui {"widget": "separator"}

// @input bool collision = false {"showIf": "type", "showIfValue": 1, "hint": "Toggle if emitter objects should collide with the ground"}
// @input float friction = 0 {"showIf": "collision", "showIfValue": true, "min": 0, "max": 100, "hint": "Sets a friction percentage that slows objects that have hit the ground"}

// Initialize API values
script.api.parent = script.parent || script.getSceneObject();
script.api.parentRotOffset = script.api.parent.getTransform().getWorldRotation();

script.api.emitterObject = script.emitterObject;

script.api.type = script.type;
script.api.shape = script.shape;
script.api.planeSize = script.planeSize;

script.api.birthrate = [ script.birthrate, script.birthrateVar/100 ];
script.api.lifetime = [ script.lifetime*1000, script.lifetimeVar/100 ];
script.api.fade = script.fade.uniformScale(1000);
if (script.fade.x + script.fade.y > script.lifetime*(1 - script.lifetimeVar/200)) {
    print('Warning: total fade in/out time exceeds minimum lifetime value. Please adjust these settings to avoid unwanted behavior.');
}

script.api.speed = [ script.speed, script.speedVar/100 ];
script.api.sprayAngle = script.sprayAngle*Math.PI/180;
script.api.acceleration = script.acceleration;
script.api.randomRot = script.randomRot;
script.api.rotation = [ script.deltaRot.uniformScale(Math.PI/180), script.rotVar/100 ];
script.api.rotMirrored = script.rotMirrored;
script.api.scaleStart = [ script.scaleStart, script.scaleVar/100 ];
script.api.scaleEnd = [ script.scaleEnd, script.scaleVar/100 ];

script.api.collisionEnabled = script.collision;
script.api.frictionFactor = script.friction/100;

script.api.timeSinceLastUpdate = 0;
script.api.lastUpdate = Date.now();
script.api.objects = [];

script.api.enabled = script.enabled;

// calculate new positions, rotations, scales, and fade values, while removing old objects
function updateObjects(now) {
    // if in world space, calculate speed based on parent rotation
    var posFunction = (script.api.type == 1) ? 
        function(obj) { return rotateVecByQuat(obj.speed, obj.rotOffset); } :
        function(obj) { return obj.speed; }

    // traverse the object array in reverse order so we can remove items as we go
    for (var i = script.api.objects.length - 1; i >= 0; i--) {
        var o = script.api.objects[i];
        var timeAlive = now - o.startTime;
        // if old, remove from scene and array
        if (timeAlive >= o.lifetime) {
            o.obj.destroy();
            script.api.objects.splice(i, 1);
            continue;
        }
        
        var oT = o.obj.getTransform();
        // position based on current position, speed, acceleration, and friction
        var f = Math.max(1 - script.api.frictionFactor*o.friction, 0);
        var speedOffset = posFunction(o).add(script.api.acceleration.uniformScale(timeAlive/1000)).uniformScale(f);
        var nPos = oT.getLocalPosition().add(speedOffset.uniformScale(script.api.timeSinceLastUpdate));
        if (script.api.type == 1 && script.api.collisionEnabled) {
            nPos.y = Math.max(nPos.y, 0);
            if (nPos.y == 0) o.friction++;
        }
        oT.setLocalPosition(nPos);

        // rotation based on current rotation, rotational speed, and friction
        oT.setLocalRotation(oT.getLocalRotation().multiply(
            quat.fromEulerVec(o.rotSpeed.uniformScale(f).uniformScale(script.api.timeSinceLastUpdate))
        ));

        // scale based on start and end values
        oT.setLocalScale(vec3.one().uniformScale((o.scale[1] - o.scale[0])*(timeAlive / o.lifetime) + o.scale[0]));

        // fade in
        if (timeAlive < script.api.fade.x) {
            var alpha = timeAlive / script.api.fade.x;
            o.materials.forEach(function(mat) {
                var color = mat.mainPass.baseColor;
                color.w = alpha;
                mat.mainPass.baseColor = color;
            });
        }
        // fade out
        else if (o.lifetime - timeAlive < script.api.fade.y) {
            var alpha = (o.lifetime - timeAlive) / script.api.fade.y;
            o.materials.forEach(function(mat) {
                var color = mat.mainPass.baseColor;
                color.w = alpha;
                mat.mainPass.baseColor = color;
            });
        }
    }
}

// create new objects based on birthrate
function emit(now) {
    // calculate how many new objects to make
    var newObjects = valueWithVariance(script.api.birthrate)*script.api.timeSinceLastUpdate;
    newObjects = Math.floor(newObjects) + ((Math.random() < (newObjects % 1)) ? 1: 0); // decimal portion becomes probability for adding an extra object

    // local space
    if (script.api.type == 0) {
        var offset = vec3.zero();
        var target = script.api.parent;
    }
    // world space
    else if (script.api.type == 1) {
        // set root as target (particle parent object)
        var target = global.scene.getRootObject(0);
        // set initial position offset to the parent object's world position relative to the root object
        var offset = script.api.parent.getTransform().getWorldPosition().sub(target.getTransform().getWorldPosition());
        // track parent rotation
        script.api.parentRotOffset = script.api.parent.getTransform().getWorldRotation();
    }

    // define functions for setting starting rotation
    var rotFunction = script.api.randomRot ? function(t) { 
            t.setLocalRotation(quat.fromEulerAngles(getRandom(0, 2*Math.PI), getRandom(0, 2*Math.PI), getRandom(0, 2*Math.PI))); 
        } :
        function(t) {};

    // define function for setting starting alpha
    var fadeFunction = (script.api.fade.x > 0) ? function(mat) {
            var color = mat.mainPass.baseColor;
            color.w = 0;
            mat.mainPass.baseColor = color;
        } :
        function(mat) {};
    
    // create new objects based on settings
    for (var i = 0; i < newObjects; i++) {
        // add object to scene
        var nObj = script.api.emitterObject.instantiate(target);
        var nObjT = nObj.getTransform();

        // setup details object referenced in the updateParticles function
        var details = {
            obj: nObj,
            position: calculatePosition[script.api.shape]().add(offset),
            speed: calculateSpeed(),
            rotSpeed: calculateRotSpeed(),
            rotOffset: script.api.parentRotOffset,
            scale: [valueWithVariance(script.api.scaleStart), valueWithVariance(script.api.scaleEnd)],
            lifetime: Math.max(valueWithVariance(script.api.lifetime), 30),
            startTime: now,
            friction: 0,
            materials: []
        }

        // set position, rotation, scale
        nObjT.setLocalPosition(details.position);
        rotFunction(nObjT);
        nObjT.setLocalScale(vec3.one().uniformScale(details.scale[0]));

        // get all materials, set initial alpha value if needed
        if (script.api.fade.x > 0 || script.api.fade.y > 0) {
            getMaterials(details, nObj, fadeFunction);
            if (!details.materials.length) {
                print("No materials found - cannot fade in/out");
            }
        }

        // add object to our array
        script.api.objects.push(details);
    }
}

// helper functions
// calculate a randomized value based on a given variation %
function valueWithVariance(arr) {
    return (arr[1] != 0 ? 
        getRandom(arr[0], arr[0]*arr[1]): 
        arr[0]);
}
// calculate random value given a midpoint and a range
function getRandom(midpoint, range) {
    return midpoint + (Math.random() - 0.5)*range;
}
// randomly assign a positive or negative value
function getRandomSign() {
    return (Math.round(Math.random()) - 0.5)*2;
}
// calculate speed vector based on randomized spray angle
function calculateSpeed() {
    var sp = valueWithVariance(script.api.speed);
    var incline = getRandom(0, 2*script.api.sprayAngle); // phi
    var curl = getRandom(0, 2*Math.PI); // theta
    var xzProj = sp*Math.sin(incline);
    return new vec3(xzProj*Math.sin(curl), sp*Math.cos(incline), xzProj*Math.cos(curl))
}
// calculate rotational speed vector
function calculateRotSpeed() {
    var rsp = script.api.rotation[0].uniformScale(valueWithVariance([1, script.api.rotation[1]]));
    return script.api.rotMirrored ? rsp.mult(new vec3(getRandomSign(), getRandomSign(), getRandomSign())): rsp;
}
// calculate initial position based on emitter geometry
var calculatePosition = [
    function() { return new vec3(0, 0, 0); }, // point
    function() { return new vec3(getRandom(0, script.api.planeSize.x), 0, getRandom(0, script.api.planeSize.y)); } // plane
];
// rotate a vector by a quat
function rotateVecByQuat(v, q) {
    qVec = new vec3(q.x, q.y, q.z);
    qS = q.w;
    // 2*(qVec . v)*qVec + (qS^2 - qVec . qVec)*v + 2*qS*(qVec x v)
    return qVec.uniformScale(2*qVec.dot(v))
        .add(v.uniformScale(qS*qS - qVec.dot(qVec)))
        .add(qVec.cross(v).uniformScale(2*qS));
}
// recursively fetch materials in the emitter object
function getMaterials(details, obj, fadeFunc) {
    // get materials from current object
    for (var d = 0; d < obj.getComponentCount("Component.MeshVisual"); d++) {
        var comp = obj.getComponentByIndex('Component.MeshVisual', d);
        if (comp.mainMaterial) {
            var mat = comp.mainMaterial.clone();
            comp.mainMaterial = mat;
            fadeFunc(mat);
            details.materials.push(mat);
        }
    }
    // get materials from child objects
    if (obj.getChildrenCount) {
        for (var c = 0; c < obj.getChildrenCount(); c++) {
            getMaterials(details, obj.getChild(c), fadeFunc);
        }
    }
}
// setup update event to track world time and run functions
var uEvent = script.createEvent('UpdateEvent');
uEvent.bind(function(event) {
    script.api.timeSinceLastUpdate = event.getDeltaTime();

    var now = Date.now();
    updateObjects(now);
    if (script.api.enabled) emit(now);
    script.api.lastUpdate = now;
});