// iOS 27 requires the scene-based life cycle. app.json declares
// `$(PRODUCT_MODULE_NAME).SceneDelegate` in UIApplicationSceneManifest; this plugin
// generates that class (on top of Expo's ExpoAppSceneDelegate) so prebuild can't drop it.
const fs = require('fs');
const path = require('path');
const {
  withAppDelegate,
  withDangerousMod,
  withXcodeProject,
  IOSConfig,
} = require('expo/config-plugins');

const SCENE_DELEGATE_SOURCE = `internal import Expo

// Creates the window and starts React Native for each connected scene.
class SceneDelegate: ExpoAppSceneDelegate {}
`;

const withSceneDelegateFile = (config) =>
  withDangerousMod(config, [
    'ios',
    (cfg) => {
      const projectName = IOSConfig.XcodeUtils.getProjectName(cfg.modRequest.projectRoot);
      const file = path.join(cfg.modRequest.platformProjectRoot, projectName, 'SceneDelegate.swift');
      fs.writeFileSync(file, SCENE_DELEGATE_SOURCE);
      return cfg;
    },
  ]);

const withSceneDelegateInProject = (config) =>
  withXcodeProject(config, (cfg) => {
    const projectName = IOSConfig.XcodeUtils.getProjectName(cfg.modRequest.projectRoot);
    const filepath = `${projectName}/SceneDelegate.swift`;
    if (!cfg.modResults.hasFile(filepath)) {
      IOSConfig.XcodeUtils.addBuildSourceFileToGroup({
        filepath,
        groupName: projectName,
        project: cfg.modResults,
      });
    }
    return cfg;
  });

// The scene delegate owns the window, so the app delegate only builds the factory.
const withFactoryProviderAppDelegate = (config) =>
  withAppDelegate(config, (cfg) => {
    let src = cfg.modResults.contents;
    src = src.replace(
      /class AppDelegate: ExpoAppDelegate \{/,
      'class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {'
    );
    src = src.replace(
      /#if os\(iOS\) \|\| os\(tvOS\)\n\s*window = UIWindow\(frame: UIScreen\.main\.bounds\)\n\s*factory\.startReactNative\([\s\S]*?\)\n#endif\n/,
      ''
    );
    cfg.modResults.contents = src;
    return cfg;
  });

module.exports = function withSceneDelegate(config) {
  config = withFactoryProviderAppDelegate(config);
  config = withSceneDelegateInProject(config);
  config = withSceneDelegateFile(config);
  return config;
};
