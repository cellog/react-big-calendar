import Selection from './Selection.jsx'
import MonthView from '../components/MonthView.jsx'

const SelectableMonthView= Selection(MonthView, { containerDiv: false })

export default SelectableMonthView