
// required imports
import "@babylonjs/core/Loading/loadingScreen";
import "@babylonjs/loaders/glTF";
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Materials/Textures/Loaders/envTextureLoader";
import '@babylonjs/core/Meshes/meshBuilder';
import '@babylonjs/core/Collisions/collisionCoordinator';

import { CreateSceneClass } from "../createScene";
import { config } from "../config";
// required imports
import "@babylonjs/loaders/glTF";

// digital assets
import texture from '../../assets/grass.jpg';
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { DefaultRenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline";

export class BlenderHouseScene implements CreateSceneClass {
    createScene = async (
        engine: Engine,
        canvas: HTMLCanvasElement
    ): Promise<Scene> => {
        // This creates a basic Babylon Scene object (non-mesh)
        	// Get the canvas element from the DOM.
        
        // This creates a basic Babylon Scene object (non-mesh)
        const scene : Scene = new Scene(engine);

        //Playground demands a camera made before the executeWhenReady/loading scene from file
        const camera : UniversalCamera = new UniversalCamera("unicam", new Vector3(0,0,0), scene);
        
        SceneLoader.loggingLevel = SceneLoader.DETAILED_LOGGING;
        const importResult : SceneLoader = await SceneLoader.AppendAsync("",config.houseFile,scene);
        
        scene.executeWhenReady(() =>{
            scene.gravity = new Vector3(0, -9.81, 0);
            scene.collisionsEnabled = true;

            this.activateCamera(canvas, scene, camera);   
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

    private generateSun(scene: Scene): void
    {
        //lights
        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        const light : DirectionalLight = new DirectionalLight(config.light.sun.name,
            new Vector3(
                config.light.sun.direction.x,
                config.light.sun.direction.y,
                config.light.sun.direction.z),
                scene);

        light.position = new Vector3(
            config.light.sun.position.x,
            config.light.sun.position.y,
            config.light.sun.position.z);

        // Default intensity is 1. Let's dim the light a small amount
        light.intensity =  config.light.sun.intensity;
        light.range = config.light.sun.range;
    }

    private generateGround(scene: Scene): void
    {
        var ground : Mesh = Mesh.CreateGround('ground', config.groundSize, config.groundSize, 2, scene);

        var groundMaterial: any = new StandardMaterial('groundMaterial', scene);
        groundMaterial.diffuseTexture = new Texture(texture, scene);
        //Adding some metallic glance
        groundMaterial.specularPower = 100;
        //u and v-scale is how many times the textrue is repeated
        groundMaterial.diffuseTexture.uScale = config.groundSize/3;
        groundMaterial.diffuseTexture.vScale = config.groundSize/3;

        ground.material = groundMaterial;
        ground.position = new Vector3(0,-0.1, 0);
        ground.checkCollisions = true;
    }

    private modifyMeshes(scene: Scene): void
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

    private activateCamera(canvas: HTMLCanvasElement, scene: Scene, camera: UniversalCamera): void
    {
        const cameraSpeed = 0.2;
        const cameraCollision = new Vector3(0.3, 0.85, 0.4);
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

    private renderPipeline(scene: Scene, camera: UniversalCamera): DefaultRenderingPipeline
    {
        //Rendering pipeline
        const pipeline : DefaultRenderingPipeline = new DefaultRenderingPipeline(
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
