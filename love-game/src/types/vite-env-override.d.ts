declare module '*.glsl' {
    const value: string;
    export default value;
}

declare module '*.glb' {
    const src: string
    export default src
}

declare module '*.fbx' {
    const src: string
    export default src
}

declare module "stats-gl" {
    const Stats: any;
    export default Stats;
  }
  
  declare module "dat.gui" {
    const GUI: any;
    export { GUI };
  }
  
  declare module "three/examples/jsm/loaders/GLTFLoader.js" {
    export { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
  }
  
  declare module "three/examples/jsm/math/MeshSurfaceSampler.js" {
    export { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler";
  }
  
  declare module "three/examples/jsm/controls/FirstPersonControls.js" {
    export { FirstPersonControls } from "three/examples/jsm/controls/FirstPersonControls";
  }
  
  declare module 'dat.gui' {
    export class GUIController {
        // 根据需要声明相关方法和属性
    }
}