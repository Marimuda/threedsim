import grass from '../../assets/grass.jpg';
import skybox from '../../assets/skybox.png';
//import * as ASSETS from '../../assets';
//import { assets } from "../../assets";


export const sceneConfig = {
    skybox: {
        size: 1000,
        texture: '../../assets/grass.jpg', //"../assets/skybox2"
        //inclination: 0,
        //turbidity: 0,
    },
    camera: {
        spawn: {
            x: -10,
            y: 1.8,
            z: 5,
            Location: "Door.003_primitive0",
        },
        collision: {
            x: 0.1,
            y: 0.7,
            z: 0.2,
        },
        minZ: 0.1,
        fov: 0.80,
        speed: 0.2,
    },
    light: {
        sun: {
            name: "sunLight",
            position: {
                x: 0,
                y: 10,
                z: -50,
            },
            direction: {
                x: 0,
                y: -20,
                z: 5,
            },
            intensity: 0.7,
            range: 100,
        },
        groundLight: {
            name: "groundLight",
            direction: {
                x: -1,
                y: -1,
                z: 0,
            },
            intensity: 0.4,
        },
        skyLight: {
            name: "skyLight",
            direction: {
                x: 1,
                y: 1,
                z: 0,
            },
            intensity: 0.8,
        }
    },
    collsion: {
        doorId : "Door",
        handleId : "Handle",
    },
    transparency: {
        visibilityValue: 0.4,
        windowId : "Window glass",
    },
    gravity: -9.81,
    ground: {
        texture: grass,
        size: 100,
    }
}