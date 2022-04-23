import { CSSProperties } from 'react'

export type ComparatorState = {
  title: string
  date: string
  instructions: string
  position: number
  images: Array<string>
  styles: {
    left: CSSProperties
    right: CSSProperties
  }
  scales: {
    left: number
    right: number
  }
  location: {
    left: {
      x: number
      y: number
    }
    right: {
      x: number
      y: number
    }
  }
  current: {
    left: number
    right: number
  }
  select_mode: 'left' | 'right'
  essay: string
}

export type AnswerState = {
  id: string
  data:
    | Array<{
        answer: string | Array<string> | ComparatorState | undefined
        points: number | undefined
      }>
    | undefined
}

export type AnswerStates = {
  answers: Array<AnswerState>
}

const initialState: AnswerStates = {
  answers: [],
}

type Action =
  | {
      type: 'ADD_ANSWER'
      payload: AnswerState
    }
  | {
      type: 'CHANGE_ANSWER'
      payload: AnswerState
    }

export const answersReducer = (state = initialState, action: Action) => {
  const { payload } = action

  switch (action.type) {
    case 'ADD_ANSWER':
      return {
        ...state,
        answers: [...state.answers, payload],
      }
    case 'CHANGE_ANSWER':
      const { id } = payload
      const nAnswers = state.answers.map((value) => {
        const { id: value_id, data } = value

        if (value_id == id) {
          return {
            ...value,
            data: payload.data,
          }
        }

        return value
      })

      return {
        ...state,
        answers: nAnswers,
      }
    default:
      return state
  }
}
