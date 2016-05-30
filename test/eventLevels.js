import { eventLevels, eventSegments } from '../src/utils/eventLevels.js'
import moment from 'moment'

describe('utils/eventLevels - eventLevels', () => {
  const events = [
    {
      start: moment().toDate(),
      end: moment().toDate(),
      allDay: true,
      title: 'boo'
    },
    {
      start: moment().add(1, 'days').toDate(),
      end: moment().add(1, 'days').toDate(),
      allDay: true,
      title: 'boo2'
    },
    {
      start: moment().add(2, 'days').toDate(),
      end: moment().add(2, 'days').toDate(),
      allDay: true,
      title: 'boo3'
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
  const first = moment().toDate()
  const last = moment().add(2, 'days').toDate()
  const segments = events.map(evt => eventSegments(evt, first, last, { startAccessor: 'start', endAccessor: 'end'}))
  const complexsegments = complexevents.map(evt => eventSegments(evt, first, last, { startAccessor: 'start', endAccessor: 'end'}))

  it('should create simple case', () => {
    const levels = eventLevels(segments)
    expect(levels.levels).to.have.length(1)
    expect(levels.levels[0]).to.have.length(3)

    expect(levels.levels[0][0].event, 'first event').to.equal(events[0])
    expect(levels.levels[0][0].span, 'first span').to.equal(1)
    expect(levels.levels[0][0].left, 'first left').to.equal(1)
    expect(levels.levels[0][0].right, 'first right').to.equal(1)

    expect(levels.levels[0][1].event, 'second event').to.equal(events[1])
    expect(levels.levels[0][1].span, 'second span').to.equal(1)
    expect(levels.levels[0][1].left, 'second left').to.equal(2)
    expect(levels.levels[0][1].right, 'second right').to.equal(2)

    expect(levels.levels[0][2].event, 'third event').to.equal(events[2])
    expect(levels.levels[0][2].span, 'third span').to.equal(1)
    expect(levels.levels[0][2].left, 'third left').to.equal(3)
    expect(levels.levels[0][2].right, 'third right').to.equal(3)
  })

  it('should overlap on complex', () => {
    const levels = eventLevels(complexsegments)
    expect(levels.levels).to.have.length(4)
    expect(levels.levels[0]).to.have.length(2)
    expect(levels.levels[1]).to.have.length(2)
    expect(levels.levels[2]).to.have.length(1)
    expect(levels.levels[3]).to.have.length(1)

    expect(levels.levels[0][0].event, 'level 1: first event').to.equal(complexevents[0])
    expect(levels.levels[0][0].span, 'level 1: first span').to.equal(2)
    expect(levels.levels[0][0].left, 'level 1: first left').to.equal(1)
    expect(levels.levels[0][0].right, 'level 1: first right').to.equal(2)

    expect(levels.levels[0][1].event, 'level 1: second event').to.equal(complexevents[5])
    expect(levels.levels[0][1].span, 'level 1: second span').to.equal(1)
    expect(levels.levels[0][1].left, 'level 1: second left').to.equal(3)
    expect(levels.levels[0][1].right, 'level 1: second right').to.equal(3)

    expect(levels.levels[1][0].event, 'level 2: first event').to.equal(complexevents[1])
    expect(levels.levels[1][0].span, 'level 2: first span').to.equal(1)
    expect(levels.levels[1][0].left, 'level 2: first left').to.equal(1)
    expect(levels.levels[1][0].right, 'level 2: first right').to.equal(1)

    expect(levels.levels[1][1].event, 'level 2: second event').to.equal(complexevents[2])
    expect(levels.levels[1][1].span, 'level 2: second span').to.equal(1)
    expect(levels.levels[1][1].left, 'level 2: second left').to.equal(2)
    expect(levels.levels[1][1].right, 'level 2: second right').to.equal(2)

    expect(levels.levels[2][0].event, 'level 3: first event').to.equal(complexevents[3])
    expect(levels.levels[2][0].span, 'level 3: first span').to.equal(1)
    expect(levels.levels[2][0].left, 'level 3: first left').to.equal(2)
    expect(levels.levels[2][0].right, 'level 3: first right').to.equal(2)

    expect(levels.levels[3][0].event, 'level 4: first event').to.equal(complexevents[4])
    expect(levels.levels[3][0].span, 'level 4: first span').to.equal(1)
    expect(levels.levels[3][0].left, 'level 4: first left').to.equal(2)
    expect(levels.levels[3][0].right, 'level 4: first right').to.equal(2)
  })
})