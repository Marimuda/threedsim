export const config = {
    camera: {
        spawn: {
            x: -10,
            y: 1.8,
            z: 5,
            Location: "Door.003_primitive0",
        }
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
            range: 10,
        },
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
    groundSize: 100,
    houseFile: "https://dl.dropboxusercontent.com/s/ebj276egud3tq5f/Husv1.2K.glb",
    skybox: "../assets/skybox2"
};