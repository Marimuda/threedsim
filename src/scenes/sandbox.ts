import * as BABYLON from "@babylonjs/core";
import { CreateSceneClass } from "../createScene";
import { config } from "../config";
import { sceneConfig } from "./sceneConfig";
import { AssetLoading } from "../assetLoading";
// required imports
import "@babylonjs/loaders/glTF";
import "@babylonjs/inspector";

// digital assets
import texture from '../../assets/grass.jpg';
//import * as Asset from '../../assets/';

export class BlenderHouseScene implements CreateSceneClass {
    createScene = async (
        engine: BABYLON.Engine,
        canvas: HTMLCanvasElement
    ): Promise<BABYLON.Scene> => {

        const scene : BABYLON.Scene = new BABYLON.Scene(engine);

        if (config.beforeAfterMode){
            const afterScene : BABYLON.Scene = new BABYLON.Scene(engine);
        }

        if (config.debugMode){
            scene.debugLayer.show();
            BABYLON.SceneLoader.loggingLevel = BABYLON.SceneLoader.DETAILED_LOGGING;
        }

        const camera : BABYLON.UniversalCamera = new BABYLON.UniversalCamera("unicam", new BABYLON.Vector3(0,0,0), scene);
        const importResult : BABYLON.SceneLoader = await BABYLON.SceneLoader.AppendAsync(
            "",
            config.houseFile,
            scene,
        );
    
        scene.executeWhenReady(() =>{
            scene.gravity = new BABYLON.Vector3(0, -9.81, 0);
            scene.collisionsEnabled = true;

            this.activateCamera(canvas, scene, camera);
            this.generateSkybox(scene);
            this.generateGround(scene);
            this.generateSun(scene);

            //Mesh loop
            this.modifyMeshes(scene);
        });

        if (config.beforeAfterMode){
            //initiateAfterScene();
        }

        const pipeline = this.renderPipeline;
        scene.registerBeforeRender(function()
        {

        });
        return scene;
    };

    private generateSkybox(scene: BABYLON.Scene): void
    {
        let skybox = BABYLON.MeshBuilder.CreateBox(
            "skybox",
            {size: sceneConfig.skybox.size},
            scene);

        let skyboxMaterial = new BABYLON.StandardMaterial("skybox", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(config.path + sceneConfig.skybox.texture, scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        //skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        //skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;
    }

    private generateSun(scene: BABYLON.Scene): void
    {
        //lights
        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        const light : BABYLON.DirectionalLight = new BABYLON.DirectionalLight(sceneConfig.light.sun.name,
            new BABYLON.Vector3(
                sceneConfig.light.sun.direction.x,
                sceneConfig.light.sun.direction.y,
                sceneConfig.light.sun.direction.z),
                scene);

        light.position = new BABYLON.Vector3(
            sceneConfig.light.sun.position.x,
            sceneConfig.light.sun.position.y,
            sceneConfig.light.sun.position.z);

        // Default intensity is 1. Let's dim the light a small amount
        light.intensity =  sceneConfig.light.sun.intensity;
        light.range = sceneConfig.light.sun.range;

        let skyLight : BABYLON.HemisphericLight = new BABYLON.HemisphericLight(sceneConfig.light.skyLight.name,
            new BABYLON.Vector3(
                sceneConfig.light.skyLight.direction.x,
                sceneConfig.light.skyLight.direction.y,
                sceneConfig.light.skyLight.direction.z),
                scene);
        skyLight.intensity = sceneConfig.light.skyLight.intensity;

        let groundLight : BABYLON.HemisphericLight = new BABYLON.HemisphericLight(sceneConfig.light.groundLight.name,
            new BABYLON.Vector3(
                sceneConfig.light.groundLight.direction.x,
                sceneConfig.light.groundLight.direction.y,
                sceneConfig.light.groundLight.direction.z),
                scene);
        groundLight.intensity = sceneConfig.light.groundLight.intensity;
    }

    private generateGround(scene: BABYLON.Scene): void
    {
        let ground : BABYLON.Mesh = BABYLON.Mesh.CreateGround('ground', sceneConfig.ground.size, sceneConfig.ground.size, 2, scene);

        let groundMaterial: any = new BABYLON.StandardMaterial('groundMaterial', scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture(sceneConfig.ground.texture, scene);
        groundMaterial.specularPower = 100;
        //u and v-scale is how many times the textrue is repeated
        groundMaterial.diffuseTexture.uScale = sceneConfig.ground.size/3;
        groundMaterial.diffuseTexture.vScale = sceneConfig.ground.size/3;

        ground.material = groundMaterial;
        ground.position = new BABYLON.Vector3(0,-0.1, 0);
        ground.checkCollisions = true;
    }

    private modifyMeshes(scene: BABYLON.Scene): void
    {
        scene.meshes.forEach((m) =>{
            let h = m.material;
            this.assignLightmapOnMaterial(<BABYLON.StandardMaterial> m.material);

            //Collision for everything except doors
            if(!(m.id.startsWith(sceneConfig.collsion.doorId) || m.id.startsWith(sceneConfig.collsion.handleId))){
                m.checkCollisions = true;
            }

            //Make windows transparent
            if(m.id.startsWith(sceneConfig.transparency.windowId)){
                try {
                    m.visibility = sceneConfig.transparency.visibilityValue;
                }
                catch (e){
                    console.log(m.id,e);
                }
            }
        });
    }

    private activateCamera(canvas: HTMLCanvasElement, scene: BABYLON.Scene, camera: BABYLON.UniversalCamera): void
    {
        let cameraCollision = new BABYLON.Vector3(sceneConfig.camera.collision.x, sceneConfig.camera.collision.y, sceneConfig.camera.collision.z);
        camera.ellipsoid = cameraCollision;

        camera.applyGravity = true;
        camera.checkCollisions = true;
        camera.fov = sceneConfig.camera.fov;
        camera.minZ = sceneConfig.camera.minZ;
        camera.speed = sceneConfig.camera.speed;

        scene.activeCamera = camera;
        scene.activeCamera.attachControl(canvas);

        let spawnlocation = scene.getMeshByName(sceneConfig.camera.spawn.Location);
        if (spawnlocation != null)
        {
            camera.position = spawnlocation.absolutePosition;
        }
        else
        {
            camera.position.y = sceneConfig.camera.spawn.y + 20;
            camera.position.z = sceneConfig.camera.spawn.z;
            camera.position.x = sceneConfig.camera.spawn.x;
        }
    }

    private assignLightmapOnMaterial(material: BABYLON.Material): void
    {

        //material.lightmapTexture = config.lightmaps;
        //let castedTexture = <BABYLON.Texture> material.lightmapTexture;

        //reverse vscale or its the wrong way
        //castedTexture.vScale = -1;

        //material.lightmapTexture.coordinatesIndex = 0;
        //material.useLightmapAsShadowmap = true;
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
            pipeline.bloomEnabled = false;
            pipeline.samples = 4;
        
        return pipeline;
    }

}

export default new BlenderHouseScene();
