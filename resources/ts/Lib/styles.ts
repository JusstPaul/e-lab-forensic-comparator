import { createStyles } from '@mantine/core'

export default createStyles((theme, _params, getRef) => ({
  link: {
    textDecoration: 'none',
    color: theme.colors.gray[9],
  },
  icon: {
    width: '1.5rem',
    height: '1.5rem',
  },
  navbarIcon: {
    ref: getRef('navbarIcon'),
    backgroundColor: theme.colors.cyan[7],
  },
  navbarLink: {
    textDecoration: 'none',
    color: theme.colors.gray[9],
    padding: '0.50rem',
    justifyContent: 'flex-start',
    borderRadius: '0.375rem',
    ':hover': {
      backgroundColor: theme.colors.gray[3],
      [`& .${getRef('navbarIcon')}`]: {
        backgroundColor: theme.colors.cyan[8],
      },
    },
  },
  fileWrapper: {
    position: 'relative',
    padding: '0.5rem',
    display: 'flex',
    flexDirection: 'row-reverse',
    columnGap: '0.5rem',
    alignItems: 'center',
  },
  fileInput: {
    ref: getRef('fileInput'),
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  },
  answer: {
    backgroundColor: theme.colors.gray[1],
    marginTop: '0.5rem',
    padding: '0.5rem',
    borderRadius: theme.radius.sm,
  },
}))
