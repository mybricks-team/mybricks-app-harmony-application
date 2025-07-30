/**
 * 手动去在线网站把模板压缩了抛出
 * TS => JS :  https://www.typescriptlang.org/play?#code/Q
 * 压缩 JS :  https://jscompress.com/
 */
const runtime = `function runtimeTemplate({env:o,data:a,inputs:s,outputs:i}){const e=window.React,[u,t]=e.useState(1);return e.useEffect(()=>{var e=()=>{t(e=>e+1)};return reRenderSet.add(e),()=>{reRenderSet.delete(e)}},[]),e.useMemo(()=>{const e=modules["--replace-moduleId--"];var l="--replace-inputsRelOutputsMap--",t=Object.assign(Object.assign({},baseToJson),{scenes:[e]});let n=!1;return(o.runtime?o.renderModuleComponent:o.renderCom)(t,{env:Object.assign({},o),extend:{env:{scenesOperate:{var:globalVariables,getGlobalComProps:function(e){return{data:{val:globalVariables.getValueById(e)}}},exeGlobalCom:function({com:e,value:t}){globalVariables.changed({com:e,value:t})}}}},ref:function(r){if(!n){n=!0,a.refs=r;var{config:t}=a;let u=0;e.inputs.forEach(({id:a,type:e})=>{"config"===e?a in t&&r.inputs[a](t[a]):s[a]((e,t)=>{var n,o=++u;0<(null===(n=l[a])||void 0===n?void 0:n.length)?(l[a].forEach(e=>{r.outputs(e+"&execute&"+o,t[e])}),r.inputs[a+"&execute&"+o](e)):r.inputs[a](e)})}),e.outputs.forEach(({id:e})=>{var t;0<(null===(t=l[e])||void 0===t?void 0:t.length)||r.outputs(e,i[e])}),r.run()}},disableAutoRun:!0,moduleId:"--replace-moduleId--",moduleVersion:"--replace-moduleVersion--",reRenderKey:u})},[u])}`;

const editors = `function editorsTemplate(){return{"@init":function({style:t}){t.width="--replace-init-width--",t.height="--replace-init-height--"},"@resize":{options:["width","height"]},":root":(t,i,e)=>{var n="--origin--";i.title="--replace-title--",i.items=[..."--replace-configs--".map(({id:e,title:t,type:i,defaultValue:n,description:o})=>({title:t,type:i,description:o,value:{get:function({data:t}){return e in t.config?t.config[e]:n},set:function({data:t},i){t.config[e]=i,t.refs&&t.refs.inputs[e](i)}}})),{title:"事件",ifVisible:function(){return"--replace-events-visible--"},items:[..."--replace-events--".map(({id:t,title:i})=>({title:i,type:"_Event",options:()=>({outputId:t})}))]}],n===window.location.origin&&(e.title="高级",e.items=[{title:"打开模块搭建页面",type:"button",ifVisible:function({}){return n===window.location.origin},value:{set:function(){window.open('/mybricks-app-harmony-module/index.html?id="--replace-id--"')}}}])}}}`;

const runtimeJs = `function runtimeTemplateJs({title:e,env:o,data:s,inputs:t,outputs:r}){var l="--replace-tojson--",a=Object.assign(Object.assign({},baseToJson),{scenes:[l]});o.renderModuleJs(a,{env:Object.assign({},o),extend:{env:{scenesOperate:{var:globalVariables,getGlobalComProps:function(e){return{data:{val:globalVariables.getValueById(e)}}},exeGlobalCom:function({com:e,value:o}){globalVariables.changed({com:e,value:o})}}}},ref:function(a){var n;s.refs||(s.refs=a,{config:n}=s,a?(l.inputs.forEach(({id:o,type:e})=>{"config"===e?o in n&&a.inputs[o](n[o]):t[o](e=>{a.inputs[o](e)})}),l.outputs.forEach(({id:e})=>{a.outputs(e,r[e])}),a.run()):console.error("计算组件["+e+"]refs为空"))},moduleId:"--replace-moduleId--",moduleVersion:"--replace-moduleVersion--"})}`

export {
  runtime,
  editors,
  runtimeJs
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
      options: ['width', 'height']
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