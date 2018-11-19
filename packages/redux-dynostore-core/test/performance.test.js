import { createStore, combineReducers } from 'redux'
import dynostore, { dynamicReducers } from 'src'

describe('performance tests', () => {

  process.env.NODE_ENV = 'production'

  const TESTS = 10000

  const logs = []

  const log = (message) => {
    logs.push(message)
  }

  beforeEach(() => logs.splice(0, logs.length))
  afterEach(() => console.log(logs.join('\n')))

  const makeTestReducer = id => (state = { value: 0 }, action) => {
    return action.id === id && action.type === 'CHANGE_VALUE' ? { ...state, value: action.newValue} : state
  }

  const changeValue = (id, newValue) => ({ type: 'CHANGE_VALUE', id, newValue })

  const runTests = (store, tests) => {
    const startTime = new Date()
    log(`starting ${tests.length} tests`)

    const splitTimes = []

    tests.forEach(test => {
      const beforeUpdate = new Date()
      store.dispatch(changeValue(test.id, test.value))
      splitTimes.push(new Date() - beforeUpdate)
    })

    log(`finished tests: ${new Date() - startTime}ms`)
    log(`average split time: ${splitTimes.reduce((prev, next) => prev + next) / splitTimes.length}ms`)
    log('')

    expect(true).toBe(true)
  }

  describe('shallow state', () => {

    const REDUCERS = 1000

    test('redux', () => {
      log(`shallow state - redux - adding ${REDUCERS} reducers`)

      const reducers = {}

      for (let i = 0; i < REDUCERS; i++) {
        reducers[`reducer${i}`] = makeTestReducer(i)
      }

      const store = createStore(combineReducers(reducers))

      const tests = []

      for (let i = 0; i < TESTS; i++) {
        tests.push({ id: i % REDUCERS, value: i + 1 })
      }

      runTests(store, tests)

      // log('final state', store.getState())
    })

    test('dynostore', () => {
      log(`shallow state - dynostore - adding ${REDUCERS} reducers`)

      const reducers = {}

      for (let i = 0; i < REDUCERS; i++) {
        reducers[`reducer${i}`] = makeTestReducer(i)
      }

      const store = createStore((state = {}) => state, dynostore(dynamicReducers()))
      store.attachReducers(reducers)

      const tests = []

      for (let i = 0; i < TESTS; i++) {
        tests.push({ id: i % REDUCERS, value: i + 1 })
      }

      runTests(store, tests)

      // log('final state', store.getState())
    })
  })

  describe('deep state - many parents', () => {

    const PARENTS = 100
    const REDUCERS = 10

    test('redux', () => {
      log(`deep state - many parents - redux - adding ${PARENTS * REDUCERS} reducers`)

      const reducers = {}

      for (let i = 0; i < PARENTS; i++) {
        for (let j = 0; j < REDUCERS; j++) {
          if (!reducers[`parent${i}`]) {
            reducers[`parent${i}`] = {}
          }
          reducers[`parent${i}`][`reducer${j}`] = makeTestReducer(i * REDUCERS + j)
        }
      }

      const collapsedReducers = {}

      Object.entries(reducers).map(([key, childReducers]) => {
        collapsedReducers[key] = combineReducers(childReducers)
      })

      const store = createStore(combineReducers(collapsedReducers))

      const tests = []

      for (let i = 0; i < TESTS; i++) {
        const parent = Math.floor(i / REDUCERS) % PARENTS
        const id = i % REDUCERS
        tests.push({ id: parent * REDUCERS + id, value: i + 1 })
      }

      runTests(store, tests)

      // log('final state', store.getState())
    })

    test('dynostore', () => {
      log(`deep state - many parents - dynostore - adding ${PARENTS * REDUCERS} reducers`)

      const reducers = {}

      for (let i = 0; i < PARENTS; i++) {
        for (let j = 0; j < REDUCERS; j++) {
          if (!reducers[`parent${i}`]) {
            reducers[`parent${i}`] = {}
          }
          reducers[`parent${i}/reducer${j}`] = makeTestReducer(i * REDUCERS + j)
        }
      }

      const store = createStore((state = {}) => state, dynostore(dynamicReducers()))
      store.attachReducers(reducers)

      const tests = []

      for (let i = 0; i < TESTS; i++) {
        const parent = Math.floor(i / REDUCERS) % PARENTS
        const id = i % REDUCERS
        tests.push({ id: parent * REDUCERS + id, value: i + 1 })
      }

      runTests(store, tests)

      // log('final state', store.getState())
    })
  })

  describe('deep state - many children', () => {

    const PARENTS = 10
    const REDUCERS = 100
    const TESTS = 10000

    test('redux', () => {
      log(`deep state - many children - redux - adding ${PARENTS * REDUCERS} reducers`)

      const reducers = {}

      for (let i = 0; i < PARENTS; i++) {
        for (let j = 0; j < REDUCERS; j++) {
          if (!reducers[`parent${i}`]) {
            reducers[`parent${i}`] = {}
          }
          reducers[`parent${i}`][`reducer${j}`] = makeTestReducer(i * REDUCERS + j)
        }
      }

      const collapsedReducers = {}

      Object.entries(reducers).map(([key, childReducers]) => {
        collapsedReducers[key] = combineReducers(childReducers)
      })

      const store = createStore(combineReducers(collapsedReducers))

      const tests = []

      for (let i = 0; i < TESTS; i++) {
        const parent = Math.floor(i / REDUCERS) % PARENTS
        const id = i % REDUCERS
        tests.push({ id: parent * REDUCERS + id, value: i + 1 })
      }

      runTests(store, tests)

      // log('final state', store.getState())
    })

    test('dynostore', () => {
      log(`deep state - many children - dynostore - adding ${PARENTS * REDUCERS} reducers`)

      const reducers = {}

      for (let i = 0; i < PARENTS; i++) {
        for (let j = 0; j < REDUCERS; j++) {
          if (!reducers[`parent${i}`]) {
            reducers[`parent${i}`] = {}
          }
          reducers[`parent${i}/reducer${j}`] = makeTestReducer(i * REDUCERS + j)
        }
      }

      const store = createStore((state = {}) => state, dynostore(dynamicReducers()))
      store.attachReducers(reducers)

      const tests = []

      for (let i = 0; i < TESTS; i++) {
        const parent = Math.floor(i / REDUCERS) % PARENTS
        const id = i % REDUCERS
        tests.push({ id: parent * REDUCERS + id, value: i + 1 })
      }

      runTests(store, tests)

      // log('final state', store.getState())
    })
  })
})
