import validate from './validate'
import create from './create'

export {validate, create}

export default {
  mustValidate (txt) {
    return /--validate/.test(txt)
  },
  mustCreate (txt) {
    return /--create/.test(txt)
  }
}
