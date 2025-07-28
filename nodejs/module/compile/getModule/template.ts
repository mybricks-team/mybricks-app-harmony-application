/**
 * 手动去在线网站把模板压缩了抛出
 * TS => JS :  https://www.typescriptlang.org/play?#code/Q
 * 压缩 JS :  https://jscompress.com/
 */
const runtime = `function runtimeTemplate({env:u,data:o,inputs:a,outputs:l}){const e=window.React;return e.useMemo(()=>{var e="--replace-tojson--",r="--replace-inputsRelOutputsMap--",t=Object.assign(Object.assign({},baseToJson),{scenes:[e]});let n=!1;return(u.runtime?u.renderModuleComponent:u.renderCom)(t,{env:u,ref:function(i){if(!n){n=!0,o.refs=i;var{config:t}=o;let s=0;e.inputs.forEach(({id:o,type:e})=>{"config"===e?o in t&&i.inputs[o](t[o]):a[o]((e,t)=>{var n,u=++s;0<(null===(n=r[o])||void 0===n?void 0:n.length)?(r[o].forEach(e=>{i.outputs(e+"&execute&"+u,t[e])}),i.inputs[o+"&execute&"+u](e)):i.inputs[o](e)})}),e.outputs.forEach(({id:e})=>{var t;0<(null===(t=r[e])||void 0===t?void 0:t.length)||i.outputs(e,l[e])}),i.run()}},disableAutoRun:!0,moduleId:"--replace-moduleId--",moduleVersion:"--replace-moduleVersion--"})},[])}`;

const editors = `function editorsTemplate(){return{"@init":function({style:t}){t.width="--replace-init-width--",t.height="--replace-init-height--"},"@resize":{options:["width","height"]},":root":(t,i,e)=>{var n="--origin--";i.title="--replace-title--",i.items=[..."--replace-configs--".map(({id:e,title:t,type:i,defaultValue:n,description:o})=>({title:t,type:i,description:o,value:{get:function({data:t}){return e in t.config?t.config[e]:n},set:function({data:t},i){t.config[e]=i,t.refs&&t.refs.inputs[e](i)}}})),{title:"事件",ifVisible:function(){return"--replace-events-visible--"},items:[..."--replace-events--".map(({id:t,title:i})=>({title:i,type:"_Event",options:()=>({outputId:t})}))]}],n===window.location.origin&&(e.title="高级",e.items=[{title:"打开模块搭建页面",type:"button",ifVisible:function({}){return n===window.location.origin},value:{set:function(){window.open('/mybricks-app-harmony-module/index.html?id="--replace-id--"')}}}])}}}`;

const runtimeJs = `function runtimeTemplateJs({title:e,env:s,data:t,inputs:r,outputs:u}){var i="--replace-tojson--",n=Object.assign(Object.assign({},baseToJson),{scenes:[i]});s.renderModuleJs(n,{env:s,ref:function(n){var o;t.refs||(t.refs=n,{config:o}=t,n?(i.inputs.forEach(({id:s,type:e})=>{"config"===e?s in o&&n.inputs[s](o[s]):r[s](e=>{n.inputs[s](e)})}),i.outputs.forEach(({id:e})=>{n.outputs(e,u[e])}),n.run()):console.error("计算组件["+e+"]refs为空"))},moduleId:"--replace-moduleId--",moduleVersion:"--replace-moduleVersion--"})}`

export {
  runtime,
  editors,
  runtimeJs
}

const baseToJson = {};

function runtimeTemplate({
  env,
  data,
  inputs: propsInputs,
  outputs: propsOutputs,
}) {
  const React = (window as any).React;

  const render = React.useMemo(() => {
    const mainScene: any = "--replace-tojson--";
    const inputsRelOutputsMap: any = "--replace-inputsRelOutputsMap--";
    const toJson = {
      ...baseToJson,
      scenes: [mainScene],
    }
    let flag = false;

    return (env.runtime ? env.renderModuleComponent : env.renderCom)(toJson, {
      env,
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
    });
  }, []);

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
    env,
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