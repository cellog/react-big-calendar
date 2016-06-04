import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import cn from 'classnames';
import dates from './utils/dates';
import localizer from './localizer'
import chunk from 'lodash/array/chunk';
import omit from 'lodash/object/omit';

import { navigate } from './utils/constants';
import { notify } from './utils/helpers';
import getHeight from 'dom-helpers/query/height';
import getPosition from 'dom-helpers/query/position';
import raf from 'dom-helpers/util/requestAnimationFrame';

import EventRow from './components/EventRow';
import EventEndingRow from './EventEndingRow';
import Popup from './Popup';
import Overlay from 'react-overlays/lib/Overlay';
import BackgroundCells from './components/BackgroundCells.jsx';
import SelectableMonthView from './containers/SelectableMonthView.jsx'

import { dateFormat } from './utils/propTypes';
import {
    segStyle, inRange, eventSegments
  , endOfRange, eventLevels, sortEvents } from './utils/eventLevels';

let eventsForWeek = (evts, start, end, props) =>
  evts.filter(e => inRange(e, start, end, props));

let isSegmentInSlot = (seg, slot) => seg.left <= slot && seg.right >= slot;

let propTypes;


export default class Month extends Component {
  static displayName = 'MonthView'

  static propTypes = {
    ...EventRow.PropTypes,

    culture: React.PropTypes.string,

    date: React.PropTypes.instanceOf(Date),

    min: React.PropTypes.instanceOf(Date),
    max: React.PropTypes.instanceOf(Date),

    dateFormat,

    weekdayFormat: dateFormat,

    popup: React.PropTypes.bool,

    popupOffset: React.PropTypes.oneOfType([
      React.PropTypes.number,
      React.PropTypes.shape({
        x: React.PropTypes.number,
        y: React.PropTypes.number
      })
    ]),

    onSelectEvent: React.PropTypes.func,
    onSelectSlot: React.PropTypes.func
  }

  static navigate(date, action) {
    switch (action){
      case navigate.PREVIOUS:
        return dates.add(date, -1, 'month');

      case navigate.NEXT:
        return dates.add(date, 1, 'month')

      default:
        return date;
    }
  }

  static range(date, { culture }) {
    let start = dates.firstVisibleDay(date, culture)
    let end = dates.lastVisibleDay(date, culture)
    return { start, end }
  }

  constructor(props) {
    super(props)
    this.state = {
      rowLimit: 5,
      needLimitMeasure: true
    }
    this._renderMeasureRows = this._renderMeasureRows.bind(this)
    this._selectEvent = this._selectEvent.bind(this)
  }

  componentWillMount() {
    this._bgRows = []
  }

  componentWillReceiveProps({ date }) {
    this.setState({
      needLimitMeasure: !dates.eq(date, this.props.date)
    })
  }

  componentDidMount() {
    let running;

    if (this.state.needLimitMeasure)
      this._measureRowLimit(this.props)

    window.addEventListener('resize', this._resizeListener = ()=> {
      if (!running) {
        raf(()=> {
          running = false
          this.setState({ needLimitMeasure: true }) //eslint-disable-line
        })
      }
    }, false)
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.needLimitMeasure)
      this._measureRowLimit(this.props)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._resizeListener, false)
  }

  _measureRowLimit(props) {
    let eventHeight = getHeight(this._measureEvent);
    let labelHeight = getHeight(this._firstDateRow);
    let eventSpace = getHeight(this._firstRow) - labelHeight;

    this._needLimitMeasure = false;

    this.setState({
      needLimitMeasure: false,
      rowLimit: Math.max(
        Math.floor(eventSpace / eventHeight), 1)
    })
  }

  _dateClick(date, e){
    e.preventDefault();
    notify(this.props.onNavigate, [navigate.DATE, date])
  }

  _selectEvent(...args){

    notify(this.props.onSelectEvent, args)
  }

  _showMore(segments, date, weekIdx, slot){
    let cell = findDOMNode(this._bgRows[weekIdx]).children[slot - 1];

    let events = segments
      .filter(seg => isSegmentInSlot(seg, slot))
      .map(seg => seg.event)

    if (this.props.popup) {
      let position = getPosition(cell, findDOMNode(this));

      this.setState({
        overlay: { date, events, position }
      })
    }
    else {
      notify(this.props.onNavigate, [navigate.DATE, date])
    }

    notify(this.props.onShowMore, [events, date, slot])
  }

  _dates(row){
    return row.map((day, colIdx) => {
      var offRange = dates.month(day) !== dates.month(this.props.date);

      return (
        <div
          key={'header_' + colIdx}
          style={segStyle(1, 7)}
          className={cn('rbc-date-cell', {
            'rbc-off-range': offRange,
            'rbc-now': dates.eq(day, new Date(), 'day'),
            'rbc-current': dates.eq(day, this.props.date, 'day')
          })}
        >
          <a href='#' onClick={this._dateClick.bind(null, day)}>
            { localizer.format(day, this.props.dateFormat, this.props.culture) }
          </a>
        </div>
      )
    })
  }

  _headers(row, format, culture){
    let first = row[0]
    let last = row[row.length - 1]

    return dates.range(first, last, 'day').map((day, idx) =>
      <div
        key={'header_' + idx}
        className='rbc-header'
        style={segStyle(1, 7)}
      >
        { localizer.format(day, format, culture) }
      </div>
    )
  }

  _renderMeasureRows(levels, row, idx) {
    let first = idx === 0;

    return first ? (
      <div className='rbc-row'>
        <div className='rbc-row-segment' style={segStyle(1, 7)}>
          <div ref={r => this._measureEvent = r} className={cn('rbc-event')}>
            <div className='rbc-event-content'>&nbsp;</div>
          </div>
        </div>
      </div>
    ) : <span/>
  }

  _renderOverlay(){
    let overlay = (this.state && this.state.overlay) || {};

    return (
      <Overlay
        rootClose
        placement='bottom'
        container={this}
        show={!!overlay.position}
        onHide={() => this.setState({ overlay: null })}
      >
        <Popup
          {...this.props}
          position={overlay.position}
          events={overlay.events}
          slotStart={overlay.date}
          slotEnd={overlay.end}
          onSelect={this._selectEvent}
        />
      </Overlay>
    )
  }

  renderWeek(week, weekIdx, content) {
    let { first, last } = endOfRange(week);
    let evts = eventsForWeek(this.props.events, week[0], week[week.length - 1], this.props)

    evts.sort((a, b) => sortEvents(a, b, this.props))

    let segments = evts = evts.map(evt => eventSegments(evt, first, last, this.props))
    let limit = (this.state.rowLimit - 1) || 1;

    let { levels, extra } = eventLevels(segments, limit)

    content = content || ((lvls, wk) => lvls.map((lvl, idx) => this.renderRowLevel(lvl, wk, idx)))

    return (
      <div key={'week_' + weekIdx}
        className='rbc-month-row'
        ref={!weekIdx && (r => this._firstRow = r)}
      >
        {
          this.renderBackground(week, weekIdx)
        }
        <div
          className='rbc-row-content'
        >
          <div
            className='rbc-row'
            ref={!weekIdx && (r => this._firstDateRow = r)}
          >
            { this._dates(week) }
          </div>
          {
            content(levels, week, weekIdx)
          }
          {
            !!extra.length &&
              this.renderShowMore(segments, extra, week, weekIdx, levels.length)
          }
        </div>
        { this.props.popup
            && this._renderOverlay()
        }
      </div>
    )
  }

  renderBackground(row, idx){

    return (
    <BackgroundCells
      container={() => findDOMNode(this)}
      slots={7}
      ref={r => this._bgRows[idx] = r}
      getValueFromSlot={slot => row[slot]}
    />
    )
  }

  renderRowLevel(segments, week, idx){
    const { first, last } = endOfRange(week);
    const { selected, ...props } = this.props

    return (
      <EventRow
        {...props}
        eventComponent={this.props.components.event}
        onSelect={this._selectEvent}
        key={idx}
        segments={segments}
        slots={7}
        start={first}
        end={last}
      />
    )
  }

  renderShowMore(segments, extraSegments, week, weekIdx) {
    let { first, last } = endOfRange(week);

    let onClick = slot => this._showMore(segments, week[slot - 1], weekIdx, slot)

    return (
      <EventEndingRow
        {...this.props}
        eventComponent={this.props.components.event}
        onSelect={this._selectEvent}
        onShowMore={onClick}
        key={'last_row_' + weekIdx}
        segments={extraSegments}
        start={first}
        end={last}
      />
    )
  }

  render() {
    var { date, culture, weekdayFormat, onSelectSlot } = this.props
      , month = dates.visibleDays(date, culture)
      , weeks  = chunk(month, 7);

    let measure = this.state.needLimitMeasure

    this._weekCount = weeks.length;

    var elementProps = omit(this.props, Object.keys(Month.propTypes));

    return (
      <SelectableMonthView
        {...elementProps}
        selectable={this.props.selectable}
        constantSelect
        selectIntermediates
        onFinishSelect={(...args) => onSelectSlot(args[2])}
        className={cn('rbc-month-view', elementProps.className)}
      >
        <div className='rbc-row rbc-month-header'>
          {this._headers(weeks[0], weekdayFormat, culture)}
        </div>
        { weeks.map((week, idx) =>
          this.renderWeek(week, idx, measure && this._renderMeasureRows))
        }
      </SelectableMonthView>
    )
  }
}
