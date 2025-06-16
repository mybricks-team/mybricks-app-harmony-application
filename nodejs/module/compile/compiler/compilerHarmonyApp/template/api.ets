import { MyBricks } from "../../utils/types"
import { Subject, emit } from "../../utils/mybricks"
$r('app.api.import')

type Callback<P, R> = (value: P) => R

class Api {
  private callbacks: Map<string, Callback<MyBricks.EventValue, MyBricks.EventValue>> = new Map()

  open(value?: MyBricks.EventValue) {
    $r('app.api.open')
  }

  on<P, R = void>(key: string, callback: Callback<P, R>) {
    this.callbacks.set(key, callback)
  }

  emit(key: string, value: MyBricks.EventValue): Subject {
    const callback = this.callbacks.get(key)

    return emit(callback, value)
  }

  clear() {
    this.callbacks = new Map()
  }

  close() {
    
  }
}

export default new Api()
