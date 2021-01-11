import {WEBGL} from 'three/examples/jsm/WebGL';

import WebglEffectRenderController from './3d/webgl-effect-render-controller';

import PlaneScene from './3d/webgl-plane-view';

import Stages3DView from './3d/stages-3d-view';

import GradientBgStage from './3d/gradient-bg-stage';

import CameraRigAddon, {set3dStagesPosition} from './3d/camera-rig-addon';

// Флаги для управления версиями сборки:
// - для просмотра работы над растровым эффектом поверх макета одной из сцен:
// has3dScene = false;
// hasCameraRig = false;
// hasEffect = true;
// - для просмотра работы над составом сцен:
// has3dScene = true;
// hasCameraRig = false;
// hasEffect = false;
// - для просмотра работы над движением камеры между сценами:
// has3dScene = true;
// hasCameraRig = true;
// hasEffect = false;
// - для просмотра полной сборки со сценами, движением камеры и растровым эффектом поверх:
// has3dScene = true;
// hasCameraRig = true;
// hasEffect = true;

const has3dScene = true;
const hasCameraRig = true;
const hasEffect = true;

// Карты соответствия идентификаторов разделов сайта и состояний сцен 3d-фона
const object3dSchema = {
  'top': `stage1`,
  'about': `stage2`,
  'numbers': `stage3`,
  'show': `stage4`,
  'mc': `stage5`,
  'map': `stage6`,
  'tickets': `stage6`
};

const effectStateSchema = {
  'top': `default`,
  'about': `default`,
  'numbers': `default`,
  'show': `default`,
  'mc': `off`,
  'map': `off`,
  'tickets': `off`
};

const globalStateStorage = {
  screenName: 'top',
  slideId: -1
};

const updateGlobalState = (evt) => {
  const {screenName, slideId} = evt.detail;

  if (typeof screenName !== `undefined`) {
    globalStateStorage.screenName = screenName;
  }
  if (typeof slideId !== `undefined` && slideId > -1) {
    globalStateStorage.slideId = slideId;
  }
};

document.body.addEventListener(`screenChanged`, updateGlobalState);

const appendRendererToDOMElement = (object, targetNode) => {
  if (!object.renderer) return;
  targetNode.appendChild(object.renderer.domElement);
};

class ThreeBackground {
  constructor() {
    // Флаг, определяющий версию сцен: 
    // - с рендерингом материалов на основе данных о свете:
    // isLightMode = false;
    // - с материалами THREE.MeshMatcapMaterial:
    // isLightMode = true;

    const isLightMode = window.innerWidth < 1025 && window.innerHeight < 1025;

    const view3d = has3dScene ? new Stages3DView({isLightMode}) : new PlaneScene();

    if (WEBGL.isWebGLAvailable()) {
      if (has3dScene && hasCameraRig) {
        set3dStagesPosition(view3d);
        view3d.installAddOn(new CameraRigAddon());
      }

      // Для Desktop добавляем эффект шума
      if (hasEffect && !isLightMode) {
        const composerController = new WebglEffectRenderController(view3d.renderer, view3d.scene, view3d.camera);

        view3d.setRenderFunction(() => {
          composerController.render();
        });

        this.composerController = composerController;
      } else {
        const bgView = new GradientBgStage();
        this.bgView = bgView;

        view3d.setRenderFunction(() => {
          view3d.renderer.render(bgView.scene, bgView.camera);
          view3d.renderer.autoClear = false;
          view3d.renderer.render(view3d.scene, view3d.camera);
          view3d.renderer.autoClear = true;
        });
      }

      appendRendererToDOMElement(view3d, document.querySelector(`.animation-screen`));

      this.view3d = view3d;
    }
  }

  async load() {
    await this.view3d.load();
  }

  start() {
    const {view3d} = this;

    this.addListeners();
    document.body.removeEventListener(`screenChanged`, updateGlobalState);

    view3d.start();
  }

  addListeners() {
    const {view3d, composerController} = this;

    if (has3dScene) {
      // Устанавливаем текущее состояние, соотвествующее разделу
      view3d.setState(object3dSchema[globalStateStorage.screenName], globalStateStorage.slideId);
      
      // Добавляем слушателя кастомного события screenChanged
      document.body.addEventListener(`screenChanged`, (evt) => {
        updateGlobalState(evt);
        view3d.setState(object3dSchema[globalStateStorage.screenName], globalStateStorage.slideId);
      });
    }

    if (composerController) {
      // Устанавливаем текущее состояние
      composerController.setState(effectStateSchema[globalStateStorage.screenName]);

      // Добавляем слушателя
      document.body.addEventListener(`screenChanged`, (evt) => {
        composerController.setState(effectStateSchema[evt.detail.screenName], -1);
      });
    }
  }
}

export default ThreeBackground;
