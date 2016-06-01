import React from 'react';
import { storiesOf, action, linkTo } from '@kadira/storybook';
import TimeGrid from '../TimeGrid.jsx';
import moment from 'moment'
import momentLocalizer, { formats } from '../../localizers/moment.js'

// Setup the localizer by providing the moment (or globalize) Object
// to the correct localizer.
momentLocalizer(moment); // or globalizeLocalizer

const events = [
  {
    title: 'first event',
    start: moment('10:00am', 'h:mma').toDate(),
    end: moment('10:43am', 'h:mma').toDate()
  },
  {
    title: 'blahbla',
    start: moment('1:00pm', 'h:mma').add(1, 'days').toDate(),
    end: moment('3:00pm', 'h:mma').add(1, 'days').toDate()
  },
  {
    title: 'hmmmm',
    start: moment('9:00am', 'h:mma').add(2, 'days').toDate(),
    end: moment('3:00pm', 'h:mma').add(2, 'days').toDate()
  },
  {
    title: '3rd',
    allDay: true,
    start: moment().toDate(),
    end: moment().toDate()
  }
]


const complexevents = [
  {
    start: moment().toDate(),
    end: moment().add(2, 'days').toDate(),
    allDay: true,
    title: 'boo multi-day'
  },
  {
    start: moment().toDate(),
    end: moment().toDate(),
    allDay: true,
    title: 'boo same day'
  },
  {
    start: moment().add(1, 'days').toDate(),
    end: moment().add(1, 'days').toDate(),
    allDay: true,
    title: 'boo2'
  },
  {
    start: moment().add(1, 'days').toDate(),
    end: moment().add(1, 'days').toDate(),
    allDay: true,
    title: 'boo2 same day'
  },
  {
    start: moment().add(1, 'days').toDate(),
    end: moment().add(1, 'days').toDate(),
    allDay: true,
    title: 'boo2 same day 2'
  },
  {
    start: moment().add(2, 'days').toDate(),
    end: moment().add(2, 'days').toDate(),
    allDay: true,
    title: 'boo3'
  }
]

storiesOf('components.TimeGrid', module)
  .add('default view', () => {
    return (
      <div height="80%">
        <TimeGrid start={moment().startOf('day').toDate()} end={moment().add(2, 'days').startOf('day').toDate()}
                  min={moment('9:00am', 'h:mma').toDate()}
                  max={moment('5:00pm', 'h:mma').toDate()}
                  now={moment('3:00pm', 'h:mma').toDate()}
                  step={20}
                  slices={2}
                  events={events}
                  selectRangeFormat={formats.selectRangeFormat}
                  timeGutterFormat={formats.timeGutterFormat}
                  eventTimeRangeFormat={formats.eventTimeRangeFormat}
                  dayFormat={formats.dayFormat}
        />
      </div>
    )
  })
  .add('default view', () => {
    return (
      <div height="80%">
        <TimeGrid start={moment().startOf('day').toDate()} end={moment().add(2, 'days').startOf('day').toDate()}
                  min={moment('9:00am', 'h:mma').toDate()}
                  max={moment('5:00pm', 'h:mma').toDate()}
                  now={moment('3:00pm', 'h:mma').toDate()}
                  step={20}
                  slices={2}
                  onSelectEvent={action('event selected')}
                  events={events}
                  selectRangeFormat={formats.selectRangeFormat}
                  timeGutterFormat={formats.timeGutterFormat}
                  eventTimeRangeFormat={formats.eventTimeRangeFormat}
                  dayFormat={formats.dayFormat}
        />
      </div>
    )
  })

  .add('selectable', () => {
    return (
      <div height="80%">
        <TimeGrid start={moment().startOf('day').toDate()} end={moment().add(2, 'days').startOf('day').toDate()}
                  min={moment('9:00am', 'h:mma').toDate()}
                  max={moment('5:00pm', 'h:mma').toDate()}
                  now={moment('3:00pm', 'h:mma').toDate()}
                  step={20}
                  selectable
                  slices={2}
                  events={events}
                  onSelectEvent={action('event selected')}
                  onSelectSlot={action('slot selected')}
                  selectRangeFormat={formats.selectRangeFormat}
                  timeGutterFormat={formats.timeGutterFormat}
                  eventTimeRangeFormat={formats.eventTimeRangeFormat}
                  dayFormat={formats.dayFormat}
        />
      </div>
    )
  })

  .add('5 slices', () => {
    return (
      <div height="80%">
        <TimeGrid start={moment().startOf('day').toDate()} end={moment().add(2, 'days').startOf('day').toDate()}
                  min={moment('9:00am', 'h:mma').toDate()}
                  max={moment('5:00pm', 'h:mma').toDate()}
                  now={moment('3:00pm', 'h:mma').toDate()}
                  step={20}
                  selectable
                  slices={5}
                  onSelectEvent={action('event selected')}
                  onSelectSlot={action('slot selected')}
                  events={events}
                  selectRangeFormat={formats.selectRangeFormat}
                  timeGutterFormat={formats.timeGutterFormat}
                  eventTimeRangeFormat={formats.eventTimeRangeFormat}
                  dayFormat={formats.dayFormat}
        />
      </div>
    )
  })

  .add('complex all-day events', () => {
    return (
      <div height="80%">
        <TimeGrid start={moment().startOf('day').toDate()} end={moment().add(2, 'days').startOf('day').toDate()}
                  min={moment('9:00am', 'h:mma').toDate()}
                  max={moment('5:00pm', 'h:mma').toDate()}
                  now={moment('3:00pm', 'h:mma').toDate()}
                  step={20}
                  selectable
                  slices={5}
                  events={complexevents}
                  onSelectEvent={action('event selected')}
                  onSelectSlot={action('slot selected')}
                  selectRangeFormat={formats.selectRangeFormat}
                  timeGutterFormat={formats.timeGutterFormat}
                  eventTimeRangeFormat={formats.eventTimeRangeFormat}
                  dayFormat={formats.dayFormat}
        />
      </div>
    )
  })
