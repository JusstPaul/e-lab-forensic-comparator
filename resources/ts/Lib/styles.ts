import { createStyles } from '@mantine/core'

export default createStyles((theme, _params, getRef) => ({
  link: {
    textDecoration: 'none',
    color: theme.colors.gray[9],
  },
  icon: {
    width: '2rem',
    height: '2rem',
  },
}))
