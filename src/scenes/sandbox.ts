import * as BABYLON from "@babylonjs/core";
import { CreateSceneClass } from "../createScene";
import { config } from "../config";
// required imports
import "@babylonjs/loaders/glTF";

// digital assets
import texture from '../../assets/grass.jpg';

export class BlenderHouseScene implements CreateSceneClass {
    createScene = async (
        engine: BABYLON.Engine,
        canvas: HTMLCanvasElement
    ): Promise<BABYLON.Scene> => {
        // This creates a basic Babylon Scene object (non-mesh)
        	// Get the canvas element from the DOM.
        
        // This creates a basic Babylon Scene object (non-mesh)
        const scene : BABYLON.Scene = new BABYLON.Scene(engine);

        //Playground demands a camera made before the executeWhenReady/loading scene from file
        const camera : BABYLON.UniversalCamera = new BABYLON.UniversalCamera("unicam", new BABYLON.Vector3(0,0,0), scene);
        
        BABYLON.SceneLoader.loggingLevel = BABYLON.SceneLoader.DETAILED_LOGGING;
        const importResult : BABYLON.SceneLoader = await BABYLON.SceneLoader.AppendAsync("",config.houseFile,scene);
        
        scene.executeWhenReady(() =>{
            scene.gravity = new BABYLON.Vector3(0, -9.81, 0);
            scene.collisionsEnabled = true;

            this.activateCamera(canvas, scene, camera);
            
            //Skybox
            var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:1000.0}, scene);
            var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
            skyboxMaterial.backFaceCulling = false;
            skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("https://dl.dropboxusercontent.com/s/nh1612z2lnbl1uk/Skybox.jpg?dl=0", scene);
            skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
            skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
            skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
            skybox.material = skyboxMaterial;

            this.generateGround(scene);
            this.generateSun(scene);

            //Mesh loop
            this.modifyMeshes(scene);
        
        });
        const pipeline = this.renderPipeline;
        scene.registerBeforeRender(function(){
        });
        console.log("End");
        return scene;
    };

    private generateSun(scene: BABYLON.Scene): void
    {
        //lights
        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        const light : BABYLON.DirectionalLight = new BABYLON.DirectionalLight(config.light.sun.name,
            new BABYLON.Vector3(
                config.light.sun.direction.x,
                config.light.sun.direction.y,
                config.light.sun.direction.z),
                scene);

        light.position = new BABYLON.Vector3(
            config.light.sun.position.x,
            config.light.sun.position.y,
            config.light.sun.position.z);

        // Default intensity is 1. Let's dim the light a small amount
        light.intensity =  config.light.sun.intensity;
        light.range = config.light.sun.range;
    }

    private generateGround(scene: BABYLON.Scene): void
    {
        var ground : BABYLON.Mesh = BABYLON.Mesh.CreateGround('ground', config.groundSize, config.groundSize, 2, scene);

        var groundMaterial: any = new BABYLON.StandardMaterial('groundMaterial', scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture(texture, scene);
        //Adding some metallic glance
        groundMaterial.specularPower = 100;
        //u and v-scale is how many times the textrue is repeated
        groundMaterial.diffuseTexture.uScale = config.groundSize/3;
        groundMaterial.diffuseTexture.vScale = config.groundSize/3;

        ground.material = groundMaterial;
        ground.position = new BABYLON.Vector3(0,-0.1, 0);
        ground.checkCollisions = true;
    }

    private modifyMeshes(scene: BABYLON.Scene): void
    {
        scene.meshes.forEach(function(m){
            //Collision for everything except doors
            if(!(m.id.startsWith(config.collsion.doorId) || m.id.startsWith(config.collsion.handleId))){
                m.checkCollisions = true;
            }

            //Make windows transparent
            if(m.id.startsWith(config.transparency.windowId)){
                try {
                    m.visibility = config.transparency.visibilityValue;
                }
                catch (e){
                    console.log(m.id,e);
                }
            }
        });
    }

    private activateCamera(canvas: HTMLCanvasElement, scene: BABYLON.Scene, camera: BABYLON.UniversalCamera): void
    {
        const cameraSpeed = 0.2;
        const cameraCollision = new BABYLON.Vector3(0.3, 0.85, 0.4);
        //Camera
        scene.activeCamera = camera;
        scene.activeCamera.attachControl(canvas);
        camera.applyGravity = true;
        //Set the ellipsoid around the camera (e.g. your player's size)
        camera.ellipsoid = cameraCollision;
        camera.checkCollisions = true;
        camera.speed = cameraSpeed;

        var spawnlocation = scene.getMeshByName(config.camera.spawn.Location);
        if (spawnlocation != null)
        {
            camera.position = spawnlocation.absolutePosition;
        }
        else
        {
            camera.position.y = config.camera.spawn.y;
            camera.position.z = config.camera.spawn.z;
            camera.position.x = config.camera.spawn.x;
        }
    }

    private renderPipeline(scene: BABYLON.Scene, camera: BABYLON.UniversalCamera): BABYLON.DefaultRenderingPipeline
    {
        //Rendering pipeline
        const pipeline : BABYLON.DefaultRenderingPipeline = new BABYLON.DefaultRenderingPipeline(
            "defaultPipeline", // The name of the pipeline
            true, // Do you want the pipeline to use HDR texture?
            scene, // The scene instance
            [camera] // The list of cameras to be attached to
            );
            //Depth of field breaks the windows for some reason
            //pipeline.depthOfFieldEnabled = true;
            //pipeline.depthOfFieldBlurLevel = BABYLON.DepthOfFieldEffectBlurLevel.Low;
            pipeline.bloomEnabled = true;
            pipeline.samples = 4;
        
        return pipeline;
    }

}

export default new BlenderHouseScene();
