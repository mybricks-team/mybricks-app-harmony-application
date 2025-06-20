import { ApplyRootStyleModifier, ApplyStyleModifier, CSSProperties } from './utils/GetDesignStyle'
import { AnyType } from './types'

type PopupPosition = 'center' | 'top' | 'bottom' | 'left' | 'right'

export interface DataType {
  layout?: CSSProperties
  position: PopupPosition
  maskClose?: boolean
  visibleClose?: boolean
}


@ObservedV2
export class Data implements DataType {
  @Trace layout?: CSSProperties = {}
  @Trace position: PopupPosition = 'center'
  @Trace maskClose?: boolean
  @Trace visibleClose?: boolean

  constructor(config: DataType) {
    this.position = config.position ?? this.position;
    this.maskClose = config.maskClose ?? this.maskClose ?? false;
    this.visibleClose = config.visibleClose ?? this.visibleClose ?? false;
  }
}


interface Inputs {
}

interface Outputs {
  onClose?: (signal?: string) => void
  onClickOverlay?: (signal?: string) => void
}

interface _Env {
  currentScenes: _EnvCurrentScenes
}

interface _EnvCurrentScenes {
  close: () => void
}

interface SlotsParamsContent {
  id: string,
  style?: CSSProperties
}

@Builder function emptySlot(params: SlotsParamsContent) {}

@ComponentV2
export default struct MyBricksPopup {
  @Param data: Data = new Data({
    position: 'center',
    maskClose: true,
    visibleClose: false
  });
  @Param styles: Record<string, CSSProperties> = {}
  @Param inputs?: Inputs = undefined;
  @Param outputs?: Outputs = undefined;
  @Param uid?: string = undefined;
  @Param parentSlot?: AnyType = undefined;
  @Param _env?: _Env = undefined

  @Param slotsIO?: AnyType = undefined;
  @BuilderParam slots: (name: SlotsParamsContent) => void = emptySlot;

  @Computed
  get contentAlign(): Alignment {
    switch (this.data.position) {
      case 'center': {
        return Alignment.Center
      }
      case 'bottom': {
        return Alignment.Bottom
      }
      case 'top': {
        return Alignment.Top
      }
      case 'left': {
        return Alignment.TopStart
      }
      case 'right': {
        return Alignment.TopEnd
      }
    }
  }

  aboutToAppear(): void {

  }

  handleOverlayClick () {
    if (this.data.maskClose) {
      this._env?.currentScenes.close?.()
      this.outputs?.onClickOverlay?.();
    }
  }

  build() {
    Column() {
      Column() {
        Stack() {
          if (this.data.position === 'center') {
            Column() {
              this.slots({
                id: 'content',
                style: this.data.layout
              })
            }
            .attributeModifier(
              new ApplyStyleModifier(this.styles['.mybricks-content'])
                .backgroundColor('#ffffff')
            )
            .center()
            .clip(true)
          }
          if (this.data.position === 'bottom') {
            Column() {
              this.slots({
                id: 'content'
              })
            }
            .attributeModifier(
              new ApplyStyleModifier(this.styles['.mybricks-content'])
                .backgroundColor('#ffffff')
            )
            .bottom()
            .clip(true)
          }
          if (this.data.position === 'top') {
            Column() {
              this.slots({
                id: 'content'
              })
            }
            .attributeModifier(
              new ApplyStyleModifier(this.styles['.mybricks-content'])
                .backgroundColor('#ffffff')
            )
            .top()
            .clip(true)
          }
          if (this.data.position === 'left') {
            Column() {
              this.slots({
                id: 'content'
              })
            }
            .attributeModifier(
              new ApplyStyleModifier(this.styles['.mybricks-content'])
                .backgroundColor('#ffffff')
            )
            .left()
            .clip(true)
          }
          if (this.data.position === 'right') {
            Column() {
              this.slots({
                id: 'content'
              })
            }
            .attributeModifier(
              new ApplyStyleModifier(this.styles['.mybricks-content'])
                .backgroundColor('#ffffff')
            )
            .right()
            .clip(true)
          }
        }
        .height('100%')
        .width('100%')
        .alignContent(this.contentAlign)
      }
      .alignItems(HorizontalAlign.Start)
      .align(Alignment.Start)
      .height('100%')
      .width('100%')
      .attributeModifier(
        new ApplyStyleModifier(this.styles['.mybricks-overlay'])
          .backgroundColor('rgba(0,0,0,0.4)')
      )
      .expandSafeArea([SafeAreaType.SYSTEM],[SafeAreaEdge.TOP, SafeAreaEdge.BOTTOM])
      .transition(TransitionEffect.OPACITY
        .animation({ duration: 300, curve: Curve.Friction, delay: 0 }))
      .onClick(() => {
        this.handleOverlayClick()
      })
    }.attributeModifier(
      new ApplyRootStyleModifier(this.styles['root'])
    )
  }
}


@Extend(Column) function center() {
  .width('fit-content')
  .transition(
    TransitionEffect.scale({ x: 0.5, y: 0.5 })
      .animation({ duration: 300, curve: Curve.Friction, delay: 0 })
  )
}

@Extend(Column) function bottom() {
  .width('100%')
  .transition(
    TransitionEffect.move(TransitionEdge.BOTTOM)
      .animation({ duration: 300, curve: Curve.Friction, delay: 0 })
  )
}

@Extend(Column) function top() {
  .width('100%')
  .transition(
    TransitionEffect.move(TransitionEdge.TOP)
      .animation({ duration: 300, curve: Curve.Friction, delay: 0 })
  )
}

@Extend(Column) function left() {
  .height('100%')
  .transition(
    TransitionEffect.move(TransitionEdge.START)
      .animation({ duration: 300, curve: Curve.Friction, delay: 0 })
  )
}

@Extend(Column) function right() {
  .height('100%')
  .transition(
    TransitionEffect.move(TransitionEdge.END)
      .animation({ duration: 300, curve: Curve.Friction, delay: 0 })
  )
}