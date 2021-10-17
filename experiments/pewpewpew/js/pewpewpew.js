function pewpewpew(imageSrc) {

    let level;

    let targets = {};
    
    let mouse = new THREE.Vector2(), clickIntersected, hoverIntersected;
    let raycaster = new THREE.Raycaster();

    let scene = new THREE.Scene();
    let camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.001, 2500 );

    let renderer;
    let startedRendering = false;

    let textureArray = new Array();
    
    let container = document.getElementById('canvas-3d');
    
    let targetsCount, removedTargets, spaceWidth, spaceHeight, spaceDepth, maxDeviceSize, additionnalSpeed;
    let leveltargetsCount, gametargetsTotal, levelCount, levelCompleted, levelSkill, levelAccuracyElement, totalAccuracyElement;
    
    let hasGameStarted = false;
    let isChangingLevel = false;
    let clickCount, levelAccuracy;
    let totalAccuracy = 0;
    
    // laser
    let laser = {}; 
    
    // bonuses
    let slowBonus = {};
    let sizeBonus = {};
    let blasterBonus = {};
    let timeMalus = {};
    let removedBonus;
    
    let shouldRender = true;
    
    // combo
    let combo = {};
    
    // particles & blaster explosion
    let particleSystem = new Array();
    let particlesColors = new Array();
    let blasterBonusExplosions = new Array();
    
    // timer
    let elapsedTime = 0;
    let levelTime;
    let timerIsActive = false;
    
    let timeLimit = 15000;
    
    // score
    let totalScore = 0;
    
    let wrapper;
    
    let isMobile;
    document.body.className.indexOf('mobile') == -1 ? isMobile = false : isMobile = true;
    
    
    
    function render() {

        if(shouldRender) {
            requestAnimationFrame(render);
        }
        
        // hover interaction
        if(!isMobile) {
            raycaster.setFromCamera( mouse, camera );

            var intersects = raycaster.intersectObjects( scene.children, true );
                    
            if ( intersects.length > 0 ) {
                
                if(hoverIntersected != intersects[ 0 ].object) {
                
                    if(hoverIntersected && hoverIntersected.ref) {
                        //hoverIntersected.material.wireframe = false;
                        hoverIntersected.material.transparent = false;
                        hoverIntersected.material.opacity = 1;
                    }
                
                    hoverIntersected = intersects[ 0 ].object;
                    //hoverIntersected.material.wireframe = true;
                    if(hoverIntersected.ref) {
                        hoverIntersected.material.transparent = true;
                        hoverIntersected.material.opacity = 0.5;
                    }
                }

            }
            else {
                if(hoverIntersected && hoverIntersected.ref) {
                    //hoverIntersected.material.wireframe = false;
                    hoverIntersected.material.transparent = false;
                    hoverIntersected.material.opacity = 1;
                }
                hoverIntersected = null;
            }
        }
        
        for(var i = 0; i < targets.mesh.length; i++) {
            
            if( targets.mesh[i] && targets.targetsDirections[i]) {
                
                targets.mesh[i].position.x = targets.mesh[i].position.x + targets.targetsDirections[i].x;
                targets.mesh[i].position.y = targets.mesh[i].position.y + targets.targetsDirections[i].y;
                targets.mesh[i].position.z = targets.mesh[i].position.z + targets.targetsDirections[i].z;
                
                targets.mesh[i].rotation.x = targets.mesh[i].rotation.x + targets.targetsRotations[i].x;
                targets.mesh[i].rotation.y = targets.mesh[i].rotation.y + targets.targetsRotations[i].y;
                targets.mesh[i].rotation.z = targets.mesh[i].rotation.z + targets.targetsRotations[i].z;
                
                // boundaries
                if(targets.mesh[i].position.x <= - 1 * (spaceWidth / 2) || targets.mesh[i].position.x >= spaceWidth / 2) {
                    targets.targetsDirections[i].x = targets.targetsDirections[i].x * -1;
                    
                    targets.targetsRotations[i].x = targets.targetsRotations[i].x * -1;
                }
                if(targets.mesh[i].position.y <= - 1 * (spaceHeight / 2) || targets.mesh[i].position.y >= spaceHeight / 2) {
                    targets.targetsDirections[i].y = targets.targetsDirections[i].y * -1;
                    
                    targets.targetsRotations[i].y = targets.targetsRotations[i].y * -1;
                }
                if(targets.mesh[i].position.z <= - 1 * spaceDepth || targets.mesh[i].position.z >= 0) {
                    targets.targetsDirections[i].z = targets.targetsDirections[i].z * -1;
                    
                    targets.targetsRotations[i].z = targets.targetsRotations[i].z * -1;
                }
                
                scene.add( targets.mesh[i] );
            }
        }
        
        if(slowBonus.mesh && slowBonus.directions) {
            slowBonus.mesh.position.x = slowBonus.mesh.position.x + slowBonus.directions.x;
            slowBonus.mesh.position.y = slowBonus.mesh.position.y + slowBonus.directions.y;
            slowBonus.mesh.position.z = slowBonus.mesh.position.z + slowBonus.directions.z;
            
            slowBonus.mesh.rotation.x = slowBonus.mesh.rotation.x + slowBonus.rotation.x;
            slowBonus.mesh.rotation.y = slowBonus.mesh.rotation.y + slowBonus.rotation.y;
            slowBonus.mesh.rotation.z = slowBonus.mesh.rotation.z + slowBonus.rotation.z;
            
            // boundaries
            if(slowBonus.mesh.position.x <= - 1 * (spaceWidth / 2) || slowBonus.mesh.position.x >= spaceWidth / 2) {
                slowBonus.directions.x = slowBonus.directions.x * -1;
                
                slowBonus.rotation.x = slowBonus.rotation.x * -1;
            }
            if(slowBonus.mesh.position.y <= - 1 * (spaceHeight / 2) || slowBonus.mesh.position.y >= spaceHeight / 2) {
                slowBonus.directions.y = slowBonus.directions.y * -1;
                
                slowBonus.rotation.y = slowBonus.rotation.y * -1;
            }
            if(slowBonus.mesh.position.z <= - 1 * spaceDepth || slowBonus.mesh.position.z >= 0) {
                slowBonus.directions.z = slowBonus.directions.z * -1;
                
                slowBonus.rotation.z = slowBonus.rotation.z * -1;
            }
            
            scene.add( slowBonus.mesh );
        }
        
        if(sizeBonus.mesh && sizeBonus.directions) {
            sizeBonus.mesh.position.x = sizeBonus.mesh.position.x + sizeBonus.directions.x;
            sizeBonus.mesh.position.y = sizeBonus.mesh.position.y + sizeBonus.directions.y;
            sizeBonus.mesh.position.z = sizeBonus.mesh.position.z + sizeBonus.directions.z;
            
            sizeBonus.mesh.rotation.x = sizeBonus.mesh.rotation.x + sizeBonus.rotation.x;
            sizeBonus.mesh.rotation.y = sizeBonus.mesh.rotation.y + sizeBonus.rotation.y;
            sizeBonus.mesh.rotation.z = sizeBonus.mesh.rotation.z + sizeBonus.rotation.z;
            
            // boundaries
            if(sizeBonus.mesh.position.x <= - 1 * (spaceWidth / 2) || sizeBonus.mesh.position.x >= spaceWidth / 2) {
                sizeBonus.directions.x = sizeBonus.directions.x * -1;
                
                sizeBonus.rotation.x = sizeBonus.rotation.x * -1;
            }
            if(sizeBonus.mesh.position.y <= - 1 * (spaceHeight / 2) || sizeBonus.mesh.position.y >= spaceHeight / 2) {
                sizeBonus.directions.y = sizeBonus.directions.y * -1;
                
                sizeBonus.rotation.y = sizeBonus.rotation.y * -1;
            }
            if(sizeBonus.mesh.position.z <= - 1 * spaceDepth || sizeBonus.mesh.position.z >= 0) {
                sizeBonus.directions.z = sizeBonus.directions.z * -1;
                
                sizeBonus.rotation.z = sizeBonus.rotation.z * -1;
            }
            
            scene.add( sizeBonus.mesh );
        }
        
        
        if(blasterBonus.mesh && blasterBonus.directions) {
            blasterBonus.mesh.position.x = blasterBonus.mesh.position.x + blasterBonus.directions.x;
            blasterBonus.mesh.position.y = blasterBonus.mesh.position.y + blasterBonus.directions.y;
            blasterBonus.mesh.position.z = blasterBonus.mesh.position.z + blasterBonus.directions.z;
            
            blasterBonus.mesh.rotation.x = blasterBonus.mesh.rotation.x + blasterBonus.rotation.x;
            blasterBonus.mesh.rotation.y = blasterBonus.mesh.rotation.y + blasterBonus.rotation.y;
            blasterBonus.mesh.rotation.z = blasterBonus.mesh.rotation.z + blasterBonus.rotation.z;
            
            // boundaries
            if(blasterBonus.mesh.position.x <= - 1 * (spaceWidth / 2) || blasterBonus.mesh.position.x >= spaceWidth / 2) {
                blasterBonus.directions.x = blasterBonus.directions.x * -1;
                
                blasterBonus.rotation.x = blasterBonus.rotation.x * -1;
            }
            if(blasterBonus.mesh.position.y <= - 1 * (spaceHeight / 2) || blasterBonus.mesh.position.y >= spaceHeight / 2) {
                blasterBonus.directions.y = blasterBonus.directions.y * -1;
                
                blasterBonus.rotation.y = blasterBonus.rotation.y * -1;
            }
            if(blasterBonus.mesh.position.z <= - 1 * spaceDepth || blasterBonus.mesh.position.z >= 0) {
                blasterBonus.directions.z = blasterBonus.directions.z * -1;
                
                blasterBonus.rotation.z = blasterBonus.rotation.z * -1;
            }
            
            scene.add( blasterBonus.mesh );
        }
        
        if(timeMalus.mesh && timeMalus.directions) {
            timeMalus.mesh.position.x = timeMalus.mesh.position.x + timeMalus.directions.x;
            timeMalus.mesh.position.y = timeMalus.mesh.position.y + timeMalus.directions.y;
            timeMalus.mesh.position.z = timeMalus.mesh.position.z + timeMalus.directions.z;
            
            timeMalus.mesh.rotation.x = timeMalus.mesh.rotation.x + timeMalus.rotation.x;
            timeMalus.mesh.rotation.y = timeMalus.mesh.rotation.y + timeMalus.rotation.y;
            timeMalus.mesh.rotation.z = timeMalus.mesh.rotation.z + timeMalus.rotation.z;
            
            // boundaries
            if(timeMalus.mesh.position.x <= - 1 * (spaceWidth / 2) || timeMalus.mesh.position.x >= spaceWidth / 2) {
                timeMalus.directions.x = timeMalus.directions.x * -1;
                
                timeMalus.rotation.x = timeMalus.rotation.x * -1;
            }
            if(timeMalus.mesh.position.y <= - 1 * (spaceHeight / 2) || timeMalus.mesh.position.y >= spaceHeight / 2) {
                timeMalus.directions.y = timeMalus.directions.y * -1;
                
                timeMalus.rotation.y = timeMalus.rotation.y * -1;
            }
            if(timeMalus.mesh.position.z <= - 1 * spaceDepth || timeMalus.mesh.position.z >= 0) {
                timeMalus.directions.z = timeMalus.directions.z * -1;
                
                timeMalus.rotation.z = timeMalus.rotation.z * -1;
            }
            
            scene.add( timeMalus.mesh );
        }
        
        if(sizeBonus.isActive) {
            for(var i = 0; i < targets.mesh.length; i++) {
                targets.mesh[i].scale.x = Math.min(targets.mesh[i].scale.x + 0.05, 2);
                targets.mesh[i].scale.y = Math.min(targets.mesh[i].scale.y + 0.05, 2);
                targets.mesh[i].scale.z = Math.min(targets.mesh[i].scale.z + 0.05, 2);
            }
        }
        else {
            for(var i = 0; i < targets.mesh.length; i++) {
                targets.mesh[i].scale.x = Math.max(targets.mesh[i].scale.x - 0.05, 1);
                targets.mesh[i].scale.y = Math.max(targets.mesh[i].scale.y - 0.05, 1);
                targets.mesh[i].scale.z = Math.max(targets.mesh[i].scale.z - 0.05, 1);
            }
        }
        
        if(blasterBonus.isActive) {
            laser.mesh.material.color.setHex(0x2cb2f5);
            laser.mesh.scale.x = 5;
            laser.mesh.scale.y = 5;
            laser.mesh.scale.z = 5;
            laser.extremePosition = -5000;
        }
        else {
            laser.mesh.material.color.setHex(0xF86EFF);
            laser.mesh.scale.x = 1;
            laser.mesh.scale.y = 1;
            laser.mesh.scale.z = 1;
            laser.extremePosition = -3000;
        }
        
        // particles
        if(particleSystem.length > 0) {                
            particleSystem.forEach(function(system) {
                if(slowBonus.isActive) {
                    system.material.opacity -= 0.005;
                }
                else {
                    system.material.opacity -= 0.01;
                }
            
                system.geometry.verticesNeedUpdate = true;
                for(var p = 0; p < system.geometry.vertices.length; p++) {
                    var particleElement = system.geometry.vertices[p];
                    var additionnalParticleSpeed = 0;
                    if(slowBonus.isActive) {
                        additionnalParticleSpeed = 75;
                    }
                    
                    particleElement.x += (particleElement.x - system.centerX) / (75 + additionnalParticleSpeed);
                    particleElement.y += (particleElement.y - system.centerY) / (75 + additionnalParticleSpeed);
                    particleElement.z += (particleElement.z - system.centerZ) / (75 + additionnalParticleSpeed);
                }
            });
        }
        
        
        // blaster bonus explosion
        if(blasterBonusExplosions.length > 0) {
            blasterBonusExplosions.forEach(function(explosion) {
                explosion.material.opacity -= 0.02;
                
                explosion.scale.x += 0.05;
                explosion.scale.y += 0.05;
                explosion.scale.z += 0.05;
            });
        }

        
        if(hasGameStarted) {
            camera.position.z = Math.min(camera.position.z + 25, spaceDepth * 2 + 100);
        }
        
        
        if(laser.mesh && laser.mesh.position.z > laser.extremePosition) {
            var newPosition = laser.mesh.position.clone();
            
            laser.mesh.position.z = Math.max(laser.extremePosition, newPosition.z - 400);
            
            if(clickIntersected && clickIntersected.position.z >= laser.mesh.position.z) {
                // reset laser position
                laser.mesh.position.z = laser.extremePosition;
                laser.isShooting = false;
            }
        }
        else {
            laser.isShooting = false;
        }
        
        // handle timer
        manageTimer();
        
        camera.updateMatrixWorld();
        renderer.render( scene, camera );
    }
    
    
    
    
    
    function initAll() {
        level = 1;
        startedRendering = false;
        wrapper = document.querySelector('.page-game');
        wrapper.className = "page-game";
        totalScore = 0;
        elapsedTime = 0;
        hasGameStarted = false;
        totalAccuracy = 0;
        levelAccuracy = 0;
        removedTargets = 0;
        removedBonus = 0;
        clickCount = 0;
        
        
        if(isMobile) {
            spaceDepth = 125;
            blasterBonus.range = 105;
        }
        else {
            spaceDepth = 250;
            blasterBonus.range = 140;
        }
        
        //camera.position.z = spaceDepth * 2 + 100;
        
        spaceWidth = window.innerWidth;
        spaceHeight = window.innerHeight;
        
        spaceWidth >= spaceHeight ? maxDeviceSize = spaceWidth : maxDeviceSize = spaceHeight;
        
        
        // ingame box & level count
        leveltargetsCount = document.getElementById('page-game-count');
        gametargetsTotal = document.getElementById('page-game-total');
        levelCount = document.getElementById('page-game-level-count');
        
        // end level screen
        levelCompleted = document.getElementById('page-game-level-completed');
        levelSkill = document.getElementById('page-game-level-skill');
        levelAccuracyElement = document.getElementById('page-game-level-accuracy');
        totalAccuracyElement = document.getElementById('page-game-total-accuracy');
        levelTimerElement = document.getElementById('page-game-level-timer');
        totalTimerElement = document.getElementById('page-game-total-timer');
        totalScoreElement = document.getElementById('page-game-total-score');  
        
        // laser beam
        laser.laserMaterial = new THREE.MeshBasicMaterial({
            color: 0xF86EFF,
        });
        laser.laserGeometry = new THREE.CylinderGeometry(3, 3, 500);
        
        laser.mesh = new THREE.Mesh(laser.laserGeometry, laser.laserMaterial); 
        
        laser.mesh.frustumCulled = false;
        laser.mesh.rotation.x = Math.PI / 2;
        laser.mesh.name = "laser";
        
        scene.add(laser.mesh);  
        laser.isShooting = false;
        laser.extremePosition = -3000;
        laser.mesh.position.z = laser.extremePosition;
        
        init(level);
    }
    
    
    function init(level) {
        //console.log('init level ', level);
        shouldRender = true;
        
        if(isMobile) {
            targetsCount = 10 + ((level - 1) * 2);
        }
        else {
            //targetsCount = 15 + ((level - 1) * 10);
            targetsCount = 10 + ((level - 1) * 2);
        }
        
        
        removedTargets = removedBonus = clickCount = levelAccuracy = 0;
        
        
        
        leveltargetsCount.innerHTML = removedTargets;
        gametargetsTotal.innerHTML = '&nbsp;/ ' + targetsCount;
        levelCount.innerHTML = 'Level ' + level;     
        
        clickIntersected = null;

        slowBonus.isActive = false;
        sizeBonus.isActive = false;
        blasterBonus.isActive = false;
        timeMalus.isActive = false;
        
        combo.count = 0;
        combo.isActive = false;
        
        slowBonus.rotation = {x: (0.0005 + 0.002 * Math.random()) - 0.001, y: (0.0005 + 0.002 * Math.random()) - 0.001, z: (0.0005 + 0.002 * Math.random()) - 0.001};
        sizeBonus.rotation = {x: (0.0005 + 0.002 * Math.random()) - 0.001, y: (0.0005 + 0.002 * Math.random()) - 0.001, z: (0.0005 + 0.002 * Math.random()) - 0.001};
        blasterBonus.rotation = {x: (0.0005 + 0.002 * Math.random()) - 0.001, y: (0.0005 + 0.002 * Math.random()) - 0.001, z: (0.0005 + 0.002 * Math.random()) - 0.001};
        timeMalus.rotation = {x: (0.0005 + 0.002 * Math.random()) - 0.001, y: (0.0005 + 0.002 * Math.random()) - 0.001, z: (0.0005 + 0.002 * Math.random()) - 0.001};
        
        targets.targetsGeometries = targets.mesh = targets.targetsDirections = targets.targetsRotations = null;
        targets.targetsGeometries = [];
        targets.mesh = [];
        targets.targetsDirections = [];
        targets.targetsRotations = [];
        
        additionnalSpeed = 0.1; 
        levelTime = 0;
        var timerDisplay = document.getElementById('page-game-timer-display');
        timerDisplay.className = "";
        
        var tenBasedLevel = level % 10; 
        
        for(var i = 0, j = 2; i < targetsCount; i++, j++) {
            
            // special for last level
            if(level == 10) {
                tenBasedLevel = Math.floor(j / 2);
                
                if(tenBasedLevel >= 10) {
                    tenBasedLevel = (tenBasedLevel % 10) + 1;
                }
            }
            
            var material  = new THREE.MeshBasicMaterial({
                map: textureArray[tenBasedLevel],
                depthTest: false,
                /*side: THREE.DoubleSide,*/
            });
            
            var mobileAdaptation = 1;
            if(isMobile) mobileAdaptation = 1.5;
            
            var targetWidth = Math.max(maxDeviceSize * mobileAdaptation / 16, ((Math.random() * maxDeviceSize / 3) - maxDeviceSize / 6) * mobileAdaptation);
            var targetHeight = Math.max(maxDeviceSize * mobileAdaptation / 16, ((Math.random() * maxDeviceSize / 3) - maxDeviceSize / 6) * mobileAdaptation);
            var targetDepth = Math.max(maxDeviceSize * mobileAdaptation / 16, ((Math.random() * maxDeviceSize / 3) - maxDeviceSize / 6) * mobileAdaptation);

            if(tenBasedLevel == 1) {
                targetWidth = Math.max(maxDeviceSize * mobileAdaptation / 20, ((Math.random() * maxDeviceSize / 3.5) - maxDeviceSize / 7) * mobileAdaptation);
                targets.targetsGeometries[i] = new THREE.SphereGeometry( targetWidth, 16, 16 );
                
                particlesColors[i] = [0x17e39a, 0xdc37dc];
            }
            else if(tenBasedLevel == 2) {
                targetWidth = Math.max(maxDeviceSize * mobileAdaptation / 20, ((Math.random() * maxDeviceSize / 3.5) - maxDeviceSize / 7) * mobileAdaptation);
                targets.targetsGeometries[i] = new THREE.DodecahedronGeometry( targetWidth, 0 );
                
                particlesColors[i] = [0xffeb80, 0x2c7c79];
            }
            else if(tenBasedLevel == 3) {
                targets.targetsGeometries[i] = new THREE.BoxGeometry( targetWidth, targetHeight, targetDepth );
                
                particlesColors[i] = [0xf5a2b4, 0x50748c];
            }
            else if(tenBasedLevel == 4) {
                targetWidth = Math.max(maxDeviceSize * mobileAdaptation / 16, ((Math.random() * maxDeviceSize / 3.5) - maxDeviceSize / 7) * mobileAdaptation);
                targets.targetsGeometries[i] = new THREE.CylinderGeometry( targetWidth / 2, targetWidth / 2, targetWidth * 1.5 );
                
                particlesColors[i] = [0x0295e5, 0xe50100];
            }
            else if(tenBasedLevel == 5) {
                targetWidth = Math.max(maxDeviceSize * mobileAdaptation / 16, ((Math.random() * maxDeviceSize / 3.5) - maxDeviceSize / 7) * mobileAdaptation);
                targets.targetsGeometries[i] = new THREE.TetrahedronGeometry( targetWidth );
                
                particlesColors[i] = [0x448bdd, 0xc999e5];
            }
            else if(tenBasedLevel == 6) {
                targetWidth = Math.max(maxDeviceSize * mobileAdaptation / 16, ((Math.random() * maxDeviceSize / 3.5) - maxDeviceSize / 7) * mobileAdaptation);
                targets.targetsGeometries[i] = new THREE.CylinderGeometry( 0, targetWidth / 2, targetWidth * 1.5 );
                
                particlesColors[i] = [0xf64001, 0x5dd4f5];
            }
            else if(tenBasedLevel == 7) {
                targetWidth = Math.max(maxDeviceSize * mobileAdaptation / 20, ((Math.random() * maxDeviceSize / 6) - maxDeviceSize / 12) * mobileAdaptation);
                targets.targetsGeometries[i] = new THREE.TorusGeometry( targetWidth, targetWidth / 3, 16, 16 );
                
                particlesColors[i] = [0xf20d0a, 0x0403c1];
            }
            else if(tenBasedLevel == 8) {
                targetWidth = Math.max(maxDeviceSize * mobileAdaptation / 20, ((Math.random() * maxDeviceSize / 6) - maxDeviceSize / 12) * mobileAdaptation);
                targets.targetsGeometries[i] = new THREE.TorusGeometry( targetWidth, targetWidth / 3.5, 16, 4 );
                
                particlesColors[i] = [0x666ff8, 0xe6ab38];
            }
            else if(tenBasedLevel == 9) {
                targetWidth = Math.max(maxDeviceSize * mobileAdaptation / 20, ((Math.random() * maxDeviceSize / 6) - maxDeviceSize / 12) * mobileAdaptation);
                targets.targetsGeometries[i] = new THREE.TorusKnotGeometry( targetWidth / 1.5, targetWidth / 6 );
                
                particlesColors[i] = [0x3bbfcc, 0xc22a52];
            }
            
            targets.mesh[i] = new THREE.Mesh( targets.targetsGeometries[i], material );
            
            targets.mesh[i].name = i;
            targets.mesh[i].ref = 'ref' + i;
            
            targets.mesh[i].position.x = Math.min((Math.random() * spaceWidth) - (spaceWidth / 2), spaceWidth - targetWidth);
            targets.mesh[i].position.y = Math.min((Math.random() * spaceHeight) - (spaceHeight / 2), spaceHeight - targetHeight);
            targets.mesh[i].position.z = (Math.random() * (spaceDepth / 2)) - spaceDepth;
            
            targets.targetsDirections[i] = {x: (0.2 + 0.8 * Math.random()) - 0.4, y: (0.2 + 0.8 * Math.random()) - 0.4, z: (0.2 + 0.8 * Math.random()) - 0.4};
            targets.targetsRotations[i] = {x: (0.0005 + 0.002 * Math.random()) - 0.001, y: (0.0005 + 0.002 * Math.random()) - 0.001, z: (0.0005 + 0.002 * Math.random()) - 0.001};
            
            targets.mesh[i].rotation.x = (5 + 2 * Math.random()) - 1;
            targets.mesh[i].rotation.y = (5 + 2 * Math.random()) - 1;
            targets.mesh[i].rotation.z = (5 + 2 * Math.random()) - 1;
            
            scene.add( targets.mesh[i] );
        }
        
        isChangingLevel = false; 
        
        if(!startedRendering) {
            startedRendering = true;
            render();
        }
    }

    
    
    
    
    window.addEventListener('resize', function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
        spaceWidth = window.innerWidth;
        spaceHeight = window.innerHeight;
        spaceWidth >= spaceHeight ? maxDeviceSize = spaceWidth : maxDeviceSize = spaceHeight;
    }, false);
    
    container.addEventListener('click', function handleContainerClick(event) {
        
        if(startedRendering) {
            event.preventDefault();
            event.stopPropagation();

            if(!isChangingLevel && !laser.isShooting) {
                
                mouse.x = ( event.offsetX / spaceWidth ) * 2 - 1;
                mouse.y = - ( event.offsetY / spaceHeight ) * 2 + 1;

                var vector = new THREE.Vector3(mouse.x, mouse.y, 0);
                vector.unproject( camera );
                var dir = vector.sub( camera.position ).normalize();
                var distance = - camera.position.z / dir.z;
                var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );
                
                //laser.mesh.position.z = pos.z;            
                laser.mesh.position.x = pos.x;
                laser.mesh.position.y = pos.y;
                
                //laser.mesh.position.z = camera.position.z + ((level - 1) * 300); // start shooting
                laser.mesh.position.z = camera.position.clone().z;
                
                laser.isShooting = true;
                
                // remove box on click
                if(hasGameStarted) {
                    clickCount++;
                }
                
                // blaster
                if(blasterBonus.isActive) {
                    var mouseRange = new Array();
                    
                    var precision = 7;
                    if(isMobile) {
                        precision = 15;
                    }
                    
                    for(let i = blasterBonus.range; i >= 0; i -= precision) {
                        for(let j = blasterBonus.range; j >= 0; j -= precision) {
                            mouseRange.push({x: ( (Math.max(0, event.offsetX + (i - blasterBonus.range))) / spaceWidth ) * 2 - 1, y: - ( (Math.max(0, event.offsetY + (j - blasterBonus.range))) / spaceHeight ) * 2 + 1});
                            mouseRange.push({x: ( (event.offsetX + (blasterBonus.range - i)) / spaceWidth ) * 2 - 1, y: - ( (event.offsetY + (blasterBonus.range - j)) / spaceHeight ) * 2 + 1});
                        }
                    }
                    
                    var allIntersections = new Array();
                    var allIntersectionsNames = new Array();
                    
                    for(let i = 1; i < mouseRange.length; i++) {
                        raycaster.setFromCamera( mouseRange[i], camera );
                        var rangeIntersection = raycaster.intersectObjects( scene.children );

                        if(rangeIntersection.length > 0) {
                            for(let j = 0; j < rangeIntersection.length; j++) {
                                if(rangeIntersection[j].object.ref && allIntersectionsNames.indexOf(rangeIntersection[j].object.ref) == -1) {
                                    rangeIntersection[j].object.impactDistance = i / 4;
                                    allIntersections.push(rangeIntersection[j]);
                                    allIntersectionsNames.push(rangeIntersection[j].object.ref);
                                }
                            }
                            
                        }
                    }

                    var intersects = new Array();
                    if(allIntersections.length > 0) {
                        intersects.push(allIntersections[0]);
                    }
                    
                    var explosion = blasterExplosion();
                    
                    if(explosion) {
                        setTimeout(function() {
                            if(explosion) {
                                scene.remove(explosion);
                                explosion = null;
                            }
                        }, 1500);
                    }
                }
                else {
                    raycaster.setFromCamera( mouse, camera );

                    var intersects = raycaster.intersectObjects( scene.children );
                }
                
                if ( intersects.length > 0) {
                    
                    if ( clickIntersected != intersects[ 0 ].object ) {
                    
                        clickIntersected = intersects[ 0 ].object;      

                        if(clickIntersected.type != "Points" && clickIntersected.name != "laser" && clickIntersected.name != "blasterBonusExplosion") {
                            
                            
                            if(removedTargets == 0) {
                                timerIsActive = true;
                                start = new Date().getTime();
                            }
                            
                            if(blasterBonus.isActive) {
                                blastTargets(allIntersections);
                            }
                            else {
                                destroyTarget(clickIntersected);
                            }
                            
                            
                            // launch game
                            if(!hasGameStarted) {
                                hasGameStarted = true;
                                clickCount++; // first click
                                wrapper = document.querySelector('.page-game');
                                wrapper.className = 'page-game page-game-started';
                                setTimeout(function() {
                                    wrapper.className = 'page-game page-game-started page-game-level-change';
                                    setTimeout(function() {
                                        wrapper.className = 'page-game page-game-started';
                                    }, 2000);
                                }, 500);
                            } 
                        }
                    }
                    
                    levelAccuracy = Math.min(100, ((removedTargets + removedBonus) / clickCount) * 100);
                }
                else {
                    clickIntersected = null;
                    laser.isShooting = true;
                    levelAccuracy = ((removedTargets + removedBonus) / clickCount) * 100;
                    
                    combo.isActive = false;
                }
                
            }
        }
        
    }, false);
    
    container.addEventListener('mousemove', function(event) {
        
        event.preventDefault();

        mouse.x = ( event.offsetX / spaceWidth ) * 2 - 1;
        mouse.y = - ( event.offsetY / spaceHeight ) * 2 + 1; 
        
    }, false);


    function blastTargets(allIntersections) {
        
        if(allIntersections.length > 0) {

            // check if we have other targets to destroy
            for(var i = 0; i < allIntersections.length; i++) {
                if(allIntersections[i].object.ref) {

                    setTimeout(destroyTarget.bind(null, allIntersections[i].object), allIntersections[i].object.impactDistance);
                
                    if(i > 0) {
                        clickCount++;
                    }
                }
            }
        }
    }
    
    
    function destroyTarget(clickIntersected) {
        if(clickIntersected.name && clickIntersected.name.toString().indexOf('us') != -1) {
            destroyBonus(clickIntersected);
        }
        else {
            removedTargets++;
            
            // particles
            var particleColor;
            var tenBasedLevel = Math.max(1, level % 10);
            
            removedTargets % 2 == 1 ? particleColor = particlesColors[clickIntersected.name][0] : particleColor = particlesColors[clickIntersected.name][1];
            
            var newParticle = createParticles(clickIntersected, particleColor);
            
            if(newParticle) {
                setTimeout(function() {
                    if(newParticle) {
                        scene.remove(newParticle);
                        newParticle = null;
                    }
                }, 2500);
            }
            
            targets.mesh.splice(clickIntersected.name, 1);
            targets.targetsDirections.splice(clickIntersected.name, 1);
            targets.targetsRotations.splice(clickIntersected.name, 1);
            particlesColors.splice(clickIntersected.name, 1);
            
            scene.remove(clickIntersected);
            
            leveltargetsCount.innerHTML = removedTargets;
            leveltargetsCount.className = 'page-game-count-activated';
            setTimeout(function() {
                leveltargetsCount.className = '';
            }, 400);
            
            // adjust indexes
            for(var i = parseInt(clickIntersected.name); i < targets.mesh.length; i++) {
                var index = parseInt(targets.mesh[i].name);
                index--;
                targets.mesh[i].name = index;
            }
            
            // increase speed
            for(var i = 0; i < targets.targetsDirections.length; i++) {
                targets.targetsDirections[i].x >= 0 ? targets.targetsDirections[i].x += additionnalSpeed : targets.targetsDirections[i].x -= additionnalSpeed;
                targets.targetsDirections[i].y >= 0 ? targets.targetsDirections[i].y += additionnalSpeed : targets.targetsDirections[i].y -= additionnalSpeed;
                targets.targetsDirections[i].z >= 0 ? targets.targetsDirections[i].z += additionnalSpeed : targets.targetsDirections[i].z -= additionnalSpeed;
                
                targets.targetsRotations[i].x >= 0 ? targets.targetsRotations[i].x += additionnalSpeed / 200 : targets.targetsRotations[i].x -= additionnalSpeed / 200;
                targets.targetsRotations[i].y >= 0 ? targets.targetsRotations[i].y += additionnalSpeed / 200 : targets.targetsRotations[i].y -= additionnalSpeed / 200;
                targets.targetsRotations[i].z >= 0 ? targets.targetsRotations[i].z += additionnalSpeed / 200 : targets.targetsRotations[i].z -= additionnalSpeed / 200;
            }
            
            if(!combo.isActive) {
                combo.isActive = true;
                combo.count = 0;
                
                if(combo.timeout) clearTimeout(combo.timeout);
                
                combo.timeout = setTimeout(function() {
                    if(combo.isActive) {
                        combo.isActive = false;
                    }
                }, 2500);
            }

            combo.count++;
            
            if(combo.count >= 5 && combo.isActive) {
                totalScore += 1000;
                                
                combo.text = document.createElement('div');
                combo.text.className = 'game-combo-text';
                combo.text.innerHTML = 'combo x' + combo.count;
                
                wrapper = document.querySelector('.page-game');
                wrapper.appendChild(combo.text);
                
                combo.isActive = false;
            }
            
            // change level
            if(removedTargets == targetsCount) {
                changeLevel();
            }
            else {
                createBonus(clickIntersected);
            }
        }
    }
    
    
    function createBonus(clickIntersected) {
        // do we show a bonus ?
        var showBonus = Math.floor(Math.random() * (30 - 1 + 1)) + 1; // between 20 and 1
        
        var mobileAdaptation = 1;
        if(isMobile) mobileAdaptation = 2;
        
        if(showBonus == 1 && !slowBonus.mesh && targets.mesh.length > 1 && !slowBonus.isActive) {
            
            // bonus
            slowBonus.slowBonusMaterial = new THREE.MeshBasicMaterial({
                //color: 0x63e552,
                map: slowBonus.slowBonusTexture,
            });
            slowBonus.slowBonusGeometry = new THREE.CubeGeometry(maxDeviceSize * mobileAdaptation / 30, maxDeviceSize * mobileAdaptation / 30, maxDeviceSize * mobileAdaptation / 30);
            
            slowBonus.mesh = new THREE.Mesh(slowBonus.slowBonusGeometry, slowBonus.slowBonusMaterial);
            slowBonus.mesh.name = "slowBonus";
            slowBonus.mesh.ref = "slowBonus";
            
            // slow bonus
            slowBonus.directions = {x: (0.2 + 0.8 * Math.random()) - 0.4, y: (0.2 + 0.8 * Math.random()) - 0.4, z: (0.2 + 0.8 * Math.random()) - 0.4};
            slowBonus.mesh.position.x = clickIntersected.position.x;
            slowBonus.mesh.position.y = clickIntersected.position.y;
            slowBonus.mesh.position.z = clickIntersected.position.z;
            
            slowBonus.mesh.rotation.x = (5 + 2 * Math.random()) - 1;
            slowBonus.mesh.rotation.y = (5 + 2 * Math.random()) - 1;
            slowBonus.mesh.rotation.z = (5 + 2 * Math.random()) - 1;
            
            scene.add(slowBonus.mesh);
            
            setTimeout(function() {
                if(slowBonus.mesh) {
                    slowBonus.mesh.material.transparent = true;
                    slowBonus.mesh.material.opacity = 0.5;
                }
                
                setTimeout(function() {
                    
                    if(slowBonus.mesh) {
                        scene.remove(slowBonus.mesh);
                        slowBonus.mesh = null;
                    }
                    
                }, 1000);
            }, 3000);
        }
        else if(showBonus == 2 && !sizeBonus.mesh && targets.mesh.length > 1 && !sizeBonus.isActive) {
            // bonus
            sizeBonus.sizeBonusMaterial = new THREE.MeshBasicMaterial({
                //color: 0xb572e5,
                map: sizeBonus.sizeBonusTexture,
            });
            sizeBonus.sizeBonusGeometry = new THREE.CubeGeometry(maxDeviceSize * mobileAdaptation / 30, maxDeviceSize * mobileAdaptation / 30, maxDeviceSize * mobileAdaptation / 30);
            
            sizeBonus.mesh = new THREE.Mesh(sizeBonus.sizeBonusGeometry, sizeBonus.sizeBonusMaterial);
            sizeBonus.mesh.name = "sizeBonus";
            sizeBonus.mesh.ref = "sizeBonus";
            
            // slow bonus
            sizeBonus.directions = {x: (0.2 + 0.8 * Math.random()) - 0.4, y: (0.2 + 0.8 * Math.random()) - 0.4, z: (0.2 + 0.8 * Math.random()) - 0.4};
            sizeBonus.mesh.position.x = clickIntersected.position.x;
            sizeBonus.mesh.position.y = clickIntersected.position.y;
            sizeBonus.mesh.position.z = clickIntersected.position.z;
            
            sizeBonus.mesh.rotation.x = (5 + 2 * Math.random()) - 1;
            sizeBonus.mesh.rotation.y = (5 + 2 * Math.random()) - 1;
            sizeBonus.mesh.rotation.z = (5 + 2 * Math.random()) - 1;
            
            scene.add(sizeBonus.mesh);
            
            setTimeout(function() {
                if(sizeBonus.mesh) {
                    sizeBonus.mesh.material.transparent = true;
                    sizeBonus.mesh.material.opacity = 0.5;
                }
                
                setTimeout(function() {
                    
                    if(sizeBonus.mesh) {
                        scene.remove(sizeBonus.mesh);
                        sizeBonus.mesh = null;
                    }
                    
                }, 1000);
            }, 3000);
        }
        else if(showBonus == 3 && !blasterBonus.mesh && targets.mesh.length > 1 && !blasterBonus.isActive) {
            // bonus
            blasterBonus.blasterBonusMaterial = new THREE.MeshBasicMaterial({
                //color: 0x2cb2f5,
                map: blasterBonus.blasterBonusTexture,
            });
            blasterBonus.blasterBonusGeometry = new THREE.CubeGeometry(maxDeviceSize * mobileAdaptation / 30, maxDeviceSize * mobileAdaptation / 30, maxDeviceSize * mobileAdaptation / 30);
            
            blasterBonus.mesh = new THREE.Mesh(blasterBonus.blasterBonusGeometry, blasterBonus.blasterBonusMaterial);
            blasterBonus.mesh.name = "blasterBonus";
            blasterBonus.mesh.ref = "blasterBonus";
            
            // slow bonus
            blasterBonus.directions = {x: (0.2 + 0.8 * Math.random()) - 0.4, y: (0.2 + 0.8 * Math.random()) - 0.4, z: (0.2 + 0.8 * Math.random()) - 0.4};
            blasterBonus.mesh.position.x = clickIntersected.position.x;
            blasterBonus.mesh.position.y = clickIntersected.position.y;
            blasterBonus.mesh.position.z = clickIntersected.position.z;
            
            blasterBonus.mesh.rotation.x = (5 + 2 * Math.random()) - 1;
            blasterBonus.mesh.rotation.y = (5 + 2 * Math.random()) - 1;
            blasterBonus.mesh.rotation.z = (5 + 2 * Math.random()) - 1;
            
            scene.add(blasterBonus.mesh);
            
            setTimeout(function() {
                if(blasterBonus.mesh) {
                    blasterBonus.mesh.material.transparent = true;
                    blasterBonus.mesh.material.opacity = 0.5;
                }
                
                setTimeout(function() {
                    
                    if(blasterBonus.mesh) {
                        scene.remove(blasterBonus.mesh);
                        blasterBonus.mesh = null;
                    }
                    
                }, 1000);
            }, 3000);
        }
        else if(showBonus == 4 && !timeMalus.mesh && targets.mesh.length > 1 && !timeMalus.isActive) {
            // bonus
            timeMalus.timeMalusMaterial = new THREE.MeshBasicMaterial({
                //color: 0xff1100,
                map: timeMalus.timeMalusTexture,
            });
            timeMalus.timeMalusGeometry = new THREE.CubeGeometry(maxDeviceSize * mobileAdaptation / 30, maxDeviceSize * mobileAdaptation / 30, maxDeviceSize * mobileAdaptation / 30);
            
            timeMalus.mesh = new THREE.Mesh(timeMalus.timeMalusGeometry, timeMalus.timeMalusMaterial);
            timeMalus.mesh.name = "timeMalus";
            timeMalus.mesh.ref = "timeMalus";
            
            // time malus
            timeMalus.directions = {x: (0.2 + 0.8 * Math.random()) - 0.4, y: (0.2 + 0.8 * Math.random()) - 0.4, z: (0.2 + 0.8 * Math.random()) - 0.4};
            timeMalus.mesh.position.x = clickIntersected.position.x;
            timeMalus.mesh.position.y = clickIntersected.position.y;
            timeMalus.mesh.position.z = clickIntersected.position.z;
            
            timeMalus.mesh.rotation.x = (5 + 2 * Math.random()) - 1;
            timeMalus.mesh.rotation.y = (5 + 2 * Math.random()) - 1;
            timeMalus.mesh.rotation.z = (5 + 2 * Math.random()) - 1;
            
            scene.add(timeMalus.mesh);
            
            setTimeout(function() {
                if(timeMalus.mesh) {
                    timeMalus.mesh.material.transparent = true;
                    timeMalus.mesh.material.opacity = 0.5;
                }
                
                setTimeout(function() {
                    
                    if(timeMalus.mesh) {
                        scene.remove(timeMalus.mesh);
                        timeMalus.mesh = null;
                    }
                    
                }, 1000);
            }, 3000);
        }
    }
    
    
    function destroyBonus(clickIntersected) {
        if(clickIntersected.name == "slowBonus" && slowBonus.mesh) {
            //console.log('slow everything down for 5 sec !');
            
            totalScore += 1000;
            
            wrapper = document.querySelector('.page-game');
            slowBonus.bonusText = document.createElement('div');
            slowBonus.bonusText.className = 'game-bonus-text game-slow-bonus-text';
            slowBonus.bonusText.innerHTML = 'slower';
            
            slowBonus.bonusTextPosition = new THREE.Vector3();

            var widthHalf = 0.5 * spaceWidth;
            var heightHalf = 0.5 * spaceHeight;

            slowBonus.mesh.updateMatrixWorld();
            slowBonus.bonusTextPosition.setFromMatrixPosition(slowBonus.mesh.matrixWorld);
            slowBonus.bonusTextPosition.project(camera);

            slowBonus.bonusTextPosition.x = ( slowBonus.bonusTextPosition.x * widthHalf ) + widthHalf;
            slowBonus.bonusTextPosition.y = - ( slowBonus.bonusTextPosition.y * heightHalf ) + heightHalf;
            
            
            slowBonus.bonusText.style.left = slowBonus.bonusTextPosition.x + 'px';
            slowBonus.bonusText.style.top = slowBonus.bonusTextPosition.y + 'px';
            
            wrapper = document.querySelector('.page-game');
            wrapper.appendChild(slowBonus.bonusText);
            
            removedBonus++;
            
            var slowBonusParticle = createParticles(slowBonus.mesh, 0x63e552);
            
            if(slowBonusParticle) {
                setTimeout(function() {
                    if(slowBonusParticle) {
                        scene.remove(slowBonusParticle);
                        slowBonusParticle = null;
                    }
                }, 2500);
            }
            
            scene.remove(slowBonus.mesh);
            slowBonus.mesh = null;
            
            slowBonus.isActive = true;
            
            additionnalSpeed = additionnalSpeed / 10;
            
            for(var i = 0; i < targets.targetsDirections.length; i++) {
                targets.targetsDirections[i].x = targets.targetsDirections[i].x / 10;
                targets.targetsDirections[i].y = targets.targetsDirections[i].y / 10;
                targets.targetsDirections[i].z = targets.targetsDirections[i].z / 10;
                
                targets.targetsRotations[i].x = targets.targetsRotations[i].x / 10;
                targets.targetsRotations[i].y = targets.targetsRotations[i].y / 10;
                targets.targetsRotations[i].z = targets.targetsRotations[i].z / 10;
            }
            
            setTimeout(function() {
                
                if(slowBonus.isActive) {
                    additionnalSpeed = additionnalSpeed * 10;
                
                    for(var i = 0; i < targets.targetsDirections.length; i++) {
                        targets.targetsDirections[i].x = targets.targetsDirections[i].x * 10;
                        targets.targetsDirections[i].y = targets.targetsDirections[i].y * 10;
                        targets.targetsDirections[i].z = targets.targetsDirections[i].z * 10;
                        
                        targets.targetsRotations[i].x = targets.targetsRotations[i].x * 10;
                        targets.targetsRotations[i].y = targets.targetsRotations[i].y * 10;
                        targets.targetsRotations[i].z = targets.targetsRotations[i].z * 10;
                    }
                }
                
                slowBonus.isActive = false;
                
                if(slowBonus.bonusText) slowBonus.bonusText.remove();
                
            }, 5000);
            
        }
        else if(clickIntersected.name == "sizeBonus" && sizeBonus.mesh) {
            //console.log('increase size for 5 sec !');
            
            totalScore += 1000;
            
            sizeBonus.bonusText = document.createElement('div');
            sizeBonus.bonusText.className = 'game-bonus-text game-size-bonus-text';
            sizeBonus.bonusText.innerHTML = 'bigger';
            
            sizeBonus.bonusTextPosition = new THREE.Vector3();

            var widthHalf = 0.5 * spaceWidth;
            var heightHalf = 0.5 * spaceHeight;

            sizeBonus.mesh.updateMatrixWorld();
            sizeBonus.bonusTextPosition.setFromMatrixPosition(sizeBonus.mesh.matrixWorld);
            sizeBonus.bonusTextPosition.project(camera);

            sizeBonus.bonusTextPosition.x = ( sizeBonus.bonusTextPosition.x * widthHalf ) + widthHalf;
            sizeBonus.bonusTextPosition.y = - ( sizeBonus.bonusTextPosition.y * heightHalf ) + heightHalf;
            
            
            sizeBonus.bonusText.style.left = sizeBonus.bonusTextPosition.x + 'px';
            sizeBonus.bonusText.style.top = sizeBonus.bonusTextPosition.y + 'px';
            
            wrapper = document.querySelector('.page-game');
            wrapper.appendChild(sizeBonus.bonusText);
            
            removedBonus++;
            
            var sizeBonusParticle = createParticles(sizeBonus.mesh, 0xb572e5);
            
            if(sizeBonusParticle) {
                setTimeout(function() {
                    if(sizeBonusParticle) {
                        scene.remove(sizeBonusParticle);
                        sizeBonusParticle = null;
                    }
                }, 2500);
            }
            
            scene.remove(sizeBonus.mesh);
            sizeBonus.mesh = null;
            
            sizeBonus.isActive = true;
            
            setTimeout(function() {
                
                sizeBonus.isActive = false;
                
                if(sizeBonus.bonusText) sizeBonus.bonusText.remove();
                
            }, 5000);
        }
        else if(clickIntersected.name == "blasterBonus" && blasterBonus.mesh) {
            //console.log('blaster laser for 5 sec !');
            
            totalScore += 1000;
            
            blasterBonus.bonusText = document.createElement('div');
            blasterBonus.bonusText.className = 'game-bonus-text game-blaster-bonus-text';
            blasterBonus.bonusText.innerHTML = 'blaster';
            
            blasterBonus.bonusTextPosition = new THREE.Vector3();

            var widthHalf = 0.5 * spaceWidth;
            var heightHalf = 0.5 * spaceHeight;

            blasterBonus.mesh.updateMatrixWorld();
            blasterBonus.bonusTextPosition.setFromMatrixPosition(blasterBonus.mesh.matrixWorld);
            blasterBonus.bonusTextPosition.project(camera);

            blasterBonus.bonusTextPosition.x = ( blasterBonus.bonusTextPosition.x * widthHalf ) + widthHalf;
            blasterBonus.bonusTextPosition.y = - ( blasterBonus.bonusTextPosition.y * heightHalf ) + heightHalf;
            
            
            blasterBonus.bonusText.style.left = blasterBonus.bonusTextPosition.x + 'px';
            blasterBonus.bonusText.style.top = blasterBonus.bonusTextPosition.y + 'px';
            
            wrapper = document.querySelector('.page-game');
            wrapper.appendChild(blasterBonus.bonusText);
            
            removedBonus++;
            
            var blasterBonusParticle = createParticles(blasterBonus.mesh, 0x2cb2f5);
            
            if(blasterBonusParticle) {
                setTimeout(function() {
                    if(blasterBonusParticle) {
                        scene.remove(blasterBonusParticle);
                        blasterBonusParticle = null;
                    }
                }, 2500);
            }
            
            scene.remove(blasterBonus.mesh);
            blasterBonus.mesh = null;
            
            blasterBonus.isActive = true;
            
            setTimeout(function() {
                
                blasterBonus.isActive = false;
                
                if(blasterBonus.bonusText) blasterBonus.bonusText.remove();
                
            }, 5000);
        }
        else if(clickIntersected.name == "timeMalus") {
            //console.log('time malus !');
            
            timeMalus.bonusText = document.createElement('div');
            timeMalus.bonusText.className = 'game-malus-text';
            timeMalus.bonusText.innerHTML = '-5 seconds';
            
            timeMalus.bonusTextPosition = new THREE.Vector3();

            var widthHalf = 0.5 * spaceWidth;
            var heightHalf = 0.5 * spaceHeight;

            timeMalus.mesh.updateMatrixWorld();
            timeMalus.bonusTextPosition.setFromMatrixPosition(timeMalus.mesh.matrixWorld);
            timeMalus.bonusTextPosition.project(camera);

            timeMalus.bonusTextPosition.x = ( timeMalus.bonusTextPosition.x * widthHalf ) + widthHalf;
            timeMalus.bonusTextPosition.y = - ( timeMalus.bonusTextPosition.y * heightHalf ) + heightHalf;
            
            
            timeMalus.bonusText.style.left = timeMalus.bonusTextPosition.x + 'px';
            timeMalus.bonusText.style.top = timeMalus.bonusTextPosition.y + 'px';
            
            wrapper = document.querySelector('.page-game');
            wrapper.appendChild(timeMalus.bonusText);
            
            levelTime -= 5000;
            
            removedBonus++;
            
            var timeMalusParticle = createParticles(timeMalus.mesh, 0xff1100);
            
            if(timeMalusParticle) {
                setTimeout(function() {
                    if(timeMalusParticle) {
                        scene.remove(timeMalusParticle);
                        timeMalusParticle = null;
                    }
                }, 2500);
            }
            
            scene.remove(timeMalus.mesh);
            timeMalus.mesh = null;
            
            timeMalus.isActive = true;
            
            setTimeout(function() {
                
                //timeMalus.isActive = false;
                
                if(timeMalus.bonusText) timeMalus.bonusText.remove();
                
            }, 5000);
        }
    }
    
    
    function createParticles(clickIntersected, particleColor) {
        var particlesGeometry = new THREE.Geometry({ dynamic: true });
                        
        var pMaterial = new THREE.PointsMaterial({
          color: new THREE.Color(particleColor),
          size: 5,
          transparent: true,
          opacity: 0.9
        });

        // now create the individual particles
        if(clickIntersected && clickIntersected.geometry &&  clickIntersected.geometry.parameters) {
            var maxPosition = clickIntersected.geometry.parameters.radius || clickIntersected.geometry.parameters.width || clickIntersected.geometry.parameters.height || 75;
            
            for (var p = 0; p < 50; p++) {
                // create a particle with random positions around target position
                var pX = ((Math.cos(p) * (Math.random() * (maxPosition * 2) - maxPosition)) + clickIntersected.position.x),
                  pY = ((Math.cos(p) * (Math.random() * (maxPosition * 2) - maxPosition)) + clickIntersected.position.y),
                  pZ = ((Math.cos(p) * (Math.random() * (maxPosition * 2) - maxPosition)) + clickIntersected.position.z);
                
                var particle = new THREE.Vector3(pX, pY, pZ);
                // add it to the geometry
                particlesGeometry.vertices.push(particle);
            }
            
            // create the particle system
            particleSystem.push(new THREE.Points(particlesGeometry, pMaterial));
            
            // center of particle system
            particleSystem[particleSystem.length - 1].centerX = clickIntersected.position.x;
            particleSystem[particleSystem.length - 1].centerY = clickIntersected.position.y;
            particleSystem[particleSystem.length - 1].centerZ = clickIntersected.position.z;
            
            particleSystem[particleSystem.length - 1].name = 'particles' + clickIntersected.name;
            
            // add it to the scene
            scene.add(particleSystem[particleSystem.length - 1]);
            
            return particleSystem[particleSystem.length - 1];
        }
        else {
            return false
        }
    }
    
    
    function blasterExplosion() {
        let blasterBonusGeometry = new THREE.SphereGeometry( blasterBonus.range / 1.5, 16, 16 );
        let blasterBonusMaterial = new THREE.MeshBasicMaterial({
            color: 0x2cb2f5,
            transparent: true,
            opacity: 0.5,
            depthWrite: false,
        });
        
        var blasterParticle = blasterParticles(blasterBonusExplosions.length);
        
        if(blasterParticle) {
            setTimeout(function() {
                if(blasterParticle) {
                    scene.remove(blasterParticle);
                    blasterParticle = null;
                }
            }, 2500);
        }
        
        blasterBonusExplosions.push(new THREE.Mesh(blasterBonusGeometry, blasterBonusMaterial));
        blasterBonusExplosions[blasterBonusExplosions.length - 1].name = 'blasterBonusExplosion';
        
        blasterBonusExplosions[blasterBonusExplosions.length - 1].position.x = laser.mesh.position.x;
        blasterBonusExplosions[blasterBonusExplosions.length - 1].position.y = laser.mesh.position.y;
        blasterBonusExplosions[blasterBonusExplosions.length - 1].position.z = 0;
        
        blasterBonusExplosions[blasterBonusExplosions.length - 1].renderOrder = 100;
        
        scene.add(blasterBonusExplosions[blasterBonusExplosions.length - 1]);
        
        return blasterBonusExplosions[blasterBonusExplosions.length - 1];
    }
    
    
    function blasterParticles(index) {
        var particlesGeometry = new THREE.Geometry({ dynamic: true });
                        
        var pMaterial = new THREE.PointsMaterial({
          color: 0x2cb2f5,
          size: 5,
          transparent: true,
          opacity: 0.9
        });

        // now create the individual particles
        var maxPosition = blasterBonus.range;
        var nbParticles = 300;
        if(isMobile) {
            nbParticles = 100;
        }
        
        
        for (var p = 0; p < nbParticles; p++) {
            // create a particle with random positions around target position
            var pX = ((Math.cos(p) * (Math.random() * (maxPosition * 2) - maxPosition)) + laser.mesh.position.x),
              pY = ((Math.cos(p) * (Math.random() * (maxPosition * 2) - maxPosition)) + laser.mesh.position.y),
              pZ = ((Math.cos(p) * (Math.random() * (maxPosition * 2) - maxPosition)));
            
            var particle = new THREE.Vector3(pX, pY, pZ);
            // add it to the geometry
            particlesGeometry.vertices.push(particle);
        }
        
        // create the particle system
        particleSystem.push(new THREE.Points(particlesGeometry, pMaterial));
        
        // center of particle system
        particleSystem[particleSystem.length - 1].centerX = laser.mesh.position.x;
        particleSystem[particleSystem.length - 1].centerY = laser.mesh.position.y;
        particleSystem[particleSystem.length - 1].centerZ = 0;
        
        particleSystem[particleSystem.length - 1].name = 'blasterParticles' + index;
        
        // add it to the scene
        scene.add(particleSystem[particleSystem.length - 1]);
        
        return particleSystem[particleSystem.length - 1];
    }
    
    
    function changeLevel() {
        isChangingLevel = true;
                                
        // stop timer
        timerIsActive = false;
        
        var bonusTexts = document.getElementsByClassName('game-bonus-text');
        while(bonusTexts.length > 0){
            bonusTexts[0].parentNode.removeChild(bonusTexts[0]);
        }
        var malusTexts = document.getElementsByClassName('game-malus-text');
        while(malusTexts.length > 0){
            malusTexts[0].parentNode.removeChild(malusTexts[0]);
        }
        var comboTexts = document.getElementsByClassName('game-combo-text');
        while(comboTexts.length > 0){
            comboTexts[0].parentNode.removeChild(comboTexts[0]);
        }

        if(slowBonus.mesh) {
            slowBonus.mesh = null;
        }
        if(sizeBonus.mesh) {
            sizeBonus.mesh = null;
        }
        if(blasterBonus.mesh) {
            blasterBonus.mesh = null;
        }
        if(timeMalus.mesh) {
            timeMalus.mesh = null;
        }
        slowBonus.isActive = false;
        sizeBonus.isActive = false;
        blasterBonus.isActive = false;
        timeMalus.isActive = false;
        
        // clear scene
        for (let i = scene.children.length - 1; i >= 0 ; i--) {
            let child = scene.children[ i ];
            if(child.name != "laser" && child.type != "Points" && child.name != "blasterBonusExplosion") {
                scene.remove(child);
            }
        }
        
        if(targets.mesh && targets.mesh.length > 0) { // clear scene
            /*targets.forEach(function(v, i) {
               scene.remove(v);
            });*/
            targets.mesh = null;
            targets.mesh = [];
        }
        
        targets.targetsDirections = null;
        targets.targetsDirections = [];
        
        targets.targetsRotations = null;
        targets.targetsRotations = [];
        
        particlesColors = null;
        particlesColors = [];
        
        level++;
        
        //console.log('new level : ', level);
        
        levelCount.innerHTML = '';
        levelCount.innerHTML = 'Level ' + level;
        
        // end level screen before re init
        levelCompleted.innerHTML = 'Level ' + (level - 1) + ' completed !';
        var skillMessage;
        if(levelAccuracy >= 100) {
            skillMessage = 'Perfect !!';
        }
        else if(levelAccuracy >= 85) {
            skillMessage = 'Awesome !';
        }
        else if(levelAccuracy >= 70) {
            skillMessage = 'Nice';
        }
        else if(levelAccuracy >= 50) {
            skillMessage = 'Not bad';
        }
        else if(levelAccuracy >= 30) {
            skillMessage = 'Job\'s done';
        }
        else {
            skillMessage = 'Well... was it too fast ?';
        }
        
        levelSkill.innerHTML = skillMessage;
        levelAccuracyElement.innerHTML = 'Level accuracy : <span>' + parseFloat(levelAccuracy).toFixed(2) + '%</span>';
        
        totalAccuracy += levelAccuracy;
        totalAccuracyElement.innerHTML = 'Total accuracy : <span>' + parseFloat((totalAccuracy / (level - 1))).toFixed(2) + '%</span>';
        
        elapsedTime += levelTime;
        
        
        var levelMinutes = Math.floor(levelTime / 60000);
        if(levelMinutes < 10) levelMinutes = '0' + levelMinutes;
        var levelSeconds = (levelTime / 1000) % 60;
        var levelMs = parseInt((levelSeconds % 1) * 100);
        
        
        
        var elapsedMinutes = Math.floor(elapsedTime / 60000);
        if(elapsedMinutes < 10) elapsedMinutes = '0' + elapsedMinutes;
        var elapsedSeconds = (elapsedTime / 1000) % 60;
        var elapsedMs = parseInt((elapsedSeconds % 1) * 100);
        
        levelSeconds = parseInt(levelSeconds);
        if(levelSeconds < 10) levelSeconds = '0' + levelSeconds;
        if(levelMs < 10) levelMs = '0' + levelMs;
        levelTimerElement.innerHTML = "Level time : <span>" + levelMinutes + ":" + levelSeconds + ":" + levelMs + "</span>";
        
        elapsedSeconds = parseInt(elapsedSeconds);
        if(elapsedSeconds < 10) elapsedSeconds = '0' + elapsedSeconds;
        if(elapsedMs < 10) elapsedMs = '0' + elapsedMs;
        totalTimerElement.innerHTML = "Total time : <span>" + elapsedMinutes + ":" + elapsedSeconds + ":" + elapsedMs + "</span>";
        
        var mobileScore = 1;
        if(isMobile) mobileScore = 0.95; // it's a bit easier on mobile
        
        totalScore += parseInt(((Math.pow(levelAccuracy, 3) * (removedTargets / 2)) / (levelTime * 0.5)) * mobileScore);
        totalScoreElement.innerHTML = 'Total score : <span>' + totalScore + '</span> points';
        
        wrapper = document.querySelector('.page-game');
        wrapper.className = 'page-game page-game-started page-game-level-end-screen';
        
        var bodyClasses = document.body.className;
        
        document.body.className = bodyClasses + " page-transition";
        
        //var endScreen = document.getElementById('page-game-end-level-screen');
        var continueGameButton = document.getElementById('page-game-continue');
        
        setTimeout(function() {
            continueGameButton.addEventListener('click', function continueGame(e) {
                e.preventDefault();
                
                wrapper.className = 'page-game page-game-started page-game-level-end-screen-resume-game';
                
                setTimeout(function() {
                    wrapper.className = 'page-game page-game-started page-game-level-change';
                    setTimeout(function() {
                        wrapper.className = 'page-game page-game-started';
                        document.body.className = bodyClasses;
                    }, 2000);
                    
                    // remove click events handlers
                    continueGameButton.removeEventListener('click', continueGame);
                    
                    ga('send', 'event', 'Game', 'click', 'New level played', level);
                    
                    init(level);
                }, 500);
                
            }, false);
        }, 1500);
    }
    
    
    var start;
    
    function manageTimer() {
        var timerDisplay = document.getElementById('page-game-timer-display');
        
        var timeMalusAccount = 0;
        if(timeMalus.isActive) {
            timeMalusAccount = 5000;
        }
        
        if(timerIsActive) {
            levelTime = new Date().getTime() - start + timeMalusAccount;
        }
        var invertTime = timeLimit - levelTime;
        
        
        var timerSeconds = (invertTime / 1000) % 60;
        var timerMs = parseInt((timerSeconds % 1) * 100);
        timerSeconds = parseInt(timerSeconds);
        if(timerSeconds < 0) timerSeconds = 0;
        if(timerSeconds < 10) timerSeconds = '0' + timerSeconds;
        if(timerMs < 0) timerMs = 0;
        if(timerMs < 10) timerMs = '0' + timerMs;
        
        timerDisplay.innerHTML = timerSeconds + ':' + timerMs;
        
        if(invertTime <= 6000) {
            timerDisplay.className = 'page-game-timer-hurry'
        }
        if(invertTime <= 4000) {
            timerDisplay.className = 'page-game-timer-mega-hurry'
        }
        
        if(levelTime >= timeLimit && timerIsActive && removedTargets != targetsCount) {
            invertTime = 0;
            
            timerDisplay.innerHTML = '00:00';
            //console.log('game over !');
            // clear scene
            shouldRender = false;
            timerIsActive = false;
            
            // display game over screen
            wrapper = document.querySelector('.page-game');
            wrapper.className = "page-game page-game-over";
            
            var gameOverScoreElement = document.getElementById('page-game-over-score');
            totalScore += parseInt(((Math.pow(levelAccuracy, 3) * (removedTargets / 2)) / (timeLimit * 0.5)));

            totalAccuracy += levelAccuracy;
            
            gameOverScoreElement.innerHTML = "You reached level <strong>" + level + "</strong> with a total score of <strong>" + totalScore + "</strong> points and an accuracy of <strong>" + parseFloat(totalAccuracy / level).toFixed(2) + "%</strong>";
            
            
            
            var twitterUrl = 'https://twitter.com/share?url=' + encodeURIComponent(window.location.href) + '&text=I scored ' + totalScore + ' and reached level ' + level + ' of PewPewPew, a WebGL shoot\'em up game&via=webdesign_ml';
			var facebookUrl = 'http://www.facebook.com/sharer.php?u=' + encodeURIComponent(window.location.href) + '&t=I scored ' + totalScore + ' and reached level ' + level + ' of PewPewPew, a WebGL shoot\'em up game';
			
            var twitterShareButton = document.getElementById('twitter-share-button-wrapper');
            twitterShareButton.href = twitterUrl;
            
            var fbShareButton = document.getElementById('fb-share-button-wrapper');
            fbShareButton.href = facebookUrl;
            
            
            
            var tryAgainButton = document.getElementById('page-game-over-try-again');
            setTimeout(function() {
                tryAgainButton.addEventListener('click', function restartGame(e) {
                    
                    for (let i = scene.children.length - 1; i >= 0 ; i--) {
                        let child = scene.children[ i ];
                        scene.remove(child);
                    }
                    
                    var bonusTexts = document.getElementsByClassName('game-bonus-text');
                    while(bonusTexts.length > 0){
                        bonusTexts[0].parentNode.removeChild(bonusTexts[0]);
                    }
                    var malusTexts = document.getElementsByClassName('game-malus-text');
                    while(malusTexts.length > 0){
                        malusTexts[0].parentNode.removeChild(malusTexts[0]);
                    }
                    var comboTexts = document.getElementsByClassName('game-combo-text');
                    while(comboTexts.length > 0){
                        comboTexts[0].parentNode.removeChild(comboTexts[0]);
                    }
                    
                    isChangingLevel = true;
                    levelTime = 0;
                    ga('send', 'event','Game' , 'click', 'Player tried again');
                    
                    initAll();
                    
                    tryAgainButton.removeEventListener('click', restartGame);
                    e.stopPropagation();
                    e.preventDefault();
                });
            }, 2000);
        }
    }
    
    // launch
    try {
        renderer = new THREE.WebGLRenderer( { alpha: true, antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.sortObjects = false;
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.sortObjects = false;
        
        container.appendChild( renderer.domElement );
        
        camera.position.z = 100;
        
        // loading manager
        var loadingIndicationElement = document.getElementById('page-game-baseline');
        var loadingBackground = document.getElementById('page-loading');
        
        var manager = new THREE.LoadingManager();
        manager.onProgress = function ( item, loaded, total ) {
            loadingIndicationElement.innerHTML = 'Loading... ' + parseInt((loaded / total) * 100) + '%';
            
            loadingBackground.style.left = parseInt((loaded / total) * 100) + '%';
            
            if(loaded == total) {
                initAll();
                
                if(isMobile) {
                    loadingIndicationElement.innerHTML = 'Touch a sphere to start the game';
                }
                else {
                    loadingIndicationElement.innerHTML = 'Click on a sphere to start the game';
                }
            }

        };
        
        var textureLoader = new THREE.TextureLoader( manager );
        textureLoader.crossOrigin = '';
        
        textureLoader.load(
            document.location + "images/slow-bonus.jpg",
            function ( texture ) {
                slowBonus.slowBonusTexture = texture;
            }
        );
        
        textureLoader.load(
            document.location + "images/size-bonus.jpg",
            function ( texture ) {
                sizeBonus.sizeBonusTexture = texture;
            }
        );
        
        textureLoader.load(
            document.location + "images/blaster-bonus.jpg",
            function ( texture ) {
                blasterBonus.blasterBonusTexture = texture;
            }
        );
        
        textureLoader.load(
            document.location + "images/time-malus.jpg",
            function ( texture ) {
                timeMalus.timeMalusTexture = texture;
            }
        );
        
        
        
        for(let i = 0; i < 10; i++) {
            
            textureLoader.load(
                document.location + "images/game-background-" + i + ".jpg",
                function ( texture ) {
                    textureArray[i] = texture;
                }
            );
        }

    }
    catch(e) {
        //console.log(e);
        container.style.backgroundImage = 'url(' + imageSrc + ')';
        
        var baseline = document.getElementById('page-game-baseline');
        baseline.innerHTML = 'Your browser does not support webGL, please try with the latest version of Chrome';
    }
}