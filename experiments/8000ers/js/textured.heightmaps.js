/**
 *
 * @author : Martin Laxenaire
 * http://www.martin-laxenaire.fr/
 *
 * This is used to generate and display WebGL objects based on heightmaps
 * mostly based on http://oos.moxiecode.com/js_webgl/terrain/index.html
 *
 * improvements ideas : button to reset camera position
 *
 */

var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;
var FLOOR = -1000;

var container;

var camera;
var scene;
var webglRenderer;

var render_gl = 1;
var has_gl = false;

var r = 0;

var sphereMesh;
var textureCube;
var waterMesh;

var ratioX = 0;
var ratioY = 0;

var planeMesh;
var groundMesh;

var heightMapSize = 256;
var textureQuality;

var infoScroll, menuScroll, aboutScroll;

var plane;
var moutainShaderMaterial


var vs = `
    varying vec3 vVertexPosition;
    varying vec2 vUv;

    void main() {
        vVertexPosition = position;
        vUv = uv;

        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
`;

var fs = `
    varying vec3 vVertexPosition;
    varying vec2 vUv;

    uniform sampler2D map;
    uniform sampler2D route;
    
    uniform float uShowRoute;

    // fog
    uniform vec3 fogColor;
    uniform float fogNear;
    uniform float fogFar;

    void main() {
        vec4 mapTexture = texture2D(map, vUv);
        vec4 routeTexture = texture2D(route, vUv);
        
        vec4 finalColor = mix(mapTexture, routeTexture, routeTexture.a * uShowRoute);

        gl_FragColor = finalColor;

        // fog
        #ifdef USE_FOG
            #ifdef USE_LOGDEPTHBUF_EXT
                float depth = gl_FragDepthEXT / gl_FragCoord.w;
            #else
                float depth = gl_FragCoord.z / gl_FragCoord.w;
            #endif
            float fogFactor = smoothstep( fogNear, fogFar, depth );
            gl_FragColor.rgba = mix( gl_FragColor.rgba, vec4(fogColor, 1.0), fogFactor );
        #endif
    }
`;

var perf = 4;
checkPerf();

init();
animate();
	

function checkPerf() {
    var start = (performance || Date).now();
    var count = 0;
    for(var i = 0; i < 2000000; i++) {
        count++;
    }

    var end = (performance || Date).now() - start;

    if(end < 2) {
        perf = 0;
    }
    else if(end < 5) {
        // good
        perf = 1;
    }
    else if(end < 10) {
        // medium
        perf = 2;
    }
    else if(end < 20) {
        // low
        perf = 3;
    }
    else {
        // bad
        perf = 4;
    }
}

function setDetailLevel() {
	
	/* if(aboutScroll) {
		aboutScroll.refresh();
	} */
	
	if(perf >= 3) {
		heightMapSize = 64;
		textureQuality = "-medium";
	}
	else if(perf === 2) {
		heightMapSize = 128;
		textureQuality = "-medium";
	}
	else if(perf === 1) {
		heightMapSize = 128;
		textureQuality = "";
	}
	else { // CPU is a beast!
		heightMapSize = 256;
		textureQuality = "";
	}
	
	if(infoScroll) {
		infoScroll.refresh();
	}
	
	if(menuScroll) {
		menuScroll.refresh();
	}
}


function addMesh( geometry, scale, x, y, z, rx, ry, rz, material ) {
	
	mesh = new THREE.Mesh( geometry, material );
	mesh.scale.x = mesh.scale.y = mesh.scale.z = scale;
	mesh.position.x = x;
	mesh.position.y = y;
	mesh.position.z = z;
	mesh.rotation.x = rx;
	mesh.rotation.y = ry;
	mesh.rotation.z = rz;
	mesh.overdraw = true;
	mesh.doubleSided = false;
	mesh.updateMatrix();

	scene.add(mesh);

	return mesh;
}
	

function init() {
	
	setDetailLevel();
	
	container = document.getElementById('container');
	
	var aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

	camera = new THREE.PerspectiveCamera( 75, aspect, 1, 100000 );
	camera.position.z = 4250;
	camera.position.x = 0;
	camera.position.y = FLOOR+4750;
	
	scene = new THREE.Scene();

	scene.fog = new THREE.Fog( 0xe7e7e7, 4500, 12500 );

    // plane
    plane = new THREE.PlaneGeometry( 150, 150, heightMapSize-1, heightMapSize-1 );

    moutainShaderMaterial = new THREE.ShaderMaterial({
        vertexShader: vs,
        fragmentShader: fs,
        uniforms: {
            map: {
                value: null,
            },
            route: {
                value: null,
            },
            fogColor: {
                type: "c",
                value: scene.fog.color
            },
            fogNear: {
                type: "f",
                value: scene.fog.near
            },
            fogFar: {
                type: "f",
                value: scene.fog.far
            },
            uShowRoute: {
                value: 0,
            }
        },
        fog: true,
        //side: THREE.DoubleSide,
    });
	
	//ground
	var ground = new THREE.PlaneGeometry( 3000, 3000 );
	groundMesh = addMesh( ground, 10,  0, FLOOR, 0, -1.57,0,0, new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load( "images/pictures/clouds-picture.jpg" )}) );
	
	try {
		webglRenderer = new THREE.WebGLRenderer( { scene: scene, alpha: true, antialiasing: true } );
		webglRenderer.setClearColor( 0xe7e7e7, 0);
		//webglRenderer.setFaceCulling(0);
		webglRenderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
		container.appendChild( webglRenderer.domElement );
		has_gl = true;
	}
	catch (e) {
		// need webgl
		render_gl = 0;
		return;
	}
	
	var orbit = new THREE.OrbitControls( camera, webglRenderer.domElement );
	//orbit.enableZoom = false;
	orbit.enablePan = false;
	orbit.maxPolarAngle = Math.PI/2; 
	
	orbit.maxDistance = 7750;
	orbit.minDistance = 3875;
	
	window.addEventListener( 'resize', onWindowResize, false );
}

function getHeightData(img, imgSize) {
	var canvas = document.createElement( 'canvas' );
	
	var size;
	if(imgSize) {
		size = imgSize * imgSize, data = new Float32Array( size );
		canvas.width = imgSize;
		canvas.height = imgSize;
	}
	else {
		size = heightMapSize * heightMapSize, data = new Float32Array( size );
		canvas.width = heightMapSize;
		canvas.height = heightMapSize;
	}
	
	var context = canvas.getContext( '2d' );

	context.drawImage(img,0,0);

	for ( var i = 0; i < size; i ++ ) {
		data[i] = 0
	}
	
	var imgd;
	if(imgSize) {
		imgd = context.getImageData(0, 0, imgSize, imgSize);
	}
	else {
		imgd = context.getImageData(0, 0, heightMapSize, heightMapSize);
	}
	
	var pix = imgd.data;

	var j=0;
	for (var i = 0, n = pix.length; i < n; i += (4)) {
		var all = pix[i]+pix[i+1]+pix[i+2];
		data[j++] = all/30;
	}

	return data;
}

function animate() {
	requestAnimationFrame( animate );
	loop();
}

function loop() {

	if ( render_gl && has_gl ) {
		webglRenderer.render( scene, camera );
	}

}

function loadMountain(mountain) {
	
	container.className = 'switching';
	
	if(planeMesh) { // remove previous mountain
		var selectedObject = scene.getObjectByName(planeMesh.name);
		scene.remove( selectedObject );
	}
	
	// new object
	// terrain
	var img = new Image();
	img.onload = function () {
		var data = getHeightData(img);

        plane.verticesNeedUpdate  = true;
		for ( var i = 0, l = plane.vertices.length; i < l; i++ ) {
			plane.vertices[i].z = data[i] * 1.5; // 150% map 
		}

        var textures = [];

        function displayMountain() {
            if(textures.length === 2) {
                for(var i = 0; i < textures.length; i++) {
                    if(textures[i].name === "mountain") {
                        moutainShaderMaterial.uniforms.map.value = textures[i].value;
                    }
                    else {
                        moutainShaderMaterial.uniforms.route.value = textures[i].value;
                    }
                }


                planeMesh = addMesh( plane, 100,  0, FLOOR, 0, -1.57,0,0, moutainShaderMaterial );

                planeMesh.name = mountain;
                planeMesh.material.opacity = 1;

                if(camera && camera.target && camera.target.position) {
                    camera.target.position.copy( planeMesh );
                }

                container.className = '';

                if(infoScroll) {
                    infoScroll.refresh();
                }
            }
        }
		
		var mountainTextureLoader = new THREE.TextureLoader();

        mountainTextureLoader.load(
            "images/pictures/" + mountain + "-picture" + textureQuality + ".jpg",
            function ( texture ) {
                textures.push({
                    name: "mountain",
                    value: texture,
                });

                displayMountain();
            }
        );

        var routesTextureLoader = new THREE.TextureLoader();

        routesTextureLoader.load(
            "images/routes/" + mountain + "-routes.png",
            function ( texture ) {
                textures.push({
                    name: "route",
                    value: texture,
                });

                displayMountain();
            }
        );
		
	};
	img.src = "images/heightmaps/" + mountain + "-" + heightMapSize + ".jpg";
}

function loadRoutes(mountain) {
    if(planeMesh) {
        planeMesh.material.uniforms.uShowRoute.value = 1;
        document.getElementById('toggle-' + mountain + '-routes').className = "toggle-routes active";
    }
}

function removeRoutes() {
    if(planeMesh) {
        planeMesh.material.uniforms.uShowRoute.value = 0;
    }
}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	webglRenderer.setSize( window.innerWidth, window.innerHeight );
	
	setDetailLevel();
}