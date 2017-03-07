import validate from './validate'
import create from './create'

export validate
export create

export default {
  mustValidate (txt) {
    return /--validate/.test(txt)
  },
  mustCreate (txt) {
    return /--create/.test(txt)
  }
}