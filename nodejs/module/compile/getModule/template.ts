/**
 * 手动去在线网站把模板压缩了抛出
 * TS => JS :  https://www.typescriptlang.org/play?#code/Q
 * 压缩 JS :  https://jscompress.com/
 */
const runtime = `function runtimeTemplate({env:o,data:a,inputs:s,outputs:i}){const e=window.React,[u,t]=e.useState(1);return e.useEffect(()=>{var e=()=>{t(e=>e+1)};return reRenderSet.add(e),()=>{reRenderSet.delete(e)}},[]),e.useMemo(()=>{const e=modules["--replace-moduleId--"];var l="--replace-inputsRelOutputsMap--",t=Object.assign(Object.assign({},baseToJson),{scenes:[e]});let n=!1;return(o.runtime?o.renderModuleComponent:o.renderCom)(t,{env:Object.assign({},o),extend:{env:{scenesOperate:{var:globalVariables,getGlobalComProps:function(e){return{data:{val:globalVariables.getValueById(e)}}},exeGlobalCom:function({com:e,value:t}){globalVariables.changed({com:e,value:t})}}}},ref:function(r){if(!n){n=!0,a.refs=r;var{config:t}=a;let u=0;e.inputs.forEach(({id:a,type:e})=>{"config"===e?a in t&&r.inputs[a](t[a]):s[a]((e,t)=>{var n,o=++u;0<(null===(n=l[a])||void 0===n?void 0:n.length)?(l[a].forEach(e=>{r.outputs(e+"&execute&"+o,t[e])}),r.inputs[a+"&execute&"+o](e)):r.inputs[a](e)})}),e.outputs.forEach(({id:e})=>{var t;0<(null===(t=l[e])||void 0===t?void 0:t.length)||r.outputs(e,i[e])}),r.run()}},disableAutoRun:!0,moduleId:"--replace-moduleId--",moduleVersion:"--replace-moduleVersion--",reRenderKey:u})},[u])}`;

const editors = `function editorsTemplate(){return{"@init":function({style:i}){i.width="--replace-init-width--",i.height="--replace-init-height--"},"@resize":{options:"--replace-@resize-options"},":root":(i,t,e)=>{var n="--origin--";t.title="--replace-title--",t.items=[..."--replace-configs--".map(({id:e,title:i,type:t,defaultValue:n,description:o})=>({title:i,type:t,description:o,value:{get:function({data:i}){return e in i.config?i.config[e]:i.config[e]=n},set:function({data:i},t){i.config[e]=t,i.refs&&i.refs.inputs[e](t)}}})),{title:"事件",ifVisible:function(){return"--replace-events-visible--"},items:[..."--replace-events--".map(({id:i,title:t})=>({title:t,type:"_Event",options:()=>({outputId:i})}))]}],n===window.location.origin&&(e.title="高级",e.items=[{title:"打开模块搭建页面",type:"button",ifVisible:function({}){return n===window.location.origin},value:{set:function(){window.open('/mybricks-app-harmony-module/index.html?id="--replace-id--"')}}}])}}}`;

const runtimeJs = `function runtimeTemplateJs({title:e,env:o,data:s,inputs:t,outputs:r}){var l="--replace-tojson--",a=Object.assign(Object.assign({},baseToJson),{scenes:[l]});o.renderModuleJs(a,{env:Object.assign({},o),extend:{env:{scenesOperate:{var:globalVariables,getGlobalComProps:function(e){return{data:{val:globalVariables.getValueById(e)}}},exeGlobalCom:function({com:e,value:o}){globalVariables.changed({com:e,value:o})}}}},ref:function(a){var n;s.refs||(s.refs=a,{config:n}=s,a?(l.inputs.forEach(({id:o,type:e})=>{"config"===e?o in n&&a.inputs[o](n[o]):t[o](e=>{a.inputs[o](e)})}),l.outputs.forEach(({id:e})=>{a.outputs(e,r[e])}),a.run()):console.error("计算组件["+e+"]refs为空"))},moduleId:"--replace-moduleId--",moduleVersion:"--replace-moduleVersion--"})}`

const upgrade = `function upgradeTemplate(e){const{data:i,input:n,output:o}=e;var d="__inputs__",s="__outputs__",a="__data__";return o.get().forEach(({id:t})=>{-1===s.findIndex(e=>e.id===t)&&o.remove(t)}),s.forEach(e=>{var{id:t,title:i,schema:e}=e;o.get(t)?(o.get(t).setTitle(i),e&&o.get(t).setSchema(e)):o.add(t,i,e||{})}),n.get().forEach(({id:t})=>{-1===d.findIndex(e=>e.id===t)&&n.remove(t)}),d.forEach(e=>{const{id:t,title:i,schema:o,rels:d=[]}=e;n.get(t)?(n.get(t).setTitle(i),o&&n.get(t).setSchema(o)):n.add(t,i,o||{});const s=n.get(t).rels||[];s.join()!==d.join()&&n.get(t).setRels(d)}),Object.keys((null===i||void 0===i?void 0:i.configs)||{}).forEach(e=>{var t;void 0===(null===(t=a.configs)||void 0===t?void 0:t[e])&&(a.configs[e]=null===i||void 0===i?void 0:i.configs[e])}),e.style,!0}`

export {
  runtime,
  editors,
  runtimeJs,
  upgrade
}

const baseToJson = {};
const modules = {};
const globalVariables = {};
const reRenderSet = new Set();

function runtimeTemplate({
  env,
  data,
  inputs: propsInputs,
  outputs: propsOutputs,
}) {
  const React = (window as any).React;
  const [key, setKey] = React.useState(1);

  React.useEffect(() => {
    const reRender = () => {
      setKey((key) => {
        return key + 1
      })
    }
    reRenderSet.add(reRender);
    return () => {
      reRenderSet.delete(reRender);
    }
  }, [])

  const render = React.useMemo(() => {
    const mainScene: any = modules["--replace-moduleId--"];
    const inputsRelOutputsMap: any = "--replace-inputsRelOutputsMap--";
    const toJson = {
      ...baseToJson,
      scenes: [mainScene],
    }
    let flag = false;

    return (env.runtime ? env.renderModuleComponent : env.renderCom)(toJson, {
      env: {
        ...env,
      },
      extend: {
        env: {
          scenesOperate: {
            var: globalVariables,
            getGlobalComProps(comId) {
              return {
                data: {
                  val: globalVariables.getValueById(comId)
                }
              }
            },
            exeGlobalCom({ com, value }) {
              globalVariables.changed({ com, value });
            },
          },
        }
      },
      ref(refs) {
        // 多场景会执行多次 ref，但实际只需执行一次
        if (flag) return;
        flag = true;

        data.refs = refs;
        const { config } = data;

        let count = 0;
        mainScene.inputs.forEach(({ id, type }: any) => {
          /** 配置项 */
          if (type === "config") {
            if (id in config) {
              refs.inputs[id](config[id]);
            }
          } else {
            propsInputs[id]((value: any, relOutputs: any) => {
              const curCount = ++count;
              if (inputsRelOutputsMap[id]?.length > 0) {
                inputsRelOutputsMap[id].forEach((outputId: string) => {
                  refs.outputs(outputId + "&execute&" + curCount, relOutputs[outputId]);
                });
                refs.inputs[id + "&execute&" + curCount](value);
              }
              else refs.inputs[id](value);
            });
          }
        });
        mainScene.outputs.forEach(({ id }: any) => {
          if (inputsRelOutputsMap[id]?.length > 0) return;
          refs.outputs(id, propsOutputs[id]);
        });
        refs.run();
      },
      /** 禁止主动触发IO、执行自执行计算组件 */
      disableAutoRun: true,
      moduleId: "--replace-moduleId--",
      moduleVersion: "--replace-moduleVersion--",
      reRenderKey: key
    });
  }, [key]);

  return render;
}

function editorsTemplate() {
  const editors = {
    '@init'({ style }: any) {
      style.width = "--replace-init-width--";
      style.height = "--replace-init-height--";
    },
    '@resize': {
      options: "--replace-@resize-options"
    },
    ":root": (_: any, cate1: any, cate2: any) => {
      const origin = "--origin--";

      cate1.title = "--replace-title--";
      cate1.items = [
        ...("--replace-configs--" as any).map(
          ({ id, title, type, defaultValue, description }: any) => {
            return {
              title,
              type: type,
              description: description,
              value: {
                get({ data }: any) {
                  if (id in data.config) {
                    return data.config[id];
                  }
                  data.config[id] = defaultValue;
                  return defaultValue;
                },
                set({ data }: any, value: any) {
                  data.config[id] = value;
                  // ui组件中为了编辑后看到效果要调refs.inputs，计算组件没有refs
                  if (data.refs){
                    data.refs.inputs[id](value);
                  }      
                },
              },
            };
          }
        ),
        {
          title: "事件",
          ifVisible() {
            return "--replace-events-visible--";
          },
          items: [
            ...("--replace-events--" as any).map(({ id, title }: any) => {
              return {
                title,
                type: "_Event",
                options: () => {
                  return {
                    outputId: id,
                  };
                },
              };
            }),
          ],
        },
      ];

      if (origin === window.location.origin) {
        cate2.title = "高级";
        cate2.items = [
          {
            title: "打开模块搭建页面",
            type: "button",
            ifVisible({ data }: any) {
              return origin === window.location.origin;
            },
            value: {
              set() {
                window.open(
                  '/mybricks-app-harmony-module/index.html?id="--replace-id--"'
                );
              },
            },
          },
        ];
      }
    },
  };

  return editors;
}

function runtimeTemplateJs({
  title,
  env,
  data,
  inputs: propsInputs,
  outputs: propsOutputs,
}: any) {
  const mainScene: any = "--replace-tojson--";
  const toJson = {
    ...baseToJson,
    scenes: [mainScene],
  }

  env.renderModuleJs(toJson, {
    env: {
      ...env,
    },
    extend: {
      env: {
        scenesOperate: {
          var: globalVariables,
          getGlobalComProps(comId) {
            return {
              data: {
                val: globalVariables.getValueById(comId)
              }
            }
          },
          exeGlobalCom({ com, value }) {
            globalVariables.changed({ com, value });
          },
        },
      }
    },
    ref(refs: any) {
      // 多场景会执行多次
      if (data.refs) return;
      data.refs = refs;
      const { config } = data;
      if (!refs) {
        console.error("计算组件[" + title + "]refs为空")
        return;
      }

      mainScene.inputs.forEach(({ id, type }: any) => {
        /** 配置项 */
        if (type === "config") {
          if (id in config) {
            refs.inputs[id](config[id]);
          }
        } else {
          propsInputs[id]((value: any) => {
            refs.inputs[id](value);
          });
        }
      });
      mainScene.outputs.forEach(({ id }: any) => {
        refs.outputs(id, propsOutputs[id]);
      });
      // 运行自执行组件
      refs.run();
    },
    moduleId: "--replace-moduleId--",
    moduleVersion: "--replace-moduleVersion--",
  });
}

function upgradeTemplate(params: any) {
  const { data, input, output } = params;
  const inputs: any = "__inputs__";
  const currentOutputs: any = "__outputs__";
  const currentData: any = "__data__";
  const newHeight: any = "__height__";
  const newWidth: any = "__width__";

  output.get().forEach(({ id }: any) => {
    const index = currentOutputs.findIndex((item: any) => item.id === id);
    if (index === -1) {
      output.remove(id);
    }
  });
  currentOutputs.forEach((pin: any) => {
    const { id, title, schema } = pin;
    if (!output.get(id)) {
      output.add(id, title, schema ? schema : {});
    } else {
      output.get(id).setTitle(title);
      if (schema) {
        output.get(id).setSchema(schema);
      }
    }
  });

  input.get().forEach(({ id }: any) => {
    const index = inputs.findIndex((item: any) => item.id === id);
    if (index === -1) {
      input.remove(id);
    }
  });
  inputs.forEach((pin: any) => {
    const { id, title, schema, rels = [] } = pin;
    if (!input.get(id)) {
      input.add(id, title, schema ? schema : {});
    } else {
      input.get(id).setTitle(title);
      if (schema) {
        input.get(id).setSchema(schema);
      }
    }
    const vRels: string[] = input.get(id).rels || [];
    if (vRels.join() !== rels.join()) {
      input.get(id).setRels(rels);
    }
  });

  Object.keys(data?.configs || {}).forEach((key) => {
    if (currentData?.configs?.[key] === undefined) {
      currentData.configs[key] = data?.configs[key];
    }
  });

  if (params.style) {
    if (newHeight === "auto") {
      params.style.height = newHeight;
      params.style.heightAuto = true;
      params.style.heightFull = false;
    } else if (typeof newHeight === "number") {
      params.style.height = newHeight;
      params.style.heightAuto = false;
      params.style.heightFull = false;
    }

    if (newWidth === "auto") {
      params.style.width = newWidth;
      params.style.widthAuto = true;
      params.style.widthFull = false;
    } else if (typeof newWidth === "number") {
      params.style.width = newWidth;
      params.style.widthAuto = false;
      params.style.widthFull = false;
    }
  }

  return true;
}