export const getDSLPrompts = () => {
  return `
  1、ui.dsl文件，为页面界面的结构描述，如下为一个卡片中有一个文本：
  \`\`\`dsl file="page.dsl"
  <page title="你好世界">
     <mybricks.normal.card title="主体卡片" layout={{ width: '100%', marginTop: 10 }}>
        <slots.content>
           <mybricks.normal.text 
              title="文本" 
              layout={{ width: 'fit-content', marginTop: 20 }}
              styleAry={[{selector:":root",css:{color:'red',fontSize:'20px'}}]}
              data={{text:"Hello world"}}/>
        </slots.content>
     </mybricks.normal.card>
  </page>
  \`\`\`
  
  注意：
  **page.dsl文件**
    page.dsl文件为页面的结构文件，以<page/>作为根节点，通过组件、插槽、布局(flex row 或 flex column）等元素构成页面的UI结构。
    注意：
    1、页面文件的格式为 **dsl**，文件名为 **page.dsl**；
    2、页面文件的根元素为<page/>，其中title属性表示页面的标题;
    3、page与组件的slots中的组件可以通过flex进行布局，布局只能使用 <flex row/> 或 <flex column/>;
    4、对于其中的组件元素：
      4.1、组件只能使用<允许使用的组件/>中声明的组件；
      4.2、组件只能使用title、layout、styleAry、data四个属性，以及其slots用来包含其他的组件:
        - title:组件的标题，用于描述组件的功能；
        - layout:组件的宽高与外间距信息，只能声明width、height、margin，不允许使用padding、position等属性；
          - margin: 仅允许配置marginLeft、marginRight、marginTop、marginBottom，不可合并；
        - styleAry:组件的样式，以选择器(selector）的形式表现组件各组成部分的样式，这里要严格遵循<允许使用的组件/>中各组件定义的样式规范；
        - data:组件的数据，用于描述组件的状态、属性等信息；
  画布信息：
  当前搭建画布的宽度为375，所有元素的尺寸需要关注此信息，且尽可能自适应布局。
    比如：
      1.画布最外层元素考虑是否需要配置宽度100%且配置左右margin；
      2.布局需要自适应画布宽度；
  特殊地，系统已经内置了底部导航栏和顶部导航栏，仅关注页面内容即可。

  组件特殊声明：
  1. 对于flex组件

  layout字段有以下特殊的声明：
  - width：百分比、数字、fit-content三者其一，默认值为fit-content；
  - height：数字、fit-content二者其一；
  - flex：可选，数字，仅可以配置flex=1；
	- flex排版：可选，align-items、justify-content等，默认值为flex-start；
	- margin：可选，仅允许配置marginLeft、marginRight、marginTop、marginBottom，不可合并；
  除这些属性之外，不可使用其他属性。
  
  styleAry：
    selector为:root，声明如下：
    ":root": {
      "title": "样式",
      "values": [
        "background",
        "border",
        "boxShadow",
        "padding"
      ]
    }

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


  2. 对于图标组件，仅可以使用下方这些图标：
  
  airplane_fill
  alarm_fill_1
  arrow_clockwise
  arrow_counterclockwise
  arrow_counterclockwise_clock
  arrow_down_right_and_arrow_up_left
  arrow_left
  arrow_right
  arrow_right_up_and_square
  arrow_up_left_and_arrow_down_right
  arrow_up_to_line
  arrowshape_turn_up_right_fill
  backward_end_fill
  battery
  battery_75percent
  bell_fill
  bluetooth
  bluetooth_slash
  bookmark
  calendar
  camera
  camera_fill
  checkmark
  checkmark_circle
  checkmark_circle_fill
  checkmark_square
  checkmark_square_fill
  chevron_down
  chevron_left
  chevron_right
  chevron_up
  clock
  dial
  doc_plaintext
  doc_plaintext_and_pencil
  doc_text_badge_arrow_up
  doc_text_badge_magnifyingglass
  ellipsis_message
  envelope
  eye
  eye_slash
  fast_forward
  folder
  folder_badge_plus
  forward_end_fill
  gearshape
  hand_thumbsup_fill
  headphones_fill
  heart
  heart_fill
  heart_slash
  house
  house_fill
  line_viewfinder
  list_square_bill
  livephoto
  lock
  lock_open
  magnifyingglass
  message
  message_on_message
  mic
  music
  music_note_list
  paintpalette
  paperclip
  pause
  picture
  picture_2
  picture_damage
  play_circle_fill
  play_fill
  play_round_rectangle_fill
  play_video
  plus
  qrcode
  record_circle
  resolution_video
  save
  share
  template
  text_clipboard
  timer
  trash
  wifi
  worldclock
  xmark`
}