import { FC } from 'react'
import { usePage, useForm } from '@inertiajs/inertia-react'
import { AnswerState } from '@/Pages/Auth/Student/ActivityAnswer'
import {
  Activity,
  Questions,
} from '@/Pages/Auth/Instructor/ClassCreateActivity'
import Class from '@/Layouts/Class'
import { User } from '@/Layouts/Auth'

type CheckState = {
  score: number
  checks: Array<boolean>
}

type Props = {
  id: string
  activity_id: string
  student_id: string
  questions: {
    title: string
    type: Activity
    date_end: string
    time_end: string
    questions: Questions
  }
  answers: AnswerState
  checks?: CheckState
}

const ClassShowAnswers: FC<Props> = ({
  id,
  activity_id,
  student_id,
  questions,
  answers,
  checks,
}) => {
  const { user } = usePage().props
  const _user = user as User

  return (
    <Class mode={3} id={id}>
      <div className="container-lg p-4 md:p-8">
        <p className="font-light text-lg w-fit mx-auto mb-4">
          {_user.role == 'instructor' ? 'Check' : 'View'} Activity
        </p>
        <div className="">
          <form className="w-full md:w-5/12 mx-auto pb-32 md:pb-16"></form>
        </div>
      </div>
    </Class>
  )
}

export default ClassShowAnswers
