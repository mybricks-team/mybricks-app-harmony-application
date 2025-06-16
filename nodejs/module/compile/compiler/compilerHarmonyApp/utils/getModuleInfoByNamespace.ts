const getModuleInfoByNamespace = (namespace: string) => {
  const [moduleId, pageId] = namespace.split(".").slice(3)
  return { moduleId, pageId }
}

export default getModuleInfoByNamespace
