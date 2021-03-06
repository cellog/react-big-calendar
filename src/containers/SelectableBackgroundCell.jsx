import Selectable from './Selectable.jsx'
import BackgroundCell from '../components/BackgroundCell.jsx'

const SelectableBackgroundCell = Selectable(BackgroundCell, {
  key: (props) => props.value.toString(),
  value: (props) => props.value
})

export default SelectableBackgroundCell
