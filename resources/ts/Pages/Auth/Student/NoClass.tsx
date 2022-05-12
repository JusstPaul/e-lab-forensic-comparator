import Auth from '@/Layouts/Auth'
import { Container, Paper, Stack, Text } from '@mantine/core'

const NoClass = () => (
  <Auth title="Not yet joined">
    <Container size="xs" pt="lg">
      <Paper p="md">
        <Stack>
          <Text size="xl" weight="bold" align="center">
            Not yet registered to a class.
          </Text>
          <Text align="center" weight="lighter">
            Please contact your instructor.
          </Text>
        </Stack>
      </Paper>
    </Container>
  </Auth>
)

export default NoClass
