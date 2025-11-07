import generateFileName from "../generateFileName";

const generatePageFileName = (name) => {
  return generateFileName(name) + "Page"
}

const handleEntryCode = (template: string, {
  tabbarScenes,
  normalScenes,
  entryScene,
  tabbarConfig,
  modulesData,
  usedModuleNames
}) => {
  let allImports = Array.from(new Set([...tabbarScenes, ...normalScenes]))
    .map(scene => `// ${scene.title} \nimport ${scene.pageName} from '../${scene.path}';`)
    .join('\n')
  const generateRoutes = (scenes) => scenes
    .map((scene, i) => `${i === 0 ? 'if' : '\t\telse if'} (path === '${scene.id}') {\n\t\t\t${scene.pageName}()\n\t\t}`)
    .join('\n');
  const renderMainScenes = generateRoutes(Array.from(new Set([entryScene, ...tabbarScenes])))
  const renderScenes = generateRoutes(normalScenes)

  let executConfigs = "";

  Object.entries(modulesData).forEach(([, { title, moduleName, configs }]: any) => {

    if (usedModuleNames.has(moduleName)) {
      allImports += `\n/** ${title} 配置 */\n` + 
      `import { config as ${moduleName}Config } from '../modules/${moduleName}/api';`

      executConfigs += `${moduleName}Config(${Object.keys(configs).length ? JSON.stringify(configs) : ""});\n`
    }
  })

  if (executConfigs) {
    allImports += `\n\n${executConfigs}`;
  }

  return template
    .replace("$r('app.config.imports')", allImports)
    .replace("$r('app.config.mainScenes')", renderMainScenes)
    .replace("$r('app.config.scenes')", renderScenes)
    .replace("$r('app.config.tabbar')", JSON.stringify(tabbarConfig, null, 2))
    .replace("$r('app.config.entry')", JSON.stringify(entryScene.id))
}

export default handleEntryCode
