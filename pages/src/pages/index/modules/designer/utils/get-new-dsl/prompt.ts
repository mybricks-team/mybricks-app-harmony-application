export const getDSLPrompts = () => {
  return `
  1、page.dsl文件，为页面界面的结构描述，如下为一个卡片中有一个文本：
  \`\`\`dsl file="page.dsl"
  <page title="你好世界">
    <system.page title="你好世界" styleAry={[{selector:":root",css:{background:"#F2F2F7"}}]}>
      <slots.content title="页面内容">
        <flex title="主体卡片" layout={{ width: '100%', marginTop: 10, marginLeft: 12, marginRight: 12, justifyContent: 'center' }}>
          <mybricks.harmony.text title="文本" layout={{ width: 'fit-content', marginTop: 20 }} styleAry={[{selector:".mybricks-text",css:{color:'red',fontSize:'20px'}}]} data={{text:"Hello world"}} />
        </flex>
      </slots.content>
    </system.page>
  </page>
  \`\`\`
  
  注意：
  **page.dsl文件**
    page.dsl文件为页面的结构文件，以<root/>作为根节点，通过组件、插槽、布局(flex row 或 flex column）等元素构成页面的UI结构。

    嵌套规则
    1. page标签、flex标签可以直接嵌套子组件，无需slots插槽即可渲染子组件；
    2. 所有组件的子组件必须由插槽来渲染，没有插槽不可渲染子组件；

    注意：
    1、页面文件的格式为 **dsl**，文件名为 **page.dsl**；
    2、页面文件的根元素为<page/>，对于page组件，可以使用title属性，同时子组件必须为system.page组件
      - title:页面的标题
    3、对于system.page组件，只能使用title、styleAry两个属性:
      - title:页面的标题
      - styleAry:
        - selector为 :root ，可以配置 background 属性
    4、对于flex标签：
      4.1、flex可以直接渲染子组件；
      4.2、flex只能使用title、layout、styleAry、column、row五个属性:
        - title:必填，搭建的别名；
        - layout:
          - width：百分比、数字、fit-content三者其一，默认值为fit-content；
          - height：数字、fit-content二者其一；
          - flex：可选，数字，仅可以配置flex=1；
          - flex排版：可选，align-items、justify-content、flex，默认值为flex-start；
          - margin：可选，仅允许配置marginLeft、marginRight、marginTop、marginBottom，不可合并；
          - position：当需要绝对定位的时候使用，仅可以声明absolute，相对父元素定位，top、left、right、bottom属性仅可以使用数字；
        - styleAry:
          - selector为 :root ，可以配置 background、border 属性
        - column 和 row
    5、对于组件中的slots插槽：
      5.1、除flex标签外，所有子组件必须由插槽来渲染，没有插槽不可渲染子组件；
      5.2、插槽只能使用title、layout两个属性:
        - title:搭建的别名；
        - layout 只能使用以下属性: 
          - flexDirection：仅可配置row和column，默认值为column；
			    - flex相关属性：alignItems、justifyContent，默认值为flex-start；
    6、对于其中的组件元素：
      6.1、组件只能使用<允许使用的组件/>中声明的组件；
      6.2、组件只能使用title、layout、styleAry、data四个属性，以及其slots用来包含其他的组件:
        - title:组件的标题，用于描述组件的功能；
        - layout:组件的宽高与外间距信息，只能声明width、height、margin，不允许使用padding等属性；
          - width:百分比、数字、fit-content三者其一；
          - height:数字、fit-content二者其一；
          - margin:仅允许配置marginLeft、marginRight、marginTop、marginBottom，不可合并；
          - position：当需要绝对定位的时候使用，仅可以声明absolute，相对父元素定位，top、left、right、bottom属性仅可以使用数字；
        - styleAry:组件的样式，以选择器(selector）的形式表现组件各组成部分的样式，这里要严格遵循<允许使用的组件/>和「知识库」中各组件定义的样式规范；
        - data:组件的数据，用于描述组件的状态、属性等信息；

  <语法限制>
  - 所有标签的props和模板语法中禁止使用javascript中的动态语法，比如函数、模板字符串、多元表达式等等，仅可以使用基本的数据类型，包括数组和对象；
  - 不允许使用类似 <!-- XXX --> 等任何格式的注释信息；
  - 对于样式单位，禁止使用calc、css变量这类特殊语法，也不允许使用vw和vh这种特殊单位；
  </语法限制>

  <使用流程>
    1.如果需要还原附件图片中的视觉设计效果:
      特别关注整体的布局、定位、颜色、字体颜色、背景色、尺寸、间距、边框、圆角等UI信息，按照以下的流程还原参考图片：
      1.1 提取图片中的关键UI信息并总结；
      1.2 根据总结和图片将所有UI信息细节使用dsl一比一还原出来；
    2.如果没有图片则根据需求完成即可。
  </使用流程>
  
  <搭建画布信息>
  当前搭建画布的宽度为375，所有元素的尺寸需要关注此信息，且尽可能自适应布局。
    比如：
      1.system.page下方元素考虑是否需要配置宽度100%且配置左右margin，效果更好；
      2.布局需要自适应画布宽度；
  特殊地，系统已经内置了底部导航栏和顶部导航栏，仅关注页面内容即可，不用实现此部分内容。
  </搭建画布信息>

  <组件使用建议>
  1. 基础布局必须使用flex组件，禁止使用容器(mybricks.harmony.containerBasic)；
  2. 文本、图片、图标、按钮组件属于基础组件，任何情况下都可以优先使用，即使不在允许使用的组件里；
  3. 图标禁止使用emoji或者特殊符号，使用图标(mybricks.harmony.icon)组件来替代；
  4. 尽可能使用margin替代padding，多注意组件是否需要配置margin；
  5. 仔细是否需要用到绝对定位，是相对于父元素的；
  6. system.page下方元素注意配置左右margin；
  </组件使用建议>

  <组件特殊声明>
  1. 对于flex组件，有以下使用案例可参考：
  使用案例
  - 基础使用
	<flex column title="边距和背景色配置" layout={{width: '100%', height: 20, marginTop: 20, marginLeft: 12, marginRight: 12}} styleAry={[{ selector: ':root', css: { backgroundColor: '#ffffff' } }]}>
	</flex>
  - 水平布局，左右两端对齐，垂直居中
  <flex row title="水平布局" layout={{width: '100%', height: 60, justifyContent: 'space-between', alignItems: 'center'}}>
		<A />
		<B />
	</flex>
  - 水平布局，左边固定宽度，右边自适应，10px分隔
  <flex row title="水平布局" layout={{width: '100%'}}>
		<flex column title="固定宽度" layout={{width: 300，marginRight: 10}}>
			<A />
		</flex>
		<flex column title="自适应宽度" layout={{flex: 1}}>
			<B />
		</flex>
	</flex>
  - 垂直布局，高度固定的情况下，可以通过justifyContent调整子组件布局
   <flex column title="布局调整Demo" layout={{width: '100%', height: 100, justifyContent:'space-between'}}>
    <flex column title="居上" layout={{width: 300，height: 30}}>
			<A />
		</flex>
		<flex column title="居下" layout={{flex: 1, height: 20}}>
			<B />
		</flex>
   </flex>
  - 绝对定位
   <flex column title="绝对定位Demo" layout={{width: '100%', height: 100}}>
    <flex column title="右上角的小角标" layout={{width: 30，height: 10, position: 'absolute', right: 0, top: 0}}>
			<A />
		</flex>
    <flex column title="左上角的小角标" layout={{width: 30，height: 10, position: 'absolute', left: 0, top: 0}}>
			<A />
		</flex>
   </flex>
  </组件特殊声明>`
}